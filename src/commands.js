const vscode = require('vscode');
const {getNpmData,getVulnerabilityData} = require('./getData.js')
const {parseNpmGraph, parseNpmTree} = require('./parseData.js')
const {getWebviewContent} = require('./render.js')


////////////////////////////////////////////////////////////////
// COMMANDS 
////////////////////////////////////////////////////////////////

// "command": "npm-dependancy-graph.full-graph"
async function npmFullGraph(context){
    const lsData = await loadDataWithProgress({
            dataFunc: getNpmData,
            title: 'NPM Full Graph',
            message: "Loading package data..."
        });
    if (!lsData) return;
    const {graphData, rootId} = parseNpmGraph(lsData);
    const panel = createWebviewPanel({title:'NPM Full Graph'})
    const scripts = getScripts(panel,context);
    panel.iconPath = getIconPath(context);
    panel.webview.postMessage({command:"fullGraph", graphData, rootId});
    panel.webview.html = getWebviewContent(scripts);
}

// "command": "npm-dependancy-graph.expandable-tree"
async function npmExpandableTree(context){
    const lsData = await loadDataWithProgress({
            dataFunc: getNpmData,
            title: 'NPM Expandable Tree',
            message: "Loading package data..."
        });
    if (!lsData) return;
    const {graphData, rootId} = parseNpmTree(lsData);
    const panel = createWebviewPanel({title:'NPM Expandable Tree'})
    const scripts = getScripts(panel,context);
    panel.iconPath = getIconPath(context);
    panel.webview.postMessage({command:"expandableTree", graphData, rootId});
    panel.webview.html = getWebviewContent(scripts);
}

// "command": "npm-dependancy-graph.vulnerabilities"
async function npmVulnerabilities(context){
    const lsData = await loadDataWithProgress({
            dataFunc: getNpmData,
            title: 'NPM Vulnerabilities',
            message: "Loading package data..."
        });
    const vulnData = await loadDataWithProgress({
            dataFunc: getVulnerabilityData,
            title: 'NPM Vulnerabilities',
            message: "Loading vulnerability data..."
        });
    if (!lsData || !vulnData) return;
    const {graphData, rootId} = parseNpmGraph(lsData);
    const panel = createWebviewPanel({title:'NPM Vulnerabilities'})
    const scripts = getScripts(panel,context);
    panel.iconPath = getIconPath(context);
    panel.webview.postMessage({command:"vulnerabilities", graphData, rootId, vulnData});
    panel.webview.html = getWebviewContent(scripts);
}

////////////////////////////////////////////////////////////////
// UTIL FUNCS 
////////////////////////////////////////////////////////////////
async function loadDataWithProgress({dataFunc, title, message}){
    const data = await vscode.window.withProgress({
        location: vscode.ProgressLocation.Window,
        cancellable: false,
        title
    }, async (progress) => {
        progress.report({  
            increment: 0,
            message
        });
        const data = await dataFunc();
        progress.report({
            increment: 100,
            message: "Done"
        });
        return data;
    });
    return data
}

function createWebviewPanel({title}){
    return vscode.window.createWebviewPanel(
        'npm-dependancy-graph',
        title,
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            retainContextWhenHidden: true,
        }
    );
}

function getScripts(panel,context){
    return [
        panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri,'src', 'client', 'graph.js')),
    ]
}

function getIconPath(context){
    return {
        dark: vscode.Uri.joinPath(context.extensionUri, "media", "dark.png"),
        ligth: vscode.Uri.joinPath(context.extensionUri, "media", "light.png")
    }
}

////////////////////////////////////////////////////////////////
// EXPORTS 
////////////////////////////////////////////////////////////////

module.exports = {
    npmFullGraph,
    npmExpandableTree,
    npmVulnerabilities
}