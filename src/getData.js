const vscode = require('vscode');
const {exec} = require('child_process');
const {promisify } = require('util')

const execute = promisify(exec); 

async function getNpmData(){
	const workspacePath = getWorkSpacePath()
	let lsData = "";
	await execute("npm ls --all --json",{cwd: workspacePath})
		.then((data)=>{lsData = data.stdout})
		.catch((e)=>displayError(e))
	return lsData;
}

async function getVulnerabilityData(){
	const workspacePath = getWorkSpacePath()
	let vulnData = "";
	await execute("npm audit --json",{cwd: workspacePath})
		.then((data)=>{vulnData = data.stdout})
		.catch((e)=>{
            displayError(e)
			if (e.stdout) vulnData = e.stdout
		})
	return vulnData;
}

function getWorkSpacePath(){
    const file = vscode.window.activeTextEditor.document;
	const filePath = file.uri.fsPath;
	const cutoff = filePath.lastIndexOf(process.platform==="win32" ? '\\' : '/');
	return filePath.substring(0, cutoff);
}

function displayError(e){
    const err = e.stderr.toString();
    if (err.includes("ELSPROBLEMS")){
        vscode.window.showErrorMessage("Some npm packages are missing for this project, cannot display graph");
        vscode.window.showInformationMessage('Run "npm i" in project directory to install packages');
    }
}

module.exports = {
	getNpmData,
	getVulnerabilityData
}