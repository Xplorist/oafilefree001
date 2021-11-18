Ext.define('Extux.util.DragUtil', {
	requires : ['Ext.dd.DragDropManager'],

	parentSelector: null,
	constructor : function(id, sGroup, config) {
		if (id) {
			this.init(id, sGroup, config);
		}
	},
	id : null,
	config : null,
	dragElId : null,
	handleElId : null,
	invalidHandleTypes : null,
	invalidHandleIds : null,
	invalidHandleClasses : null,
	startPageX : 0,
	startPageY : 0,
	groups : null,
	locked : false,
	dragFloatTarget : null,
	lock : function() {
		this.locked = true;
	},

	moveOnly : false,

	unlock : function() {
		this.locked = false;
	},

	isTarget : true,

	padding : null,

	_domRef : null,

	__ygDragDrop : true,

	constrainX : false,

	constrainY : false,

	minX : 0,

	maxX : 0,

	minY : 0,

	maxY : 0,

	maintainOffset : false,

	xTicks : null,

	yTicks : null,

	primaryButtonOnly : true,

	available : false,

	hasOuterHandles : false,

	b4StartDrag : function(x, y) {
	},

	startDrag : function(x, y) {
		
	},

	onDrag : function(e) {
	},

	onDragEnter : function(e, id) {
	},

	b4DragOver : function(e) {
	},

	onDragOver : function(e, id) {
	},

	b4DragOut : function(e) {
	},

	onDragOut : function(e, id) {
	},

	b4DragDrop : function(e) {
	},

	onDragDrop : function(e, id) {
	},

	onInvalidDrop : function(e) {
	},

	b4EndDrag : function(e) {
	},
	getFloatOverTarget : function(){
		return this.dragFloatTarget;
	},
	endDrag : function(e) {
		var t = Ext.get(this.dragElId),
			p = t.parent(),
			tp = {
				top : p.getScroll().top + t.getTop(),
				left : p.getScroll().left + t.getLeft()
			},
			imgs = p.query('img.book-page'),
			img,box;
		this.dragFloatTarget = null;
		for(var i=0;i<imgs.length;i++){
			img = Ext.get(imgs[i]);
			box = {
				top : p.getScroll().top + img.getTop(),
				left : p.getScroll().left + img.getLeft(),
				height : img.getHeight(),
				width: img.getWidth()
			};
			if(tp.top >= box.top && tp.top < box.top + box.height
			  && tp.left >= box.left && tp.left < box.left+box.width){
				this.dragFloatTarget = {
					target : img,
					pageNum : parseInt(img.getAttribute('pageNum')),
					top : tp.top - box.top,
					left : tp.left - box.left,
					height : img.getHeight(),
					width: img.getWidth()
				};
				break;
			}
		}
	},

	onMouseDown : function(e) {
	},

	onMouseUp : function(e) {
	},

	onAvailable : function() {
	},

	defaultPadding : {
		left : 0,
		right : 0,
		top : 0,
		bottom : 0
	},

	constrainTo : function(constrainTo, pad, inContent) {
		if (Ext.isNumber(pad)) {
			pad = {
				left : pad,
				right : pad,
				top : pad,
				bottom : pad
			};
		}
		pad = pad || this.defaultPadding;
		var b = Ext.get(this.getEl()).getBox(),
			ce = Ext.get(constrainTo),
			s = ce.getScroll(), c,
			cd = ce.dom, xy, topSpace, leftSpace;
		if (cd == document.body) {
			c = {
				x : s.left,
				y : s.top,
				width : Ext.Element.getViewWidth(),
				height : Ext.Element.getViewHeight()
			};
		} else {
			xy = ce.getXY();
			c = {
				x : xy[0],
				y : xy[1],
				width : cd.clientWidth,
				height : cd.clientHeight
			};
		}

		topSpace = b.y - c.y;
		leftSpace = b.x - c.x;

		this.resetConstraints();
		this.setXConstraint(leftSpace - (pad.left || 0), c.width - leftSpace - b.width - (pad.right || 0), this.xTickSize);
		this.setYConstraint(topSpace - (pad.top || 0), c.height - topSpace - b.height - (pad.bottom || 0), this.yTickSize);
	},

	getEl : function() {
		if (!this._domRef) {
			this._domRef = Ext.getDom(this.id);
		}

		return this._domRef;
	},

	getDragEl : function() {
		return Ext.getDom(this.dragElId);
	},

	init : function(id, sGroup, config) {
		this.initTarget(id, sGroup, config);
		Ext.EventManager.on(this.id, "mousedown", this.handleMouseDown, this);

	},

	initTarget : function(id, sGroup, config) {

		this.config = config || {};

		this.DDMInstance = Ext.dd.DragDropManager;

		this.groups = {};

		if (typeof id !== "string") {
			id = Ext.id(id);
		}

		this.id = id;

		this.addToGroup((sGroup) ? sGroup : "default");

		this.handleElId = id;

		this.setDragElId(id);

		this.invalidHandleTypes = {
			A : "A"
		};
		this.invalidHandleIds = {};
		this.invalidHandleClasses = [];

		this.applyConfig();

		this.handleOnAvailable();
	},

	applyConfig : function() {

		this.padding = this.config.padding || [0, 0, 0, 0];
		this.isTarget = (this.config.isTarget !== false);
		this.maintainOffset = (this.config.maintainOffset);
		this.primaryButtonOnly = (this.config.primaryButtonOnly !== false);
		
		this.scroll = (this.config.scroll !== false);
	},

	handleOnAvailable : function() {
		this.available = true;
		this.resetConstraints();
		this.onAvailable();
	},

	setPadding : function(iTop, iRight, iBot, iLeft) {

		if (!iRight && 0 !== iRight) {
			this.padding = [iTop, iTop, iTop, iTop];
		} else if (!iBot && 0 !== iBot) {
			this.padding = [iTop, iRight, iTop, iRight];
		} else {
			this.padding = [iTop, iRight, iBot, iLeft];
		}
	},

	setInitPosition : function(diffX, diffY) {
		var el = this.getEl(), dx, dy, p;

		if (!this.DDMInstance.verifyEl(el)) {
			return;
		}

		dx = diffX || 0;
		dy = diffY || 0;

		p = Ext.Element.getXY(el);

		this.initPageX = p[0] - dx;
		this.initPageY = p[1] - dy;

		this.lastPageX = p[0];
		this.lastPageY = p[1];

		this.setStartPosition(p);
	},

	setStartPosition : function(pos) {
		var p = pos || Ext.Element.getXY(this.getEl());
		this.deltaSetXY = null;

		this.startPageX = p[0];
		this.startPageY = p[1];
	},

	addToGroup : function(sGroup) {
		this.groups[sGroup] = true;
		this.DDMInstance.regDragDrop(this, sGroup);
	},

	removeFromGroup : function(sGroup) {
		if (this.groups[sGroup]) {
			delete this.groups[sGroup];
		}

		this.DDMInstance.removeDDFromGroup(this, sGroup);
	},

	setDragElId : function(id) {
		this.dragElId = id;
	},

	setHandleElId : function(id) {
		if (typeof id !== "string") {
			id = Ext.id(id);
		}
		this.handleElId = id;
		this.DDMInstance.regHandle(this.id, id);
	},

	setOuterHandleElId : function(id) {
		if (typeof id !== "string") {
			id = Ext.id(id);
		}
		Ext.EventManager.on(id, "mousedown", this.handleMouseDown, this);
		this.setHandleElId(id);

		this.hasOuterHandles = true;
	},

	unreg : function() {
		Ext.EventManager.un(this.id, "mousedown", this.handleMouseDown, this);
		this._domRef = null;
		this.DDMInstance._remove(this);
	},

	destroy : function() {
		this.unreg();
	},

	isLocked : function() {
		return (this.DDMInstance.isLocked() || this.locked);
	},

	handleMouseDown : function(e, oDD) {
		if (this.primaryButtonOnly && e.button != 0) {
			return;
		}

		if (this.isLocked()) {
			return;
		}

		this.DDMInstance.refreshCache(this.groups);

		if (this.hasOuterHandles || this.DDMInstance.isOverTarget(e.getPoint(), this)) {
			if (this.clickValidator(e)) {

				this.setStartPosition();
				this.b4MouseDown(e);
				this.onMouseDown(e);

				this.DDMInstance.handleMouseDown(e, this);

				this.DDMInstance.stopEvent(e);
			}
		}
	},

	clickValidator : function(e) {
		var target = e.getTarget();
		return (this.isValidHandleChild(target) && (this.id == this.handleElId || this.DDMInstance.handleWasClicked(target, this.id)));
	},

	addInvalidHandleType : function(tagName) {
		var type = tagName.toUpperCase();
		this.invalidHandleTypes[type] = type;
	},

	addInvalidHandleId : function(id) {
		if (typeof id !== "string") {
			id = Ext.id(id);
		}
		this.invalidHandleIds[id] = id;
	},

	addInvalidHandleClass : function(cssClass) {
		this.invalidHandleClasses.push(cssClass);
	},

	removeInvalidHandleType : function(tagName) {
		var type = tagName.toUpperCase();

		delete this.invalidHandleTypes[type];
	},

	removeInvalidHandleId : function(id) {
		if (typeof id !== "string") {
			id = Ext.id(id);
		}
		delete this.invalidHandleIds[id];
	},

	removeInvalidHandleClass : function(cssClass) {
		for (var i = 0, len = this.invalidHandleClasses.length; i < len; ++i) {
			if (this.invalidHandleClasses[i] == cssClass) {
				delete this.invalidHandleClasses[i];
			}
		}
	},

	isValidHandleChild : function(node) {

		var valid = true, nodeName, i, len;

		try {
			nodeName = node.nodeName.toUpperCase();
		} catch (e) {
			nodeName = node.nodeName;
		}
		valid = valid && !this.invalidHandleTypes[nodeName];
		valid = valid && !this.invalidHandleIds[node.id];

		for (i = 0, len = this.invalidHandleClasses.length; valid && i < len; ++i) {
			valid = !Ext.fly(node).hasCls(this.invalidHandleClasses[i]);
		}

		return valid;

	},

	setXTicks : function(iStartX, iTickSize) {
		this.xTicks = [];
		this.xTickSize = iTickSize;

		var tickMap = {}, i;

		for (i = this.initPageX; i >= this.minX; i = i - iTickSize) {
			if (!tickMap[i]) {
				this.xTicks[this.xTicks.length] = i;
				tickMap[i] = true;
			}
		}

		for (i = this.initPageX; i <= this.maxX; i = i + iTickSize) {
			if (!tickMap[i]) {
				this.xTicks[this.xTicks.length] = i;
				tickMap[i] = true;
			}
		}

		Ext.Array.sort(this.xTicks, this.DDMInstance.numericSort);
	},

	setYTicks : function(iStartY, iTickSize) {
		this.yTicks = [];
		this.yTickSize = iTickSize;

		var tickMap = {}, i;

		for (i = this.initPageY; i >= this.minY; i = i - iTickSize) {
			if (!tickMap[i]) {
				this.yTicks[this.yTicks.length] = i;
				tickMap[i] = true;
			}
		}

		for (i = this.initPageY; i <= this.maxY; i = i + iTickSize) {
			if (!tickMap[i]) {
				this.yTicks[this.yTicks.length] = i;
				tickMap[i] = true;
			}
		}

		Ext.Array.sort(this.yTicks, this.DDMInstance.numericSort);
	},

	setXConstraint : function(iLeft, iRight, iTickSize) {
		this.leftConstraint = iLeft;
		this.rightConstraint = iRight;

		this.minX = this.initPageX - iLeft;
		this.maxX = this.initPageX + iRight;
		if (iTickSize) {
			this.setXTicks(this.initPageX, iTickSize);
		}

		this.constrainX = true;
	},

	clearConstraints : function() {
		this.constrainX = false;
		this.constrainY = false;
		this.clearTicks();
	},

	clearTicks : function() {
		this.xTicks = null;
		this.yTicks = null;
		this.xTickSize = 0;
		this.yTickSize = 0;
	},

	setYConstraint : function(iUp, iDown, iTickSize) {
		this.topConstraint = iUp;
		this.bottomConstraint = iDown;

		this.minY = this.initPageY - iUp;
		this.maxY = this.initPageY + iDown;
		if (iTickSize) {
			this.setYTicks(this.initPageY, iTickSize);
		}

		this.constrainY = true;

	},

	resetConstraints : function() {

		if (this.initPageX || this.initPageX === 0) {

			var dx = (this.maintainOffset) ? this.lastPageX - this.initPageX : 0,
				dy = (this.maintainOffset) ? this.lastPageY - this.initPageY : 0;

			this.setInitPosition(dx, dy);

		} else {
			this.setInitPosition();
		}

		if (this.constrainX) {
			this.setXConstraint(this.leftConstraint, this.rightConstraint, this.xTickSize);
		}

		if (this.constrainY) {
			this.setYConstraint(this.topConstraint, this.bottomConstraint, this.yTickSize);
		}
	},

	getTick : function(val, tickArray) {
		if (!tickArray) {

			return val;
		} else if (tickArray[0] >= val) {

			return tickArray[0];
		} else {
			var i, len, next, diff1, diff2;
			for (i = 0, len = tickArray.length; i < len; ++i) {
				next = i + 1;
				if (tickArray[next] && tickArray[next] >= val) {
					diff1 = val - tickArray[i];
					diff2 = tickArray[next] - val;
					return (diff2 > diff1) ? tickArray[i] : tickArray[next];
				}
			}

			return tickArray[tickArray.length - 1];
		}
	},

	scroll : true,

	autoOffset : function(iPageX, iPageY) {
		var x = iPageX - this.startPageX,
			y = iPageY - this.startPageY;
		this.setDelta(x, y);
	},

	setDelta : function(iDeltaX, iDeltaY) {
		this.deltaX = iDeltaX;
		this.deltaY = iDeltaY;
	},

	setDragElPos : function(iPageX, iPageY) {

		var el = this.getDragEl();
		this.alignElWithMouse(el, iPageX, iPageY);
	},

	alignElWithMouse : function(el, iPageX, iPageY) {
		var oCoord = this.getTargetCoord(iPageX, iPageY),
			fly = el.dom ? el : Ext.fly(el, '_dd'),
			elSize = fly.getSize(),
			p = Ext.get(el).parent(this.parentSelector),
			ps,
			EL = Ext.Element, containerSize, aCoord, newLeft, newTop, width, height;

		if (!this.deltaSetXY) {
			ps = p.getSize();
			width = ps.width;
			height = ps.height;
			if(p.isScrollable()){
				width = p.dom.scrollWidth;
				height = p.dom.scrollHeight;
			}
			
			containerSize = this.cachedViewportSize = {
				width : width,
				height : height
			};
			aCoord = [
				Math.max(0, Math.min(oCoord.x, containerSize.width - elSize.width)), 
				Math.max(0, Math.min(oCoord.y, containerSize.height - elSize.height))
			];
			fly.setXY(aCoord);
//			fly.setStyle('position', 'absolute');
			newLeft = fly.getLocalX();
			newTop = fly.getLocalY();
			this.deltaSetXY = [newLeft - oCoord.x, newTop - oCoord.y];
		} else {
			containerSize = this.cachedViewportSize;
			fly.setLeftTop(
				Math.max(0, Math.min(oCoord.x + this.deltaSetXY[0], containerSize.width - elSize.width)), 
				Math.max(0, Math.min(oCoord.y + this.deltaSetXY[1], containerSize.height - elSize.height))
			);
		}

		this.cachePosition(oCoord.x, oCoord.y);
		this.autoScroll(oCoord.x, oCoord.y, el.offsetHeight, el.offsetWidth);
		return oCoord;
	},

	cachePosition : function(iPageX, iPageY) {
		if (iPageX) {
			this.lastPageX = iPageX;
			this.lastPageY = iPageY;
		} else {
			var aCoord = Ext.Element.getXY(this.getEl());
			this.lastPageX = aCoord[0];
			this.lastPageY = aCoord[1];
		}
	},

	autoScroll : function(x, y, h, w) {

		if (this.scroll) {

			var clientH = Ext.Element.getViewHeight(),

				clientW = Ext.Element.getViewWidth(),

				st = this.DDMInstance.getScrollTop(),

				sl = this.DDMInstance.getScrollLeft(),

				bot = h + y,

				right = w + x,

				toBot = (clientH + st - y - this.deltaY),

				toRight = (clientW + sl - x - this.deltaX),

				thresh = 40,

				scrAmt = (document.all) ? 80 : 30;

			if (bot > clientH && toBot < thresh) {
				window.scrollTo(sl, st + scrAmt);
			}

			if (y < st && st > 0 && y - st < thresh) {
				window.scrollTo(sl, st - scrAmt);
			}

			if (right > clientW && toRight < thresh) {
				window.scrollTo(sl + scrAmt, st);
			}

			if (x < sl && sl > 0 && x - sl < thresh) {
				window.scrollTo(sl - scrAmt, st);
			}
		}
	},

	getTargetCoord : function(iPageX, iPageY) {
		var x = iPageX - this.deltaX,
			y = iPageY - this.deltaY;

		if (this.constrainX) {
			if (x < this.minX) {
				x = this.minX;
			}
			if (x > this.maxX) {
				x = this.maxX;
			}
		}

		if (this.constrainY) {
			if (y < this.minY) {
				y = this.minY;
			}
			if (y > this.maxY) {
				y = this.maxY;
			}
		}

		x = this.getTick(x, this.xTicks);
		y = this.getTick(y, this.yTicks);

		return {
			x : x,
			y : y
		};
	},


	b4MouseDown : function(e) {

		this.autoOffset(e.getPageX(), e.getPageY());
	},

	b4Drag : function(e) {
		this.setDragElPos(e.getPageX(), e.getPageY());
	},

	toString : function() {
		return ("DragDrop " + this.id);
	}

});