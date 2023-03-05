////////////////////////////////////////////////////////////////
// MESSAGE HANDLER & DISPATCH LOGIC
////////////////////////////////////////////////////////////////
document.addEventListener('DOMContentLoaded', function () {
	window.addEventListener('message', event => {
		console.log(event.data)
		const {command, ...message} = event.data; // The JSON data our extension sent
		switch (command) {
			case 'fullGraph':{
				const {graphData, rootId} = message;
				drawTree(graphData, rootId);
				break;
			}
			case 'expandableTree':{
				const {graphData, rootId} = message;
				drawInteractiveTree(graphData, rootId);
				break;
			}
			case 'vulnerabilities':{
				const {graphData, rootId, vulnData} = message;
				const vulnObj = JSON.parse(vulnData);
				drawVulnerabilityTree(graphData, vulnObj);
			}
		}
	})
})

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