
/**
 * * 流程展示窗口(確認時展示)
 * @author S7187592
 * @date 2018/05/05 08時59分
 */
Ext.define('OA.view.FlowShowWin', {
	extend : 'Ext.window.Window',
	alias : 'widget.flowshowwin',
	title : '流程配置',

	modal : true,
	closeAction : 'destroy',
	overflowY : 'auto',
	hidden : false,
	border : false,
	maximized : true,
	tbar : [{
		text : '自動拆分會簽',
		itemId : 'autoSplitFlow'
	}],
	buttonAlign : 'center',
	buttons : [{
		xtype : 'button',
		itemId : 'addSaveBtn',
		text : '確認(S)',
		hotKey : 'S',
		tooltip : 'Ctrl+Alt+S',
		iconCls : 'icon-page-save',
		hotSelector : 'addheadwin'

	}, {
		xtype : 'button',
		itemId : 'addCancelBtn',
		text : '取消(N)',
		hotKey : 'N',
		tooltip : 'Ctrl+Alt+N',
		hotSelector : 'addheadwin',
		iconCls : 'icon-page-cancel',
		listeners : {
			click : {
				fn : function() {
					this.up().up().close();
				}
			}
		}

	}],
	bodyStyle : 'background: white',
	layout: 'fit',
	items : [{
		xtype : 'uxiframe',
		border : 1,
		src : contextPath + '/workflow/flow-display.jsp',
		loadData : function(nodes) {
			if (this.rendered && this.getWin().loadData) {
				this.getWin().loadData(nodes);
			} else {
				var iframe = this;
				iframe.on('load', function() {
					iframe.getWin().loadData(nodes);
				});
			}
		},
		hasChange : function() {
			if (this.rendered && this.getWin().hasChange) {
				return this.getWin().hasChange();
			}
			return false;
		},
		getData : function() {
			if (this.rendered && this.getWin().getData) {
				return this.getWin().getData();
			}
			return [];
		}
	}]

})
