const { compareVersions, compare, satisfies, validate } = window.compareVersions
////////////////////////////////////////////////////////////////
// MESSAGE HANDLER & DISPATCH LOGIC
////////////////////////////////////////////////////////////////
document.addEventListener('DOMContentLoaded', function () {
	window.addEventListener('message', event => {
		const message = event.data; // The JSON data our extension sent
		switch (message.command) {
			case 'fullGraph':{
				const {graphData, rootId} = parseNpmGraph(message.data)
				drawTree(graphData, rootId)
				break;
			}
			case 'expandableTree':{
				const {graphData, rootId} = parseNpmTree(message.data)
				drawInteractiveTree(graphData, rootId)
				break;
			}
			case 'vulnerabilities':{
				const {data,vulnData} = message
				const vulnObj = JSON.parse(vulnData)
				console.log(data,vulnObj)
				const {graphData, rootId} = parseNpmGraph(message.data)
				drawVulnerabilityTree(graphData, vulnObj)
			}
		}
	})
})

////////////////////////////////////////////////////////////////
//PARSING FUNCTIONS
////////////////////////////////////////////////////////////////
function parseNpmGraph (string){
	const graphData = {nodes: [],links: []} // graph object to be returned 
	
	const hash = new Set(); // set that keeps track of dupes
	const tree = JSON.parse(string) //parse JSON string to JS object
	const root = tree.name+"^"+tree.version; // keep track of root

	function dfs(node, data, layer){ // dfs for traversing JSON tree
		if (!data.dependencies) return;
		Object.entries(data.dependencies)
			.forEach(([key, val])=>{
				const curr = key+"^"+val.version
				const dependant = node+"^"+data.version
				if(!hash.has(curr)){
					graphData.nodes.push({
						id: curr,
						name: key,
						version: val.version,
						layer,
						collapsed: curr !== root,
						childLinks: [] 
					});
					hash.add(curr);
				}
				if(!hash.has(curr+dependant)){
					graphData.links.push({
						source: dependant,
						target: curr,
					})
					hash.add(curr+dependant)
				}
				dfs(key,val,layer+1);
			})
	}
	// add root
	graphData.nodes.push({
		id: root,
		name: tree.name,
		version: tree.version,
		layer: 1,
		collapsed: false,
		childLinks: [] 
	})
	hash.add(root)
	dfs(tree.name, tree, 2)

	return {graphData, rootId: root};
}

function parseNpmTree (string){
	const graphData = {nodes: [],links: []} // graph object to be returned 
	
	const dupes = {}; // set that keeps track of dupes
	const tree = JSON.parse(string) //parse JSON string to JS object
	const root = tree.name+"^"+tree.version; // keep track of root

	function dfs(node, data, layer){ // dfs for traversing JSON tree
		if (!data.dependencies) return;
		Object.entries(data.dependencies)
			.forEach(([key, val])=>{
				const curr = key+"^"+val.version
				const dependant = node+"^"+data.version
				let duplicate = false
				if (curr in dupes){
					dupes[curr]++;
					duplicate = true
				}
				else dupes[curr] = 1
				graphData.nodes.push({
					id: curr+dupes[curr],
					name: key,
					version: val.version,
					duplicate,
					layer,
					collapsed: curr !== root,
					childLinks: []
				});
				graphData.links.push({
					source: dependant+dupes[dependant],
					target: curr+dupes[curr],
				})
				dfs(key,val,layer+1);
			})
	}
	// add root
	dupes[root] = 1
	graphData.nodes.push({
		id: root+dupes[root],		
		name: tree.name,
		version: tree.version,
		layer: 1,
		collapsed: false,
		childLinks: [] 
	})
	dfs(tree.name, tree, 2)

	return {graphData, rootId: root+dupes[root]};
}

////////////////////////////////////////////////////////////////
//RENDERING FUNCTIONS
////////////////////////////////////////////////////////////////

// Draw Full Graph
function drawTree(graphData, rootId){
	console.log(graphData)
	
	function nodePaint( node, ctx) {
		ctx.fillStyle = node.color;
		//draw circle
		const radius = 20 / node.layer
		ctx.beginPath(); 
		ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false); 
		ctx.fill();
	}

	const elem = document.getElementById('graph');
	const Graph = ForceGraph()(elem)
		.graphData(graphData)
		.linkColor(() => 'rgba(255,255,255,0.1)')
		.nodeLabel((node)=>node.name+"^"+node.version)
		.nodeAutoColorBy('layer')
		.nodeCanvasObject((node, ctx) => nodePaint(node, ctx))
		.linkCurvature('curvature')
		.linkDirectionalParticles(1)
		.linkDirectionalParticleSpeed(0.001)
		.linkDirectionalParticleWidth(2)

	// Graph.d3Force('center', null);

	// fit to canvas when engine stops
	// Graph.onEngineStop(() => Graph.zoomToFit(400));
}

// Draw Expandable Tree
function drawInteractiveTree(graphData, rootId){
	console.log(graphData)

	function nodePaint( node, ctx) {
		ctx.fillStyle = node.color;
		//draw circle
		const radius = Math.abs(10 / (1 + Math.log(node.layer)))
		ctx.beginPath(); 
		ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false); 
		ctx.fill();
	}

    // link parent/children
    const nodesById = Object.fromEntries(graphData.nodes.map(node => [node.id, node]));
    graphData.links.forEach(link => {
		nodesById[link.source].childLinks.push(link);
    });

	const getPrunedTree = () => {
		const visibleNodes = [];
		const visibleLinks = [];
		(function traverseTree(node = nodesById[rootId]) {
			visibleNodes.push(node);
			if (node.collapsed) return;
			visibleLinks.push(...node.childLinks);
			node.childLinks
				.map(link => ((typeof link.target) === 'object') ? link.target : nodesById[link.target]) // get child node
				.forEach(traverseTree);
		})(); // IIFE
		console.log({ nodes: visibleNodes, links: visibleLinks })
		return { nodes: visibleNodes, links: visibleLinks };
	};

	let clickedNode = null
	const elem = document.getElementById('graph');
	const Graph = ForceGraph()(elem)
		.linkColor(() => 'rgba(255,255,255,0.1)')
		.linkDirectionalParticles(1)
		.linkDirectionalParticleSpeed(0.001)
		.linkDirectionalParticleWidth(2)
		.graphData(getPrunedTree())
		.onNodeHover(node => elem.style.cursor = node && node.childLinks.length ? 'pointer' : null)
		.onNodeClick(node => {
			if (node.childLinks.length) {
				node.collapsed = !node.collapsed; // toggle collapse state
				Graph.graphData(getPrunedTree());
			}
		})
        .nodeCanvasObject((node, ctx, globalScale) => {
			const label = node.name + "^" + node.version + (!node.childLinks.length ? '' : node.collapsed ? ' [ + ]' : ' [ - ]');
			const fontSize = 12/globalScale;
			ctx.font = `${fontSize}px Sans-Serif`;
			const textWidth = ctx.measureText(label).width;
			const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding
			ctx.fillStyle = 'rgb(0, 0, 0)';
			ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillStyle = node.color;
			ctx.fillText(label, node.x, node.y);
			node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
			node.color = !node.childLinks.length ? 'green' : node.collapsed ? 'red' : 'orange';
		})
		.nodePointerAreaPaint((node, color, ctx) => {
			ctx.fillStyle = color;
			const bckgDimensions = node.__bckgDimensions;
			bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
		})
		.enableNodeDrag(false)
		.cooldownTicks(250);
	
	// Graph.d3Force('center', null);

	// // fit to canvas when engine stops
	// Graph.onEngineStop(() => Graph.zoomToFit(400));
	
}

// Draw Full Vulnerability Graph
function drawVulnerabilityTree(graphData, audit){
	function getVulnerabilityPaint(node){
		if (audit.vulnerabilities.hasOwnProperty(node.name)){
			console.log(node.version, audit.vulnerabilities[node.name].range)
			if(satisfies(node.version, audit.vulnerabilities[node.name].range)){
				switch (audit.vulnerabilities[node.name].severity){
					case 'low':
						return 'yellow';
						break;
					case 'medium':
						return 'orange';
						break;
					case 'high':
						return 'red';
						break;
					case 'critical':
						return 'purple';
						break;
				}
			}
		}
		return 'green';
	}
	function nodePaint( node, ctx) {
		ctx.fillStyle = getVulnerabilityPaint(node);
		//draw circle
		const radius = 20 / node.layer
		ctx.beginPath(); 
		ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false); 
		ctx.fill();
	}

	const elem = document.getElementById('graph');
	const Graph = ForceGraph()(elem)
		.graphData(graphData)
		.linkColor(() => 'rgba(255,255,255,0.1)')
		.nodeLabel((node)=>node.name+"^"+node.version)
		.nodeCanvasObject((node, ctx) => nodePaint(node, ctx))
		.linkCurvature('curvature')
		.linkDirectionalParticles(1)
		.linkDirectionalParticleSpeed(0.001)
		.linkDirectionalParticleWidth(2)

	// Graph.d3Force('center', null);

	// fit to canvas when engine stops
	// Graph.onEngineStop(() => Graph.zoomToFit(400));
}