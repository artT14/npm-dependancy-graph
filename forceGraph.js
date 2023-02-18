document.addEventListener('DOMContentLoaded', function () {
	let dataVariable;
	window.addEventListener('message', event => {
		const message = event.data; // The JSON data our extension sent
		switch (message.command) {
			case 'lsJsonData':
				const graphData = parseNpmGraph(message.data)
				drawTree(graphData)
				break;
		}
	})
}) 
function parseNpmGraph (string){
	const graphData = {
		nodes: [],
		links: []
	} 
	// run dfs
	const hash = new Set();
	const tree = JSON.parse(string)

	function dfs(node,data, layer){
		if (!data.dependencies) return;
		Object.entries(data.dependencies)
			.filter(([key, val])=>!hash.has(key+val.version))
			.forEach(([key, val])=>{
				graphData.nodes.push({
					id: key+val.version,
					name: key+val.version,
					layer
				});
				graphData.links.push({
					source: key+val.version,
					target: node+data.version
				})
				hash.add(key+val.version);
				dfs(key,val,layer+1);
			})
	}
	// add main node
	graphData.nodes.push({
		id: tree.name+tree.version,
		name: tree.name+tree.version,
		layer: 0
	})
	hash.add(tree.name+tree.version)

	// add first layer of dependencies
	Object.entries(tree.dependencies).forEach(([key, val])=>{
		graphData.nodes.push({
			id: key+val.version,
			name: key+val.version,
			layer: 1
		});
		graphData.links.push({
			source: key+val.version,
			target: tree.name+tree.version
		})
		hash.add(key+val.version);
		dfs(key,val, 2);
	})
	return graphData;
}

function drawTree(graphData){
	console.log(graphData)
	const N = 20;
	// const gData = {
	// 	nodes: [...Array(N).keys()].map(i => ({ id: i })),
	// 	links: [...Array(N).keys()]
	// 	.filter(id => id)
	// 	.map(id => ({
	// 		source: id,
	// 		target: Math.round(Math.random() * (id-1))
	// 	}))
	// };
	// console.log(gData);

	// gen a number persistent color from around the palette

	const Graph = ForceGraph()
		(document.getElementById('graph'))
		.graphData(graphData)
		.nodeAutoColorBy('layer')
		;
}
