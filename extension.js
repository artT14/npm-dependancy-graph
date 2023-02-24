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
function activate(context) {
	let fullgraph = vscode.commands.registerCommand('npm-dependancy-graph.full-graph', ()=>{
		const lsData = getNpmData();
		if (!lsData) return;
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
		const lsData = getNpmData();
		if (!lsData) return;
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

function getNpmData(){
	const file = vscode.window.activeTextEditor.document;
	const filePath = file.uri.fsPath;
	const cutoff = filePath.lastIndexOf(process.platform==="win32" ? '\\' : '/');
	const workspacePath = filePath.substring(0, cutoff);
	let lsData;
	try{
		const ls = execSync("npm ls --all --json",{cwd: workspacePath});
		lsData = ls.toString();
	}catch(e){
		const err = e.stderr.toString();
		if (err.includes("ELSPROBLEMS")){
			vscode.window.showErrorMessage("Some npm packages are missing for this project, cannot display graph");
			vscode.window.showInformationMessage('Run "npm i" in project directory to install packages');
		}
		lsData = "";
	}
	return lsData;
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
function deactivate() {
	console.log("deactivating")
}

module.exports = {
	activate,
	deactivate
}
