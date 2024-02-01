d3.contextSubMenu = function (openCallback, id, text) {

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
	var id = id;
	var text = text;

	// this gets executed when a contextmenu event occurs
	return function (data, index) {
		menu = [];
		// We reset menuItems at every right click
		var menuItems = [
			{ property: "id", title: "Id" },
			{ property: "schema", title: "Description" },
			{ property: "process", title: "Process" },
			{ property: "ref", title: "Ref" },
			{ property: "domain", title: "Domain" },
			{ property: "source", title: "Mobi+" },
			{ property: "destination", title: "Destination" },
			{ property: "object", title: "Object" },
			{ property: "description", title: "Description" },
			{ property: "type", title: "Type" },
			{ property: "frequency", title: "Frequency" },
			{ property: "volume", title: "Volume" },
			{ property: "complexity", title: "Complexity" },
			{ property: "technologies", title: "Technologies" },
			{ property: "status", title: "Status" },
			{ property: "comments", title: "Comments" },
			{ property: "itContact", title: "IT Contact" },
			{ property: "businessContact", title: "Business Contact" },
			{ property: 'name', title: 'Name' },
			{ property: 'contactName', title: 'Contact Name' },
			{ property: 'contactEmail', title: 'Contact Email' },
			{ property: 'consumer', title: 'Consumer' },
			{ property: 'target', title: 'Target' },
			{ property: 'url', title: 'URL', action: function (elm, data, index, url) { window.open(url, '_blank').focus() } },
			{ property: 'createdDate', title: 'Created Date' },
			{ property: 'updatedDate', title: 'Updated Date' },
			{ property: 'tags', title: 'Tags' },
		];
		//Get the line in the dotSrc that contains the id
		var indexOfTheId;
		var indexs = text.split(' / ').map(Number);
		for (let i = 0; i < indexs.length; i++) {
			if (Number(id) == Number(indexs[i])) {
				indexOfTheId = i
			}
		}

		// We now get the line in the dotSrc that contains the information about the edge
		dotSrcLines = dotOriginSrc.split('\n');
		var strLine = "";
		for (var i = 0; i < dotSrcLines.length; i++) {
			if (dotSrcLines[i].indexOf(text) >= 0) {
				strLine = dotSrcLines[i];
				break;
			}
		}
		// Edit the menu based on the data stored in x64 json in the edge
		var dataNotParsed = atob(getValue("data", strLine));
		var dataOfTheLine;
		// Check if dataNotParsed isn't null (it occurs when we right click on a node instead of a edge and vice versa)
		if (dataNotParsed != "") {
			dataOfTheLine = JSON.parse(dataNotParsed)[indexOfTheId];

			// Loop through the menuItems array and create the menu dynamically
			for (var i = 0; i < menuItems.length; i++) {
				var menuItem = {
					title: menuItems[i].title + " : " + dataOfTheLine[menuItems[i].property],
					value: dataOfTheLine[menuItems[i].property],
					action: menuItems[i].action
				};
				if (dataOfTheLine[menuItems[i].property] != null && dataOfTheLine[menuItems[i].property] != "") {
					menu.push(menuItem);
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

			d3.preventDefault();
		}
	}
};