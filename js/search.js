const input = document.querySelector('#searchbox');
const suggestions = document.querySelector('.list-container');

const names = [];
	
/*
 Init the list of node names to display in the search bar (suggestions).
*/
function initNodeList(str) {
	lines = str.split('\n');
	for (i = 0; i < lines.length;i++) {	
		if (isNode(lines[i])) {
			var id = getValue("id", lines[i]);
			var label = getValue("label", lines[i]);
			var node = {id: id, name: label};	
			names.push(node)
		}
	}
}

/*
 Render (update display) the list of suggestions
*/			
function renderNames(arrayOfNames) {
	let liElemet = "";
	for (let i = 0; i < arrayOfNames.length; i++) {
		liElemet += `<li id="${arrayOfNames[i].id}">${arrayOfNames[i].name}</li>`;
	}
	document.getElementById("list-container").innerHTML = liElemet;
	if (liElemet.length>0) {
		document.getElementById("list-container").hidden = false;
	} else {
		document.getElementById("list-container").hidden = true;
	}
}

/*
 Filter the list of suggestions according an input string
 */
function filterNames(event) {	
	var searchvalue = event.target.value.toLowerCase();
	if (searchvalue.length>0) {
		var filterNames = names.filter((v, i) => {
			return v.name.toLowerCase().includes(searchvalue);
		});
		filterNames = filterNames.sort((a, b) => a.name.localeCompare(b.name));
		renderNames(filterNames);
	} else {
		document.getElementById("list-container").hidden = true;
	}
}
	
function useSuggestion(e) {
	input.value = e.target.innerText;
	input.focus();
	suggestions.innerHTML = '';
	document.getElementById("list-container").hidden = true;
	//Say that we zoomed in
	isMainGraph = false;
	filterGraph(e.target.id);	
}

// Detect when a suggestion is selected from the list
suggestions.addEventListener('click', useSuggestion);

