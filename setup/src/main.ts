import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as exec from '@actions/exec';

// TODO Update to 2.0.0 once available
const INTERNAL_FCLI_VERSION='dev_develop';

// TODO For both fcli and other tools, if version is 'latest', we probably shouldn't use
//      tool cache (as then we may never download newer versions), but we do want to check
//      whether installPath already exists to avoid reinstalling multiple times within a
//      single workflow (depending on how we organize other actions, this setup action may 
//      be invoked multiple times).
// TODO Somewhat related, if version is 'default', we may want to translate that to the 
//      actual version number for use in tool path and cache. For tools installed through
//      fcli, we can run `fcli tool * list` with query and output options to get the version
//      number for the default version.
// TODO We may need 'internal' versions for the other tools as well, for example a composite
//      export-vulnerabilities workflow may use this setup action to install a specific FVE
//      version, but we don't want to add that version to the system path as we don't want
//      the export-vulnerabilities action to override the FVE version requested by the user.

/**
 * Install fcli
 * @returns path to the directory where fcli was installed
 */
async function installFcli(fcliVersion: string): Promise<string> {
	let cachedPath = tc.find('fcli', fcliVersion);
	if (cachedPath) {
		core.info(`Using previously installed fcli ${fcliVersion}`);
	} else {
		const baseUrl = fcliVersion === 'latest'
			? 'https://github.com/fortify/fcli/releases/latest/download'
			: `https://github.com/fortify/fcli/releases/download/${fcliVersion}`
		let installPath = `/opt/fortify/fcli/${fcliVersion}`;
		core.info(`Installing fcli ${fcliVersion} from ${baseUrl}`);
		// TODO Verify download hashes
		if (process.platform === 'win32') {
			const downloadPath = await tc.downloadTool(`${baseUrl}/fcli-windows.zip`);
			installPath = await tc.extractZip(downloadPath, installPath);
		} else if (process.platform === 'darwin') {
			const downloadPath = await tc.downloadTool(`${baseUrl}/fcli-mac.tgz`);
			installPath = await tc.extractTar(downloadPath, installPath);
		} else if (process.platform === 'linux') {
			const downloadPath = await tc.downloadTool(`${baseUrl}/fcli-linux.tgz`);
			installPath = await tc.extractTar(downloadPath, installPath);
		} else {
			// TODO Install Java version?
			throw "Unsupported platform"
		}
		cachedPath = await tc.cacheDir(installPath, 'fcli', fcliVersion);
	}
	return cachedPath;
}

function getFcliVersion(): string {
	const fcliVersion = core.getInput('fcli');
	switch (fcliVersion) {
		case "latest": return "latest";
		// TODO: Once we add support for checking fcli hash based on provided version,
		//       use latest version for which hash is known if fcliVersion=='default'
		case "default": return "latest";
		default: return (fcliVersion.match(/^\d+\.\d+\.\d+$/)) ? "v" + fcliVersion : fcliVersion
	}
}

async function installTool(internalFcli: string, toolName: string, toolVersion: string): Promise<void> {
	if (toolVersion !== 'none') {
		let installPath = tc.find(toolName, toolVersion);
		if (installPath) {
			core.info(`Using previously installed ${toolName} ${toolVersion}`);
		} else {
			core.info(`Installing ${toolName} ${toolVersion}`);
			installPath = `/opt/fortify/${toolName}/${toolVersion}`;
			await exec.exec(internalFcli, ['tool', toolName, 'install', toolVersion, '-d', installPath]);
			installPath = await tc.cacheDir(installPath, toolName, toolVersion);
		}
		core.addPath(`${installPath}/bin`);
	}
}

async function main(): Promise<void> {
	const tools = ['sc-client', 'fod-uploader', 'vuln-exporter']
	try {
		// Install fixed fcli version for internal action use. The path to the
		// internal fcli executable is accessible through the INTERNAL_FCLI
		// environment variable.
		const internalFcli = core.toPlatformPath(await installFcli(INTERNAL_FCLI_VERSION)+'/fcli');
		core.exportVariable('INTERNAL_FCLI', internalFcli);
		
		// Install user-specified fcli version and other Fortify tools
		core.addPath(await installFcli(getFcliVersion()));
		for (const tool of tools) {
			await installTool(internalFcli, tool, core.getInput(tool))
		}
	} catch (err) {
		core.setFailed("Action failed with error: " + err);
	}
}

main();
