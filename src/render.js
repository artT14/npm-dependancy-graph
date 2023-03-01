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

module.exports = {
	getWebviewContent
}