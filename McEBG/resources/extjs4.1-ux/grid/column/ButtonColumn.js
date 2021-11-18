/**
 * 由button組成的column
 * 如果有items.icon,就使用圖片作為button的背景圖片,成為圖片按鈕
 */
Ext.define('Extux.grid.column.ButtonColumn', {
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
					//v += '<img align="middle" style="margin: 2px 1px 2px 1px;cursor: pointer;" alt="' + (item.altText || me.altText) + '" class="' + Ext.baseCSSPrefix + 'action-col-icon ' + me.actionSelector + ' ' + Ext.baseCSSPrefix + 'action-col-' + String(i) + ' ' + (item.disabled ? Ext.baseCSSPrefix + 'item-disabled' : ' ') + (item.iconCls || '') + ' ' + (Ext.isFunction(item.getClass) ? item.getClass.apply(item.scope || me.scope || me, arguments) : (me.iconCls || '')) + '"' + ((item.tooltip) ? ' data-qtip="' + item.tooltip + '"' : '') + ' src="' + item.icon + '">'  + '</img>';
					
					v += '<button style="background: url('
					+ item.icon
					+') no-repeat left center;height:15px;padding-left: 18px;cursor: pointer; margin: 0px;padding: 0px;border: 0px;'+(item.text?'padding-left: 17px':'')+';font-size:11px;" class="'
					+ Ext.baseCSSPrefix 
					+ 'action-col-icon ' 
					+ me.actionSelector 
					+ ' ' 
					+ Ext.baseCSSPrefix 
					+ 'action-col-' 
					+ String(i) 
					+ ' ' 
					+ (item.disabled ? Ext.baseCSSPrefix + 'item-disabled' : ' ') 
					+ (item.iconCls || '') 
					+ ' ' + (Ext.isFunction(item.getClass) ? item.getClass.apply(item.scope || me.scope || me, arguments) : (me.iconCls || ''))
					+'" alt="' 
					+ (item.altText || me.altText) + '" ' 
					+ ((item.tooltip) ? ' data-qtip="' 
					+ item.tooltip + '"' : '') 
					+ '>'
					+ (item.text || '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')
					+'</button>';
				
				} else {
					var tip = '';
					if (item.tooltip) {
						if (item.tooltip.title) {
							tip += 'data-qtitle="' + item.tooltip.title + '" ';
						}
						if (item.tip && item.tip.html) {
							tip += 'data-qtip="' + item.tooltip.html + '" ';
						}
						if (Ext.isString(item.tooltip)){
							tip += 'data-qtip="' + item.tooltip + '" ';
						}
					}
					v += '<button ' + tip + ' alt="' + (item.altText || me.altText) + '" class="' + Ext.baseCSSPrefix + 'action-col-icon ' + me.actionSelector + ' ' + Ext.baseCSSPrefix + 'action-col-' + String(i) + ' ' + (item.disabled ? Ext.baseCSSPrefix + 'item-disabled' : ' ') + (item.iconCls || '') + ' ' + (Ext.isFunction(item.getClass) ? item.getClass.apply(item.scope || me.scope || me, arguments) : (me.iconCls || '')) + '"' + ((item.tooltip) ? ' data-qtip="' + item.tooltip + '"' : '') + ' >' + (item.text || 'button') + '</button>';
				}
//				if (item.text) {
//					v += '<a style="cursor: pointer;" alt="' + (item.altText || me.altText) + '" class="' + Ext.baseCSSPrefix + 'action-col-icon ' + me.actionSelector + ' ' + Ext.baseCSSPrefix + 'action-col-' + String(i) + ' ' + (item.disabled ? Ext.baseCSSPrefix + 'item-disabled' : ' ') + (item.iconCls || '') + ' ' + (Ext.isFunction(item.getClass) ? item.getClass.apply(item.scope || me.scope || me, arguments) : (me.iconCls || '')) + '"' + ((item.tooltip) ? ' data-qtip="' + item.tooltip + '"' : '') + ' src="' + item.icon + '">' + (item.text || '') + '</a>';
//				}
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
