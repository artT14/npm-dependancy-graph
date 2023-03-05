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

module.exports = {
    parseNpmGraph,
    parseNpmTree
}