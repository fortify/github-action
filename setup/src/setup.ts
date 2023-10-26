import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as exec from '@actions/exec';
import * as fs from 'node:fs';
import * as crypto from 'node:crypto';
      
const TOOLS: Record<string, Record<string, Record<string, string>>> = {
	"fcli": { 
		"versionAliases": {"action-default": "2.0.0", "latest": "2.0.0"},
		"cmds": {"win32": "fcli.exe", "linux": "fcli", "darwin": "fcli"}
	},
	"sc-client": { 
		"versionAliases": {"action-default": "23.1.0"},
		"cmds": {"win32": "scancentral.bat", "linux": "scancentral", "darwin": "scancentral"}
	},
	"vuln-exporter": { 
		"versionAliases": {"action-default": "2.0.4"},
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
const FCLI_SHA256: Record<string, string> = {
	"v2.0.0/fcli-linux.tgz": "6af0327561890bf46e97fab309eb69cd9b877f976f687740364a08d83fc7e020",
	"v2.0.0/fcli-mac.tgz": "9416074065b4e27557a9323bc41534b11689003a464fc92ac17ca49c1d25c6c6",
	"v2.0.0/fcli-windows.zip": "1abef1f55fb586efdc8eb63ed25575e1ee25e63aa1e59f56216d8e38699fa608",
	"v1.3.2/fcli-linux.tgz": "c2ecf1dd8656b348246e2d699aeb84f1d683e7bd9d2e3095f041dbc7249293f8",
	"v1.3.2/fcli-mac.tgz": "cc6c7c0de68724974210749e50e2d0d6ea75275f58c344c071d6c94edd9414c2",
	"v1.3.2/fcli-windows.zip": "1355029aba5e904e956e01da2c09eb9068d027e3df58930cc5530e0c1bcbadbb",
	"v1.3.1/fcli-linux.tgz": "4982191d756cbde2749243dcd98f76277c2bde635a06500658305a00aec75016",
	"v1.3.1/fcli-mac.tgz": "05f89d6954f5efdd1fd8eceee85b3aeecabe357321dcd84c4b16412bb6d01538",
	"v1.3.1/fcli-windows.zip": "7557f5a390405654bad777c76795ffdc69ab6b7bb3204bc32311fd500c52c776",
	"v1.3.0/fcli-linux.tgz": "e43618e0836f2a9257264729ac2b4fed3f1f6e9ba981f7d78886d10a8c22425a",
	"v1.3.0/fcli-mac.tgz": "0b7bd0bf4eb607e015fcf051a4d24241bc358cb530f79ef8ce89d5835505c45f",
	"v1.3.0/fcli-windows.zip": "fc2d9d32fa29df916bd8a9d038147db732a67c9fe6b55bf9a20504d663e3baa0",
	"v1.2.5/fcli-linux.tgz": "bf8570ca2fb59ddd27373779a51d9b494a93110420dfc6e7dadf3423bf244682",
	"v1.2.5/fcli-mac.tgz": "9cbc6269196aaf0de80fcc17ce29da8381eb7628bae94fe82880d7bcfa34b4b3",
	"v1.2.5/fcli-windows.zip": "78a3799e57d5e58cfaa31dcb091438c745231c949850f921af878b8c9ec75274",
	"v1.2.4/fcli-linux.tgz": "f332c9c7907abe58ea924f21e59541f4130dbbd09eaa14cbe5cf9e92bbd11dd2",
	"v1.2.4/fcli-mac.tgz": "21c2d155cf7f47d75ef67baae9aa3e58c9053860bfbe13c0681cce843fcc4712",
	"v1.2.4/fcli-windows.zip": "4a719ec7327432e873c9f4e064f84b37c0023e4f376f7595edfbe8e97a59383d",
	"v1.2.3/fcli-linux.tgz": "abe5fe695bf474b5912c4cc60f843f8318f78abb00a393d9abf1601d58752b88",
	"v1.2.3/fcli-mac.tgz": "255a4059bbf5ce28a625f21b056fbf52991246030d93022617bc43bc836cf7f5",
	"v1.2.3/fcli-windows.zip": "5c14fc4e108d927d43374e3cbae12536745c0c3241d96e69df1d5026f4f9d124",
	"v1.2.2/fcli-linux.tgz": "6c2fc08f6374ca25ada516e90a6a9e78492135493d2a0903c6c126370f18ca3b",
	"v1.2.2/fcli-mac.tgz": "ab03c8566859014ec40f816d5e009781f802aca00109ae1ce5637d57796d0278",
	"v1.2.2/fcli-windows.zip": "3574d39888a58d8e1c8a57ab2ee8367eea66b630816416fffae513b59f1b87c2",
	"v1.2.1/fcli-linux.tgz": "04fe14fc1e2ab307824038e6c384d01cf7fbac36ece9b3f4fbde25b51bee617f",
	"v1.2.1/fcli-mac.tgz": "6abd10d324623a70425aee64991fc461b172258a3a46668509b6cd8e52bc700a",
	"v1.2.1/fcli-windows.zip": "aa907601dd19d43c1d1fea199be3877d87c81f5aedde10122b8ea369a2c64d25",
	"v1.2.0/fcli-linux.tgz": "9aeb6efc28d692fc3f721f17b0a71acb93a84001571d99b9af74ef2a62f67b97",
	"v1.2.0/fcli-mac.tgz": "57eef5ec58eb793cc510200f003702111064d146b601576cb92fbf7fac3d5b54",
	"v1.2.0/fcli-windows.zip": "64b4983b647fe800c538d0a962fcd411e0c5d7ff612839df110a593a964ae04f",
	"v1.1.0/fcli-linux.tgz": "5553766f0f771abdf27f4c6b6d38a34825a64aaa5d72cfd03c68d7e2f43a49a0",
	"v1.1.0/fcli-mac.tgz": "e8364c9bb7f340c5129fc825d1c8f6425ea1140039be53258cf0d8061ae2167a",
	"v1.1.0/fcli-windows.zip": "9868783113e77f871e02756e883de4cf929b2f0efc53f79b49b1c4f06c27d18c",
	"v1.0.5/fcli-linux.tgz": "f57b697e42a5ef11f0c6c5a4be077a099a6020461b1f4eaba923f26968f1f8fa",
	"v1.0.5/fcli-mac.tgz": "d935abd69303dc4849e5838768002b57e57ef71818463f50b159e402bc2d9d84",
	"v1.0.5/fcli-windows.zip": "2745e96e5b9b14aeea871a9bbaf1fd57261cbe315480266a12e411df1e4cc730",
	"v1.0.4/fcli-linux.tgz": "ca10969ed6dfa6357000c0f4efda8f36e1c820dda464d370ea75cf9e26b6f6e6",
	"v1.0.4/fcli-mac.tgz": "89f8028025503c068e6c28d6cafab10d9cae5839a54df7496fa288ce77ffd323",
	"v1.0.4/fcli-windows.zip": "d01f7a4eaf27e33f2fa17883a92eb5e896a04464783b942caf6b9a3a8ae3381e",
	"v1.0.3/fcli-linux.tgz": "48ec8fc82419d72d9af998bc7cd67d4275739275e7059437c84030b2764ec4ff",
	"v1.0.3/fcli-mac.tgz": "89029a38896f5d9e12094cc9ea78202c6c3d8cedbfaee26e2aefe08afd8bb12e",
	"v1.0.3/fcli-windows.zip": "de57ee5e8da7b03af000acd2347b136fa168f084221375c00636e7fca7927573",
	"v1.0.2/fcli-linux.tgz": "3e68eb41eb59c1c4f80b773e236f62ca745ebf5f57c174a6a6aaba562be219b6",
	"v1.0.2/fcli-mac.tgz": "473795eaa097c48c8d3484fa993e28dd6aae56b8c2d7707846f2ef5f14e1fde2",
	"v1.0.2/fcli-windows.zip": "d770199c39c6716196dc9b969a74a71616f31638df0a00ca4989ce29c54fe80e",
	"v1.0.1/fcli-linux.tgz": "6ce43de4e5b754962dadb444ba6e904f1f3918a5c755437b754bf8c82919bcd6",
	"v1.0.1/fcli-mac.tgz": "e22cdc45064ef65c36be428feff191ebfc05516c0aa120477d268cd17c173463",
	"v1.0.1/fcli-windows.zip": "9c5ce7ca2513b4c4c38f54a127bed4544e2b8f82fecd893b59a51f32759f2259",
	"v1.0.0/fcli-linux.tgz": "a8fa6ede646888dfd693b8706b4712cfde7aacbfc94c01438b78adc145f41a25",
	"v1.0.0/fcli-mac.tgz": "8d9e514b851d798dc1ecc5c7d96e31298c4afffe88d66dbc013eeb0ca5967fc3",
	"v1.0.0/fcli-windows.zip": "177dc75c8aaa3e188a313d75e68ea85832e097b85f62e15f9f2edc6ffb323f71"
}

function updateFcliVersionAliases() {
	for ( const slug in Object.keys(FCLI_SHA256) ) {
		const version = slug.substring(0, slug.indexOf('/'));
		const alias1 = version.substring(0, version.indexOf('.'));
		const alias2 = version.substring(0, version.lastIndexOf('.'));
		core.info(`${version} aliases: ${alias1} ${alias2}`);
		TOOLS["fcli"]["versionAliases"][alias1] = version;
		TOOLS["fcli"]["versionAliases"][alias2] = version;
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
		await exec.exec(internalFcliCmd, ['tool', toolName, 'install', '-v', toolVersion, '-d', installPath]);
	}
}

/**
 * Install the given fcli version to the given path. This function doesn't perform any tool 
 * caching, and doesn't set any environment variables; this is handled by installAndConfigure 
 * if applicable.
 */
async function installFcli(installPath: string, version: string): Promise<void> {
	const downloadSlug = getFcliDownloadSlug(version);
	const downloadUrl = `https://github.com/fortify/fcli/releases/download/${downloadSlug}`;
	installPath = `${installPath}/bin`;
	core.info(`Installing fcli ${version} from ${downloadUrl}`);
	const downloadPath = await tc.downloadTool(downloadUrl);
	verifyFcliHash(downloadPath, downloadSlug);
	if ( downloadSlug.endsWith('.zip') ) {
		await tc.extractZip(downloadPath, installPath);
	} else {
		await tc.extractTar(downloadPath, installPath);
	}
}

/**
 * Get the base URL for downloading fcli artifacts for the given version. 
 */
function getFcliDownloadSlug(version: string): string {
	if ( version.match(/^\d+\.\d+\.\d+$/) ) {
		version = `v${version}`
	}
	let slug = version+"/";
	switch (process.platform) {
		case "win32": slug+="fcli-windows.zip"; break;
		case "darwin": slug+="fcli-mac.tgz"; break;
		case "linux": slug+="fcli-linux.tgz"; break;
		default: 
			// TODO Install Java version? Should we then also generate a bash script
			// for invoking 'java -jar <path/to/jar> $@'? 
			throw "Unsupported platform"
	}
	return slug;
}

/**
 * Verify the integrity of the given fcli archive.
*/
function verifyFcliHash(archivePath: string, downloadSlug: string) {
	const expectedSha256 = FCLI_SHA256[downloadSlug];
	if (!expectedSha256) {
		core.warning(`Not verifying integrity of ${archivePath}`);
	} else {
		const currentSha256Promise = calculateSha256(archivePath);
		currentSha256Promise.then( currentSha256 => {
			if ( currentSha256!==expectedSha256) {
				throw `Invalid SHA256 hash for ${downloadSlug}.\nExpected: ${expectedSha256}\nCurrent: ${currentSha256}`
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
	updateFcliVersionAliases();
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
