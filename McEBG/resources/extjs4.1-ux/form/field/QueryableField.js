/**
 * 通用查詢模版
 */
Ext.define('Extux.form.field.QueryableField', {
	extend : 'Ext.form.field.Text',
	alias : 'widget.queryablefield',
	requires : ['Extux.form.field.SearchField', 'Extux.grid.plugin.CellTipPlugin'],
	win : null,
	name : 'emp',
	emptyText : 'Ctrl+↓查詢',
	queryTip : '',
	canQuery : true,
	initComponent : function() {
		var me = this;
		Ext.Object.merge(me, {
			listeners : {
				scope : me,
				//				render : function(txt) {
				//					txt.tip = Ext.create('Ext.tip.ToolTip', {
				//						target : txt.el,
				//						//dismissDelay : 2000,
				//						html : 'Ctrl+↓查詢'
				//					});
				//				},
				//				focus : function(txt) {
				//					var pos = txt.getPosition(false);
				//					pos[0] = pos[0] + txt.getWidth();
				//					txt.tip.showAt(pos);
				//				},
				//				blur : function(txt) {
				//					txt.tip.hide();
				//				},
				specialkey : function(txt, e, options) {
					if (e.getKey() == e.DOWN && e.ctrlKey) {
						me.queryObject(txt);
					}
				}
			}
		});
		/*
		 * 查詢框模版需要配置屬性 me.dataModel: 'modelClass' me.queryDataUrl:
		 * '/mes/sss/...' me.dataColumns: [column1,column2]
		 */
		me.addEvents('beforeWinShow',//function(txt,win){}
		'onWinClose',//function(txt,win){}
		'selectedRecord'//function(txt,win,record){}
		);

		me.callParent(arguments);
		me.storeData = new Ext.data.Store({
			model : me.dataModel,
			autoLoad : false,
			pageSize : me.pageSize ? me.pageSize : 15,
			proxy : {
				type : 'ajax',
				url : contextPath + me.queryDataUrl,
				extraParams : me.extraParams,
				actionMethods : {
					read : "POST"
				},
				reader : {
					type : 'json',
					totalProperty : me.totalStr ? me.totalStr : 'totalCount',
					messageProperty : 'message',
					root : me.rootStr ? me.rootStr : 'data'
				}
			},
			reload : function(param, fn, scope) {
				var me = this;
				if (param) {
					me.getProxy().extraParams = Ext.merge(me.getProxy().extraParams, param);
				}
				me.currentPage = 1;
				me.removeAll();
				me.load({
					scope : me,
					callback : function(records, operation, success) {
						if (!success) {
							Ext.Msg.alert('提示', '查詢無數據.');
						} else {
							if (fn instanceof Function) {
								fn.call(scope || me, records);
							}
						}
					}
				});
			}
		});
		me.winCfg = {
			height : me.winHeight ? me.winHeight : 370,
			width : me.winWidth ? me.winWidth : 450,
			maximized : me.winMaximized ? me.winMaximized : false,
			title : me.queryTitle + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label style="color:#A3A298;font-size:8px;">提示：按下Esc可退出查詢</label>',
			layout : 'fit',
			modal : true,
			autoHeight : true,
			closeAction : 'hide',
			items : {
				itemId : 'gridData',
				xtype : 'grid',
				plugins : [{
					ptype : 'gridhotkeysup'
				}, {
					ptype : 'celltipplugin'
				}],
				border : false,
				selModel : me.selModel || null,
				columns : me.dataColumns,
				bbar : [{
					flex : 1,
					xtype : 'pagingtoolbar',
					store : me.storeData,
					listeners : {
						change : function(btn) {
							btn.up('grid').resetFocus(false);
						}
					}
				}],
				store : me.storeData,
				tbar : [{
					itemId : 'txtMiniSearch',
					xtype : 'searchfield',
					listeners : {
						scope : me,
						specialkey : function(field, e) {
							if (e.getKey() == e.ENTER) {
								e.stopEvent();
								me.handlerQuery(field.getValue());
							}
						}
					}
				}, {
					//					text : '查詢',
					text : '查詢(F)',
					scope : me,
					icon : contextPath + '/resources/img/icons/page_find.png',
					handler : function() {
						var keyword = me.win.down('#txtMiniSearch').getValue();
						me.handlerQuery(keyword);
					}
				}, {
					xtype : 'displayfield',
					value : '查詢條件:' + '<font color="blue">' + (me.queryTip || '') + '</font>'
				}, '->', {
					text : '選擇記錄(G)',
					scope : me,
					icon : contextPath + '/resources/img/icons/tick.png',
					hidden : (me.selModel == undefined),
					handler : function() {
						var records = me.win.down('#gridData').getSelectionModel().getSelection();
						me.handlerSelectedRecord(records);
					}
				}],
				viewConfig : {
					getRowClass : me.getRowClass || new Function(),
					enableTextSelection : true,
					listeners : {
						itemkeydown : {
							fn : function(view, record, item, index, e, options) {
								if (e.keyCode == e.ENTER) {
									me.handlerSelectedRecord(record);
								} else if (e.keyCode == e.F && e.ctrlKey && e.altKey) {
									me.win.down('#txtMiniSearch').focus(true);
								} else if (e.keyCode == e.G && e.ctrlKey && e.altKey) {
									me.handlerSelectedRecord(record);
								}
							}
						}
					}
				},
				listeners : {
					scope : me,
					itemdblclick : function(view, record, item, index, e) {
						me.handlerSelectedRecord(record);
					}
				}
			},
			listeners : {
				scope : me,
				hide : function(win, options) {
					me.fireEvent('onWinClose', me, me.win);
					me.focus();
				}
			}
		};
		me.win = Ext.create('Ext.window.Window', me.winCfg);

	},
	handlerSelectedRecord : function(records) {
		var me = this,
			win = me.win;
		me.fireEvent('selectedRecord', me, win, records);
		win.close();
	},
	handlerQuery : function(keyword) {
		var me = this,
			win = me.win,
			grid = win.down('#gridData'),
			sm = grid.getSelectionModel(),
			store = grid.getStore();
		store.reload({
			keyword : keyword
		}, function(a,b,c,d) {
			sm.selectByPosition({
				row : 0,
				column : 1
			});
			grid.resetFocus();
		}, me);
	},
	queryObject : function(txt) {
		var me = this,
			pos = txt.getPosition(),
			height = txt.getHeight();
		if (me.canQuery === false)
			return;
		me.win.setVisible(false);
		me.storeData.removeAll();
		//		me.win.setPosition(pos[0],pos[1]+height,txt);
		var isflag = me.fireEvent('beforeWinShow', me, me.win);
		if (!isflag) {
			return false;
		}

		me.win.show(txt, function() {
			Ext.defer(function() {
				me.win.down('#txtMiniSearch').focus(true);
			}, 200);
		});
	}
});