Ext.define('OA.view.FileImportwin', {
	extend : 'Ext.window.Window',
	alias : 'widget.fileimportwin',
	title : '上傳掃描檔文件信息',
	frame : false,
	border : false,
	width : 450,
	height : 110,
	closeAction : 'hide',
	modal : true,
	resizable : false,
	initComponent : function() {
		var me = this;
		Ext.apply(me, {
			items : [{
				xtype : 'form',
				border:false,
				padding : '5 3 5 3',
				style:'background-color:#dfe9f6;',
				bodyStyle:'background-color:#dfe9f6;',
				items : [{
					itemId : 'batchInputFile',
					xtype : 'filefield',
					name : 'fileInfo',
					style:'background-color:#dfe9f6;',
					fieldLabel : 'PDF文件',
					labelWidth : 80,
					msgTarget : 'under',
					allowBlank : false,
					anchor : '100%',
					buttonText : '選擇文件',
					listeners : {
						change : function(field, value) {
							var ext = value.substr(value.indexOf('.') + 1);
							if (ext == 'pdf' || ext == 'tif') {
							} else {
								Ext.Msg.alert('提示', '只允許上傳pdf，請重新上傳');
							}
						}
					}

				}]
			}],
			buttons : [{
				text : '上傳',
				itemId : 'inputSubmitButton'
			}]
		});
		this.callParent();
	}

});
