import * as path from 'node:path';
import { createReadStream, createWriteStream } from 'node:fs';
import { readdir, realpath, rm, stat } from 'node:fs/promises';
import { Readable, Writable } from 'node:stream';
import { finished } from 'node:stream/promises';

// Using require to have ncc bundle the CommonJS build of zip.js; the ES module build uses import.meta,
// which causes a syntax error in our CommonJS bundles.
const { ZipWriter } = require('@zip.js/zip.js') as typeof import('@zip.js/zip.js');

interface DebugArtifactFile {
    file: string;
    name: string;
    size: number;
    lastModDate: Date;
}

function errorCode(error: unknown) {
    return (error as NodeJS.ErrnoException).code;
}

// Mirrors actions/upload-artifact directory handling: hidden files and directories are excluded,
// symbolic links are followed, and broken links are ignored.
async function listFiles(directory: string, prefix: string, visited: Set<string>): Promise<DebugArtifactFile[]> {
    const realDirectory = await realpath(directory);
    if (visited.has(realDirectory)) return [];
    visited.add(realDirectory);
    const files: DebugArtifactFile[] = [];
    for (const name of (await readdir(directory)).filter(name => !name.startsWith('.')).sort()) {
        const file = path.join(directory, name);
        const stats = await stat(file).catch(error => {
            if (errorCode(error) === 'ENOENT' || errorCode(error) === 'ELOOP') return undefined;
            throw error;
        });
        if (stats?.isDirectory()) files.push(...await listFiles(file, `${prefix}${name}/`, visited));
        else if (stats?.isFile()) files.push({ file, name: `${prefix}${name}`, size: stats.size, lastModDate: stats.mtime });
    }
    return files;
}

/**
 * Creates an AES-256 encrypted zip file containing all non-hidden files in the given directory, returning
 * the number of files added. No zip file is created if the directory doesn't exist or doesn't contain any files.
 */
export async function createDebugArtifactsZip(directory: string, zipFile: string, password: string) {
    if (!password) throw new Error('Debug artifacts zip password must be specified');
    const files = await listFiles(directory, '', new Set()).catch(error => {
        if (errorCode(error) === 'ENOENT') return [];
        throw error;
    });
    if (!files.length) return 0;
    const output = createWriteStream(zipFile);
    try {
        // Node.js web stream types are runtime-compatible with, but not assignable to, the DOM types used by zip.js
        const writer = new ZipWriter(Writable.toWeb(output) as unknown as WritableStream, {
            password, encryptionStrength: 3, zipCrypto: false, useWebWorkers: false,
        });
        for (const { file, name, size, lastModDate } of files) {
            const reader = Readable.toWeb(createReadStream(file)) as unknown as ReadableStream;
            await writer.add(name, reader, { lastModDate, uncompressedSize: size });
        }
        await writer.close();
        if (!output.writableEnded) output.end();
        await finished(output);
        return files.length;
    } catch (error) {
        output.destroy();
        await rm(zipFile, { force: true }).catch(() => undefined);
        throw error;
    }
}
