const vscode = require('vscode');
const {getNpmData,getVulnerabilityData} = require('./data.js')
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
    const panel = createWebviewPanel({title:'NPM Full Graph'})
    const forceGraphScript = getForceGraphScript(panel,context);
    panel.iconPath = getIconPath(context);
    panel.webview.postMessage({command:"fullGraph", data:lsData});
    panel.webview.html = getWebviewContent(forceGraphScript);
}

// "command": "npm-dependancy-graph.expandable-tree"
async function npmExpandableTree(context){
    const lsData = await loadDataWithProgress({
            dataFunc: getNpmData,
            title: 'NPM Expandable Tree',
            message: "Loading package data..."
        });
    if (!lsData) return;
    const panel = createWebviewPanel({title:'NPM Expandable Tree'})
    const forceGraphScript = getForceGraphScript(panel,context);
    panel.iconPath = getIconPath(context);
    panel.webview.postMessage({command:"expandableTree", data:lsData});
    panel.webview.html = getWebviewContent(forceGraphScript);
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
    const panel = createWebviewPanel({title:'NPM Vulnerabilities'})
    const forceGraphScript = getForceGraphScript(panel,context);
    panel.iconPath = getIconPath(context);
    panel.webview.postMessage({command:"vulnerabilities", data: lsData, vulnData});
    panel.webview.html = getWebviewContent(forceGraphScript);
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

function getForceGraphScript(panel,context){
    return panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri,'src', 'forceGraph.js'));
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