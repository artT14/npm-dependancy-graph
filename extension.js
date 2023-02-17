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
	// fetch workspace rootPath
	const rootPath = vscode.workspace.workspaceFolders || ".";
	const workspacePath = rootPath[0].uri._fsPath;
	console.log(workspacePath);
	// run npm ls in workspace
	const ls = execSync("npm ls --all --json",{cwd: workspacePath}).toString();
	const dir = vscode.Uri.joinPath(rootPath[0].uri,'.dependancy-graph', 'ls.json')
	await vscode.workspace.fs.writeFile(dir,new TextEncoder().encode(ls))	
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
		panel.webview.html = getWebviewContent(forceGraphScript,dir.path);

	});

	context.subscriptions.push(cmd);
}

function getWebviewContent(script,lspath) {
	return `<!DOCTYPE html>
		<html lang="en">
		<head>
			<style> body { margin: 0; } </style>
		
			<script src="https://unpkg.com/force-graph/dist/force-graph.min.js"></script>
			<!--<script src="../../dist/force-graph.js"></script>-->
		</head>
		
		<body>
			<div id="graph"></div>
			<script src="${script}" lspath="${lspath}">
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
