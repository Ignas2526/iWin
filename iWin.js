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
	iWin.dragStartX = null;
	iWin.dragStartY = null;

	iWin.offsetTop = 0;
	iWin.offsetLeft = 0;
	iWin.offsetRight = 0;
	iWin.offsetBottom = 0;
	
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

	// Detect if passive events are present. Added with Chrome 51, prevents preventDefault() function in the events
	iWin.passiveEvents = false;
	try {
	  var opts = Object.defineProperty({}, 'passive', {get: function(){iWin.passiveEvents = true;}});
	  window.addEventListener('test', null, opts);
	} catch (e) {}
};

iWin.create = function(param, wID)
{
	if (typeof iWin.win[wID] != 'undefined') return false;
	if (typeof param.type != 'string') param.type = 'window';
	if (typeof param.class == 'string') param.class = ' ' + param.class; else param.class = '';
	
	iWin.win[wID] = {};
	iWin.win[wID].type = param.type;
	iWin.win[wID].tabs = {};
	iWin.win[wID].wID = wID;
	iWin.win[wID].obj = document.createElement('div');
	iWin.win[wID].obj.className = 'winb iwin_'+ param.type + param.class;
	iWin.win[wID].obj.style.cssText = "display:none;top:50px;left:20px;";
	iWin.win[wID].obj.innerHTML =
		'<div class="winbt" style="white-space:nowrap;overflow:hidden;"> </div>'+
		'<div class="winbb" style="display:none"> </div>'+
		'<div class="winbc"> </div>'+
		'<div class="winr tl"> </div><div class="winr tt"> </div><div class="winr tr"> </div>'+
		'<div class="winr ll"> </div><div class="winr rr"> </div>'+
		'<div class="winr bl"> </div><div class="winr bb"> </div><div class="winr br"> </div>';
	//'<div style="display:none;position:absolute;width:100%;height:100%;top:0;"></div>';// for modal window lock
	document.body.appendChild(iWin.win[wID].obj);
	
	iWin.win[wID].onShow = typeof param.onShow == 'function' ? param.onShow : function(){};
	iWin.win[wID].onHide = typeof param.onHide == 'function' ? param.onHide : function(){};
	iWin.win[wID].onClose = typeof param.onClose == 'function' ? param.onClose : function(){};
	iWin.win[wID].onDestroy = typeof param.onDestroy == 'function' ? param.onDestroy : function(){};
	
	// Capture phase first
	iWin.addEvent(iWin.win[wID].obj, 'press', function(){iWin.toFront(wID);}, true);

	// Bubble phase third: move window
	iWin.addEvent(iWin.win[wID].obj.children[0], 'start', function(e) {iWin.resize(wID, {moveT:1, moveL:1}, e);}, false);
	
	// Top Left
	iWin.addEvent(iWin.win[wID].obj.children[3], 'start', function(e) {iWin.resize(wID, {moveT:1, moveB:1, invertB:1, moveL:1, moveR:1, invertR:1}, e);}, true);
	// Top Top
	iWin.addEvent(iWin.win[wID].obj.children[4], 'start', function(e) {iWin.resize(wID, {moveT:1, moveB:1, invertB:1}, e);}, true);
	// Top Right
	iWin.addEvent(iWin.win[wID].obj.children[5], 'start', function(e) {iWin.resize(wID, {moveT:1, moveB:1, invertB:1, moveR:1}, e);}, true);

	// Left left
	iWin.addEvent(iWin.win[wID].obj.children[6], 'start', function(e) {iWin.resize(wID, {moveL:1, moveR:1, invertR:1}, e);}, true);
	// Right Right
	iWin.addEvent(iWin.win[wID].obj.children[7], 'start', function(e) {iWin.resize(wID, {moveR:1}, e);}, true);

	// Bottom Left
	iWin.addEvent(iWin.win[wID].obj.children[8], 'start', function(e) {iWin.resize(wID, {moveB:1, moveL:1, moveR:1, invertR:1}, e);}, true);
	// Bottom Bottom
	iWin.addEvent(iWin.win[wID].obj.children[9], 'start', function(e) {iWin.resize(wID, {moveB:1}, e);}, true);
	// Bottom Right
	iWin.addEvent(iWin.win[wID].obj.children[10], 'start', function(e) {iWin.resize(wID, {moveB:1, moveR:1}, e);}, true);

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
	iWin.win[wID].obj.className = 'winp';
	iWin.win[wID].obj.style.cssText = 'display:none;position:absolute;top:0;left:0;width:100%;height:100%';

	document.body.appendChild(iWin.win[wID].obj);

	iWin.win[wID].onShow = typeof param.onShow == 'function' ? param.onShow : function(){};
	iWin.win[wID].onDestroy = typeof param.onDestroy == 'function' ? param.onDestroy : function(){};
	iWin.win[wID].onHide = typeof param.onHide == 'function' ? param.onHide : function(){};
	iWin.win[wID].onClose = typeof param.onClose == 'function' ? param.onClose : function(){};
	iWin.win[wID].onPress = typeof param.onPress == 'function' ? param.onPress : function(){};

	// Capture phase first
	iWin.addEvent(iWin.win[wID].obj, 'press', function(e){iWin.win[wID].onPress(wID, e);}, true);
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
	iWin.win[wID].onDestroy(wID);

	var evt = e || window.event;
	
	iWin.zRemove(wID);
	document.body.removeChild(iWin.win[wID].obj);
	delete iWin.win[wID];
	if (evt) (evt.stopPropagation)? evt.stopPropagation(): evt.cancelBubble = true;
	return true;
}

iWin.show = function(wID)
{
	if (iWin.win[wID].obj.style.display == 'block') return false;
	iWin.win[wID].onShow(wID);
	iWin.win[wID].obj.style.display = 'block';
	iWin.zAdd(wID);
	return true;
}

iWin.hide = function(wID)
{
	if (iWin.win[wID].obj.style.display == 'none') return false;
	iWin.win[wID].onHide(wID);
	iWin.win[wID].obj.style.display = 'none';
	iWin.zRemove(wID);
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

iWin.setContent = function(content, wID)
{
	iWin.win[wID].obj.children[2].innerHTML = content;
	return true;
}

iWin.setContentDimensions = function(param, wID)
{
	if (!param) param = {};
	if (typeof param.width == 'undefined') param.width = 'auto';
	if (typeof param.height == 'undefined') param.height = 'auto';

	var posTop = iWin.win[wID].obj.offsetTop, posLeft = iWin.win[wID].obj.offsetLeft;
	iWin.win[wID].obj.style.top = '-9999px';
	iWin.win[wID].obj.style.left = '-9999px';
	var isHidden = iWin.show(wID);

	var visibleTab = null;
	if (param.width == 'auto' || param.height == 'auto') {
		iWin.win[wID].obj.children[2].style.width = 'auto';
		iWin.win[wID].obj.children[2].style.height = 'auto';
		iWin.win[wID].obj.children[2].style.overflow = 'hidden'; // impartant for proper height calculations

		// Make all tabs visible before computing height
		for (var tID in iWin.win[wID].tabs) {
			if (iWin.win[wID].tabs[tID].contentObj.style.display == 'block') {
				visibleTab = tID;
			} else {
				iWin.win[wID].tabs[tID].contentObj.style.display = 'block';
			}
		}
	}

	var ContentRect = iWin.win[wID].obj.children[2].getBoundingClientRect();

	if (param.width == 'auto') {
		iWin.win[wID].contentWidth = ContentRect.width;
	} else {
		iWin.win[wID].contentWidth = parseInt(param.width, 10);
	}

	if (param.height == 'auto') {
		iWin.win[wID].contentHeight = ContentRect.height;
	} else {
		iWin.win[wID].contentHeight = parseInt(param.height, 10);
	}

	if (iWin.win[wID].contentWidth < iWin.contentMinAutoWidth) iWin.win[wID].contentWidth = iWin.contentMinAutoWidth;
	else if (iWin.win[wID].contentWidth > iWin.contentMaxAutoWidth) iWin.win[wID].contentWidth = iWin.contentMaxAutoWidth;

	iWin.win[wID].obj.children[2].style.width = iWin.win[wID].contentWidth + 'px';

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
	if (iWin.dragObj != -1) iWin.MoveStop(); // there can be only one resize
	iWin.dragwID = wID;
	iWin.dragObj = iWin.win[wID].obj;

	if (evt.touches) {
		iWin.dragStartX = parseInt(evt.touches[0].clientX, 10);
		iWin.dragStartY = parseInt(evt.touches[0].clientY, 10);
	} else {
		iWin.dragStartX = evt.clientX;
		iWin.dragStartY = evt.clientY;
	}
	
	iWin.dragSTop = iWin.dragObj.offsetTop;
	iWin.dragSLeft = iWin.dragObj.offsetLeft;
	
	iWin.windowMoveT =  params.moveT ? true : false;
	iWin.windowMoveR =  params.moveR ? true : false;
	iWin.windowMoveB =  params.moveB ? true : false;
	iWin.windowMoveL =  params.moveL ? true : false;

	iWin.windowMoveInvertB =  params.invertB ? true : false;
	iWin.windowMoveInvertR =  params.invertR ? true : false;
	
	iWin.resizeWidth = iWin.win[wID].contentWidth + (iWin.win[wID].contentScrollVertical ? iWin.scroll_length : 0);
	iWin.resizeHeight = iWin.win[wID].contentHeight + (iWin.win[wID].contentScrollHorizontal ? iWin.scroll_length : 0);

	document.body.classList.add('nse');
	iWin.addEvent(document, 'move', iWin._windowMove, true);
	iWin.addEvent(document, 'end', iWin.MoveStop, true);
	return true;
}

iWin._windowMove = function(e)
{
	var evt = e || window.event;
	evt.preventDefault();

	var wID = iWin.dragwID;

	var clientY, clientX;
	if (evt.touches) {
		clientX = parseInt(evt.touches[0].clientX, 10);
		clientY = parseInt(evt.touches[0].clientY, 10);
	} else {
		clientX = evt.clientX;
		clientY = evt.clientY;
	}
	
	if (iWin.windowMoveB) {
		if (iWin.windowMoveInvertB && (iWin.resizeHeight - clientY + iWin.dragStartY) < iWin.contentMinHeight) {
			clientY = -iWin.contentMinHeight + iWin.dragStartY + iWin.resizeHeight;
		} else if (!iWin.windowMoveInvertB && (iWin.resizeHeight + clientY - iWin.dragStartY) < iWin.contentMinHeight) {
			clientY = iWin.contentMinHeight + iWin.dragStartY - iWin.resizeHeight;
		}
	}

	if (iWin.windowMoveT && (iWin.dragSTop + clientY - iWin.dragStartY) < iWin.offsetTop) {
		clientY = iWin.offsetTop + iWin.dragStartY - iWin.dragSTop;
	}

	if (iWin.windowMoveR) {
		if (iWin.windowMoveInvertR && (iWin.resizeWidth - clientX + iWin.dragStartX) < iWin.contentMinWidth) {
			clientX = -iWin.contentMinWidth + iWin.dragStartX + iWin.resizeWidth;
		} else if (!iWin.windowMoveInvertR && (iWin.resizeWidth + clientX - iWin.dragStartX) < iWin.contentMinWidth) {
			clientX = iWin.contentMinWidth + iWin.dragStartX - iWin.resizeWidth;
		}
	}

	if (iWin.windowMoveL && (iWin.dragSLeft + clientX - iWin.dragStartX) < iWin.offsetLeft) {
		clientX = iWin.offsetLeft + iWin.dragStartX - iWin.dragSLeft;
	}

	if (iWin.windowMoveT) {
		var NewWindowY = iWin.dragSTop + clientY - iWin.dragStartY;

		if (NewWindowY > (window.innerHeight - 10)) NewWindowY = window.innerHeight - 10;
		iWin.dragObj.style.top = NewWindowY + 'px';
	}

	if (iWin.windowMoveB) {
		if (iWin.windowMoveInvertB) {
			iWin.win[wID].contentHeight = iWin.resizeHeight - clientY + iWin.dragStartY;
		} else {
			iWin.win[wID].contentHeight = iWin.resizeHeight + clientY - iWin.dragStartY;
		}
		
		iWin.win[wID].obj.children[2].style.height = iWin.win[wID].contentHeight + 'px';
	}

	if (iWin.windowMoveL) {
		var NewWindowX = iWin.dragSLeft + clientX - iWin.dragStartX;
		
		if (NewWindowX > (window.innerWidth - 10)) NewWindowX = window.innerWidth - 10;
		
		iWin.dragObj.style.left = NewWindowX + 'px';
	}

	if (iWin.windowMoveR) {
		if (iWin.windowMoveInvertR) {
			iWin.win[wID].contentWidth = iWin.resizeWidth - clientX + iWin.dragStartX;
		} else {
			iWin.win[wID].contentWidth = iWin.resizeWidth + clientX - iWin.dragStartX;
		}
		
		iWin.win[wID].obj.children[0].style.width = iWin.win[wID].contentWidth + 'px';
		iWin.win[wID].obj.children[2].style.width = iWin.win[wID].contentWidth + 'px';
	}
}

iWin.MoveStop = function(e)
{
	var evt = e || window.event;
	evt.preventDefault();

	document.body.classList.remove('nse');
	iWin.removeEvent(document, 'move', iWin._windowMove, true);
	iWin.removeEvent(document, 'end', iWin.MoveStop, true);

	iWin.dragObj = -1;

	if (document.selection && document.selection.empty) {document.selection.empty();} else if (window.getSelection) {window.getSelection().removeAllRanges();}
	
	iWin.win[iWin.dragwID].onResize(iWin.dragwID);
}

iWin.messageBox = function(msg, params, _wID)
{
	// TOOD: _wID will be used in future for modal messageBox
	var wID = 'iAlert' + new Date().getTime().toString(36) + parseInt(Math.random() * 72).toString(36);
	iWin.create({title: params.title, onClose:iWin.destroy, type:'message'}, wID);
	iWin.setContent(msg, wID);
	iWin.setContentDimensions(null, wID);
	iWin.setPosition({top:'center', left:'center'}, wID);
	iWin.show(wID);
	iWin.toFront(wID);
	if (typeof params.timeout != 'undefined')
		setTimeout(function(e){iWin.destroy(wID, e);}, parseInt(params.timeout, 10));
	return wID;
}

iWin.createSelect = function(params, wID)
{
	if (typeof wID == 'undefined') wID = 'iWinSelectBox_'+ new Date().getTime().toString(36) + parseInt(Math.random() * 72).toString(36);

	if (!iWin.create({
		onClose: function(wID){iWin.hide(wID); iWin.hide(wID+ 'p')},
		onShow: function(wID){iWin.show(wID+ 'p')},
		onDestroy: function(wID){iWin.destroy(wID+ 'p')},
		onHide: function(wID){iWin.hide(wID+ 'p')},
		class: params.class,
		type: 'select'}, wID)) return false;

	iWin.createPlane({onPress:function(wID, e){
		var evt = e || window.event;
		iWin.hide(wID.slice(0,-1));
		iWin.hide(wID);
		evt.preventDefault();
	}}, wID + 'p');
	iWin.win[wID].callback = typeof params.callback == 'function' ? params.callback : function(){};
	
	if (typeof params.options != 'undefined') {
		var content = '';
		for (option in params.options) {
			content += '<div class="option option_'+ option+ '"onclick="iWin.onSelectOption('+ option+ ',\''+ wID+ '\')">' + params.options[option] + '</div>';
		}
		iWin.setContent(content, wID);
	}

	iWin.setWindowOption({'resizable': false}, wID);
	return wID;
}

iWin.onSelectOption = function(option, wID)
{
	iWin.hide(wID); iWin.hide(wID+ 'p');
	iWin.win[wID].callback(option, wID);
}
