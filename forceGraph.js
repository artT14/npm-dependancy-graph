document.addEventListener('DOMContentLoaded', function () {
	let dataVariable;
	window.addEventListener('message', event => {
		const message = event.data; // The JSON data our extension sent
		switch (message.command) {
			case 'lsJsonData':
				dataVariable = message.data;
				console.log(dataVariable)
				drawTree()
				break;
		}
	})
}) 


function drawTree(){
	const N = 20;
	const gData = {
		nodes: [...Array(N).keys()].map(i => ({ id: i })),
		links: [...Array(N).keys()]
		.filter(id => id)
		.map(id => ({
			source: id,
			target: Math.round(Math.random() * (id-1))
		}))
	};

	// gen a number persistent color from around the palette
	const getColor = n => '#' + ((n * 1234567) % Math.pow(2, 24)).toString(16).padStart(6, '0');

	const Graph = ForceGraph()
		(document.getElementById('graph'))
		.nodeCanvasObject((node, ctx) => nodePaint(node, getColor(node.id), ctx))
		.nodePointerAreaPaint(nodePaint)
		.nodeLabel('id')
		.graphData(gData);

	function nodePaint({ id, x, y }, color, ctx) {
		ctx.fillStyle = color;
		[
		() => { ctx.fillRect(x - 6, y - 4, 12, 8); }, // rectangle
		() => { ctx.beginPath(); ctx.moveTo(x, y - 5); ctx.lineTo(x - 5, y + 5); ctx.lineTo(x + 5, y + 5); ctx.fill(); }, // triangle
		() => { ctx.beginPath(); ctx.arc(x, y, 5, 0, 2 * Math.PI, false); ctx.fill(); }, // circle
		() => { ctx.font = '10px Sans-Serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Text', x, y); } // text
		][id%4]();
	}
}
