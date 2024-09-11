import * as core from '@actions/core';

/**
 * The TOOLS records list the tools supported by this action, together with
 * 'action-default' version aliases and the appropriate command names for
 * each platform.
 */ 
export const TOOLS: Record<string, Record<string, Record<string, string>>> = {
    /**
     * IMPORTANT: When updating "action-default" versions in the TOOLS record,
     *            please make sure to update any corresponding version numbers 
     *            in the documentation links in doc-resources/template-values.md 
     *            accordingly to allow for proper version-specific links in the 
     *            action documentation. For now, this only applies to fcli and
     *            ScanCentral Client, but please double-check. 
     */
    "fcli": { 
        "versionAliases": {"action-default": "2.6.0"},
        "cmds": {"windows": "fcli.exe", "linux": "fcli", "darwin": "fcli"}
    },
    "sc-client": { 
        "versionAliases": {"action-default": "24.2.0"},
        "cmds": {"windows": "scancentral.bat", "linux": "scancentral", "darwin": "scancentral"}
    },
    "vuln-exporter": { 
        "versionAliases": {"action-default": "2.1.0"},
        "cmds": {"windows": "FortifyVulnerabilityExporter.bat", "linux": "FortifyVulnerabilityExporter", "darwin": "FortifyVulnerabilityExporter"}
    },
    "fod-uploader": { 
        "versionAliases": {"action-default": "5.4.1"},
        "cmds": {"windows": "FoDUploader.bat", "linux": "FoDUploader", "darwin": "FoDUploader"}
    },
    "bugtracker-utility": { 
        "versionAliases": {"action-default": "4.14.0"},
        "cmds": {"windows": "FortifyBugTrackerUtility.bat", "linux": "FortifyBugTrackerUtility", "darwin": "FortifyBugTrackerUtility"}
    },
    "debricked-cli": { 
        "versionAliases": {"action-default": "2.0.8"},
        "cmds": {"windows": "debricked.exe", "linux": "debricked", "darwin": "debricked"}
    }
};
/** For every tool listed in TOOLS, the TOOL_VERSIONS Map contains the corresponding version to be installed */
export const TOOL_VERSIONS = Object.keys(TOOLS)
    .reduce((map,toolName)=>map.set(toolName, getOrDefault(core.getInput(toolName), 'skip')), new Map());
    
/** The EXPORT_PATH boolean indicates whether the new tool installation should be added to the PATH */
export const EXPORT_PATH = core.getBooleanInput('export-path');

/** The WORK_DIR string defines the working directory for this action */
export const WORK_DIR = `${process.env['RUNNER_TEMP']}/fortify`

/** The TOOL_DEFINITIONS string defines the tool definitions source */
export const TOOL_DEFINITIONS = getOrDefault(core.getInput('tool-definitions'), 
    getOrDefault(process.env['TOOL_DEFINITIONS'], 'https://github.com/fortify/tool-definitions/releases/download/v1/tool-definitions.yaml.zip'));
    
/** The NORMALIZED_PLATFORM string defines the normalized platform for lookup in tool definitions */
export const NORMALIZED_PLATFORM = getNormalizedPlatform()

/** The TOOL_DEFINITIONS_PUBLIC_KEY string defines the public key for checking tool definition signatures */
export const TOOL_DEFINITIONS_PUBLIC_KEY = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArij9U9yJVNc53oEMFWYp
NrXUG1UoRZseDh/p34q1uywD70RGKKWZvXIcUAZZwbZtCu4i0UzsrKRJeUwqanbc
woJvYanp6lc3DccXUN1w1Y0WOHOaBxiiK3B1TtEIH1cK/X+ZzazPG5nX7TSGh8Tp
/uxQzUFli2mDVLqaP62/fB9uJ2joX9Gtw8sZfuPGNMRoc8IdhjagbFkhFT7WCZnk
FH/4Co007lmXLAe12lQQqR/pOTeHJv1sfda1xaHtj4/Tcrq04Kx0ZmGAd5D9lA92
8pdBbzoe/mI5/Sk+nIY3AHkLXB9YAaKJf//Wb1yiP1/hchtVkfXyIaGM+cVyn7AN
VQIDAQAB
-----END PUBLIC KEY-----`;

/** Utility function that returns the given value if defined and not blank, or the given default value otherwise */
function getOrDefault(value: string|undefined, def: string) {
    return value && value.trim()!=''  ? value : def;
}

/** Utility function to get normalized platform */
function getNormalizedPlatform() {
    const platform = process.platform;
    if (platform.toLowerCase().startsWith("linux") ) {
        return "linux";
    }
    if (platform.toLowerCase().startsWith("mac") || platform.toLowerCase().startsWith("darwin") ) {
        return "darwin";
    }
    if (platform.toLowerCase().startsWith("win") ) {
        return "windows";
    }
    return platform;
}