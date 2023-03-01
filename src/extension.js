const vscode = require('vscode');
const {
    npmFullGraph,
    npmExpandableTree,
    npmVulnerabilities
} = require('./commands.js')

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	const fullgraph = vscode.commands.registerCommand('npm-dependancy-graph.full-graph', ()=>npmFullGraph(context));
	const expandabletree = vscode.commands.registerCommand('npm-dependancy-graph.expandable-tree', ()=>npmExpandableTree(context));
	const vulnerabilities = vscode.commands.registerCommand('npm-dependancy-graph.vulnerabilities', ()=>npmVulnerabilities(context));

	context.subscriptions.push(fullgraph);
	context.subscriptions.push(expandabletree);
	context.subscriptions.push(vulnerabilities);
}

function deactivate() {
	console.log("deactivating")
}

module.exports = {
	activate,
	deactivate
}
