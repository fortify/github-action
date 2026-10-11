import * as core from '@actions/core';
import * as path from 'node:path';
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