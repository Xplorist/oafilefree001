/**
 * 一個是上下文，一個是用戶信息
 * @type String
 */
var userInfo,
	sysTitle = "周邊服務系統";
if(!window.contextPath){
	contextPath = window.location.pathname.substr(0, window.location.pathname.indexOf('/', 1));
}
var mainThemeName = window.top.MAIN_THEME_NAME;
if (!Ext || !Ext.versions) {
	(function() {
		document.write('<link rel="stylesheet" type="text/css" href="' + contextPath + '/resources/extjs4.1/ux/css/CheckHeader.css" >');
		if (!mainThemeName) {
			document.write('<link id="theme_ext_css" rel="stylesheet" type="text/css" href="' + contextPath + '/resources/extjs4.1/resources/css/ext-all.css" >');
		} else {
			document.write('<link id="theme_ext_css" rel="stylesheet" type="text/css" href="' + contextPath + '/resources/extjs4.1/resources/css/ext-all-' + mainThemeName + '.css" >');
		}
	})();
}
if(!Ext.ClassManager.get('Extux.form.field.SearchField')){
	document.write('<script type="text/javascript" charset="UTF-8" src="' + contextPath + '/resources/extjs4.1-ux/form/field/Search.js"></script>');
}
if(!Ext.ClassManager.get('Extux.grid.plugin.GridHotKeySup')){
	document.write('<script type="text/javascript" charset="UTF-8" src="' + contextPath + '/resources/extjs4.1-ux/grid/plugin/GridHotKeySup.js"></script>');
}
document.write('<script type="text/javascript" charset="UTF-8" src="' + contextPath + '/resources/extjs4.1-ux/Override.js"></script>');
document.write('<script type="text/javascript" charset="UTF-8" src="' + contextPath + '/resources/js/pub/funStorage.js"></script>');
Ext.BLANK_IMAGE_URL = contextPath + "/resources/extjs/resources/themes/images/default/tree/s.gif";
Ext.Loader.setConfig({
	enabled : true,
	paths : {
		'Extux' : contextPath + '/resources/extjs4.1-ux',
		"Ext" : contextPath + '/resources/extjs4.1'
	}
});

//session登錄超時處理
Ext.Ajax.on({
	requestexception : function(conn, response, opts, eOpts) {
		var obj = null;
		try {
			obj = Ext.decode(response.responseText);
		} catch (e) {
			obj = e;
			Ext.Error.raise(e);
		}
		if (obj && obj.errorMsg == 'SessionLoseException') {
			if (window.top.isLoginWinShow && window.top.isLoginWinShow()) {
				Ext.Error.raise('登錄超時！');
			}
			if (window.top.showLoginWin && confirm('登錄超時，是否重新登錄？')) {
				window.top.showLoginWin();
			}
			Ext.Error.raise('登錄超時！');
		}
	}
});
Ext.ns('JCSC');
/*
 * Ext.apply(Ext.Ajax, { onUploadComplete : function(frame, options) { var me =
 * this, response = { responseText : '', responseXML : null }, doc, firstChild;
 * try { doc = frame.contentWindow.document || frame.contentDocument ||
 * window.frames[frame.id].document; if (doc) { if (doc.body) { if
 * (/textarea/i.test((firstChild = doc.body.firstChild || {}).tagName)) {
 * response.responseText = firstChild.value; } else { response.responseText =
 * doc.body.innerHTML; } } response.responseXML = doc.XMLDocument || doc; } }
 * catch (e) { } var flag = me.fireEvent('requestcomplete', me, response,
 * options); if (!flag) { setTimeout(function() { Ext.removeNode(frame); },
 * 100); return; } Ext.callback(options.success, options.scope, [response,
 * options]); Ext.callback(options.callback, options.scope, [options, true,
 * response]); setTimeout(function() { Ext.removeNode(frame); }, 100); },
 * onComplete : function(request) { var me = this, options = request.options,
 * result, success, response; try { result = me.parseStatus(request.xhr.status); }
 * catch (e) { // in some browsers we can't access the status if the readyState
 * is not 4, so the request has failed result = { success : false, isException :
 * false }; } success = result.success; if (success) { response =
 * me.createResponse(request); var flag = me.fireEvent('requestcomplete', me,
 * response, options); if (!flag) { delete me.requests[request.id]; return
 * response; } Ext.callback(options.success, options.scope, [response,
 * options]); } else { if (result.isException || request.aborted ||
 * request.timedout) { response = me.createException(request); } else { response =
 * me.createResponse(request); } me.fireEvent('requestexception', me, response,
 * options); Ext.callback(options.failure, options.scope, [response, options]); }
 * Ext.callback(options.callback, options.scope, [options, success, response]);
 * delete me.requests[request.id]; return response; } });
 */
/**
 * 用戶信息
 */
Ext.define('UserInfo', {
	config : {
		userNo : null,
		userName : null,
		siteNo : null,
		deptNo : null,
		deptName : null,
		telephone : null,
		mailAddress : null,
		costNo : null,
		auth : null,
		mobilePhone : null
	},
	constructor : function(cfg) {
		this.initConfig(cfg);
	}
});
function userInit() {
	userInfo = null;
	userJuri = null;
	//獲得用戶當前form的相關權限信息
	Ext.Ajax.request({
		async : false,
		url : contextPath + '/login!getLoginUserInfo.action',
		success : function(response) {
			var obj = Ext.decode(response.responseText);
			if (!userInfo) {
				userInfo = Ext.create('UserInfo', obj);
			}
		},
		failure : function(response) {
			var obj = Ext.decode(response.responseText);
			Ext.Error.raise('登錄超時！');
			alert('權限驗證異常，原因：' + obj.errorMsg);
		}
	});
	/**
	 * 獲得表單節點權限及用戶基本信息
	 */
	Ext.Ajax.request({
		async : false,
		url : contextPath + '/juri/userInfo!getUserJuri.action',
		success : function(response) {
			var json = Ext.decode(response.responseText);
			userJuri = json;
		}
	});

	/**
	 * 獲得有刪除權限的部門
	 */
/*
 * Ext.Ajax.request({ async : false, url : contextPath +
 * '/juri/userInfo.action', params : { crud : 'd' }, success :
 * function(response) { var json = Ext.decode(response.responseText);
 * juriInfo.delDpts = json.depts; } });
 *//**
		 * 獲得有新增（修改）權限的部門
		 */
/*
 * Ext.Ajax.request({ async : false, url : contextPath +
 * '/juri/userInfo.action', params : { crud : 'c' }, success :
 * function(response) { var json = Ext.decode(response.responseText);
 * juriInfo.modDpts = json.depts; } });
 */
};
/**
 * 權限控制
 */
function juriManager() {
	var beJuriElements = Ext.ComponentQuery.query('*[juriAction]');
	var beJuriDoms = Ext.DomQuery.select('*[juri-action]');
	Ext.each(beJuriElements, function(ele) {
		ele.disable();
	});
	Ext.each(beJuriDoms, function(ele) {
		ele.setAttribute("disabled", "disabled");
	});
	if (!userJuri) {
		return false;
	}
	var juriElements = userJuri.elements;// 用戶有的權限
	Ext.each(juriElements, function(ele) {
		Ext.each(beJuriElements, function(beJuriEle) {
			if (ele === beJuriEle.juriAction) {
				beJuriEle.enable();
				//return false;
			}
		});
		Ext.each(beJuriDoms, function(beJuriDom) {
			if (ele === beJuriDom.getAttribute("juri-action")) {
				beJuriDom.removeAttribute("disabled");
				//return false;
			}
		});
	});
}
/**
 * 資料所屬部門， 其实就是新增的权限部门
 */
Ext.define('Ext.ux.CmbJuriAddDepts', {
	extend : 'Ext.form.ComboBox',
	alias : 'widget.cmbadd',
	valueField : 'deptNo',
	displayField : 'deptName',
	// fieldLabel : '資料所屬部門',
	forceSelection : true,
	queryMode : 'local',
	store : Ext.create('Ext.data.Store', {
		autoLoad : true,
		fields : ['deptNo', 'deptName'],
		proxy : {
			type : 'ajax',
			url : contextPath + '/juri/userInfo!getUserJuri.action',
			reader : {
				type : 'json',
				root : 'addDpts'
			}
		}
	})
});

/**
 * 好看的查詢框
 */
Ext.define('Ext.ux.SearchField', {
	extend : 'Ext.form.field.Text',
	alias : 'widget.searchfield',
	emptyText : '模糊查詢',
	margin : '0 10 0 0',
	fieldSubTpl : ['<div class=\'search-small\'><input id="{id}" type="{type}" ', '<tpl if="name">name="{name}" </tpl>', '<tpl if="size">size="{size}" </tpl>', '<tpl if="tabIdx">tabIndex="{tabIdx}" </tpl>', 'class="{fieldCls} {typeCls}" autocomplete="off" /></div>', {
		compiled : true,
		disableFormats : true
	}]
});
/**
 * 查詢體
 */
Ext.define('Ext.ux.Search', {
	extend : 'Ext.container.Container',
	alias : 'widget.search',
	layout : {
		type : 'hbox',
		pack : 'start'
	},
	width : 300,
	emptyText : '模糊查詢',
	text : '查詢',
	initComponent : function() {
		var me = this;
		me.addEvents("query");
		me.items = me.buildItems();
		me.callParent(arguments);
	},
	focus : function(selectText, delay) {
		var me = this;
		me.down('searchfield').focus(selectText, delay);
	},
	setValue : function(value) {
		var me = this;
		me.down('searchfield').setValue(value);
	},
	getValue : function() {
		var me = this;
		return me.down('searchfield').getValue();
	},
	buildItems : function() {
		var me = this;
		return [{
			xtype : 'searchfield',
			emptyText : me.emptyText,
			listeners : {
				specialkey : function(field, e) {
					var value = field.getValue();
					if (e.getKey() === e.ENTER) {
						e.stopEvent();
						me.fireEvent('query', field);
					}
				}
			}
		}, {
			xtype : 'button',
			text : me.text,
			iconCls : 'page-find',
			listeners : {
				click : function() {
					var field = this.up('search').down('searchfield');
					me.fireEvent('query', field);
				}
			}
		}]
	}
});
/**
 * CheckColumn
 */
Ext.define('Ext.ux.CheckColumn', {
	extend : 'Ext.grid.column.Column',
	alias : 'widget.checkcolumn',

	tdCls : Ext.baseCSSPrefix + 'grid-cell-checkcolumn',

	constructor : function() {
		this.addEvents(
		    /**
			 * @event checkchange Fires when the checked state of a row changes
			 * @param {Ext.ux.CheckColumn} this
			 * @param {Number} rowIndex The row index
			 * @param {Boolean} checked True if the box is checked
			 */
		    'checkchange'
		);
		this.callParent(arguments);
	},

	/**
	 * @private Process and refire events routed from the GridView's
	 *          processEvent method.
	 */
	processEvent : function(type, view, cell, recordIndex, cellIndex, e) {
		if (type == 'mousedown' || (type == 'keydown' && (e.getKey() == e.ENTER || e.getKey() == e.SPACE))) {
			var rec = view.store.getAt(recordIndex),
				val = rec.get("isEnable"), val1,
				checked = (val == 'Y' ? false : true);
			val1 = val == 'Y' ? "N" : "Y";
			rec.set("isEnable", val1);
			this.fireEvent('checkchange', this, recordIndex, checked);
			// cancel selection.
			return false;
		} else {
			return this.callParent(arguments);
		}
	},

	// Note: class names are not placed on the prototype bc renderer scope
	// is not in the header.
	renderer : function(value) {
		var cssPrefix = Ext.baseCSSPrefix,
			cls = [cssPrefix + 'grid-checkheader'];

		if (value == 'Y') {
			cls.push(cssPrefix + 'grid-checkheader-checked');
		}
		return '<div class="' + cls.join(' ') + '">&#160;</div>';
	}
});
Ext.define('Ext.grid.column.Button', {
	extend : 'Ext.grid.column.Column',
	alias : ['widget.buttoncolumn'],
	alternateClassName : 'Ext.grid.ActionColumn',

	header : '&#160;',

	actionIdRe : new RegExp(Ext.baseCSSPrefix + 'action-col-(\\d+)'),

	actionSelector : 'x-button-action-column',

	altText : '',

	sortable : false,

	constructor : function(config) {
		var me = this,
			cfg = Ext.apply({}, config),
			items = cfg.items || [me],
			l = items.length, i, item;
		me.btnItems = items;
		me.renderer = function(v, meta, record, row, col, store, view) {
			v = Ext.isFunction(cfg.renderer) ? cfg.renderer.apply(this, arguments) || '' : '';

			meta.tdCls += ' ' + Ext.baseCSSPrefix + 'action-col-cell';
			for (i = 0; i < l; i++) {
				item = items[i];
				//在請求前，調用item.beferRender，如果返回false，則不添加這個action button
				if (Ext.isFunction(item.beferRender) && item.beferRender.call(me, item, meta, record, row, col, store, view) === false) {
					continue;
				}
				item.disable = Ext.Function.bind(me.disableAction, me, [i]);
				item.enable = Ext.Function.bind(me.enableAction, me, [i]);
				if (item.icon) {
					v += '<img align="middle" style="padding: 0px 1px 6px 1px" alt="' + (item.altText || me.altText) + '" class="' + Ext.baseCSSPrefix + 'action-col-icon ' + me.actionSelector + ' ' + Ext.baseCSSPrefix + 'action-col-' + String(i) + ' ' + (item.disabled ? Ext.baseCSSPrefix + 'item-disabled' : ' ') + (item.iconCls || '') + ' ' + (Ext.isFunction(item.getClass) ? item.getClass.apply(item.scope || me.scope || me, arguments) : (me.iconCls || '')) + '"' + ((item.tooltip) ? ' data-qtip="' + item.tooltip + '"' : '') + ' src="' + item.icon + '">' + (item.text || '') + '</img>';
				} else {
					var tip = '';
					if (item.tip) {
						if (item.tip.title) {
							tip += 'data-qtitle="' + item.tip.title + '" ';
						}
						if (item.tip.html) {
							tip += 'data-qtip="' + item.tip.html + '" ';
						}
					}
					//					v += '<button ' + tip + ' alt="' + (item.altText || me.altText) + '" class="' + Ext.baseCSSPrefix + 'action-col-icon ' + me.actionSelector + ' ' + Ext.baseCSSPrefix + 'action-col-' + String(i) + ' ' + (item.disabled ? Ext.baseCSSPrefix + 'item-disabled' : ' ') + (item.iconCls || '') + ' ' + (Ext.isFunction(item.getClass) ? item.getClass.apply(item.scope || me.scope || me, arguments) : (me.iconCls || '')) + '"' + ((item.tooltip) ? ' data-qtip="' + item.tooltip + '"' : '') + ' >' + (item.text || 'button') + '</button>';
					v += '<input type="button" align="middle" style="padding:2px;margin:2px;" ' + tip + ' alt="' + (item.altText || me.altText) + '" class="' + Ext.baseCSSPrefix + 'action-col-icon ' + me.actionSelector + ' ' + Ext.baseCSSPrefix + 'action-col-' + String(i) + ' ' + (item.disabled ? Ext.baseCSSPrefix + 'item-disabled' : ' ') + (item.iconCls || '') + ' ' + (Ext.isFunction(item.getClass) ? item.getClass.apply(item.scope || me.scope || me, arguments) : (me.iconCls || '')) + '"' + ((item.tooltip) ? ' data-qtip="' + item.tooltip + '"' : '') + ' value="' + (item.text || 'button') + '" ></input>';
				}
			}
			return v;
		};

		delete cfg.items;
		me.callParent([cfg]);
	},

	enableAction : function(index) {
		var me = this;

		if (!index) {
			index = 0;
		} else if (!Ext.isNumber(index)) {
			index = Ext.Array.indexOf(me.items, index);
		}
		me.items[index].disabled = false;
		me.up('tablepanel').el.select('.' + Ext.baseCSSPrefix + 'action-col-' + index).removeCls(me.disabledCls);
	},

	disableAction : function(index) {
		var me = this;

		if (!index) {
			index = 0;
		} else if (!Ext.isNumber(index)) {
			index = Ext.Array.indexOf(me.items, index);
		}
		me.items[index].disabled = true;
		me.up('tablepanel').el.select('.' + Ext.baseCSSPrefix + 'action-col-' + index).addCls(me.disabledCls);
	},

	destroy : function() {
		delete this.items;
		delete this.renderer;
		return this.callParent(arguments);
	},

	processEvent : function(type, view, cell, recordIndex, cellIndex, e) {
		var me = this,
			target = e.getTarget(),
			match = target.className.match(me.actionIdRe), item, fn;
		var key = type == 'keydown' && e.getKey();
		if (key && !Ext.fly(target).findParent(view.cellSelector)) {
			target = Ext.fly(cell).down('.' + Ext.baseCSSPrefix + 'action-col-icon', true);
		}
		if (match) {
			item = me.btnItems[parseInt(match[1], 10)];
			if (item) {
				if (type == 'click') {
					fn = item.handler || me.handler;
					if (fn && !item.disabled) {
						fn.call(item.scope || me.scope || me, view, recordIndex, cellIndex, item, e);
					}
				} else if (type == 'mousedown' && item.stopSelection !== false) {
					return false;
				}
			}
		}
		return me.callParent(arguments);
	},

	cascade : function(fn, scope) {
		fn.call(scope || this, this);
	},

	getRefItems : function() {
		return [];
	}
});
/**
 * 增加一個後臺異常的前臺顯示監聽器
 */
function addErrorListener() {
	Ext.Ajax.on({
		requestexception : function(conn, response, opts, eOpts) {
			showAjaxError(response);
		}
	});
	Ext.define('JCSC.HtmlErrrorShowWin', {
		extend : 'Ext.window.Window',
		alias : 'widget.htmlerrrorshowwin',
		layout : 'fit',
		closeAction : 'hide',
		width : 700,
		minHeight : 100,
		maxHeight : 400,
		modal : true,
		constrain : true,
		title : '<span style="color:red;">系統異常</span>',
		initComponent : function() {
			var me = this;
			me.items = [{
				itemId : 'errorPanel',
				border : false,
				autoScroll : true,
				data : {},
				tpl : ''
			}];
			me.upTpl = function(data) {
				me.down('#errorPanel').update(data);
			};
			me.callParent();
		},
		showError : function(data) {
			this.upTpl(data);
			this.show();
		}
	}, function() {
		JCSC.HtmlErrrorShowWin = JCSC.ErrorWin = new this();
	});
}
/**
 * alert顯示response的後臺異常信息
 * @param {} response
 */
function showAjaxError(response) {
	if (response.responseText) {
		try {
			var responseObj = Ext.decode(response.responseText);
			var errorMsg = '',
				errorMsgDesc = '<span style=\"font-size:14px;\">';
//			if (!!responseObj.errorMsg) {
//				errorMsg += responseObj.errorMsg;
//			}
			if (!!responseObj.errorMsgDesc) {
				errorMsgDesc += responseObj.errorMsgDesc;
				errorMsgDesc += '</span>';
				errorMsg += errorMsgDesc;
			}
			Ext.Msg.alert(sysTitle, errorMsg);
		} catch (e) {
			JCSC.ErrorWin.showError(response.responseText);
		}
	} else {
		Ext.Msg.alert(sysTitle, '未知原因的系統異常,請聯係系統管理員!');
	}
}
/** ----------------init method-------------------------* */
userInit();