// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
// const {series} = require('async');
const {execSync} = require('child_process');



// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	// fetch workspace rootPath
	const rootPath = vscode.workspace.workspaceFolders || ".";
	// run npm ls in workspace
	// const ls = execSync("npm ls --all --json",{cwd: rootPath[0].uri._fsPath}).toString();
	// can run np audit in same workspace
	// const audit = execSync("npm audit --json",{cwd: rootPath[0].uri._fsPath}).toString();
	// console.log(ls);



	let cmd = vscode.commands.registerCommand('catCoding.start', ()=>{
		const panel = vscode.window.createWebviewPanel(
			'catCoding', //webview identifier
			'Cat Coding', //title
			vscode.ViewColumn.One, //edit column to show wabpanel in
			{
				enableScripts: true
			} //view options
		);
		// uri for graph.js
		const forceGraphScript = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'forceGraph.js'));
		panel.webview.html = getWebviewContent(forceGraphScript);

	});

	context.subscriptions.push(cmd);
}

function getWebviewContent(script) {
	return `<!DOCTYPE html>
		<html lang="en">
		<head>
			<style> body { margin: 0; } </style>
		
			<script src="https://unpkg.com/force-graph/dist/force-graph.min.js"></script>
			<!--<script src="../../dist/force-graph.js"></script>-->
		</head>
		
		<body>
			<div id="graph"></div>
		
			<script src="${script}"></script>
		</body>
	</html>`;
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
