import * as vscode from 'vscode';
import { parseDiff } from './parser';
import { applyParsedDiffs } from './apply';


export function activate(context: vscode.ExtensionContext) {
const disposable = vscode.commands.registerCommand('applyDiff.fromClipboard', async () => {
const clipboard = await vscode.env.clipboard.readText();
if (!clipboard || clipboard.trim().length === 0) {
vscode.window.showErrorMessage('Clipboard empty — copy a diff/patch first.');
return;
}


const parsed = parseDiff(clipboard);
if (parsed.length === 0) {
vscode.window.showErrorMessage('No hunks or diffs detected in clipboard.');
return;
}


// Try to apply
const result = await applyParsedDiffs(parsed);


const applied = result.appliedCount;
const failed = result.failedCount;
const message = `Applied ${applied} hunks${failed > 0 ? `, failed ${failed}` : ''}`;


if (applied > 0) {
vscode.window.showInformationMessage(message);
} else {
vscode.window.showWarningMessage(message);
}
});


context.subscriptions.push(disposable);
}


export function deactivate() {}