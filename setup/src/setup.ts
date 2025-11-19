import * as core from '@actions/core';
import { runFortifySetup } from '@fortify/setup';

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
		
		// Get export-path input (default: true)
		const exportPath = core.getBooleanInput('export-path');
		if (!exportPath) {
			core.warning('export-path is set to false - tools will not be added to PATH');
			// Prevent fcli from automatically adding tools to PATH in GitHub Actions
			core.exportVariable('SETUP_EXPORT_PATH', 'false');
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
		
		for (const tool of tools) {
			const version = core.getInput(tool);
			if (version && version !== 'skip') {
				args.push(`--${tool}`, version);
			}
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
		}
	} catch (err) {
		core.setFailed(`Action failed with error: ${err}`);
	}
}

main();
