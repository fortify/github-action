import * as core from '@actions/core';
import * as path from 'path';
import { runFortifyEnv } from '@fortify/setup';

/**
 * Main entrypoint for the Fortify Setup GitHub Action.
 * 
 * This action uses the @fortify/setup npm package to bootstrap fcli and run
 * the 'fcli tool env init' command, which detects, registers, and installs
 * Fortify tools for use in CI/CD workflows.
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
		
		// Determine cache directory and fcli version for bootstrap configuration
		// - If FCLI_BOOTSTRAP_VERSION is set to a full major.minor.patch version (e.g., 3.14.1),
		//   use RUNNER_TOOL_CACHE for persistent caching across workflow runs
		// - Otherwise, use RUNNER_TEMP for job-specific temporary storage (cleaned after each job)
		const fcliBootstrapVersion = process.env.FCLI_BOOTSTRAP_VERSION;
		const isFullVersion = fcliBootstrapVersion && /^v?\d+\.\d+\.\d+$/.test(fcliBootstrapVersion);
		
		let cacheDir: string | undefined;
		if (isFullVersion && process.env.RUNNER_TOOL_CACHE) {
			// Use tool cache for specific versions (persistent across runs)
			cacheDir = path.join(process.env.RUNNER_TOOL_CACHE, 'fortify', 'fcli', fcliBootstrapVersion!);
		} else if (process.env.RUNNER_TEMP) {
			// Use temp directory for latest/partial versions (cleaned after job)
			cacheDir = path.join(process.env.RUNNER_TEMP, '.fortify', 'fcli', 'bootstrap');
		}
		
		const bootstrapConfig = {
			cacheDir
		};
		
		// Run tool env init using @fortify/setup
		core.info('Setting up Fortify tools...');
		core.info('');
		
		const result = await runFortifyEnv({
			args: ['init', ...args],
			verbose: true,
			config: bootstrapConfig
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
				envArgs.push('--excludes=path');
			}
			
			const envResult = await runFortifyEnv({
				args: envArgs,
				verbose: true,
				config: bootstrapConfig
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
