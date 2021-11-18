/**
 * GRID錯誤無效消息展示
 * 
 * @since 2013/04/25
 * @author FredHe
 */
Ext.define('Extux.grid.ErrMsg', {
	constructor : function() {
		var me = this;
		me.tpl = Ext.create('Ext.XTemplate',
						[		'<div style="max-height: 400px;overflow: auto;">',
								'<h3>提示:</h3><ol type=I>',
								'<tpl for=".">',
								'<li><b>' + "行" + ':{index}</b></li>',
								'<ol style=\"margin-left:20px;color:red;letter-spacing: 1px;word-spacing: 2px;\" type=i>',
								'<tpl for="items">', '<li>{#}) ',
								'"<font color="blue">{fieldName}</font>"' + "欄位" + ' {message};', '</li>',
								'</tpl>', '</ol>', '</tpl>', '</ol>','</div>']);
	},
	errorAlert : function(title, errors, fn, scope) {
		var me = this;
		msg = me.tpl.apply(errors);
		Ext.Msg.show({
					title : title,
					msg : msg,
					buttons : Ext.Msg.OK,
					//icon : Ext.Msg.ERROR,
					fn : fn,
					scope : scope
				});
	}

}, function() {
	ErrorMsg = new this();
});