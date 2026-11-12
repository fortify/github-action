import * as core from '@actions/core';
import * as path from 'node:path';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { runSetup } from './setup';
import { createDebugArtifactsReadmeZip, createDebugArtifactsZip } from './debug-artifacts';

export { createDebugArtifactsZip };

export function parseEnvironment(content: string): Record<string, string> {
    const variables: Record<string, string> = Object.create(null);
    const lines = content.split(/\r?\n/);
    for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        if (!line) continue;
        const equals = line.indexOf('=');
        const heredoc = line.indexOf('<<');
        if (equals >= 0 && (heredoc < 0 || equals < heredoc)) {
            variables[line.slice(0, equals)] = line.slice(equals + 1);
        } else if (heredoc > 0) {
            const delimiter = line.slice(heredoc + 2);
            if (!delimiter) throw new Error('Invalid GitHub environment delimiter');
            const values: string[] = [];
            while (++index < lines.length && lines[index] !== delimiter) values.push(lines[index]);
            if (index === lines.length) throw new Error('Unterminated GitHub environment value');
            variables[line.slice(0, heredoc)] = values.join('\n');
        } else {
            throw new Error('Invalid GitHub environment entry');
        }
    }
    return variables;
}

async function readEnvironment(filename: string) {
    try {
        return await readFile(filename, 'utf8');
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return '';
        throw error;
    }
}

export async function executeScan(command: string, args: string[], cwd: string, env: NodeJS.ProcessEnv) {
    await new Promise<void>((resolve, reject) => {
        const child = spawn(command, args, { cwd, env, stdio: 'inherit', shell: false });
        child.once('error', reject);
        child.once('close', (code, signal) => {
            if (code === 0) resolve();
            else reject(new Error(`Fortify scan failed with ${signal ? `signal ${signal}` : `exit code ${code}`}`));
        });
    });
}

const scanServices = {
    setup: runSetup, execute: executeScan, mkdir, readEnvironment, createZip: createDebugArtifactsZip,
    createReadmeZip: createDebugArtifactsReadmeZip, core, env: process.env,
};

// Characters rejected by actions/upload-artifact in artifact names; leading dot would result in a hidden file.
const invalidArtifactName = /^\.|[":<>|*?\r\n\\/\0]/;

const debugArtifactsReadme = `No Fortify debug artifacts are available for this scan.

Debug artifacts are only collected if debugging is enabled (through the 'debug: true' action input or by
re-running the workflow with GitHub's "Enable debug logging" option) and a password is set through the
'debug-artifact-password' action input. If both are set, please check the workflow log for warnings that
explain why no debug artifacts are available.

As debug artifacts may contain sensitive data, they're only made available as a password-protected (AES-256)
zip file. When debugging is requested but no encrypted zip is available, an unencrypted zip containing only
this README is provided instead. Note that the 'debug-artifacts-dir' output is deprecated; please upload the
file referenced by the 'debug-artifacts-zip' output instead.
See https://github.com/fortify/github-action#artifact-storage for details.
`;

async function createZipFile(services: typeof scanServices, dataDirectory: string, zipFile: string, password: string) {
    try {
        const count = await services.createZip(dataDirectory, zipFile, password);
        if (count) {
            services.core.info(`Created password-protected debug artifacts zip file ${zipFile} containing ${count} files`);
            return true;
        }
        services.core.warning(`No debug artifact files were found in ${dataDirectory}; creating a README-only zip instead`);
    } catch (error) {
        services.core.warning(`Error creating encrypted debug artifacts zip file; creating a README-only zip instead: ${
            (error as Error).message}`);
    }
    return false;
}

// The per-scan directory contains only an encrypted debug zip or a README (zipped when debugging is requested).
async function packageDebugArtifacts(services: typeof scanServices, debug: boolean, dataDirectory: string, tempDirectory: string,
    password: string) {
    try {
        const directory = await mkdtemp(path.join(tempDirectory, 'fortify-debug-artifacts-'));
        if (debug) {
            const name = services.env.FORTIFY_DEBUG_ARTIFACT_NAME || 'fortify-debug-artifacts';
            if (invalidArtifactName.test(name)) {
                services.core.warning(`Debug artifacts will not be uploaded due to invalid debug artifact name: ${name}`);
            } else {
                const zipFile = path.join(directory, `${name}.zip`);
                if (!password || !await createZipFile(services, dataDirectory, zipFile, password)) {
                    await services.createReadmeZip(zipFile, debugArtifactsReadme);
                    services.core.info(`Created README-only debug artifacts zip file ${zipFile}`);
                }
                return { directory, zipFile };
            }
        }
        await writeFile(path.join(directory, 'README.txt'), debugArtifactsReadme);
        return { directory, zipFile: '' };
    } catch (error) {
        services.core.warning(`Debug artifacts will not be uploaded due to error preparing debug artifacts directory: ${
            (error as Error).message}`);
        return { directory: '', zipFile: '' };
    }
}

export async function runScan(debugInput: string, dependencies: Partial<typeof scanServices> = {}) {
    const services = { ...scanServices, ...dependencies };
    const { env } = services;
    // Prevent the password from being passed to fcli or any other child processes
    const password = env.FORTIFY_DEBUG_ARTIFACT_PASSWORD || '';
    delete env.FORTIFY_DEBUG_ARTIFACT_PASSWORD;
    if (password) services.core.setSecret(password);
    if (!env.RUNNER_TEMP || !env.GITHUB_ENV) throw new Error('RUNNER_TEMP and GITHUB_ENV must be set');
    const tempDirectory = env.RUNNER_TEMP;
    const directory = path.join(tempDirectory, 'fortify-data');
    const debugRequested = debugInput === 'true' || env.RUNNER_DEBUG === '1';
    const debug = debugRequested && password !== '';
    if (debugRequested && !debug) {
        services.core.warning('Debug artifacts will not be collected as the debug-artifact-password action input is not set; '
            + 'debug artifacts may contain sensitive data and are therefore only uploaded as password-protected zip file');
    }
    try {
        services.core.exportVariable('FORTIFY_DATA_DIR', directory);
        env.FORTIFY_DATA_DIR = directory;
        const before = await services.readEnvironment(env.GITHUB_ENV);
        const bootstrapPath = await services.setup({ tools: { fcli: 'bootstrapped' }, exportPath: false });
        const after = await services.readEnvironment(env.GITHUB_ENV);
        if (!after.startsWith(before)) throw new Error('GitHub environment file changed unexpectedly during setup');
        Object.assign(env, parseEnvironment(after.slice(before.length)));
        const command = env.FCLI_CMD || bootstrapPath;
        if (!command) throw new Error('Fortify setup did not provide an fcli command');
        await services.mkdir(directory, { recursive: true });
        await services.execute(command, ['action', 'run', 'ci', `--debug=${debug}`], directory, {
            ...env,
            SAST_EXPORT_EXTRA_OPTS: `--publish=true ${env.SAST_EXPORT_EXTRA_OPTS || ''}`,
            DEBRICKED_EXPORT_EXTRA_OPTS: `--publish=true ${env.DEBRICKED_EXPORT_EXTRA_OPTS || ''}`,
        });
    } finally {
        const artifacts = await packageDebugArtifacts(services, debugRequested, directory, tempDirectory, password);
        services.core.setOutput('upload-debug-artifacts', String(artifacts.zipFile !== ''));
        services.core.setOutput('debug-artifacts-dir', artifacts.directory);
        services.core.setOutput('debug-artifacts-zip', artifacts.zipFile);
    }
}
