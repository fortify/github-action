/* eslint-disable @typescript-eslint/no-explicit-any */
import * as exec from '@actions/exec';
import * as tc from '@actions/tool-cache';
import * as core from '@actions/core';
import StreamZip from 'node-stream-zip';
import * as yaml from 'yaml';
import * as constants from './constants';
import * as fs from 'fs-extra';
import * as crypto from 'node:crypto';

/** 
 * Exported class that provides functionality for install and running the
 * internal 'action-default' fcli instance. An instance of this class can
 * be retrieved through the instance() method, which will download and 
 * install the internal 'action-default' fcli instance if not yet installed.
 * The public run() method can be used to run arbitrary fcli commands, the
 * public installWithFcli() method can be used to run 'fcli tool * install'
 * commands. Both methods will use the internal 'action-default' fcli instance. 
*/
export class InternalFcliHelper {
    /** Private constructor; use the instance() method to retrieve the single instance of this class. */
    private constructor(internalFcliDir : string) {
        this.internalFcliDir = internalFcliDir;
        this.internalFcliCmd = this.#getInternalFcliCmd(internalFcliDir);
    }
    
    internalFcliDir: string;
    internalFcliCmd: string;
    static #instance: InternalFcliHelper|undefined;
    
    /** 
     * Retrieve the single instance of this class. This will install the internal 
     * 'action-default' fcli instance if not yet installed. 
     */
    static async instance() : Promise<InternalFcliHelper> {
        if ( !InternalFcliHelper.#instance ) {
            InternalFcliHelper.#instance = await InternalFcliHelper.#createInstance();
        }
        return InternalFcliHelper.#instance;
    }
    
    /**
     * Run the internal 'action-default' fcli instance with the given arguments. If
     * fcli returns a non-zero exit code, this function will throw an exception.
     * Otherwise, it will return an FcliRunOutput instance, allowing callers to 
     * access stdout and stderr of the fcli invocation.
     */
    async run(args: Array<string>) : Promise<FcliRunOutput> {
        const output = new FcliRunOutput();
        const options = {
            listeners: {
                stdout: (data: Buffer) => {
                    output.stdout += data.toString();
                },
                stderr: (data: Buffer) => {
                    output.stderr += data.toString();
                }
            }
        };
        const exitCode = await exec.exec(this.internalFcliCmd, args, options);
        if ( exitCode!=0 ) {
            throw `Error executing ${this.internalFcliCmd} ${args}`
        }
        return output;
    }
    
    /** 
     * Install the given version of the given tool using the internal
     * 'action-default' fcli instance, returning the tool installation
     * directory.
    */
    async installWithFcli(toolName: string, version:string) : Promise<string> {
        const baseDir = `${constants.WORK_DIR}/tools`;
        const result = await this.run(['tool', toolName, 'install', '-y', '-v', version, '-b', baseDir, '--no-global-bin', '--progress', 'none', '-o', 'expr={installDir}\\n']);
        return result.stdout.split("\n")[0];
    }
    
    /**
     * Private method to create an instance of this class after installing the 
     * internal 'action-default' fcli instance if not yet installed.
     */
    static async #createInstance() : Promise<InternalFcliHelper> {
        const toolDefinitions = await ToolDefinitions.load(constants.TOOL_DEFINITIONS);
        const internalFcliDir = await InternalFcliHelper.#downloadAndExtract(toolDefinitions); 
        const internalFcliHelper = new InternalFcliHelper(internalFcliDir);
        await internalFcliHelper.#updateToolDefinitions(toolDefinitions);
        return internalFcliHelper;
    }
    
    /**
     * Private method to download and install the internal 'action-default' fcli
     * instance, based on the given tool definitions.
     */
    static async #downloadAndExtract(toolDefinitions: ToolDefinitions) : Promise<string> {
        const version = constants.TOOLS['fcli']['versionAliases']['action-default'];
        const versionDescriptors = await toolDefinitions.getVersionDescriptors('fcli');
        const versionDescriptor = versionDescriptors.getVersionDescriptor(version);
        if ( !versionDescriptor ) {
            throw `No tool definition found for fcli ${version}`;
        }
        return await versionDescriptor.downloadAndExtract();
    }
    
    /** 
     * Private method to update the tool definitions of the internal 'action-default'
     * fcli instance.
    */
    async #updateToolDefinitions(toolDefinitions: ToolDefinitions) : Promise<void> {
        await this.run(['tool', 'definitions', 'update', '--source', toolDefinitions.toolDefinitionsZip]);
    }
    
    /**
     * Private method to get the fcli invocation command for the internal 'action-default'
     * fcli instance.
     */
    #getInternalFcliCmd(internalFcliDir: string) {
        const internalFcliBinDir = `${internalFcliDir}/bin`;
        if (fs.existsSync(`${internalFcliBinDir}/fcli.jar`)) {
            return `java -jar ${internalFcliBinDir}/fcli.jar`;
        } else if (fs.existsSync(`${internalFcliBinDir}/fcli.exe`)) {
            return `${internalFcliBinDir}/fcli.exe`;
        } else if (fs.existsSync(`${internalFcliBinDir}/fcli`)) {
            return `${internalFcliBinDir}/fcli`;
        } else {
            throw `No fcli executable found in ${internalFcliBinDir}`;
        }
    }
}

/**
 * Exported class that holds the output of an fcli invocation.
 */
export class FcliRunOutput {
    stdout = ""
    stderr = ""
}

/** 
 * This internal class is responsible for loading and processing tool definitions.
 * Instances can be retrieved through the load() method, by providing the tool
 * definitions source URL (note that contrary to fcli, local tool definition files are 
 * currently not supported). The getVersionDescriptors() method can be used to retrieve
 * a VersionDescriptors instance for a given tool name.
 */
class ToolDefinitions {
    /** Private constructor; use the load() method to retrieve an instance of this class. */
    private constructor(toolDefinitionsZip: string) {
        this.toolDefinitionsZip = toolDefinitionsZip;
    }
    toolDefinitionsZip: string;
    
    /** Get the VersionDescriptors instance for the given tool name. */
    async getVersionDescriptors(toolName: string) {
        return await VersionDescriptors.load(this.toolDefinitionsZip, toolName);
    }
    /** Static method for loading an instance of this class using the given tool definitions source. */
    static async load(src: string) : Promise<ToolDefinitions> {
        return new ToolDefinitions(await ToolDefinitions.#downloadToolDefinitions(src));
    }
    /** Private static method to download tool definitions from the given source. */
    static async #downloadToolDefinitions(src: string) {
        const dest = `${constants.WORK_DIR}/tool-definitions/${Buffer.from(src).toString('base64')}.zip`;
        if ( !fs.existsSync(dest) ) {
            await tc.downloadTool(src, dest);
        }
        return dest;
    }
}

/**
 * This internal class holds an array of VersionDescriptor instances for a
 * single tool. Instances of this class are usually retrieved through the
 * ToolDefinitions::getVersionDescriptors() method. Individual VersionDescriptor
 * instances can be retrieved using the getVersionDescriptor() method.
 */
class VersionDescriptors {
    /** Private constructor; use the load() method to retrieve an instance of this class */
    private constructor(toolName: string, versionDescriptors: Array<VersionDescriptor>) { 
        this.#versionDescriptors = versionDescriptors;
        this.toolName = toolName;
    }
    #versionDescriptors : Array<VersionDescriptor>;
    toolName: string
    /** Load the version descriptors for the given tool from the given tool definitions zip-file. */
    static async load(toolDefinitionsZip: string, toolName: string) : Promise<VersionDescriptors> {
        const zip = new StreamZip.async({file: toolDefinitionsZip});
        const data = await zip.entryData(`${toolName}.yaml`);
        await zip.close();
        return new VersionDescriptors(toolName, yaml.parse(data.toString('utf8'))['versions'].map((obj:any)=>new VersionDescriptor(toolName, obj)));
    }
    /** Get a VersionDescriptor instance for the given tool version. */
    getVersionDescriptor(version: string) {
        return this.#versionDescriptors.find(v=>v.matches(version));
    }
}

/** 
 * This class represents a single version for a single tool, as defined in the
 * tool definitions bundle. Instances of this class are usually retrieved through
 * the VersionDescriptors::getVersionDescriptor method. The downloadAndExtract()
 * method can be used to download and extract the platform-specific tool version
 * artifact to a predefined directory.
*/
class VersionDescriptor {
    /** 
     * Constructor for creating an instance of this class for the given tool name,
     * using the data from the given object that was loaded from a tool definitions
     * bundle. 
     */
    constructor(toolName: string, obj: any) {
        this.toolName = toolName;
        this.version = obj.version;
        this.aliases = obj.aliases;
        this.artifact = this.#getArtifact(obj.binaries);
    }
    toolName: string;
    version: string;
    aliases: Array<string>;
    artifact: ArtifactDescriptor;
    /**
     * Private method to retrieve a single platform-specific ArtifactDescriptor
     * instance from the given object that was loaded from a tool definitions
     * bundle.
     */
    #getArtifact(obj: any) : ArtifactDescriptor {
        // TODO Type determination is currently fcli-specific (only supporting
        //      x64 and defaulting to java for non-matching platforms); if we
        //      ever want to reuse this code for other tool installations, this
        //      will need to be updated.
        const type = `${constants.NORMALIZED_PLATFORM}/x64`;
        const artifactObj = obj[type] ? obj[type] : obj['java'];
        if ( !artifactObj ) { throw `No suitable installation candidate found for ${type}`; }
        const result = Object.assign(new ArtifactDescriptor(), artifactObj);
        result.toolName = this.toolName;
        result.version = this.version;
        return result;
    }
    /**
     * This method returns true if the given version matches either the version or
     * one of the aliases defined in this VersionDescriptor, false otherwise.
     */
    matches(version: string) {
        return this.version==version || this.aliases.find(alias=>alias==version);
    }
    /** Download and extract the platform-specific tool version artifact to a predefined directory. */
    async downloadAndExtract() {
        return await this.artifact.downloadAndExtract();
    }
}

/**
 * This class represents a single tool version (binary) artifact, as defined in the
 * tool definitions bundle. Instances of this class are usually retrieved through
 * the VersionDescriptor::#getArtifact method. The downloadAndExtract()
 * method can be used to download and extract this artifact to a predefined directory.
 */
class ArtifactDescriptor {
    toolName: string = "";
    version: string = "";
    name: string = "";
    downloadUrl: string = "";
    rsa_sha256: string = "";
    /** 
     * Download, verify and copy or extract the artifact represented by this 
     * descriptor to a predefined directory as returned by the #getDestDir() 
     * method. This method returns the directory where the tool was extracted.
     */
    async downloadAndExtract() {
        const destDir = this.#getDestDir();
        if ( !fs.existsSync(destDir) || fs.readdirSync(destDir).length === 0 ) {
            const binDir = `${destDir}/bin`;
            const file = await tc.downloadTool(this.downloadUrl);
            await this.#verify(file);
            if ( this.downloadUrl.endsWith(".zip") ) {
                await tc.extractZip(file, binDir);
            } else if ( this.downloadUrl.endsWith(".tgz") ) {
                await tc.extractTar(file, binDir);
            } else if (this.downloadUrl.endsWith(".jar") ) {
                await fs.ensureDir(binDir);
                await fs.copyFile(file, `${binDir}/${this.name}`);
            } else {
                throw `Unexpected file extension in download URL ${this.downloadUrl}`;
            }
            await fs.rm(file);
        }
        return destDir;
    }
    /**
     * Private method to retrieve the artifact extraction directory. This uses a different
     * naming convention than fcli, to ensure that fcli post-install actions are being run
     * for user-requested fcli versions.
     */
    #getDestDir() : string {
        return `${constants.WORK_DIR}/tools/${this.toolName}/${Buffer.from(this.downloadUrl).toString('base64')}`;
    }
    /**
     * Verify the given file against the signature contained in this ArtifactDescriptor instance.
     */
    async #verify(file: string) {
        if ( this.version.startsWith("dev_") ) {
            core.warning("Fcli action-default set to development version, not verifying signature. This should be changed to fcli release version before releasingthe GitHub Action.");
        } else {
            const verifier = crypto.createVerify('RSA-SHA256');
            const readable = fs.createReadStream(file);
            // For some reason, readable.pipe(verifier) doesn't work
            for await (const chunk of readable) {
                verifier.update(chunk);
            }
            if (!verifier.verify(constants.TOOL_DEFINITIONS_PUBLIC_KEY, this.rsa_sha256, 'base64')) {
                console.log(constants.TOOL_DEFINITIONS_PUBLIC_KEY)
                console.log(this.rsa_sha256)
                throw `File signature verification failed for ${this.downloadUrl}`;
            }
        }
    }
}