# Diff from Clipboard

A small VS Code extension that applies diffs/patches copied into your clipboard with one command or a single shortcut. It’s built to tolerate **messy, agent-produced diffs (ChatGPT-style)** — unordered hunks, fenced blocks, and small formatting issues — and gives a short visual highlight where changes were applied.

---

## Quick start (5‑minute test)

1. Clone the repo:

```bash
git clone https://github.com/<your-org>/diff-from-clipboard.git
cd apply-diff-from-clipboard
```

2. Install dependencies:

```bash
npm install
```

3. Build the extension:

```bash
npm run compile
```

4. Open in VS Code and run the extension host:

```bash
code .
# Press F5 in VS Code (Extension Development Host will open)
```

5. Test it:

* Open a file (e.g. `hello.ts`) in the Extension Development Host.
* Copy a diff to the clipboard (example below).
* Open Command Palette (`Ctrl+Shift+P`) → **Apply Diff from Clipboard**.
* Or use the default shortcut: `Ctrl+Shift+Alt+D` (if configured).

---

## Features

* Applies diffs from your clipboard
* Tolerates fenced blocks (`diff`) and skipped garbage lines
* Handles unordered hunks (applies hunks independently)
* Tries active editor first, then other visible editors
* Provides a theme-friendly highlight for 1–2 seconds and scrolls to the applied area

---

## Installation (end-user)

If you want to share the extension without building from source, use the packaged `.vsix`:

1. Create the package (from repo root):

```bash
# recommended (no global install required)
npx @vscode/vsce package
# or, if you installed globally
# npx @vscode/vsce package
```

2. Install locally in VS Code:

```bash
code --install-extension apply-diff-from-clipboard-0.1.0.vsix
```

3. Run the command: **Apply Diff from Clipboard** from Command Palette.

---

## Developer: build & debug

* `npm run compile` — compile TypeScript to `out/`.
* `npm run watch` — watch mode.
* `F5` — launch Extension Development Host.

**Logs & troubleshooting while developing**

* In the Extension Development Host: `Help → Toggle Developer Tools` to see console errors.
* In the main VS Code window (where you pressed F5): open **Debug Console** to view `console.log` from `extension.ts`.
* Sprinkle `console.log(...)` in `extension.ts` / `parser.ts` to inspect clipboard content and parsed hunks.

---

## Usage: exact workflow

1. Copy a diff into your clipboard. The extension accepts:

   * unified diffs (lines starting with `@@`, `+`, `-`, or space)
   * fenced diffs (`diff` or `patch`) — fences will be stripped
   * messy diffs produced by language models (unordered hunks, extra text)

2. With the file you want to patch open in the active editor, run `Apply Diff from Clipboard`.

3. The extension will:

   * parse the clipboard (produce one or more `hunks`)
   * attempt to apply each hunk to the active file (or other visible files)
   * scroll to the first applied change and briefly highlight the area
   * show a notification with `Applied: X, Failed: Y`

### Example messy diff (copy this whole block and run the command)

````diff
```diff
@@ -1,3 +1,5 @@
 function greet() {
-    console.log("Hello, world!");
+    console.log("Hello, Lokhi!");
+    console.log("🔥 Extension works!");
 }
+
````

````

> Expected result: the open file will have the two new `console.log` lines inserted and the editor will scroll/highlight the changed block.

---

## Keybinding (optional)

To add a shortcut, edit `package.json` `contributes.keybindings` or add to your user keybindings in VS Code. Example snippet for `package.json`:

```json
"contributes": {
  "commands": [
    { "command": "applyDiffFromClipboard", "title": "Apply Diff from Clipboard" }
  ],
  "keybindings": [
    {
      "command": "applyDiffFromClipboard",
      "key": "ctrl+shift+alt+d",
      "when": "editorTextFocus"
    }
  ]
}
````

---

## Troubleshooting & common fixes

* **`npm` not recognized** → Install Node LTS, ensure `npm` in PATH.
* **`code` not recognized** → In VS Code: `Command Palette → Shell Command: Install 'code' command in PATH` (macOS/Linux) or add VS Code to PATH on Windows.
* **`Cannot find module './types'`** → Ensure `src/types.ts` exists and other files import from `./types` (not `./type`).
* **`setTimeout` (or DOM types) not found** → Add `"dom"` to `compilerOptions.lib` in `tsconfig.json`.
* **`A 'repository' field is missing` during `vsce package`** → add a `repository` object to `package.json` (see template below).
* **`vsce has been renamed` warning** → use `npx @vscode/vsce package` or install `@vscode/vsce`.

If an edit does not apply correctly: open Developer Tools in the Extension Dev Host and check console for parsing/apply errors. Try copying a simpler diff to narrow down the issue.

---

## package.json repository field (example)

```json
"repository": {
  "type": "git",
  "url": "https://github.com/<your-org>/apply-diff-from-clipboard.git"
}
```

---

## Contributing

1. Fork or create a branch from `main`.
2. Implement changes and run tests/manual validation (`npm run compile` and F5).
3. Open a PR with a clear description and which diffs you tested.

**CLA**: Please sign the `CLA.md` in the repository when contributing. For bounty attribution, we require you to: push code under the org and confirm the CLA is signed.

---

## License

This project is licensed under the MIT License. See `LICENSE`.

---

## Checklist 

* `npm run compile` → no TypeScript errors
* `F5` → Extension Development Host opens
* `Diff from Clipboard` appears in Command Palette
* Test diff applies correctly to an open file and shows highlight
* `LICENSE` and `CLA.md` present in repository

