var text;
var id;
d3.contextMenu = function (openCallback) {
	// create the div element that will hold the context menu
	d3.selectAll('.d3-context-menu').data([1])
		.enter()
		.append('div')
		.attr('class', 'd3-context-menu');

	// close menu
	d3.select('body').on('click.d3-context-menu', function () {
		d3.select('.d3-context-menu').style('display', 'none');
	});

	// Create a menu that we will edit later
	var menu = [];

	// Define the properties and titles for each menu item
	var menuItems;

	// this gets executed when a contextmenu event occurs
	return function (data, index) {
		menu = [];
		// We reset menuItems at every right click
		var menuItems = [
			{ property: "id", title: "Id" },
			{ property: 'name', title: 'Name' },
			{ property: "domain", title: "Domain" },
			{ property: "source", title: "Mobi+" },
			{ property: "destination", title: "Destination" },
			{ property: "description", title: "Description" },
			{ property: "type", title: "Type" },
			{ property: 'consumer', title: 'Consumer' },
			{ property: "frequency", title: "Frequency" },
			{ property: 'target', title: 'Target' },
			{ property: "status", title: "Status" },
			{ property: "schema", title: "Schema" },
			{ property: "process", title: "Process" },
			{ property: "ref", title: "Ref" },
			{ property: "object", title: "Object" },
			{ property: "volume", title: "Volume" },
			{ property: "complexity", title: "Complexity" },
			{ property: "technologies", title: "Technologies" },
			{ property: "comments", title: "Comments" },
			{ property: "itContact", title: "IT Contact" },
			{ property: "businessContact", title: "Business Contact" },
			{ property: 'contactName', title: 'Contact Name' },
			{ property: 'contactEmail', title: 'Contact Email' },
			{ property: 'createdDate', title: 'Created Date' },
			{ property: 'updatedDate', title: 'Updated Date' },
			{ property: 'tags', title: 'Tags' },
			{ property: 'url', title: 'URL', action: function (elm, data, index, url) { window.open(url, '_blank').focus() } },
		];
		var elm = this;
		//Get the line in the dotSrc that contains the id
		var id = elm.getAttribute("id");
		// We check if there is multiple indexs for example 7 / 8 / 9 instead of just 8
		var text = elm.querySelector('text').textContent;
		var indexs = text.split(' / ').map(Number);

		//Correct the issue of mulesoft nodes
		const match = id.match(/^node(\d+)/);
		if (match) {
			id = text
		}

		var dataOfTheLine;
		if (1 < indexs.length) {
			//If there is multiple indexs. Case : "7/8/9"
			var menuItems = []
			indexs.forEach(index => {
				var menuItem = {
					property: index,
					title: String(index),
				};
				menuItems.push(menuItem)
			});

		} else {
			//If there is just one index. Case : "8"

			// We now get the line in the dotSrc that contains the information about the edge
			dotSrcLines = dotOriginSrc.split('\n');
			var strLine = "";
			for (var i = 0; i < dotSrcLines.length; i++) {
				//If mulesoft
				if (match) {
					if (dotSrcLines[i].includes(id)) {
						strLine = dotSrcLines[i];
						break;
					}
				} else {
					//If saur flow

					if (dotSrcLines[i].indexOf(id) >= 0) {
						strLine = dotSrcLines[i];
						break;
					}
				}
			}
			// Edit the menu based on the data stored in x64 json in the edge
			var dataNotParsed = atob(getValue("data", strLine));

			// Check if dataNotParsed isn't null (it occurs when we right click on a node instead of a edge and vice versa)
			if (dataNotParsed != "") {
				// If it's an edge
				if (this.classList.contains("edge")) {
					dataOfTheLine = JSON.parse(dataNotParsed)[0];
				} else {
					//if it's a node
					dataOfTheLine = JSON.parse(dataNotParsed);
				}
			}
		}
		// Loop through the menuItems array and create the menu dynamically
		for (var i = 0; i < menuItems.length; i++) {
			if (1 < indexs.length) {
				var menuItem = {
					title: menuItems[i].title + "\t\t >",
					value: menuItems[i].property,
					action: d3.contextSubMenu(this, menuItems[i].property, text)
				};
				menu.push(menuItem)
			} else {
				var menuItem = {
					title: menuItems[i].title + " : " + dataOfTheLine[menuItems[i].property],
					value: dataOfTheLine[menuItems[i].property],
					action: menuItems[i].action
				};
				if (dataOfTheLine[menuItems[i].property] != null && dataOfTheLine[menuItems[i].property] != "") {
					menu.push(menuItem);
				}
			}

		}
		d3.selectAll('.d3-context-menu').html('');
		var list = d3.selectAll('.d3-context-menu').append('ul');
		list.selectAll('li').data(menu).enter()
			.append('li')
			.html(function (d) {
				return d.title;
			})
			.on('click', function (d, i) {
				if (i.action) {
					i.action(elm, data, index, i.value);
					d3.select('.d3-context-menu').style('display', 'none');
				}
			});

		// the openCallback allows an action to fire before the menu is displayed
		// an example usage would be closing a tooltip
		if (openCallback) openCallback(data, index);
		// display context menu
		d3.select('.d3-context-menu')
			.style('left', (data.pageX - 2) + 'px')
			.style('top', (data.pageY - 2) + 'px')
			.style('display', 'block');

		data.preventDefault();


	};
};