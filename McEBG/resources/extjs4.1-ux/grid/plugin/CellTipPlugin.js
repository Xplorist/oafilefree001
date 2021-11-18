/**
 * grid cell單元格 不完全顯示列 tooltip支持
 * @author F1930235
 * @date 2012.10.12
 */
Ext.define('Extux.grid.plugin.CellTipPlugin', {
	extend : 'Ext.AbstractPlugin',
	alias : 'plugin.celltipplugin',
	mixins : {
		observable : 'Ext.util.Observable'
	},
	cellTipDisplay : false,

	// private
	init : function(grid) {
		var me = this;
		me.grid = grid;
		me.view = grid.view;
		/*
		 * me.view.on('refresh', function() { Ext.defer(function() {
		 * me.onViewRefresh(); }, 100); }, me);
		 */
		me.grid.mon(me.grid.getStore(), {
			datachanged : function() {
				Ext.defer(function() {
					me.onViewRefresh();
				}, 200);
			},
			load : function() {
				me.onViewRefresh();
			},
			clear : function() {
				Ext.defer(function() {
					me.onViewRefresh();
				}, 200);
			}
		});
	},

	// 在記錄被展示到頁面上時
	onViewRefresh : function() {
		var me = this,
			view = me.view,
			store = view.store,
			cells = view.el ? view.el.query('.x-grid-cell-inner') : null,
			rows = view.all.elements, row, cell;
		if (!me.celltip) {
			me.celltip = Ext.create('Ext.tip.ToolTip', {
				target : view.el,
				html : '',
				listeners : {
					beforeshow : function(tip) {
						return me.cellTipDisplay;
					}
				}
			});
		}
		Ext.each(cells, function(cell) {
			me.mon(Ext.fly(cell), {
				freezeEvent : true,
				mouseover : function(e, element) {
					me.onTargetOver(e, cell, me.celltip);
				},
				mouseout : function(e, element) {
					me.onTargetOut(e, cell, me.celltip);
				},
				mousemove : function(e, element) {
					me.onMouseMove(e, cell, me.celltip);
				}
			});
		});
		Ext.defer(function() {
			me.celltip.hide();
		}, 100);
	},
	/**
	 * 鼠標進過
	 */
	onTargetOver : function(e, innercell, tip) {
		var me = this,
			text = Ext.String.trim(innercell.innerText);
		if (!text) {
			return false;
		}
		tip.update(text);

		var cellwidth = innercell.clientWidth;
		var textLength = text.length;
		// 所有漢字 12px
		var chineseCharCount = text.replace(/[^\u4e00-\u9fa5]/g, '');
		// 大寫字母 8px
		var uppercaseCharCount = text.match(/[A-Z]/g) || [];
		// 小寫字母 6px
		var lowercaseCharCount = text.match(/[a-z]/g) || [];
		// 數字 7px
		var numCharCount = text.match(/[\d]/g) || [];
		// 中杠 4px
		var gangCharCount = text.match(/[-]/g) || [];
		// 空格 4px
		var spaceCharCount = text.match(/[\s]/g) || [];
		// 下劃線 7px
		var enCharCount = text.match(/[_]/g) || [];
		// . 4px
		var dotCharCount = text.match(/[.]/g) || [];
		var otherCharCount = textLength - chineseCharCount.length - uppercaseCharCount.length - lowercaseCharCount.length - spaceCharCount.length - enCharCount.length - dotCharCount.length - numCharCount.length - gangCharCount.length;
		// 計算內容應該的寬度
		var contentWidth = (chineseCharCount.length * 12) + (uppercaseCharCount.length * 8) + (lowercaseCharCount.length * 6) + (enCharCount.length * 7) + (dotCharCount.length * 4) + (otherCharCount * 4) + (spaceCharCount.length * 4) + (numCharCount.length * 7) + (gangCharCount.length * 4) + 10;
		me.cellTipDisplay = contentWidth >= cellwidth;
		if (me.cellTipDisplay) {
			tip.show();
		} else {
			tip.hide();
		}
	},
	/**
	 * 鼠標移出
	 */
	onTargetOut : function(e, innercell, tip) {
		var me = this;
		me.cellTipDisplay = false;
		tip.hide();
	},
	/**
	 * 鼠標異動
	 */
	onMouseMove : function(e, innercell, tip) {
		var me = this;
		tip.setPosition(e.getX() + 15, e.getY() + 10);
	}
});