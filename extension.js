// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
// const {series} = require('async');
const {exec} = require('child_process');
const {promisify } = require('util')

const execute = promisify(exec); 


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let fullgraph = vscode.commands.registerCommand('npm-dependancy-graph.full-graph', async ()=>{
		const lsData = await vscode.window.withProgress({
			location: vscode.ProgressLocation.Window,
			cancellable: false,
			title: 'NPM Full Graph'
		}, async (progress) => {
			progress.report({  increment: 0 });
			const lsData = await getNpmData();
			progress.report({ increment: 100 });
			return lsData;
		});
		if (!lsData) return;
		const panel = vscode.window.createWebviewPanel(
			'npm-dependancy-graph',
			'NPM Graph',
			vscode.ViewColumn.One,
			{
				enableScripts: true,
				retainContextWhenHidden: true,

			}
		);
		const forceGraphScript = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'forceGraph.js'));
		panel.iconPath = {
			dark: vscode.Uri.joinPath(context.extensionUri, "media", "dark.png"),
			ligth: vscode.Uri.joinPath(context.extensionUri, "media", "light.png")
		}
		panel.webview.postMessage({command:"fullGraph", data:lsData});
		panel.webview.html = getWebviewContent(forceGraphScript);
	});
	let expandabletree = vscode.commands.registerCommand('npm-dependancy-graph.expandable-tree', async ()=>{
		const lsData = await vscode.window.withProgress({
			location: vscode.ProgressLocation.Window,
			cancellable: false,
			title: 'NPM Expandable Tree'
		}, async (progress) => {
			progress.report({  increment: 0 });
			const lsData = await getNpmData();
			progress.report({ increment: 100 });
			return lsData;
		});
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
		panel.iconPath = {
			dark: vscode.Uri.joinPath(context.extensionUri, "media", "dark.png"),
			ligth: vscode.Uri.joinPath(context.extensionUri, "media", "light.png")
		}
		panel.webview.postMessage({command:"expandableTree", data:lsData});
		panel.webview.html = getWebviewContent(forceGraphScript);
	});
	let vulnerabilities = vscode.commands.registerCommand('npm-dependancy-graph.vulnerabilities', async ()=>{
		const {lsData,vulnData} = await vscode.window.withProgress({
			location: vscode.ProgressLocation.Window,
			cancellable: false,
			title: 'NPM Vulnerabilities'
		}, async (progress) => {
			progress.report({  
				increment: 0,
				message: "Loading package data"
			});
			const lsData = await getNpmData(); 
			progress.report({  
				increment: 50,
				message: "Loading vulnerability data"
			});
			const vulnData = await getVulnerabilityData();
			progress.report({ increment: 100 });
			return {lsData,vulnData};
		});
		if (!lsData || !vulnData) return;
		const panel = vscode.window.createWebviewPanel(
			'npm-dependancy-graph',
			'NPM Vulnerabilities',
			vscode.ViewColumn.One,
			{
				enableScripts: true,
				retainContextWhenHidden: true
			}
		);
		const forceGraphScript = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'forceGraph.js'));
		panel.iconPath = {
			dark: vscode.Uri.joinPath(context.extensionUri, "media", "dark.png"),
			ligth: vscode.Uri.joinPath(context.extensionUri, "media", "light.png")
		}
		panel.webview.postMessage({command:"vulnerabilities", data: lsData, vulnData});
		panel.webview.html = getWebviewContent(forceGraphScript);
	});

	context.subscriptions.push(fullgraph);
	context.subscriptions.push(expandabletree);
	context.subscriptions.push(vulnerabilities);
}

async function getNpmData(){
	const file = vscode.window.activeTextEditor.document;
	const filePath = file.uri.fsPath;
	const cutoff = filePath.lastIndexOf(process.platform==="win32" ? '\\' : '/');
	const workspacePath = filePath.substring(0, cutoff);
	let lsData = "";
	await execute("npm ls --all --json",{cwd: workspacePath})
		.then((data)=>{lsData = data.stdout})
		.catch((e)=>{
			const err = e.stderr.toString();
			if (err.includes("ELSPROBLEMS")){
				vscode.window.showErrorMessage("Some npm packages are missing for this project, cannot display graph");
				vscode.window.showInformationMessage('Run "npm i" in project directory to install packages');
			}
		})
	return lsData;
}

async function getVulnerabilityData(){
	const file = vscode.window.activeTextEditor.document;
	const filePath = file.uri.fsPath;
	const cutoff = filePath.lastIndexOf(process.platform==="win32" ? '\\' : '/');
	const workspacePath = filePath.substring(0, cutoff);
	let vulnData = "";
	await execute("npm audit --json",{cwd: workspacePath})
		.then((data)=>{vulnData = data.stdout})
		.catch((e)=>{
			const err = e.stderr.toString();
			if (err.includes("ELSPROBLEMS")){
				vscode.window.showErrorMessage("Some npm packages are missing for this project, cannot display graph");
				vscode.window.showInformationMessage('Run "npm i" in project directory to install packages');
			}
			if (e.stdout) vulnData = e.stdout
		})
	return vulnData;
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
