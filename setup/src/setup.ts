import * as core from '@actions/core';
import { runFortifySetup, runFortifyEnv } from '@fortify/setup';

/**
 * Main entrypoint for the Fortify Setup GitHub Action.
 * 
 * This action uses the @fortify/setup npm package to bootstrap fcli and run
 * the fortify-setup action, which detects, registers, and installs Fortify
 * tools for use in CI/CD workflows.
 */
async function main(): Promise<void> {
	try {
		// Build arguments array from action inputs
		const args: string[] = [];
		
		// Get tool-definitions input
		const toolDefinitions = core.getInput('tool-definitions');
		if (toolDefinitions) {
			args.push('--tool-definitions', toolDefinitions);
		}
		
		// Set tool cache pattern using GitHub Actions runner tool cache directory
		const runnerToolCache = process.env.RUNNER_TOOL_CACHE;
		const arch = process.env.RUNNER_ARCH ?? process.arch;
		if (runnerToolCache) {
			args.push('--tool-cache-pattern', `${runnerToolCache}/{tool}/{version}/${arch}`);
		}
		
		// Map tool inputs to fcli action arguments
		const tools = [
			'fcli',
			'sc-client',
			'fod-uploader',
			'vuln-exporter',
			'bugtracker-utility',
			'debricked-cli'
		];
		
		const setupToolSpecs: string[] = [];
		const envToolSpecs: string[] = [];
		for (const tool of tools) {
			const version = core.getInput(tool);
			if (version && version !== 'skip') {
				setupToolSpecs.push(`${tool}:${version}`);
				envToolSpecs.push(tool);
			}
		}
		
		if (setupToolSpecs.length > 0) {
			args.push('--tools', setupToolSpecs.join(','));
		}
		
		// Run fortify-setup action using @fortify/setup
		core.info('Setting up Fortify tools...');
		core.info('');
		
		const result = await runFortifySetup({
			args,
			verbose: true
		});
		
		if (result.exitCode !== 0) {
			core.setFailed(`Fortify setup failed with exit code ${result.exitCode}`);
		} else {
			core.info('');
			core.info('✓ Fortify tools setup complete');
			
			// Set up environment variables for GitHub Actions
			core.info('');
			core.info('Setting up environment variables...');
			
			const envArgs: string[] = ['github'];
			if (envToolSpecs.length > 0) {
				envArgs.push('--tools', envToolSpecs.join(','));
			}
			// Get export-path input (default: true)
			const exportPath = core.getBooleanInput('export-path');
			if (!exportPath) {
				envArgs.push('--exclude=path');
			}
			
			const envResult = await runFortifyEnv({
				args: envArgs,
				verbose: true
			});
			
			if (envResult.exitCode === 0) {
				core.info('✓ Environment setup complete');
			} else {
				core.warning('Failed to set up environment variables');
			}
		}
	} catch (err) {
		core.setFailed(`Action failed with error: ${err}`);
	}
}

main();
