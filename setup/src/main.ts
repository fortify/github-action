import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as exec from '@actions/exec';

/**
 * Install fcli
 * @returns path to the directory where fcli was installed
 */
async function installFcli(): Promise<void> {
	const fcliVersion = getFcliVersion();
	let cachedPath = tc.find('fcli', fcliVersion);
	if (cachedPath) {
		core.info(`Using fcli ${fcliVersion} from cache`);
	} else {
		const baseUrl = fcliVersion === 'latest'
			? 'https://github.com/fortify/fcli/releases/latest/download'
			: `https://github.com/fortify/fcli/releases/download/${fcliVersion}`
		let installPath = '/opt/fortify/fcli';
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
	core.addPath(cachedPath);
}

function getFcliVersion(): string {
	const fcliVersion = core.getInput('fcli');
	switch (fcliVersion) {
		case "latest": return "latest";
		// TODO: Once we add support for checking fcli hash based on provided version,
		//       use latest version for which hash is known if fcliVersion=='default'
		case "default": return "latest";
		default: return (fcliVersion.match(/\d+\.\d+\.\d+/)) ? "v" + fcliVersion : fcliVersion
	}
}

async function installTool(toolName: string, toolVersion: string): Promise<void> {
	if (toolVersion !== 'none') {
		let installPath = tc.find(toolName, toolVersion);
		if (installPath) {
			core.info(`Using ${toolName} ${toolVersion} from cache`);
		} else {
			core.info(`Installing ${toolName} ${toolVersion}`);
			installPath = `/opt/fortify/${toolName}`;
			await exec.exec('fcli', ['tool', toolName, 'install', toolVersion, '-d', installPath]);
			installPath = await tc.cacheDir(installPath, toolName, toolVersion);
		}
		core.addPath(`${installPath}/bin`);
	}
}

async function main(): Promise<void> {
	const tools = ['sc-client', 'fod-uploader', 'vuln-exporter']
	try {
		await installFcli();
		for (const tool of tools) {
			await installTool(tool, core.getInput(tool))
		}
	} catch (err) {
		core.setFailed("Action failed with error: " + err);
	}
}

main();
