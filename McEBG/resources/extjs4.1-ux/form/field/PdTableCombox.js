/**
 * 公用table字段
 */
Ext.define('Extux.form.field.PdTableCombox', {
	extend : 'Ext.form.field.ComboBox',
	alias : ['widget.pdtablecombox'],

	store : null,
	combox : null,

	constructor : function(cfg) {
		var me = this,
			table = cfg.tableName,
			column = cfg.columnName;
		if (!table || !column) {
			throw new Error('CommonsTableColumn列類型參數錯誤，請查看tableName和columnName參數');
		}
		var modelObjectSelfColumn = Ext.ModelManager.getModel('Commons.self.column.ObjectSelfColumn');
		if (!modelObjectSelfColumn) {
			Ext.define('Commons.self.column.ObjectSelfColumn', {
				extend : 'Ext.data.Model',
				fields : [{
					name : 'tableColumnDescId',
					type : 'number'
				}, {
					name : 'tableName',
					type : 'string'
				}, {
					name : 'columnName',
					type : 'string'
				}, {
					name : 'columnValue',
					type : 'string'
				}, {
					name : 'valueDesc',
					type : 'string'
				}]
			});
		}
		me.store = Ext.create('Ext.data.Store', {
			model : 'Commons.self.column.ObjectSelfColumn',
			proxy : {
				type : 'ajax',
				url : contextPath + '/pub/getTableColumnField.action?tableName=' + table + '&columnName=' + column,
				reader : {
					type : 'json',
					root : 'data'
				}
			},
			autoLoad : false
		});
		me.store.load(function(records, operation, success) {
			me.fireEvent('afterloadData', me, me.store, records, operation, success);
		});
		Ext.apply(this, {
			forceSelection : true,
			queryMode : 'local',
			displayField : 'valueDesc',
			valueField : 'columnValue',
			listConfig : {
				minWidth : 130
			},
			store : me.store
		});
		this.callParent(arguments);
	}
});