
function addStyleString(str) { 
	var node = document.createElement("style");
	node.innerHTML = str;
	document.body.appendChild(node);
} 

function toArray(collection, from = 0, to = collection.length) {
	return Array.prototype.slice.call(collection, from, to);
}

function setId(element, id) {
	element.setAttribute("id", id);
}

function setClassName(element, className) {
	element.setAttribute("class", className);
}

function hide(element) {
	element.style.visibility = "hide";
}

function show(element) {
	element.style.visibility = "visible";
}

function conceal(element) {
	element.style.display = "none";
}

function reveal(element) {
	element.style.display = "";
}

function lable(first, second) {
	var lable = document.createElement("lable");
	if(first instanceof Element) {
		lable.appendChild(first);
		appendText(lable, second);
		lable.onclick = function () { first.click(); }
		first.lable = lable;
		return first;
	} else if (second instanceof Element) {
		appendText(lable, first);
		lable.appendChild(second);
		lable.onclick = function () { second.click(); }
		second.lable = lable;
		return second;
	}
}

function tag(elementType, attributes, text) {
	var element = document.createElement(elementType);

	for(var attribName in attributes) {
		if(attributes.hasOwnProperty(attribName)) {
			element.setAttribute(attribName, attributes[attribName]);
		}
	}

	if(typeof text !== undefined) {
		appendText(element, text);
	}

	return element;
}

function div(className, attributes, text) {
	var element = tag("div", attributes, text);
	setClassName(element, className);
	return element;
}

function appendText(element, text) {
	if(typeof text !== 'undefined') {
		element.appendChild(document.createTextNode(text));
	}
}

function textNode(text) {
	var textElement = document.createElement("div");
	appendText(textElement, text);
	return textElement;
}

function appendTextNode(element, text) {
	var textElement = textNode(text);
	element.appendChild(textElement);
	return textElement;
}

function rowsFromArray(dataArray) {
	var _tr = tag("tr"),
		_td = tag("td");
	var rows = dataArray.map(function (item) {
		var row = _tr.cloneNode(false);
		for(var attrib in item) {
			if(item.hasOwnProperty(attrib)) {
				var cell = _td.cloneNode(false);
				appendText(cell, item[attrib]);
				row.appendChild(cell);
			}
		}
		return row;
	});
	return rows;
}

function headerFromObject(headerAttributes) {
	var headerRow = tag("tr");
	var _th = tag("th");

	if(headerAttributes) {
		for(var attrib in headerAttributes) {
			if(headerAttributes.hasOwnProperty(attrib)) {
				var header = _th.cloneNode(false);
				appendText(header, headerAttributes[attrib]);
				headerRow.appendChild(header);
			}
		}
	} else {
		var header = _th.cloneNode(false);
		appendText(header, "<empty>");
		headerRow.appendChild(header);
	}
	return headerRow;
}

function removeChildren(parent, tagName, from, to) {
	var children = toArray(parent.getElementsByTagName(tagName), from, to);
	children.forEach(function (child) {
		child.parentNode.removeChild(child);
	});
}

function appendChildren(parent, children) {
	children.forEach(function (child) {
		parent.appendChild(child);
	});
}

function appendChildrenCopy(parent, children) {
	children.forEach(function (child) {
		parent.appendChild(child.cloneNode(true));
	});
}

function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function sortNodesByChild(nodes, child, descendingOrder = false) {
	nodes.sort(function(a, b) {
		return a.childNodes[child].innerText < b.childNodes[child].innerText ? -1 : 1;
	});

	if(descendingOrder) {
		nodes.reverse();
	}
}

function sortByProperty(elements, property, descendingOrder = false) {
	elements.sort(function(a, b) {
		return a[property] < b[property] ? -1 : 1;
	});

	if(descendingOrder) {
		elements.reverse();
	}
}

function ownProperties(element) {
	var props = [];
	for(var property in element) {
		if(element.hasOwnProperty(property)) {
			props.push(property);
		}
	}
	return props;
}

function buildDOMHierarchy(root) {	
	ownProperties(root).forEach(
		function(propertyName) 
		{
			var property = root[propertyName];
			if(property instanceof Array) {
				for(var i = 0; i < property.length; ++i) 
				{
					if(property[i] instanceof Element) {
						buildDOMHierarchy(property[i]);
						if(property[i].hasOwnProperty("lable") && property[i].lable !== undefined) {
							root.appendChild(property[i].lable);
						} else {
							root.appendChild(property[i]);
						}
					}
				}
			} else if(property instanceof Element && propertyName != "lable") {
				buildDOMHierarchy(property);
				if(property.hasOwnProperty("lable") && property.lable !== undefined) {
					root.appendChild(property.lable);
				} else {
					root.appendChild(property);
				}
			}
		}
	);
}

function dropBox(text, attributes) {
	var dropBox = div("dropBox", attributes, text);
	dropBox.onFileSelected = function (file) {
		appendTextNode(dropBox, file.name);
	};

	dropBox.addEventListener("dragover", function (event) {
		event.stopPropagation();
		event.preventDefault();
		event.dataTransfer.dropEffect = "copy";
	});

	dropBox.addEventListener("drop", function (event) {
		event.stopPropagation();
		event.preventDefault();
		dropBox.onFileSelected(event.dataTransfer.files[0]);
	});

	return dropBox;
}



