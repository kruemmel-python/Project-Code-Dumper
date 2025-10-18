
export type BinaryMode = "skip" | "hex" | "base64" | "bytes";
export type SortMode = "path" | "size" | "time";

export interface DumpOptions {
    include: string[];
    exclude: string[];
    maxSize: number | null;
    binaryMode: BinaryMode;
    showMetadata: boolean;
    sort: SortMode;
    strictText: boolean;
}

export interface Preset {
    name: string;
    options: Partial<DumpOptions & { include: string[]; exclude: string[] }>;
}

export interface FileResult {
    path: string;
    markdown: string;
}
