import * as core from '@actions/core';
import * as installer from './installer';
import * as constants from './constants';

/**
 * Main entrypoint for this GitHub Action. This function simply invokes the 
 * installer.install() function for every tool name & version defined in the 
 * TOOL_VERSIONS constant.
 */
async function main(): Promise<void> {
	try {
        for ( const [toolName, toolVersion] of constants.TOOL_VERSIONS.entries()) {
            await installer.install(toolName, toolVersion);
        }
	} catch (err) {
		core.setFailed("Action failed with error: " + err);
	}
}

main();
