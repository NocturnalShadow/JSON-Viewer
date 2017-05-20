

function addTableWidget(parent)
{
	var tableWidget = div("tableWidget");
	parent.appendChild(tableWidget);

	tableWidget.dataSwitch 					= tag("form");
	tableWidget.dataSwitch.dataSwitchText 	= textNode("Источник:");
	tableWidget.dataSwitch.serverModeRadio 	= lable(tag("input", { type : "radio", name: "sample" }), "Отдаленный");
	tableWidget.dataSwitch.localModeRadio 	= lable(tag("input", { type : "radio", name: "sample" }), "Локальный");
	tableWidget.loadDataButton 				= tag("input", { type : "button", class: "button right", value: "Загрузить JSON" });
	tableWidget.dropBox 					= dropBox("Drop the file here."); 
	tableWidget.urlForm 					= div("urlForm");
	tableWidget.urlForm.urlBox 				= lable("URL: ", tag("input", { type: "text", class: "textBox" }));
	tableWidget.urlForm.goButton 			= tag("input", { type : "button", class: "button", value: "GO" });
	tableWidget.searchBox					= lable("Поиск: ", tag("input", { type: "text", class: "textBox" }));
	tableWidget.dataTable 					= tag("table");
	tableWidget.dataTable.headerRow 		= headerFromObject();
	tableWidget.dataTable.dataRows			= [];
	tableWidget.pageNavigation				= div("pageNavigation");
	tableWidget.selectionInfo 				= div("selectionInfo");

	setClassName(tableWidget.dataTable, "dataTable");
	setClassName(tableWidget.dataSwitch, "dataSwitch");

	buildDOMHierarchy(tableWidget);

	switchMode(tableWidget, "urlForm");

	tableWidget.dataSwitch.serverModeRadio	.addEventListener("click", function () { onServerMode(tableWidget); });
	tableWidget.dataSwitch.localModeRadio	.addEventListener("click", function () { onLocalMode(tableWidget); });
	tableWidget.loadDataButton				.addEventListener("click", function () { onLoadJson(tableWidget); });
	tableWidget.urlForm.goButton			.addEventListener("click", function () { onSubmitUrl(tableWidget, tableWidget.urlForm.urlBox.value); });

	var defaultFilter = function (element) { return true; };

	tableWidget.source = "server";
	tableWidget.urlForm.urlBox.value 	= "big.json";
	tableWidget.dropBox.onFileSelected 	= onFileSelected;
	tableWidget.searchBox.oninput  		= function () { 
		setFilter(tableWidget.dataTable, tableWidget.searchBox.value); 
		updateNavigation(tableWidget);
	};
	tableWidget.dataTable.onmousedown 	= onTableClicked;
	tableWidget.dataTable.defaultFilter = defaultFilter;
	tableWidget.dataTable.currentFilter = defaultFilter;
	tableWidget.dataTable.pageCount 	= function () { 
		return Math.ceil(this.dataRows.filter(this.currentFilter).length / this.rowsOnPage);
	};
	tableWidget.dataTable.rowsOnPage = 50;
	tableWidget.dataTable.currentPage = 0;
}

function setFilter(table, value) {
	table.currentPage = 0;
	if(value == "") {
		table.currentFilter = table.defaultFilter;
	} else {
		table.currentFilter = function (element) {
			for(let property in ownProperties(element)) {
				if(element[property].toString().includes(value)) {
					return true;
				}
			}
			return false;
		};
	}
	showTablePage(table);
}

function switchMode(tableWidget, mode) {
	if(mode != "table") {
		conceal(tableWidget.searchBox);
		conceal(tableWidget.searchBox.lable);
		conceal(tableWidget.dataTable);
		conceal(tableWidget.selectionInfo);
		conceal(tableWidget.loadDataButton);
		conceal(tableWidget.pageNavigation);

		tableWidget.searchBox.value = "";
		tableWidget.dataTable.currentFilter = tableWidget.dataTable.defaultFilter;
	}
	if(mode != "dropBox") {
		conceal(tableWidget.dropBox);
	}
	if(mode != "urlForm") {
		conceal(tableWidget.urlForm);
	}

	if(mode == "table") {
		conceal(tableWidget.dataSwitch);
		reveal(tableWidget.searchBox);
		reveal(tableWidget.searchBox.lable);
		reveal(tableWidget.dataTable);
		reveal(tableWidget.selectionInfo);
		reveal(tableWidget.loadDataButton);
		reveal(tableWidget.pageNavigation);
		tableWidget.selectionInfo.innerText = "Выбрано: ";
	} else {
		reveal(tableWidget.dataSwitch);
		if (mode == "dropBox") {
			reveal(tableWidget.dropBox);
			tableWidget.dataSwitch.localModeRadio.checked = "true";
		} else if (mode == "urlForm") {
			reveal(tableWidget.urlForm);
			tableWidget.dataSwitch.serverModeRadio.checked = "true";
		}
	}
}

function fillTableFromJson(table, data) {
	table.headerRow = headerFromObject(data[0]);
	table.dataRows = data.slice(1);
	table.goToPage = [];
	for(var i = 0; i < table.pageCount(); i++) {
		let index = i;
		table.goToPage.push(function () {
			table.currentPage = index;
			showTablePage(table);
		});
	}
}

function onFileSelected (file) {
	var tableWidget = this.parentNode;
	var table = tableWidget.dataTable;
	if(file.name.match(/\.json$/i)) {
			var reader = new FileReader();
			reader.readAsText(file);
			reader.onload = function () {
				fillTableFromJson(table, JSON.parse(reader.result));
				table.currentPage = 0;
				showTablePage(table);
				updateNavigation(tableWidget);
				switchMode(tableWidget, "table");
			}
		}
}

function onSubmitUrl(tableWidget, urlAddress) {
	var request = new XMLHttpRequest();
	var table = tableWidget.dataTable;
	request.onreadystatechange = function () {
		if(this.readyState == XMLHttpRequest.DONE) {
				fillTableFromJson(table, JSON.parse(this.responseText));	
				table.currentPage = 0;
				showTablePage(table);
				updateNavigation(tableWidget);
				switchMode(tableWidget, "table");
		}
	}
	request.open("GET", urlAddress, true);
	request.send();
}

function onTableClicked(event) {
	var cell 	= event.target,
		row 	= cell.parentNode,
		table 	= cell.parentNode.parentNode,
		rowInfo = table.parentNode.selectionInfo;

	if(row.rowIndex == 0) {
		if(typeof cell.order === undefined) {
			cell.order = true;
		} else {
			cell.order = !cell.order;
		}
		sortByProperty(table.dataRows, cell.cellIndex, cell.order);
		showTablePage(table);
	} else {
		try {
			var values = toArray(row.childNodes).map(function (cell) {
				return cell.innerText;
			});
			rowInfo.innerText = "Выбрано: " + values[0];
			if(values.length > 1) {
				rowInfo.innerText += (" (" + values.slice(1)+ ")").replace(/,/g, ", ");
			}
		} catch (err)  { }
	}
}


function onLoadJson(tableWidget) {
	if(tableWidget.source === "server") {
		switchMode(tableWidget, "urlForm");
	} else if (tableWidget.source === "local") {
		switchMode(tableWidget, "dropBox");
	}
}

function onServerMode(tableWidget) {
	tableWidget.source = "server";
	onLoadJson(tableWidget);
}

function onLocalMode(tableWidget) {
	tableWidget.source = "local";
	onLoadJson(tableWidget);
}	

function showTablePage(table) {
	let position = table.currentPage * table.rowsOnPage;
	removeChildren(table, "tr");
	appendChildren(table, [ table.headerRow ]);
	appendChildren(table, 
		rowsFromArray(table.dataRows
			.filter(table.currentFilter)
			.slice(position, position + table.rowsOnPage))
	);	
}

function updateNavigation(tableWidget, position = 0) {
	var navigation = tableWidget.pageNavigation;
	var table = tableWidget.dataTable;

	removeChildren(navigation, "button");

	if(table.pageCount() < 2) {
	 	return; 
	}

	for(var i = position; i < position + 10 && i < table.pageCount(); i++) {
		let button = tag("button", {}, (i + 1).toString());
		button.onclick = table.goToPage[i];
		navigation.appendChild(button);
	}

	if(position > 0) {
		let button = tag("button", {}, "<<");
		let prevPosition = position - 10;
		button.onclick = function () { updateNavigation(tableWidget, prevPosition); };
		navigation.insertBefore(button, navigation.childNodes[0]);
	}
	if(position + 10 < table.pageCount()) {
		let button = tag("button", {}, ">>");
		let nextPosition = position + 10;
		button.onclick = function () { updateNavigation(tableWidget, nextPosition); };
		navigation.appendChild(button);
	}
}