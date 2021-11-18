/**
 * 文件簽核審核人列表
 * @author S7194487
 * @date 2016/06/06 08時59分
 */
Ext.define('OA.view.SecretRemarkWin', {
	extend : 'Ext.window.Window',
	alias : 'widget.secretremarkwin',
	title : '機密等級說明',

	modal : true,
	closeAction : 'destroy',
//	overflowY : 'auto',
	hidden : false,
	border : false,
	height : 220,
	width : 500,
	buttonAlign : 'center',
	buttons : [{
		xtype : 'button',
		buttonAlign : 'center',
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

	items : [{
		xtype : 'form',
		height : 160,
//		overflowY : 'auto',
		trackResetOnLoad : true,
		frame : true,
		bodyCls : 'x-border-layout-ct',
		defaults : {
			xtype : 'fieldcontainer'
		},
		items : [{
			layout : {
				type : 'table',
				columns : 1
			},
			defaults : {
				labelAlign : 'right',
				labelWidth : 95,
				width : 250,
				margin : "10 0 0 0"
			},
			items : [{
				xtype : 'displayfield',
				fieldLabel : '',
//				value : '<label style="color: red;width:100px;text-align:right;">極機密：</label>檔案具有最高價值、風險程度為高，影響全集團/事業群；<br><label style="color: red;width:100px;text-align:right;">機密：</label>檔案具有較高價值、風險程度為中，影響事業群；<br><label style="color: red;text-align:right;">密：</label>檔案具有較高價值、風險程度為中或低，影響事業處；<br/><label style="color: red;text-align:right;">一般：</label>檔案不涉及公司運營秘密<br/>',
				value:'<ul style="margin: 0; padding: 0; list-style: none; width: 450px;"><li style="line-height: 30px;"><label style="display: block; width: 80px; text-align: right;color: red;">極機密：</label><span style="display: block;	height: 20px;padding-left: 80px;margin-top: -30px;">檔案具有最高價值、風險程度為高，影響全集團/事業群；</span></li><li style="line-height: 30px;"><label style="display: block; width: 80px; text-align: right;color: red;">機密：</label><span style="display: block;	height: 20px;padding-left: 80px;margin-top: -30px;">檔案具有較高價值、風險程度為中，影響事業群；</span></li><li style="line-height: 30px;"><label style="display: block; width: 80px; text-align: right;color: red;">密：</label><span style="display: block;	height: 20px;padding-left: 80px;margin-top: -30px;">檔案具有較高價值、風險程度為中或低，影響事業處；</span></li><li style="line-height: 30px;"><label style="display: block; width: 80px; text-align: right;color: red;">一般：</label><span style="display: block;	height: 20px;padding-left: 80px;margin-top: -30px;">檔案不涉及公司運營秘密</span></li>	</ul>',
				width : 450
			}]
		}]
	}]
})
