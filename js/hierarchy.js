

var dotOriginSrc;

var dotSrc = dotOriginSrc;

// On va suivre si on est le main graph ou non pour des questions d'optimisations
var isMainGraph = true;

function changeCartoWithSelect() {
	// Retrieve the dot graph from the file url
	//var request = "./dot/yoyo.dot"
	//var request = "./dot/toto.dot"
	if(document.getElementById("cartoSelector").value == "./dot/yoyo.dot"){
		document.getElementById("containerFilters").style.display ="none";
	}else{
		document.getElementById("containerFilters").style.display ="block";
	}
	showLoadingAnim();
	var request = document.getElementById("cartoSelector").value;
	fetch(request, {
		method: 'GET',
		headers: {
			'content-type': 'application/octet-stream',
			'Cache-Control': 'private, max-age=0, no-cache',
		},
	})
		.then(resp => resp.text())
		.then(data => { dotOriginSrc = data; dotOriginSrc = addStatus(); render(dotOriginSrc); initNodeList(dotOriginSrc); })
		.catch(err => { console.log(err) });
	dotSrc = dotOriginSrc;
}
var div = d3.select("#graph");
var svg = d3.select(div.node().querySelector("svg"));



function addStatus() {
	var newDotSrc = "";
	dotSrcLines = dotOriginSrc.split('\n');
	var idsOfNodesToKeep = [];
	for (let i = 0; i < dotSrcLines.length; i++) {
		var dataNotParsed = atob(getValue("data", dotSrcLines[i]));
		//Apply filters
		var toSkip = true;
		// Check if dataNotParsed isn't null (it occurs when we right click on a node instead of a edge and vice versa)
		if (dataNotParsed != "") {
			//Check if it's an edge or a node
			if (getValue("xlabel", dotSrcLines[i])) {
				// if it's an edge
				dataOfTheLine = JSON.parse(dataNotParsed)[0];
				// Associate a status color
				var color;
				switch (dataOfTheLine.status) {
					//fontcolor="CornflowerBlue",
					case "actif":
						color = "green"
						break;
					case "inactif":
						color = "red"
						break;
					case "planned":
						color = "blue"
						break;
					case "inprogress":
						color = "blue"
						break;
					case "unknown":
						color = "orange"
						break;
					default:
						color = "black"
					// black
				}
				//Si la ligne (edge) où on est bien du status qu'un cherche ou que le status cherché est all 
				// (dataOfTheLine.status == null && document.getElementById("statusSelect").value=="null") est la parce que null n'est pas la équivalent à "null"
				if (dataOfTheLine.status == document.getElementById("statusSelect").value || (dataOfTheLine.status == null && document.getElementById("statusSelect").value == "null") || document.getElementById("statusSelect").value == "all") {
					//We add the fontcolor="$color" to the line
					var slicedDotSrvLine = dotSrcLines[i].slice(0, -2);
					newDotSrc += slicedDotSrvLine + ", fontcolor=\"" + color + "\"]\n";
					idsOfNodesToKeep = idsOfNodesToKeep.concat(getIdsOfConnectedNodesToThisEdge(getValue("id", dotSrcLines[i])));
				}
			} else {
				// if it's a node
				if (document.getElementById("cartoSelector").value == "./dot/yoyo.dot") {
					dataOfTheLine = JSON.parse(dataNotParsed);
				} else {
					dataOfTheLine = JSON.parse(dataNotParsed)[0];
				}
				newDotSrc = newDotSrc + dotSrcLines[i] + "\n"
			}
		} else {
			newDotSrc = newDotSrc + dotSrcLines[i] + "\n"
		}
	}
	if (document.getElementById("cartoSelector").value != "./dot/yoyo.dot") {
		//Now remove all the nodes that aren't connected to anything
		var newNodeRemovedDotSrc = "";
		var newDotSrcLines = newDotSrc.split('\n');
		newDotSrcLines.forEach(line => {
			//For each line of the new dot src
			if (isNode(line)) {
				//if the current line is a node, decide if we keep it or not 
				if (idsOfNodesToKeep.includes(getValue("id", line))) {
					//If the id is to keep, we keep it
					newNodeRemovedDotSrc = newNodeRemovedDotSrc + line + "\n"
				}
			} else {
				//If it's not a node, we keep it anyway because we are only interested in the nodes
				newNodeRemovedDotSrc = newNodeRemovedDotSrc + line + "\n"
			}
		});
		return newNodeRemovedDotSrc
	}else{
		return newDotSrc
	}
}
changeCartoWithSelect();

function goToMain() {
	// To optimize a little bit
	if (isMainGraph) {
		resetZoom();
	} else {
		render(dotOriginSrc);
	}
	isMainGraph = true;
}

var graphviz = d3.select("#graph").graphviz();


/**
 * The code isn't made by me, I found it at : https://ramblings.mcpher.com/gassnippets2/converting-svg-to-png-with-javascript/. Edited a little bit to match my requirements
  * converts an svg string to base64 png using the domUrl
  * @param {string} svgText the svgtext
  * @param {number} [margin=0] the width of the border - the image size will be height+margin by width+margin
  * @param {string} [fill] optionally backgrund canvas fill
  * @return {Promise} a promise to the bas64 png image
  */
var svgToPng = function (svgText, margin, fill) {
	// convert an svg text to png using the browser
	return new Promise(function (resolve, reject) {
		try {
			// can use the domUrl function from the browser
			var domUrl = window.URL || window.webkitURL || window;
			if (!domUrl) {
				throw new Error("(browser doesnt support this)")
			}

			// figure out the height and width from svg text
			var match = svgText.match(/height=\"(\d+)/m);
			var height = match && match[1] ? parseInt(match[1], 10) : 200;
			var match = svgText.match(/width=\"(\d+)/m);
			var width = match && match[1] ? parseInt(match[1], 10) : 200;
			margin = margin || 0;
			height *= 4 / 3;	// The height given by the svg is in pt and the height asked by the canvas is in px. However, 1 pt = 3/4 px so 1 px = 4/3 pt
			width *= 4 / 3;

			// it needs a namespace
			if (!svgText.match(/xmlns=\"/mi)) {
				svgText = svgText.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
			}

			// create a canvas element to pass through
			var canvas = document.createElement("canvas");
			canvas.width = width + margin * 2;
			canvas.height = height + margin * 2;
			var ctx = canvas.getContext("2d");

			// make a blob from the svg
			var svg = new Blob([svgText], {
				type: "image/svg+xml;charset=utf-8"
			});

			// create a dom object for that image
			var url = domUrl.createObjectURL(svg);

			// create a new image to hold it the converted type
			var img = new Image;

			// when the image is loaded we can get it as base64 url
			img.onload = function () {
				// draw it to the canvas
				ctx.drawImage(this, margin, margin);

				// if it needs some styling, we need a new canvas
				if (fill) {
					var styled = document.createElement("canvas");
					styled.width = canvas.width;
					styled.height = canvas.height;
					var styledCtx = styled.getContext("2d");
					styledCtx.save();
					styledCtx.fillStyle = fill;
					styledCtx.fillRect(0, 0, canvas.width, canvas.height);
					styledCtx.strokeRect(0, 0, canvas.width, canvas.height);
					styledCtx.restore();
					styledCtx.drawImage(canvas, 0, 0);
					canvas = styled;
				}
				// we don't need the original any more
				domUrl.revokeObjectURL(url);
				// now we can resolve the promise, passing the base64 url
				resolve(canvas.toDataURL());
			};

			// load the image
			img.src = url;

		} catch (err) {
			reject('failed to convert svg to png ' + err);
		}
	});
};
function triggerDownload(svgText, margin) {
	svgToPng(svgText, margin, "#fff")	//We can adjust the background if we want
		.then(function (data) {		// When the svg is finished converting into a b64 image : (data contain the url of the b64 img)
			// do something with the encode b64 image
			var a = document.createElement("a");	//We create a hidden element (a link) that will contain the link to url of the b64 image 
			a.href = data;
			a.download = "Image.png";	//We download the a element (so the content of the url it contains). We can edit this line to change the name of the file
			a.click();	//We trigger the download
		})
		.catch(function (err) {
			// do something with the error
		});
}
function exportToPNG() {
	graphviz.resetZoom(d3.transition().duration(200));	//We unzoom quickly the graph

	// We wait until the graph has unzoomed (Not the best implementation but it work for now)
	setTimeout(function () {
		var div = document.getElementById("graph");
		var svg = div.querySelector('svg')	//We collect the current svg
		var margin = 0;		// We use no margin (can be edited if we want some margins)
		var svgText = svg.outerHTML;	// We convert the svg into a str containing the html (needed to be parsed later)
		triggerDownload(svgText, margin);	//When the graph has finished unzooming, we can trigger the download
	}, 2000); // Adjust the delay as needed
}

/*
 This function reset the zoom and scale according the size of the graph
*/
function resetZoom() {
	graphviz
		.resetZoom(d3.transition().duration(1000));
}

/*
This function render the graph from a dot String.
*/
function render(dotSrc) {
	// Create a style element
	var style = document.createElement("style");
	// We ovewrite the fill attribute of polygone with !important to fight against the graphviz's code
	style.innerHTML = "polygon { fill: transparent !important; }";

	// Append the style element to the document head
	document.head.appendChild(style);

	graphviz
		.transition(function () {
			return d3.transition()
				.delay(100)
				.duration(800);
		})
		.renderDot(dotSrc)
		.zoom(true)
		.on("end", function () {
			// Code to perform other actions after the graph finishes showing, zooming, and translating
			interactive();
			// Code to hide loading animation
			hideLoadingAnim();
		});
}


/*
Return a list of id to keep on the graph.
Start from the clicked element id.
If a edge contains this id (as a source or destination) the keep the id of the node linked.
Need to browse the list of string 2 times to prevent order issues.
*/
function getIdToKeep(clickedId) {
	let idSet = new Set();
	idSet.add(clickedId);
	for (j = 0; j < 2;) {
		for (i = 0; i < dotSrcLines.length;) {
			if (dotSrcLines[i].indexOf(clickedId) >= 0) {
				var value = getValue("id", dotSrcLines[i]);
				let idList = value.split('_');
				if (idList != null && idList.length > 0) {
					idList.forEach(function (it) {
						idSet.add(it);
					});
				}
			}
			i++;
		}
		j++;
	}
	return idSet;
}


/*
Return the value of an attribute from a dot line.
*/
function getValue(key, str) {
	if (str != null && str.length > 0 && key != null && key.length > 0) {
		// Search for "key=" in the String
		let regexp = new RegExp(key + "=\"([a-zA-Z0-9_\\-, \\;\\&=/]*)\"", "gi");
		var match = regexp.exec(str);
		if (match != null && match.length > 1) {
			// Keep only the first match
			return match[1];
		}
	}
	return "";
}

/*
Return a list of the ids of the nodes connected to the id of the edge entered in parameter
Example : "1243_324" in parameter return ["123", "324"]
*/
function getIdsOfConnectedNodesToThisEdge(idEdge) {
	const regex = /(\d+)_*(\d+)/;
	const matches = idEdge.match(regex);

	if (matches && matches.length >= 3) {
		const substrings = [matches[1], matches[2]];
		return substrings;
	} else {
		console.log("No matches found.");
		return null;
	}
}


/*
Return a list of node names to keep on the graph.
Use the list of node id to keep to do that.
*/
function getNodeNameToKeep(idSet) {
	let nameSet = new Set();
	for (i = 0; i < dotSrcLines.length;) {
		if (isNode(dotSrcLines[i])) {
			if (toKeep(dotSrcLines[i], idSet)) {
				// It's a node to keep then Parse the name
				let rx = /(.)*\[/gi;
				let arr = rx.exec(dotSrcLines[i]);
				if (arr != null && arr.length > 0) {
					// Keep only the first match
					let nameString = arr[0];
					nameString = nameString.replace('[', '');
					nameString = nameString.replace(' ', '');
					nameString = nameString.replace('\t', '');
					nameSet.add(nameString);
				}
			}
		}
		i++;
	}
	return nameSet;
}

/*
Check if the string line is a node.
*/
function isNode(graphLine) {
	return graphLine.indexOf("id=") >= 0 && graphLine.indexOf("->") == -1;
}

/*
Check if the string line is an edge.
*/
function isEdge(graphLine) {
	return graphLine.indexOf("id=") >= 0 && graphLine.indexOf("->") >= 0;
}

/*
 Check if the string line is a rank block.
*/
function isRank(graphLine) {
	return dotSrcLines[i].indexOf("rank=") >= 0;
}

function toKeep(graphLine, set) {
	for (const item of set.keys()) {
		if (graphLine.indexOf(item) >= 0) {
			return true;
		}
	}
	return false;
}

/*
 Activate interactions with the graph
*/
function interactive() {

	resetZoom();

	/*
	// Action when user click outside a node
	d3.selectAll("polygon").on("click", function () {
		render(dotOriginSrc);
	});*/


	// Action when user click on a node		
	d3.selectAll('.node').on("click", function () {
		// Get the id of the clicked node
		var id = d3.select(this).attr('id');
		//On dit qu'on a quitté le main graph
		isMainGraph = false;
		// Filter the graph
		filterGraph(id);
	});

	// Action when user right click on a node		
	d3.selectAll('.node').on('contextmenu', d3.contextMenu());



	var data = [1, 2, 3];

	// Action when user click on an edge		
	d3.selectAll('.edge').on('contextmenu', d3.contextMenu());

}

/*
 Filter the graph. Remove all nodes and edges except the clicked one and related direct parents & children.
*/
function filterGraph(id) {
	dotSrcLines = dotOriginSrc.split('\n');

	// Get the list of nodes id to keep related to the clicked node (direct parents + children)
	var idSet = getIdToKeep(id);

	// Get the list of nodes name to keep from the node ids (for the search input)
	var nameSet = getNodeNameToKeep(idSet);

	// Remove unlinked nodes & edges
	for (i = 0; i < dotSrcLines.length;) {
		if ((isNode(dotSrcLines[i]) && !toKeep(dotSrcLines[i], idSet)) ||
			((isEdge(dotSrcLines[i]) && (dotSrcLines[i].indexOf(id) == -1)))) {
			// Remove the line
			dotSrcLines.splice(i, 1);
		} else if (isRank(dotSrcLines[i])) {
			// It's a rank, then remove informations of nodes to hide
			rankItems = dotSrcLines[i].split(';');
			for (k = 0; k < rankItems.length;) {
				let rankToKeep = false;
				if (rankItems[k].indexOf("{") >= 0 || rankItems[k].indexOf("}") >= 0 || rankItems[k].indexOf("node") >= 0) {
					rankToKeep = true;
				} else {
					for (const nameItem of nameSet.keys()) {
						if (rankItems[k].indexOf(nameItem) >= 0) {
							rankToKeep = true;
							break;
						}
					}
				}
				if (!rankToKeep) {
					rankItems.splice(k, 1);
				} else {
					k++;
				}
			}
			dotSrcLines[i] = rankItems.join(';');
			i++;
		} else {
			if (isNode(dotSrcLines[i]) && (dotSrcLines[i].indexOf(id) >= 0)) {
				// It's the clicked node then inverse the color to highlight it
				let rx = /\[color=(.*),\sstyle/gi;;
				let arr = rx.exec(dotSrcLines[i]);
				if (arr != null && arr.length > 1) {
					// Keep only the first match
					let colorString = arr[1];
					if (lightOrDark(colorKeywordToRGB(colorString)) == 'dark') {
						// It's a "dark" color then put the font in white
						dotSrcLines[i] = dotSrcLines[i].replace(/fillcolor=white\,/, "fillcolor=" + colorString + ", fontcolor=white,");
					} else {
						dotSrcLines[i] = dotSrcLines[i].replace(/fillcolor=white\,/, "fillcolor=" + colorString + ",");
					}
				}


			}
			// Keep the line
			i++;
		}
	}

	dotSrc = dotSrcLines.join('\n');
	// Update display
	render(dotSrc);
}