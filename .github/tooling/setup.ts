import * as core from '@actions/core';
import * as path from 'node:path';
import { mkdir, readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { runFortifyEnv } from '@fortify/setup';

export const tools = ['fcli', 'sc-client', 'fod-uploader', 'vuln-exporter', 'bugtracker-utility', 'debricked-cli'];

export interface SetupInputs {
    tools: Record<string, string>;
    toolDefinitions?: string;
    exportPath: boolean;
}

export function setupRequests(inputs: SetupInputs, env: NodeJS.ProcessEnv = process.env) {
    const setupTools = tools.filter(tool => inputs.tools[tool] && inputs.tools[tool] !== 'skip');
    const initArgs = ['init'];
    if (inputs.toolDefinitions) initArgs.push('--tool-definitions', inputs.toolDefinitions);
    if (setupTools.length) initArgs.push('--tools', setupTools.map(tool => `${tool}:${inputs.tools[tool]}`).join(','));
    const githubArgs = ['github'];
    if (setupTools.length) githubArgs.push('--tools', setupTools.join(','));
    if (!inputs.exportPath) githubArgs.push('--excludes=path');
    const version = env.FCLI_BOOTSTRAP_VERSION;
    const cacheDir = version && /^v?\d+\.\d+\.\d+$/.test(version) && env.RUNNER_TOOL_CACHE
        ? path.join(env.RUNNER_TOOL_CACHE, 'fortify', 'fcli', version)
        : env.RUNNER_TEMP ? path.join(env.RUNNER_TEMP, '.fortify', 'fcli', 'bootstrap') : undefined;
    return { initArgs, githubArgs, config: { cacheDir } };
}

export async function runSetup(inputs: SetupInputs, run = runFortifyEnv) {
    const { initArgs, githubArgs, config } = setupRequests(inputs);
    core.info('Setting up Fortify tools...');
    const result = await run({ args: initArgs, verbose: true, config });
    if (result.exitCode !== 0) throw new Error(`Fortify setup failed with exit code ${result.exitCode}`);
    core.info('Setting up environment variables...');
    const envResult = await run({ args: githubArgs, verbose: true, config });
    if (envResult.exitCode !== 0) core.warning('Failed to set up environment variables');
    return result.bootstrap?.fcliPath;
}

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

const scanServices = { setup: runSetup, execute: executeScan, mkdir, readEnvironment, core, env: process.env };

export async function runScan(debugInput: string, dependencies: Partial<typeof scanServices> = {}) {
    const services = { ...scanServices, ...dependencies };
    const { env } = services;
    if (!env.RUNNER_TEMP || !env.GITHUB_ENV) throw new Error('RUNNER_TEMP and GITHUB_ENV must be set');
    const directory = path.join(env.RUNNER_TEMP, 'fortify-data');
    const debug = debugInput === 'true' || env.RUNNER_DEBUG === '1';
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
        services.core.setOutput('upload-debug-artifacts', String(debug));
        services.core.setOutput('debug-artifacts-dir', directory);
    }
}

export async function main() {
    try {
        await runSetup({
            tools: Object.fromEntries(tools.map(tool => [tool, core.getInput(tool)])),
            toolDefinitions: core.getInput('tool-definitions'),
            exportPath: core.getBooleanInput('export-path'),
        });
    } catch (error) {
        core.setFailed(`Action failed with error: ${error}`);
    }
}