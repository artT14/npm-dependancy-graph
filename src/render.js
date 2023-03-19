function getWebviewContent(scripts) {
	return `<!DOCTYPE html>
		<html lang="en">
		<head>
			<style> body { margin: 0; } </style>
			${generateScriptTags(scripts)}
			<!--<script src="../../dist/force-graph.js"></script>-->
			<style>
				:root {
					--link-color: var(--vscode-editor-foreground)33;
				}
			</style>
		</head>
		
		<body>
			<div id="graph"></div>
		</body>
	</html>`;
}

function generateScriptTags(scripts){
	return scripts.reduce(
		(accumulator,curr)=> accumulator + `<script src="${curr}" type="module"></script>
`,
		""
		)
}

module.exports = {
	getWebviewContent
}