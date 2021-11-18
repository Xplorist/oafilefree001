//設置默認表單的 'under' 在欄位的下方添加一個包含錯誤消息的塊狀div
Ext.form.Field.prototype.msgTarget = 'side';
//可複製
Ext.view.Table.prototype.enableTextSelection = true;
//配置加載器物件
Ext.Loader.setConfig({
	//啟用動態依賴裝載功能
	enabled : true
});
A4 = {
	scale: 1.414,
	minHeight: 270,
	maxHeight: 300,
	height: 297,
	width: 210
};
A3 = {
	scale: 1.414,
	height: 420,
	width: 297
};
Ext.onReady(function() {
	//創建mvc的應用程式對象
	Ext.application({
		//配置應用程式的名稱
		name : 'OA',
		//應用程式的檔夾,默認是app目錄
		appFolder : contextPath + '/oafilefreesign/app',
		//設置控制器的名稱
		controllers : ['OaFileFreeSignCon'],
		//動態加載JS
		requires : ['Extux.grid.plugin.CellTipPlugin', 'Extux.grid.column.PdTableColumn', 'Extux.form.field.PdTableCombox', 'Extux.grid.ErrMsg', 'Extux.grid.column.LinkedColumn', 'Extux.form.field.QueryableField', 'Extux.form.field.SimpleMultiFile', 'Extux.util.DragUtil'],
		//已完全載入頁面時自動調用。
		launch : function() {
			//創建頁面對象
			Ext.create('Ext.container.Viewport', {
				layout : 'border',//邊界佈局
				items : [{
					region : 'north',
					title : '文件簽核作業',
					xtype : 'oafilesignhead',
					height : 300,
					split : true
				}, {
					region : 'center',
					title : '簽核人列表',
					xtype : 'oafilesignbody'
				}, {
					xtype : 'filepreviewwin'
				}, {
					region : 'south',
					xtype : 'toolbar',
					margin : '1 0 0 1',
					items : [{
						xtype : 'tbtext',
						text : '詳細信息'
					}, '-', {
						xtype : 'marqueebox'
					}]
				}]
			});
		}
	});
});