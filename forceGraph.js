document.addEventListener('DOMContentLoaded', function () {
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
			.forEach(([key, val])=>{
				const curr = key+val.version
				const dependant = node+data.version
				if(!hash.has(curr)){
					graphData.nodes.push({
						id: curr,
						name: curr,
						layer
					});
					hash.add(curr);
				}
				if(!hash.has(curr+dependant)){
					graphData.links.push({
						source: curr,
						target: dependant
					})
					hash.add(curr+dependant)
				}
				dfs(key,val,layer+1);
			})
	}
	// add main node
	graphData.nodes.push({
		id: tree.name+tree.version,
		name: tree.name+tree.version,
		layer: 1
	})
	hash.add(tree.name+tree.version)

	// add first layer of dependencies
	Object.entries(tree.dependencies).forEach(([key, val])=>{
		const curr = key+val.version
		const dependant = tree.name+tree.version
		if(!hash.has(curr)){
			graphData.nodes.push({
				id: curr,
				name: curr,
				layer: 2
			});
			hash.add(curr);
		}
		if(!hash.has(curr+dependant)){
			graphData.links.push({
				source: curr,
				target: dependant
			})
			hash.add(curr+dependant)
		}
		dfs(key,val, 3);
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
		.linkColor(() => 'rgba(255,255,255,0.1)')
		.nodeAutoColorBy('layer')
		.nodeCanvasObject((node, ctx) => nodePaint(node, ctx));
	
	function nodePaint( node, ctx) {
		ctx.fillStyle = node.color;
		//draw circle
		const radius = Math.abs(10 / (1 + Math.log(node.layer)))
		ctx.beginPath(); 
		ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false); 
		ctx.fill();
	}
}
