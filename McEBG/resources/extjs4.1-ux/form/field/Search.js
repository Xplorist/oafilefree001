/**
 * 好看的查詢框
 */
Ext.define('Extux.form.field.SearchField', {
	extend : 'Ext.form.field.Text',
	alias : 'widget.searchfield',
	emptyText : '模糊查詢',
	margin : '3 5 0 0',
	//	initComponent : function() {
	//		this.on('specialkey', this.checkEnterKey, this);
	//		this.callParent();
	//	},
	fieldSubTpl : ['<div class=\'search-small\'><input id="{id}" type="{type}" ', '<tpl if="name">name="{name}" </tpl>', '<tpl if="size">size="{size}" </tpl>', '<tpl if="tabIdx">tabIndex="{tabIdx}" </tpl>', 'class="{fieldCls} {typeCls}" autocomplete="off" /></div>', {
		compiled : true,
		disableFormats : true
	}]
	//,
	//	queryFn : Ext.emptyFn,
	//	checkEnterKey : function(field, e) {
	//		var value = this.getValue();
	//		if (e.getKey() === e.ENTER && !Ext.isEmpty(value)) {
	//			e.stopEvent();
	//			this.queryFn(field);
	//		}
	//	}
});
Ext.define('Extux.form.field.Search', {
	extend : 'Ext.container.Container',
	alias : 'widget.search',
	layout : {
		type : 'hbox',
		pack : 'start'
	},
	width : 260,
	emptyText : '模糊查詢',
	text : '查詢(F)',
	btnHotKey : 'F',
	btnTooltip : 'Ctrl+Alt+F',
	queryFn : Ext.emptyFn,
	setValue : function(value) {
		this.down('searchfield').setValue(value);
	},
	getValue : function() {
		return this.down('searchfield').getValue();
	},
	initComponent : function() {
		var me = this;
		me.addEvents("search");
		me.items = me.buildItems();
		// me.down("searchfield").prototype.queryFn=me.queryFn;
		me.callParent(arguments);
	},
	/**
	 * 設置查詢函數
	 */
	setQueryFn : function(fn, scope) {
		if (!Ext.isFunction(fn)) {
			throw 'Please offer a fun!';
		}
		fn = scope == null ? fn : Ext.bind(fn, scope);
		this.queryFn = fn;
		this.down('searchfield').queryFn = fn;
	},
	focus : function(selectText, delay) {
		var me = this;
		me.down('searchfield').focus(selectText, delay);
	},
	buildItems : function() {
		var me = this;
		return [{
			width : 185,
			xtype : 'searchfield',
			emptyText : me.emptyText,
			hotKey : me.btnHotKey,
			//queryFn : me.queryFn,
			listeners : {
				specialkey : function(a, b) {
					if (b.getKey() == Ext.EventObject.ENTER)
						me.fireEvent("query", a, b);
				}
			}
		}, {
			margin : '4 0 0 0',
			xtype : 'button',
			text : me.text,
			icon : contextPath + '/resources/img/icons/page_find.png',
			tooltip : me.btnTooltip,
			hotSelector : me.btnHotSelector,
			listeners : {
				click : function() {
					var field = this.up('search').down('searchfield');
					me.fireEvent("query", field);
				}
			}
		}]
	}
});