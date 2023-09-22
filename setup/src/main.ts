import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as exec from '@actions/exec';
import * as fs from 'node:fs';

// TODO Update to 2.0.0 once available
const INTERNAL_FCLI_VERSION='dev_develop';
const LATEST_KNOWN_FCLI_VERSION='v1.3.1';

/** 
 * Install and configure the given version of the given tool, then export environment
 * variables to allow pipelines to locate the tool installation(s). If the given version
 * equals 'skip' the tool installation will be skipped.
*/
async function installAndConfigure(internalFcliCmd: string, toolName: string, toolVersion: string): Promise<void> {
	if (toolVersion==='skip') {
		core.info(`Skipping ${toolName} installation`);
	} else {
		const installPath = await installIfNotCached(internalFcliCmd, toolName, toolVersion, core.info);
		exportVariables(toolName, toolVersion, installPath)
	}
}

/** 
 * Install the given version of the given tool if it hasn't been previously installed.
 * This function doesn't export any variables; this is handled by installAndConfigure
 * if applicable. 
*/
async function installIfNotCached(internalFcliCmd: string, toolName: string, toolVersion: string, log: (arg: string) => void): Promise<string> {
	const installPath = `/opt/fortify/${toolName}/${toolVersion}`;
	// We explicitly don't use GitHub tool-cache as we support semantic versioning;
	// versions like 'latest' or 'v2' may change over time so we don't want to use
	// an older cached version in case new versions are released.
	if (fs.existsSync(installPath)) {
		log(`Using previously installed ${toolName} ${toolVersion}`);
	} else {
		log(`Installing ${toolName} ${toolVersion}`);
		await install(internalFcliCmd, toolName, toolVersion, installPath);
	}
	return installPath;
}

/**
 * Install the given version of the given tool to the given path. This function doesn't 
 * perform any tool caching, and doesn't set any environment variables; this is handled 
 * by installAndConfigure if applicable. If an fcli installation is requested, we use 
 * the installFcli function, in which case the internalFcliCmd parameter may be empty. 
 * For other tool installations, we execute the given internalFcliCmd to have fcli 
 * install the requested tool.
 */
async function install(internalFcliCmd: string, toolName: string, toolVersion: string, installPath: string): Promise<void> {
	if (toolName==='fcli') {
		await installFcli(installPath, toolVersion);
	} else {
		await exec.exec(internalFcliCmd, ['tool', toolName, 'install', toolVersion, '-d', installPath]);
	}
}

/**
 * Install the given fcli version to the given path. This function doesn't perform any tool 
 * caching, and doesn't set any environment variables; this is handled by installAndConfigure 
 * if applicable.
 */
async function installFcli(installPath: string, version: string): Promise<void> {
	const baseUrl = getFcliBaseUrl(version);
	installPath = `${installPath}/bin`;
	core.info(`Installing fcli ${version} from ${baseUrl}`);
	if (process.platform === 'win32') {
		const downloadPath = await tc.downloadTool(`${baseUrl}/fcli-windows.zip`);
		verifyFcliHash(downloadPath, 'fcli-windows.zip', version);
		installPath = await tc.extractZip(downloadPath, installPath);
	} else if (process.platform === 'darwin') {
		const downloadPath = await tc.downloadTool(`${baseUrl}/fcli-mac.tgz`);
		verifyFcliHash(downloadPath, 'fcli-mac.tgz', version);
		installPath = await tc.extractTar(downloadPath, installPath);
	} else if (process.platform === 'linux') {
		const downloadPath = await tc.downloadTool(`${baseUrl}/fcli-linux.tgz`);
		verifyFcliHash(downloadPath, 'fcli-linux.zip', version);
		installPath = await tc.extractTar(downloadPath, installPath);
	} else {
		// TODO Install Java version? Should we then also generate a bash script
		// for invoking 'java -jar <path/to/jar> $@'? 
		throw "Unsupported platform"
	}
}

/**
 * Get the base URL for downloading fcli artifacts for the given version. 
 */
function getFcliBaseUrl(version: string): string {
	if ( version.match(/^\d+\.\d+\.\d+$/) ) {
		version = `v${version}`
	}
	return `https://github.com/fortify/fcli/releases/download/${version}`;
}

/**
 * Verify the integrity of the given fcli archive.
*/
function verifyFcliHash(archivePath: string, variant: string, version: string) {
	// TODO Implement integrity checks
	core.warning(`Not verifying integrity of ${variant} ${version}`);
}

/** 
 * Export environment variables for the given tool name and version, allowing
 * pipelines to locate the tool installation(s).
*/
function exportVariables(toolName: string, toolVersion: string, installPath: string): void {
	if (core.getBooleanInput('export-path')) {
		core.addPath(`${installPath}/bin`);
	}
	const varBaseName = toolName.toUpperCase().replace('-','_')
	core.exportVariable(varBaseName+'_INSTALL_DIR', core.toPlatformPath(installPath));
	core.exportVariable(varBaseName+'_BIN_DIR', core.toPlatformPath(`${installPath}/bin`));
	let cmd = '';
	switch (toolName) {
		case 'fcli': cmd = 'fcli'; break;
		case 'sc-client': cmd = 'scancentral'; break;
		case 'vuln-exporter': cmd = 'FortifyVulnerabilityExporter'; break;
		case 'fod-uploader': cmd = 'FoDUpload'; break;
	}
	core.exportVariable(varBaseName+'_CMD', core.toPlatformPath(`${installPath}/bin/${cmd}`));
}

/**
 * Get the configured tool version for the given tool.
 */
function getToolVersion(tool: string): string {
	let version = core.getInput(tool);
	if (version==='latest') {
		version = 'default';
	}
	if (tool==='fcli' && version==='default') {
		version = LATEST_KNOWN_FCLI_VERSION;
	}
	return version;	
}

/**
 * Main entrypoint for this GitHub Action. This function installs a fixed fcli
 * version for internal use, then iterates over the available tools to install
 * them if applicable.
 */
async function main(): Promise<void> {
	try {
		// Install fixed fcli version for internal action use by this action only.
		const internalFcliPath = await installIfNotCached('', 'fcli', INTERNAL_FCLI_VERSION, core.debug);
		const internalFcliCmd = core.toPlatformPath(`${internalFcliPath}/bin/fcli`);
		
		// Install user-specified tools
		const tools = ['fcli', 'sc-client', 'fod-uploader', 'vuln-exporter']
		for (const tool of tools) {
			await installAndConfigure(internalFcliCmd, tool, getToolVersion(tool));
		}
	} catch (err) {
		core.setFailed("Action failed with error: " + err);
	}
}

main();
