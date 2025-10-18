import { DumpOptions, FileResult } from '../types';
import { DEFAULT_EXCLUDES } from '../constants';
import { minimatch } from 'minimatch';

declare const JSZip: any;

function guessLanguage(filename: string): string {
    const extension = (filename.split('.').pop() || '').toLowerCase();
    switch (extension) {
        case "py": return "python";
        case "ipynb": return "json";
        case "js": return "javascript";
        case "ts": return "typescript";
        case "jsx": return "jsx";
        case "tsx": return "tsx";
        case "java": return "java";
        case "kt": return "kotlin";
        case "rs": return "rust";
        case "go": return "go";
        case "cpp": case "cc": case "cxx": return "cpp";
        case "c": return "c";
        case "cs": return "csharp";
        case "php": return "php";
        case "rb": return "ruby";
        case "swift": return "swift";
        case "sh": case "bash": return "bash";
        case "ps1": return "powershell";
        case "html": case "htm": return "html";
        case "css": return "css";
        case "scss": case "sass": return "scss";
        case "md": return "markdown";
        case "json": return "json";
        case "toml": return "toml";
        case "ini": case "cfg": case "conf": return "ini";
        case "yaml": case "yml": return "yaml";
        case "xml": return "xml";
        case "sql": return "sql";
        case "csv": return "csv";
        case "txt": return "";
        default: return "";
    }
}

function isProbablyBinary(data: Uint8Array): boolean {
    // Check for null byte
    if (data.slice(0, 4096).includes(0)) {
        return true;
    }

    // Heuristic: check ratio of non-text characters
    const textChars = new Set([9, 10, 13, ...Array.from({ length: 95 }, (_, i) => i + 32)]);
    const sample = data.slice(0, 8192);
    if (sample.length === 0) return false;
    
    let nonTextCount = 0;
    for (const byte of sample) {
        if (!textChars.has(byte)) {
            nonTextCount++;
        }
    }
    
    return (nonTextCount / sample.length) > 0.30;
}

function decodeText(data: Uint8Array, strictText: boolean): string | null {
    const decoder = new TextDecoder('utf-8', { fatal: strictText });
    try {
        return decoder.decode(data);
    } catch (e) {
        if (strictText) return null;
        // Fallback for non-strict mode
        const fallbackDecoder = new TextDecoder('utf-8', { fatal: false });
        return fallbackDecoder.decode(data);
    }
}

function shouldSkip(filename: string, include: string[], exclude: string[]): boolean {
    const posixPath = filename.replace(/\\/g, "/");
    
    if (include.length > 0 && !include.some(p => minimatch(posixPath, p))) {
        return true;
    }
    
    const allExcludes = [...DEFAULT_EXCLUDES, ...exclude];
    if (allExcludes.some(p => minimatch(posixPath, p))) {
        return true;
    }
    
    return false;
}

function formatDatetime(date: Date): string {
    return date.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
}

function arrayBufferToHexString(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

async function processFile(zipFile: any, options: DumpOptions): Promise<FileResult> {
    const path = zipFile.name;
    const data: ArrayBuffer = await zipFile.async("arraybuffer");
    const dataUint8 = new Uint8Array(data);

    const metadata = {
        path: path,
        size: data.byteLength,
        modified: formatDatetime(zipFile.date),
    };

    const metadataLines = options.showMetadata ? [
        `- Path: \`${metadata.path}\``,
        `- Size: ${metadata.size} Bytes`,
        `- Modified: ${metadata.modified}`,
    ] : [];
    
    const header = (details: string[] = []) => {
        let h = `## File: \`${metadata.path}\``;
        const allDetails = [...metadataLines, ...details];
        if (allDetails.length > 0) {
            h += `  \n${allDetails.join('  \n')}`;
        }
        return h + '\n\n';
    };

    if (options.maxSize !== null && metadata.size > options.maxSize) {
        return { path, markdown: header() + `> **Skipped**: File is larger than max size (${options.maxSize} bytes).\n\n`};
    }

    if (isProbablyBinary(dataUint8)) {
        switch (options.binaryMode) {
            case "skip":
                return { path, markdown: header() + `> **Binary file skipped** (mode: skip).\n\n`};
            case "hex":
                return { path, markdown: header([`- Mode: hex`]) + `\`\`\`text\n${arrayBufferToHexString(data)}\n\`\`\`\n\n` };
            case "base64":
                return { path, markdown: header([`- Mode: base64`]) + `\`\`\`text\n${arrayBufferToBase64(data)}\n\`\`\`\n\n` };
            case "bytes":
                const snippet = new TextDecoder('latin1').decode(data.slice(0, 65536));
                const more = data.byteLength > 65536 ? '... (truncated)' : '';
                return { path, markdown: header([`- Mode: bytes`]) + `\`\`\`text\n${snippet}${more}\n\`\`\`\n\n` };
        }
    }
    
    const text = decodeText(dataUint8, options.strictText);
    if (text === null) {
        return { path, markdown: header() + `> **Warning**: Text decoding failed (strict mode is on). File skipped.\n\n` };
    }

    const lang = guessLanguage(path);
    return {
        path,
        markdown: header() + `\`\`\`${lang}\n${text}\n\`\`\`\n\n`,
    };
}

export async function createCodeDump(
    zipFile: File,
    options: DumpOptions,
    onProgress: (percent: number) => void
): Promise<FileResult[]> {
    const zip = await JSZip.loadAsync(zipFile);
    
    const filesToProcess = Object.values(zip.files).filter((file: any) => {
        return !file.dir && !shouldSkip(file.name, options.include, options.exclude);
    });

    filesToProcess.sort((a: any, b: any) => {
        switch (options.sort) {
            case 'size':
                return a.unsafeOriginalName.length - b.unsafeOriginalName.length || a.name.localeCompare(b.name);
            case 'time':
                return (a.date.getTime() - b.date.getTime()) || a.name.localeCompare(b.name);
            case 'path':
            default:
                return a.name.localeCompare(b.name);
        }
    });

    const results: FileResult[] = [];
    for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        const result = await processFile(file, options);
        results.push(result);
        onProgress(Math.round(((i + 1) / filesToProcess.length) * 100));
    }

    return results;
}