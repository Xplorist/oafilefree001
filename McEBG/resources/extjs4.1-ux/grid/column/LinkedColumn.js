
/**
 * 連接式按鈕
 * column { 
 * 	dataIndex : '', 
 * 	tooltip : '', 
 *  handler : function(){},
 *  beferRender : function(){}, renderer : function(){} },
 *  getStyle : function(){}
 */
Ext.define('Extux.grid.column.LinkedColumn', {
	extend : 'Ext.grid.column.Column',
	alias : ['widget.linkedcolumn'],
	alternateClassName : 'Ext.grid.LinkedColumn',

	actionIdRe : new RegExp(Ext.baseCSSPrefix + 'linked-action-column'),

	actionSelector : 'x-linked-action-column',

	sortable : false,

	emptyText : '',
	//構造方法
	constructor : function(config) {
		var me = this,
			cfg = Ext.apply({}, config),
			tooltip = config.tooltip || me.tooltip || {};
		me.renderer = function(v, meta, record, row, col, store, view) {
			//響應用戶自己的renderer
			if (Ext.isFunction(cfg.format)) {
				v = cfg.format(v, meta, record, row, col, store, view);
			}
			var style = '';
			if(Ext.isFunction(cfg.getStyle)){
				style = cfg.getStyle(v, meta, record, row, col, store, view);
			}
			if (!v && !me.emptyText){
				return '';
			}
			//在請求前，調用item.beferRender，如果返回false，則不添加這個action button
			if (Ext.isFunction(me.beferRender) && me.beferRender.call(me, meta, record, row, col, store, view) === false) {
				return '';
			}
			var tip = '';
			if (Ext.isString(tooltip)) {
				tip += tooltip;
			} else if (tooltip.title) {
				tip += tooltip.title;
			} else if (tooltip.html) {
				tip += tooltip.html;
			}
			if (Ext.isFunction(me.getTipContent)) {
				var tipContent = me.getTipContent.call(me, meta, record, row, col, store, view);
				if (tipContent && Ext.isString(tipContent)) {
					tip += ': ' + tipContent;
				}
			}
			tip += 'data-qtitle="' + tip + '" ';
			v = '<a href="#" ' + tip + ' class="' + Ext.baseCSSPrefix + 'action-col-icon ' + me.actionSelector + ' ' + Ext.baseCSSPrefix + 'action-linked-col ' + (me.disabled ? Ext.baseCSSPrefix + 'item-disabled' : ' ') + ' ' + (Ext.isFunction(me.getClass) ? me.getClass.apply(me.scope || me.scope || me, arguments) : (me.iconCls || '')) + '"' + ' style="'+style+'">' + (v || me.emptyText) + '</a>';
			return v;
		};

		me.callParent([cfg]);
	},
	/**
	 * 銷毀組建
	 * @return {}
	 */
	destroy : function() {
		delete this.renderer;
		return this.callParent(arguments);
	},
	/**
	 * 處理用戶點擊事件
	 * @param {} type 時間類型
	 * @param {} view 響應事件的view
	 * @param {} cell grid的column cell
	 * @param {} recordIndex row索引
	 * @param {} cellIndex cell索引
	 * @param {} e 事件原型
	 * @return {Boolean}
	 */
	processEvent : function(type, view, cell, recordIndex, cellIndex, e, record, row) {
		var me = this,
			target = e.getTarget(),
			match = target.className.match(me.actionIdRe), fn;
		var key = type == 'keydown' && e.getKey();
		if (match) {
			if (type == 'click' || (key == e.ENTER || key == e.SPACE)) {
				fn = me.click || me.handler;
				if (Ext.isFunction(fn)) {
					fn.call(me, view, recordIndex, cellIndex, e, record, row);
				}
			} else if (type == 'mousedown') {
				return false;
			}
		}
		return me.callParent(arguments);
	}
});
