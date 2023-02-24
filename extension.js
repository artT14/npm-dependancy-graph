// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
// const {series} = require('async');
const {execSync} = require('child_process');
const {TextEncoder } = require('util')



// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
	const file = vscode.window.activeTextEditor.document
	const filePath = file.uri.fsPath
	const cutoff = filePath.lastIndexOf('\\')
	const workspacePath = filePath.substring(0, cutoff)
	const lsData = execSync("npm ls --all --json",{cwd: workspacePath}).toString();

	let fullgraph = vscode.commands.registerCommand('npm-dependancy-graph.full-graph', ()=>{
		const panel = vscode.window.createWebviewPanel(
			'npm-dependancy-graph',
			'NPM Graph',
			vscode.ViewColumn.One,
			{
				enableScripts: true,
				retainContextWhenHidden: true
			}
		);
		const forceGraphScript = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'forceGraph.js'));
		panel.webview.postMessage({command:"fullGraph", data:lsData});
		panel.webview.html = getWebviewContent(forceGraphScript);
	});

	let expandabletree = vscode.commands.registerCommand('npm-dependancy-graph.expandable-tree', ()=>{
		const panel = vscode.window.createWebviewPanel(
			'npm-dependancy-graph',
			'NPM Expandable Tree',
			vscode.ViewColumn.One,
			{
				enableScripts: true,
				retainContextWhenHidden: true
			}
		);
		const forceGraphScript = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'forceGraph.js'));
		panel.webview.postMessage({command:"expandableTree", data:lsData});
		panel.webview.html = getWebviewContent(forceGraphScript);
	});

	context.subscriptions.push(fullgraph);
	context.subscriptions.push(expandabletree);
}

function getWebviewContent(forceGraphScript) {
	return `<!DOCTYPE html>
		<html lang="en">
		<head>
			<style> body { margin: 0; } </style>
			<script src="https://unpkg.com/force-graph/dist/force-graph.min.js"></script>
			<!--<script src="../../dist/force-graph.js"></script>-->
		</head>
		
		<body>
			<div id="graph"></div>
			<script src="${forceGraphScript}">
			</script>
		</body>
	</html>`;
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
