import * as core from '@actions/core';
import * as exec from '@actions/exec';

function resolveVariables(s: string): string {
	return s.replace(/\$\{(.*?)\}/g, (...match) => {
        return resolveVariables(process.env[match[1]] || '');
	});
}

async function main(): Promise<void> {
	const cmd = resolveVariables(core.getInput('cmd'));
	try {
		await exec.exec(cmd);
	} catch (err) {
		core.setFailed(`Failed to run command:\n${cmd}\nError: ${err}`);
	}
}

main();
