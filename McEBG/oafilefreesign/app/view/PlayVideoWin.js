
/**
 * * 流程展示窗口(確認時展示)
 * @author S7187592
 * @date 2018/05/05 08時59分
 */
Ext.define('OA.view.PlayVideoWin', {
	extend : 'Ext.window.Window',
	alias : 'widget.playvideowin',
	title : '使用幫助視頻',

	modal : true,
	closeAction : 'destroy',
	overflowY : 'auto',
	hidden : false,
	border : false,
	maximized : true,
	buttonAlign : 'center',
	buttons : [{
		xtype : 'button',
		itemId : 'addCancelBtn',
		text : '關閉(N)',
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
		src : contextPath + '/oafilefreesign/oafile_free.mp4',
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
