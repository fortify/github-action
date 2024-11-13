import * as core from '@actions/core';
import * as fcli from './fcli'
import * as constants from './constants';
import { env } from 'node:process';

/** 
 * Exported function for installing the given version of the given tool.
 * 
 * If version=='skip', tool installation will be skipped.
 * If version=='action-default', the 'action-default' version as defined
 * in the TOOLS constant will be installed.
 * Otherwise, the given tool version will be installed.
 * 
 * If the 'action-default' version of fcli is to be installed, the internal fcli 
 * installer will be used. For all other tools and other fcli versions, the 
 * internal 'action-default' fcli installation will be used to perform the installation.
 * 
 * If the 'export-path' input is set to 'true', the tool bin-directory will be
 * added to the workflow PATH environment variable for easy tool invocation. In
 * addition, the following environment variables will always be set:
 * - <TOOL_NAME>_INSTALL_DIR: Tool installation directory
 * - <TOOL_NAME>_BIN_DIR: Tool bin-directory
 * - <TOOL_NAME>_CMD: Platform-specific command for running the primary tool executable
*/
export async function install(toolName: string, version: string) {
    switch(version) {
        case 'skip': break;
        case 'action-default': await installActionDefault(toolName); break;
        default: await installVersion(toolName, version); break;
    }
}

/** 
 * Install the 'action-default' version of the given tool name as defined in 
 * the TOOLS constant. If toolName=='fcli', the installActionDefaultFcli() 
 * function will be invoked to install fcli using the internal fcli installer, 
 * otherwise the installVersion() function will be invoked to use the internal
 * 'action-default' fcli instance for performing the installation.
*/
async function installActionDefault(toolName: string) {
    switch(toolName) {
        case 'fcli': await installActionDefaultFcli(); break;
        default: await installVersion(toolName, getActionDefault(toolName)); break;
    }
}

function getActionDefault(toolName: string) {
    const versionFromEnv = env[getEnvVarBaseName(toolName)+"_VERSION"];
    return versionFromEnv ? versionFromEnv : constants.TOOLS[toolName]['versionAliases']['action-default'];
}

/**
 * Install the 'action-default' fcli version using the internal fcli
 * installer. This simply gets the singleton instance of the 
 * InternalFcliHelper (which will install the internal fcli instance
 * if not yet installed), and then exports the appropriate environment
 * variables.
 */
async function installActionDefaultFcli() {
    const fcliHelper = await fcli.InternalFcliHelper.instance();
    exportToolPathVariables('fcli', fcliHelper.internalFcliDir);
    exportToolCmdVariable('fcli', fcliHelper.internalFcliCmd);
}

/** 
 * Install the given version of the given tool using the internal
 * 'action-default' fcli instance, then export the appropriate 
 * environment variables.
*/
async function installVersion(toolName: string, version: string) {
    const fcliHelper = await fcli.InternalFcliHelper.instance();
    const installPath = await fcliHelper.installWithFcli(toolName, version);
    exportToolPathVariables(toolName, installPath);
    const cmd = constants.TOOLS[toolName]["cmds"][constants.NORMALIZED_PLATFORM];
    exportToolCmdVariable(toolName, core.toPlatformPath(`${installPath}/bin/${cmd}`));
}

/**
 * Export tool path variables. If the 'export-path' input is set to 'true', the
 * <installPath>/bin directory will be added to the workflow PATH environment
 * variable. In addition, the following environment variables will be set:
 * - <TOOL_NAME>_INSTALL_DIR: Tool installation directory
 * - <TOOL_NAME>_BIN_DIR: Tool bin-directory
 */
function exportToolPathVariables(toolName: string, installPath: string): void {
  if (constants.EXPORT_PATH) {
      core.addPath(`${installPath}/bin`);
  }
  const varBaseName = getEnvVarBaseName(toolName);
  core.exportVariable(varBaseName+'_INSTALL_DIR', core.toPlatformPath(installPath));
  core.exportVariable(varBaseName+'_BIN_DIR', core.toPlatformPath(`${installPath}/bin`));
}

/** 
 * Export the <TOOL_NAME>_CMD environment variable, containing the platform-specific 
 * command for running the primary tool executable. If no platform-specific command
 * is available, this environment variable will not be exported. 
*/
function exportToolCmdVariable(toolName: string, cmd: string) {
    if ( cmd ) {
        core.exportVariable(`${getEnvVarBaseName(toolName)}_CMD`, cmd);
    }
}

/** 
 * Get the environment variable base name for the given tool name. This simply
 * converts the given tool name to upper case and replaces all dashes by underscores.
*/
function getEnvVarBaseName(toolName: string) {
    return toolName.toUpperCase().replace('-','_');
}

