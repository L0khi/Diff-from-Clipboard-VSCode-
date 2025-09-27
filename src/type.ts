// src/types.ts
export interface Hunk {
    file?: string | null;   // optional filename
    header?: string;        // raw @@ header line
    startLine: number;      // where to apply in target file
    endLine: number;        // end of range
    lines: string[];        // raw diff lines (+, -, or space)
}
