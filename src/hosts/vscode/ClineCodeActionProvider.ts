import * as vscode from "vscode"
import { ExtensionRegistryInfo } from "@/registry"

export class ClineCodeActionProvider implements vscode.CodeActionProvider {
	public static readonly providedCodeActionKinds = [vscode.CodeActionKind.QuickFix, vscode.CodeActionKind.Refactor]

	provideCodeActions(
		document: vscode.TextDocument,
		range: vscode.Range,
		context: vscode.CodeActionContext,
	): vscode.CodeAction[] {
		const CONTEXT_LINES_TO_EXPAND = 3
		const START_OF_LINE_CHAR_INDEX = 0
		const LINE_COUNT_ADJUSTMENT_FOR_ZERO_INDEXING = 1

		const actions: vscode.CodeAction[] = []
		const editor = vscode.window.activeTextEditor // Get active editor for selection check

		// Expand range to include surrounding 3 lines or use selection if broader
		const selection = editor?.selection
		let expandedRange = range
		if (editor && selection && !selection.isEmpty && selection.contains(range.start) && selection.contains(range.end)) {
			expandedRange = selection
		} else {
			expandedRange = new vscode.Range(
				Math.max(0, range.start.line - CONTEXT_LINES_TO_EXPAND),
				START_OF_LINE_CHAR_INDEX,
				Math.min(document.lineCount - LINE_COUNT_ADJUSTMENT_FOR_ZERO_INDEXING, range.end.line + CONTEXT_LINES_TO_EXPAND),
				document.lineAt(
					Math.min(
						document.lineCount - LINE_COUNT_ADJUSTMENT_FOR_ZERO_INDEXING,
						range.end.line + CONTEXT_LINES_TO_EXPAND,
					),
				).text.length,
			)
		}

		const { commands } = ExtensionRegistryInfo

		// Add to Cline (Always available)
		const addAction = new vscode.CodeAction("Add to Cline", vscode.CodeActionKind.QuickFix)
		addAction.command = {
			command: commands.AddToChat,
			title: "Add to Cline",
			arguments: [expandedRange, context.diagnostics],
		}
		actions.push(addAction)

		// Explain with Cline (Always available)
		const explainAction = new vscode.CodeAction("Explain with Cline", vscode.CodeActionKind.RefactorExtract) // Using a refactor kind
		explainAction.command = {
			command: commands.ExplainCode,
			title: "Explain with Cline",
			arguments: [expandedRange],
		}
		actions.push(explainAction)

		// Improve with Cline (Always available)
		const improveAction = new vscode.CodeAction("Improve with Cline", vscode.CodeActionKind.RefactorRewrite) // Using a refactor kind
		improveAction.command = {
			command: commands.ImproveCode,
			title: "Improve with Cline",
			arguments: [expandedRange],
		}
		actions.push(improveAction)

		// Fix with Cline (Only if diagnostics exist)
		if (context.diagnostics.length > 0) {
			const fixAction = new vscode.CodeAction("Fix with Cline", vscode.CodeActionKind.QuickFix)
			fixAction.isPreferred = true
			fixAction.command = {
				command: commands.FixWithCline,
				title: "Fix with Cline",
				arguments: [expandedRange, context.diagnostics],
			}
			actions.push(fixAction)
		}
		return actions
	}
}
