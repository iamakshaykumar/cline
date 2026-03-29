import type * as vscode from "vscode"

export class DiffContentProvider implements vscode.TextDocumentContentProvider {
	provideTextDocumentContent(uri: vscode.Uri): string {
		return Buffer.from(uri.query, "base64").toString("utf-8")
	}
}
