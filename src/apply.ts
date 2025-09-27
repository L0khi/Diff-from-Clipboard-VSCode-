import * as vscode from 'vscode';
import { Hunk } from './type';

export interface ApplyResult {
    appliedCount: number;
    failedCount: number;
}

/**
 * Attempt to apply a single hunk into one editor.
 * Tries to align context lines loosely, so malformed diffs still work.
 */
async function tryApplyHunkToEditor(editor: vscode.TextEditor, hunk: Hunk): Promise<boolean> {
    const doc = editor.document;

    // Extract target text range
    const start = new vscode.Position(hunk.startLine, 0);
    const end = new vscode.Position(
        hunk.endLine,
        doc.lineAt(Math.min(hunk.endLine, doc.lineCount - 1)).text.length
    );
    let working = doc.getText(new vscode.Range(start, end)).split('\n');

    let writeIndex = 0;
    let origIndex = 0;

    for (const line of hunk.lines) {
        const prefix = line[0];
        const content = line.slice(1);

        if (prefix === ' ') {
            // context line
            if (working[writeIndex] && working[writeIndex].includes(content)) {
                writeIndex++;
                origIndex++;
            } else {
                const fi = working.findIndex((l, idx) => idx >= writeIndex && l.includes(content));
                if (fi !== -1) {
                    writeIndex = fi + 1;
                    origIndex++;
                } else {
                    // context missing → just insert
                    working.splice(writeIndex, 0, content);
                    writeIndex++;
                }
            }
        } else if (prefix === '-') {
            // remove line
            const fi = working.findIndex((l, idx) => idx >= writeIndex && l.includes(content));
            if (fi !== -1) {
                working.splice(fi, 1);
                writeIndex = fi;
            }
        } else if (prefix === '+') {
            // insert line
            working.splice(writeIndex, 0, content);
            writeIndex++;
        }
    }

    // Replace the range with new content
    const newText = working.join('\n');
    const edit = new vscode.WorkspaceEdit();
    edit.replace(doc.uri, new vscode.Range(start, end), newText);

    const ok = await vscode.workspace.applyEdit(edit);
    if (!ok) return false;

    // Reveal and decorate applied block
    const firstLineAfter = Math.max(0, hunk.startLine + origIndex);
    const revealRange = new vscode.Range(
        new vscode.Position(firstLineAfter, 0),
        new vscode.Position(firstLineAfter, 0)
    );
    editor.revealRange(revealRange, vscode.TextEditorRevealType.InCenter);

    const deco = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(180,220,255,0.3)'
    });
    const decRange = new vscode.Range(
        new vscode.Position(firstLineAfter, 0),
        new vscode.Position(Math.min(firstLineAfter + 4, doc.lineCount - 1), 0)
    );
    editor.setDecorations(deco, [decRange]);
    setTimeout(() => deco.dispose(), 2500);

    return true;
}

/**
 * Try applying hunks to active editor first, then visible editors.
 */
export async function applyParsedDiffs(hunks: Hunk[]): Promise<ApplyResult> {
    const editors = vscode.window.visibleTextEditors;
    const active = vscode.window.activeTextEditor;
    let applied = 0;
    let failed = 0;

    for (const h of hunks) {
        let success = false;

        if (active) {
            success = await tryApplyHunkToEditor(active, h);
        }
        if (!success) {
            for (const ed of editors) {
                if (ed !== active) {
                    if (await tryApplyHunkToEditor(ed, h)) {
                        success = true;
                        break;
                    }
                }
            }
        }

        if (success) applied++;
        else failed++;
    }

    return { appliedCount: applied, failedCount: failed };
}
