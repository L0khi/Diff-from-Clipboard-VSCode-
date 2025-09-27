import { Hunk } from './type';

function stripFences(text: string) {
    return text
        .replace(/```(?:diff|patch)?\n?/gi, '') // remove ```diff
        .replace(/```/g, '');                   // remove closing ```
}

/**
 * Parse a unified diff from raw clipboard text.
 * - Ignores garbage lines
 * - Resets state on multiple @@ headers
 * - Applies hunks independently (no crash if unordered)
 */
export function parseDiff(raw: string): Hunk[] {
    const text = stripFences(raw).replace(/\r\n/g, '\n');

    // Try to grab a file name if one exists
    const fileHeaderMatch = text.match(
        /(?:^|\n)(?:\+\+\+|---)\s?(?:a\/|b\/)?(.+?)\s*(?=\n|$)/
    );
    const defaultFile = fileHeaderMatch ? fileHeaderMatch[1].trim() : null;

    // Split into candidate lines
    const allLines = text.split('\n').map(l => l.replace(/\t/g, ' '));

    const hunks: Hunk[] = [];
    let current: Hunk | null = null;

    for (let line of allLines) {
        // Detect new hunk header
        if (line.startsWith('@@')) {
            // Commit previous hunk if we had one
            if (current) {
                hunks.push(current);
            }
            current = {
                file: defaultFile,
                header: line,
                startLine: 0,
                endLine: 0,
                lines: []
            };
            continue;
        }

        // Only accept valid diff markers
        if (
            line.length === 0 ||
            line[0] === ' ' ||
            line[0] === '+' ||
            line[0] === '-'
        ) {
            if (!current) {
                // If diff starts without header, make a fallback hunk
                current = {
                    file: defaultFile,
                    header: '',
                    startLine: 0,
                    endLine: 0,
                    lines: []
                };
            }
            current.lines.push(line);
        } else {
            // Garbage line → skip it
            continue;
        }
    }

    // Push last hunk if exists
    if (current) {
        hunks.push(current);
    }

    return hunks;
}
