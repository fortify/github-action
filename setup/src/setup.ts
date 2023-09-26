import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as exec from '@actions/exec';
import * as fs from 'node:fs';
import * as crypto from 'node:crypto';
      
const TOOLS: Record<string, Record<string, Record<string, string>>> = {
	"fcli": { 
		"versionAliases": {"action-default": "dev_github-action", "latest": "1.3.1"},
		"cmds": {"win32": "fcli.exe", "linux": "fcli", "darwin": "fcli"}
	},
	"sc-client": { 
		"versionAliases": {"action-default": "23.1.0"},
		"cmds": {"win32": "scancentral.bat", "linux": "scancentral", "darwin": "scancentral"}
	},
	"vuln-exporter": { 
		"versionAliases": {"action-default": "2.0.3"},
		"cmds": {"win32": "FortifyVulnerabilityExporter.bat", "linux": "FortifyVulnerabilityExporter", "darwin": "FortifyVulnerabilityExporter"}
	},
	"fod-uploader": { 
		"versionAliases": {"action-default": "5.4.0"},
		"cmds": {"win32": "FoDUploader.bat", "linux": "FoDUploader", "darwin": "FoDUploader"}
	},
	"bugtracker-utility": { 
		"versionAliases": {"action-default": "4.12"},
		"cmds": {"win32": "FortifyBugTrackerUtility.bat", "linux": "FortifyBugTrackerUtility", "darwin": "FortifyBugTrackerUtility"}
	}
};
const INTERNAL_FCLI_VERSION = TOOLS["fcli"]["versionAliases"]["action-default"];
const FCLI_SHA256: Record<string, Record<string, string>> = {
	"dev_github-action": { 
		"win32": "803089f25c6e15e73281e61182ebe30f9542a93d7326105c3869b0771611436c",
		"linux": "6bf599d1951f59bf9d3c115b7ac398625f86add52f3bc3b55fdb58ffe6aef360",
		"darwin": "c730a6f4c49640bfd54d566608f869357e80e2a334468d1a75967ca230fb3239" 
	},
	"1.3.1": { 
		"win32": "7557f5a390405654bad777c76795ffdc69ab6b7bb3204bc32311fd500c52c776",
		"linux": "4982191d756cbde2749243dcd98f76277c2bde635a06500658305a00aec75016",
		"darwin": "05f89d6954f5efdd1fd8eceee85b3aeecabe357321dcd84c4b16412bb6d01538" 
	}
	
}

/** 
 * Install and configure the given version of the given tool, then export environment
 * variables to allow pipelines to locate the tool installation(s). If the given version
 * equals 'skip' the tool installation will be skipped.
*/
async function installAndConfigure(internalFcliCmd: string, toolName: string, toolVersion: string): Promise<void> {
	if (toolVersion==='skip') {
		core.debug(`Skipping ${toolName} installation`);
	} else {
		const actualVersion = TOOLS[toolName]["versionAliases"][toolVersion] || toolVersion;
		const installPath = await installIfNotCached(internalFcliCmd, toolName, actualVersion, core.info);
		exportVariables(toolName, toolVersion, installPath)
	}
}

/** 
 * Install the given version of the given tool if it hasn't been previously installed.
 * This function doesn't export any variables; this is handled by installAndConfigure
 * if applicable. 
*/
async function installIfNotCached(internalFcliCmd: string, toolName: string, toolVersion: string, log: (arg: string) => void): Promise<string> {
	const tmpPath = process.env['RUNNER_TEMP'];
	const installPath = `${tmpPath}/fortify/${toolName}/${toolVersion}`;
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
		verifyFcliHash(downloadPath, version);
		installPath = await tc.extractZip(downloadPath, installPath);
	} else if (process.platform === 'darwin') {
		const downloadPath = await tc.downloadTool(`${baseUrl}/fcli-mac.tgz`);
		verifyFcliHash(downloadPath, version);
		installPath = await tc.extractTar(downloadPath, installPath);
	} else if (process.platform === 'linux') {
		const downloadPath = await tc.downloadTool(`${baseUrl}/fcli-linux.tgz`);
		verifyFcliHash(downloadPath, version);
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
function verifyFcliHash(archivePath: string, version: string) {
	const platform = process.platform;
	const expectedSha256 = FCLI_SHA256[version][platform];
	if (!expectedSha256) {
		core.warning(`Not verifying integrity of ${archivePath}`);
	} else {
		const currentSha256Promise = calculateSha256(archivePath);
		currentSha256Promise.then( currentSha256 => {
			if ( currentSha256!==expectedSha256) {
				throw `Invalid SHA256 hash for fcli ${version} (${platform}).\nExpected: ${expectedSha256}\nCurrent: ${currentSha256}`
			}
		});
	}
}

async function calculateSha256(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (error) => reject(error));
  });
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
	const cmd = TOOLS[toolName]["cmds"][process.platform];
	if (cmd) {
		core.exportVariable(varBaseName+'_CMD', core.toPlatformPath(`${installPath}/bin/${cmd}`));
	}
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
		for (const tool of Object.keys(TOOLS)) {
			await installAndConfigure(internalFcliCmd, tool, core.getInput(tool));
		}
	} catch (err) {
		core.setFailed("Action failed with error: " + err);
	}
}

main();
