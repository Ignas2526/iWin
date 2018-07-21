/*
	This file is part of iWin JS library by Ignas Poklad(ignas2526).
	iWin is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	iWin is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with iWin. If not, see <http://www.gnu.org/licenses/>.
*/

var iWin = {};

iWin.init = function(param)
{
	iWin.win = {};
	iWin.dragwID = null;
	iWin.dragObj = -1;
	iWin.dragSTop = null;
	iWin.dragSleft = null;
	iWin.dragMouseX = null;
	iWin.dragMouseY = null;

	iWin.resizeWidth = null;
	iWin.resizeHeight = null;

	iWin.zwin = [];
	iWin.zindex = 99;

	iWin.scroll_length = 0;
	iWin.contentMinAutoWidth = 10;
	iWin.contentMinAutoHeight = 10;
	iWin.contentMaxAutoWidth = 810;
	iWin.contentMaxAutoHeight = 610;
	iWin.onSetTitle = typeof param.onSetTitle != 'function' ? function(wID, obj, title) {obj.innerText = title;} : param.onSetTitle;


	var tmpDiv = document.createElement('div');
	tmpDiv.style.cssText = 'position:aboslute;top:-99px;left:-99px;width:70px;height:70px;overflow:scroll;border:0;margin:0;padding:0';
	document.body.appendChild(tmpDiv);
	iWin.scroll_length = tmpDiv.offsetWidth - tmpDiv.clientWidth;
	document.body.removeChild(tmpDiv);
}

iWin.create = function(param, wID)
{
	if (typeof iWin.win[wID] != 'undefined') return false;
	
	iWin.win[wID] = {};
	iWin.win[wID].tabs = {};
	iWin.win[wID].wID = wID;
	iWin.win[wID].obj = document.createElement('div');
	iWin.win[wID].obj.className = "winb";
	iWin.win[wID].obj.style.cssText = "display:none;top:50px;left:20px;";
	iWin.win[wID].obj.innerHTML =
		'<div class="winbt" style="white-space:nowrap;overflow:hidden;"> </div>'+
		'<div class="winbb" style="display:none"> </div>'+
		'<div class="winbc"> </div>'+
	'<div style="cursor:nwse-resize;width:20px;height:20px;position:absolute;right:-7px;bottom:-7px;"> </div>';
	//'<div style="display:none;position:absolute;width:100%;height:100%;top:0;"></div>';// for modal window lock
	/*"<img src=\"/img/refresh.png\" onclick=\"bref('"+id+"')\" /> "+*/
	document.body.appendChild(iWin.win[wID].obj);
	
	iWin.win[wID].onshow = typeof param.onshow == 'function' ? param.onshow : function(){};
	iWin.win[wID].onhide = typeof param.onhide == 'function' ? param.onhide : function(){};
	iWin.win[wID].onclose = typeof param.onclose == 'function' ? param.onclose : function(){};
	iWin.win[wID].onrefresh = typeof param.onrefresh == 'function' ? param.onrefresh : function(){};
	
	// Capture phase first
	iWin.addEvent(iWin.win[wID].obj, 'press', function(){iWin.toFront(wID);}, true);
	
	// Bubble phase third: move window
	iWin.addEvent(iWin.win[wID].obj.children[0], 'start', function(e) {iWin.drag(wID, e);}, false);
	
	iWin.addEvent(iWin.win[wID].obj.children[3], 'start', function(e) {iWin.resize(wID, e);}, true);

	iWin.win[wID].contentWidth = 0;
	iWin.win[wID].contentHeight = 0;
	iWin.win[wID].contentScrollHorizontal = false;
	iWin.win[wID].contentScrollVertical = false;

	iWin.setTitle(param.title, wID);
	return true;
}

iWin.createPlane = function(param, wID)
{
	if (typeof iWin.win[wID] != 'undefined') return false;
	
	iWin.win[wID] = {};
	iWin.win[wID].type = 'plane';
	iWin.win[wID].wID = wID;
	iWin.win[wID].obj = document.createElement('div');
	iWin.win[wID].obj.className = "winp";
	iWin.win[wID].obj.style.cssText = "display:none;position:absolute;top:0;left:0;width:100%;height:100%";

	document.body.appendChild(iWin.win[wID].obj);

	iWin.win[wID].onShow = typeof param.onShow == 'function' ? param.onShow : function(){};
	iWin.win[wID].onHide = typeof param.onHide == 'function' ? param.onHide : function(){};
	iWin.win[wID].onClose = typeof param.onClose == 'function' ? param.onClose : function(){};
	iWin.win[wID].onPress = typeof param.onPress == 'function' ? param.onPress : function(){};

	// Capture phase first
	iWin.addEvent(iWin.win[wID].obj, 'press', function(){iWin.win[wID].onPress(wID);}, true);
	return true;
}

iWin.addEvent = function(object, event, callback, bubbles, passive)
{
	passive = typeof passive == 'undefined' ? false : passive;
	
	if (iWin.passiveEvents) {
		var opts = {passive: passive, capture: bubbles};
	} else {
		var opts = bubbles;
	}

	switch(event) {
		// Start implies that there will be an end event. Press means either a single click or a tap event.
		case 'start': case 'press':
			object.addEventListener('touchstart', callback, opts);
			object.addEventListener('mousedown', callback, opts);
		break;
		case 'move':
			object.addEventListener('touchmove', callback, opts);
			object.addEventListener('mousemove', callback, opts);
		break;
		case 'end':
			object.addEventListener('touchend', callback, opts);
			object.addEventListener('mouseup', callback, opts);
		break;
	}
}

iWin.removeEvent = function(object, event, callback, bubbles, passive)
{
	passive = typeof passive == 'undefined' ? false : passive;
	if (iWin.passiveEvents) {
		var opts = {passive: passive, capture: bubbles};
	} else {
		var opts = bubbles;
	}

	switch(event) {
		case 'start': case 'press':
			object.removeEventListener('touchstart', callback, opts);
			object.removeEventListener('mousedown', callback, opts);
		break;
		case 'move':
			object.removeEventListener('touchmove', callback, opts);
			object.removeEventListener('mousemove', callback, opts);
		break;
		case 'end':
			object.removeEventListener('touchend', callback, opts);
			object.removeEventListener('mouseup', callback, opts);
		break;
	}
}


iWin.destroy = function(wID, e)
{
	if (typeof iWin.win[wID] == 'undefined') return false;
	var evt = e || window.event;
	
	iWin.zRemove(wID);
	document.body.removeChild(iWin.win[wID].obj);
	delete iWin.win[wID];
	if (typeof evt != 'undefined') evt.stopPropagation();
	return true;
}

iWin.show = function(wID)
{
	if (iWin.win[wID].obj.style.display == 'block') return false;
	iWin.win[wID].obj.style.display = 'block';
	iWin.zAdd(wID);
	iWin.win[wID].onshow(wID);
	return true;
}

iWin.hide = function(wID)
{
	if (iWin.win[wID].obj.style.display == 'none') return false;
	iWin.win[wID].onhide(wID);
	iWin.win[wID].obj.style.display = 'none';
	iWin.zRemove(wID);
	return true;
}

iWin.refresh = function(wID)
{
	iWin.win[wID].onrefresh(wID);
	return true;
}

iWin.setTitle = function(title, wID)
{
	if (typeof title == 'undefined' || !title.length) {
		iWin.win[wID].titlebar = false;
		iWin.win[wID].obj.children[0].style.display = 'none';
	} else { 
		iWin.win[wID].titlebar = true;
		iWin.win[wID].obj.children[0].style.display = 'block';
		iWin.onSetTitle(wID, iWin.win[wID].obj.children[0], title);
	}
	return true;
}

iWin.setContent = function(content, autoSize, wID)
{
	iWin.win[wID].obj.children[2].innerHTML = content;

	if (autoSize) iWin.setContentDimensionsAuto(wID);
	return true;
}

iWin.setContentDimensions = function(width, height, wID)
{
	iWin.win[wID].contentWidth = parseInt(width, 10);
	iWin.win[wID].contentHeight = parseInt(height, 10);

	iWin.win[wID].obj.children[2].style.width = (iWin.win[wID].contentWidth + (iWin.win[wID].contentScrollVertical ? iWin.scroll_length : 0)) + 'px';
	iWin.win[wID].obj.children[2].style.height = (iWin.win[wID].contentHeight + (iWin.win[wID].contentScrollHorizontal ? iWin.scroll_length : 0)) + 'px';

	return true;
}

iWin.setContentScroll = function(scrollHorizontal, scrollVertical, wID)
{
	iWin.win[wID].contentScrollHorizontal = scrollHorizontal ? true : false;
	iWin.win[wID].contentScrollVertical = scrollVertical ? true : false;

	if (iWin.win[wID].contentScrollVertical) {
		iWin.win[wID].obj.children[2].style.overflowY = 'scroll';
		iWin.win[wID].obj.children[2].style.width = (iWin.win[wID].contentWidth + iWin.scroll_length) + 'px';
	} else {
		iWin.win[wID].obj.children[2].style.overflowY = 'hidden';
		iWin.win[wID].obj.children[2].style.width = iWin.win[wID].contentWidth + 'px';
	}

	if (iWin.win[wID].contentScrollHorizontal) {
		iWin.win[wID].obj.children[2].style.overflowX = 'scroll';
		iWin.win[wID].obj.children[2].style.height = (iWin.win[wID].contentHeight + iWin.scroll_length) + 'px';
	} else {
		iWin.win[wID].obj.children[2].style.overflowX = 'hidden';
		iWin.win[wID].obj.children[2].style.height = iWin.win[wID].contentHeight + 'px';
	}

	return true;
}

iWin.setPosition = function(top, left, wID)
{
	iWin.win[wID].obj.style.top = parseInt(top, 10) + 'px';
	iWin.win[wID].obj.style.left = parseInt(left, 10) + 'px';
	return true;
}

iWin.setContentDimensionsAuto = function(wID)
{
	// The order of operations is important

	var posTop = iWin.win[wID].obj.offsetTop, posLeft = iWin.win[wID].obj.offsetLeft;
	
	iWin.win[wID].obj.style.top = '-9999px';
	iWin.win[wID].obj.style.left = '-9999px';

	var isHidden = iWin.show(wID);

	iWin.win[wID].obj.children[2].style.width = 'auto';
	iWin.win[wID].obj.children[2].style.height = 'auto';
	iWin.win[wID].obj.children[2].style.overflow = '';

	// Make all tabs visible before computing height
	var visibleTab = null;
	for (var tID in iWin.win[wID].tabs) {
		if (iWin.win[wID].tabs[tID].contentObj.style.display == 'block') {
			visibleTab = tID;
		} else {
			iWin.win[wID].tabs[tID].contentObj.style.display = 'block';
		}
	}
	
	iWin.win[wID].contentWidth = iWin.win[wID].obj.children[2].scrollWidth;
	if (iWin.win[wID].contentWidth < iWin.contentMinAutoWidth) iWin.win[wID].contentWidth = iWin.contentMinAutoWidth;
	else if (iWin.win[wID].contentWidth > iWin.contentMaxAutoWidth) iWin.win[wID].contentWidth = iWin.contentMaxAutoWidth;

	iWin.win[wID].obj.children[2].style.width = iWin.win[wID].contentWidth + 'px';
	
	iWin.win[wID].contentHeight = iWin.win[wID].obj.children[2].scrollHeight;
	if (iWin.win[wID].contentHeight > iWin.contentMaxAutoHeight) {
		iWin.win[wID].contentHeight = iWin.contentMaxAutoHeight;
		iWin.win[wID].contentScroll = true;
	} else if (iWin.win[wID].contentHeight < iWin.contentMinAutoHeight) iWin.win[wID].contentHeight = iWin.contentMinAutoHeight;

	iWin.win[wID].obj.children[2].style.height = iWin.win[wID].contentHeight + 'px';

	// Set tabs back
	for (var tID in iWin.win[wID].tabs) {
		if (tID == visibleTab ) {
			iWin.win[wID].tabs[tID].contentObj.style.display = 'block';
		} else {
			iWin.win[wID].tabs[tID].contentObj.style.display = 'none';
		}
	}
	
	iWin.setContentScroll(iWin.win[wID].contentScrollHorizontal, iWin.win[wID].contentScrollVertical, wID);
	
	iWin.win[wID].obj.style.top = posTop + 'px';
	iWin.win[wID].obj.style.left = posLeft + 'px';

	if (isHidden) iWin.hide(wID);

	return true;
}

iWin.showTab = function(tID, wID)
{
	for (var _tID in iWin.win[wID].tabs) {
		if (tID == _tID) {
			iWin.win[wID].tabs[_tID].contentObj.style.display = 'block';
			iWin.win[wID].tabs[_tID].tabObj.classList.add('open');
		} else {
			iWin.win[wID].tabs[_tID].contentObj.style.display = 'none';
			iWin.win[wID].tabs[_tID].tabObj.classList.remove('open');
		}
	}
	return true;
};

iWin.setTabs = function(tabs, wID)
{
	iWin.win[wID].tabs = {};
	var first = null;
	iWin.win[wID].obj.children[1].innerHTML = '';
	for (var id in tabs) {
		var contentObj = iWin.win[wID].obj.children[2].querySelectorAll('[data-iwin-tabid="'+id+'"]')[0];
		if (typeof(contentObj) == 'undefined') continue;
		
		var tabObj = document.createElement('div');
		tabObj.className = 'winbbt';
		(function(id, wID){tabObj.onclick = function(e){iWin.showTab(id, wID);};})(id, wID);
		tabObj.innerHTML = tabs[id];

		iWin.win[wID].tabs[id] = {text:tabs[id], tabObj:tabObj, contentObj:contentObj};
		if (first == null) {first = id;}
		
		iWin.win[wID].obj.children[1].appendChild(tabObj);
	}
	
	if (first != null) {
		iWin.win[wID].obj.children[1].style.display = 'table';
		iWin.showTab(first, wID);
	} else {
		iWin.win[wID].obj.children[1].style.display = 'none';
	}
	return true;
};

iWin.zAdd = function(wID)
{
	iWin.zindex++;
	iWin.win[wID].obj.style.zIndex = iWin.zindex;
	iWin.zwin[iWin.zindex] = iWin.win[wID].obj;
	return true;
}

iWin.zRemove = function(wID)
{
	var zID = parseInt(iWin.win[wID].obj.style.zIndex, 10);
	for (var i = zID + 1; i < iWin.zindex + 1; i++) {iWin.zwin[i - 1] = iWin.zwin[i]; iWin.zwin[i].style.zIndex = i - 1;}
	delete iWin.zwin[iWin.zindex];
	iWin.zindex--;
	return true;
}

iWin.toFront = function(wID)
{
	var zID = parseInt(iWin.win[wID].obj.style.zIndex, 10);
	if (zID != iWin.zindex) {
		for (var i = zID + 1; i < iWin.zindex + 1; i++) {
			iWin.zwin[i - 1] = iWin.zwin[i];
			iWin.zwin[i].style.zIndex = i - 1;
		}
		iWin.zwin[iWin.zindex] = iWin.win[wID].obj;
		iWin.win[wID].obj.style.zIndex = iWin.zindex;
	}
	return true;
}

iWin.drag = function(wID, e)
{
	if (iWin.dragObj != -1) iWin.MoveStop(); // prevent multiple drags
	iWin.dragwID = wID;
	iWin.dragObj = iWin.win[wID].obj;
	
	iWin.dragMouseX = e.clientX; iWin.dragMouseY = e.clientY;
	iWin.dragSTop = iWin.dragObj.offsetTop; iWin.dragSLeft = iWin.dragObj.offsetLeft;

	document.body.classList.add('nse');
	iWin.addEvent(document, 'move', iWin.dragM, true);
	iWin.addEvent(document, 'end', iWin.MoveStop, true);
	return true;
}

iWin.resize = function(wID, e)
{
	var evt = e || window.event;
	if (iWin.dragObj != -1) iWin.MoveStop(); // prevent multiple drags
	iWin.dragwID = wID;
	iWin.dragObj = iWin.win[wID].obj;

	iWin.dragMouseX = evt.clientX; iWin.dragMouseY = evt.clientY;
	iWin.resizeWidth = iWin.win[wID].contentWidth + (iWin.win[wID].contentScrollVertical ? iWin.scroll_length : 0);
	iWin.resizeHeight = iWin.win[wID].contentHeight + (iWin.win[wID].contentScrollHorizontal ? iWin.scroll_length : 0);

	document.body.classList.add('nse');
	iWin.addEvent(document, 'move', iWin.resizeM, true);
	iWin.addEvent(document, 'end', iWin.MoveStop, true);
	return true;
}

iWin.resizeM = function(e)
{
	var wID = iWin.dragwID;
	
	iWin.win[wID].contentWidth = iWin.resizeWidth + e.clientX - iWin.dragMouseX;
	if (iWin.win[wID].contentWidth < 100) iWin.win[wID].contentWidth = 100;
	iWin.win[wID].obj.children[2].style.width = iWin.win[wID].contentWidth + 'px';

	iWin.win[wID].contentHeight = iWin.resizeHeight + e.clientY - iWin.dragMouseY;
	if (iWin.win[wID].contentHeight < 20) iWin.win[wID].contentHeight = 20;
	iWin.win[wID].obj.children[2].style.height = iWin.win[wID].contentHeight + 'px';
}

iWin.dragM = function(e)
{
	var by = iWin.dragSTop + e.clientY - iWin.dragMouseY;
	if (by < 40) by = 40;
	if (by > (window.innerHeight - 10)) by = window.innerHeight - 10;
	
	var bx = iWin.dragSLeft + e.clientX - iWin.dragMouseX;
	if (e.clientX < 5) bx = iWin.dragSLeft + 5 - iWin.dragMouseX;
	if (bx > (window.innerWidth - 10)) bx = window.innerWidth - 10;
	
	iWin.dragObj.style.top = by + 'px'; iWin.dragObj.style.left = bx + 'px';
}

iWin.MoveStop = function()
{
	document.body.classList.remove('nse');
	iWin.removeEvent(document, 'move', iWin.resizeM, true);
	iWin.removeEvent(document, 'move', iWin.dragM, true);
	iWin.removeEvent(document, 'end', iWin.MoveStop, true);
	iWin.dragObj = -1;

	if (document.selection && document.selection.empty) {document.selection.empty();}else if (window.getSelection) {window.getSelection().removeAllRanges();}
}

iWin.messageBox = function(msg, params, _wID) // _wID will be used in future for modal messageBox
{
	var wID = 'iAlert' + new Date().getTime();
	iWin.create({title: params.title, onclose:function(){iWin.destroy(wID)}}, wID);
	iWin.setContent(msg, true, wID);
	iWin.setPosition(60, (window.innerWidth / 2) - 20, wID);
	iWin.show(wID);
	iWin.toFront(wID);
	iWin.show(wID);
	if (typeof params.timeout != 'undefined')
	setTimeout(function(){iWin.destroy(wID)}, parseInt(params.timeout, 10));
	return true;
}

iWin.selectBoxCallback = {function:null, arg:null};
iWin.selectBox = function(options, callbackFunction, arg, e)
{
	var evt = e || window.event;

	iWin.selectBoxCallback.function = typeof callbackFunction == 'function' ? callbackFunction : function(){};
	iWin.selectBoxCallback.arg = arg;

	var wIDplane = 'iWinSelectBoxPlane';
	var wIDbox = 'iWinSelectBox';
	iWin.createPlane({onPress:function(wID){iWin.destroy('iWinSelectBoxPlane'); iWin.destroy('iWinSelectBox');}}, wIDplane);
	iWin.show(wIDplane);

	iWin.create({onClose:iWin.destroy}, wIDbox);
	var content = '';
	for (option in options) {
		content += '<div onclick="iWin.selectBoxOption('+ option + ')">' + options[option] + '</div>';
	}
	iWin.setContent(content, true, wIDbox);

	iWin.setWindowOption({'resizable': false}, wIDbox);
	iWin.show(wIDbox);

	var boxRect = iWin.win['iWinSelectBox'].obj.getBoundingClientRect();
	var srcRect = evt.target.getBoundingClientRect();

	var boxTop = 0, boxLeft = srcRect.left + (srcRect.width / 2) - (boxRect.width / 2);

	if ((srcRect.top - boxRect.height) < 0) {
		// Position Below
		boxTop = srcRect.bottom;
	} else {
		// Position Above
		boxTop = srcRect.top - boxRect.height;
	}

	iWin.setPosition(boxTop, boxLeft, wIDbox);
	iWin.show(wIDbox);
	return true;
}

iWin.selectBoxOption = function(option)
{
	iWin.destroy('iWinSelectBoxPlane');
	iWin.destroy('iWinSelectBox');
	iWin.selectBoxCallback.function(option, iWin.selectBoxCallback.arg);
}
