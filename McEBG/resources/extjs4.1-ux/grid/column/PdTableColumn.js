/**
 * table column field column
 * @author f1930235
 * @date 2011.09.01 xtype: pdtablecolumn
 */
Ext.define('Extux.grid.column.PdTableColumn', {
	extend : 'Ext.grid.column.Column',
	alias : ['widget.pdtablecolumn'],
	alternateClassName : 'Ext.grid.SolidComboxColumn',

	store : null,
	combox : null,
	metaAlign : 'left',
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
		me.store.load();
		if (cfg.readOnly != true) {
			var config = Ext.merge({
				forceSelection : true,
				editable : true,
				queryMode : 'local',
				displayField : 'valueDesc',
				valueField : 'columnValue',
				listConfig : {
					minWidth : 70
				},
				store : me.store
			}, cfg.fieldConfig);
			me.combox = Ext.create('Ext.form.field.ComboBox', config);
			me.field = me.combox;
		};
		me.renderer = function(val, metaData, record, rowIndex, colIndex) {
			metaData.style = 'text-align:'+me.metaAlign+' !important;cursor: pointer;';
			var index = me.store.find('columnValue', val, 0, false, false, true);
			var result = '';
			if (index != -1) {
				result = me.store.getAt(index).get('valueDesc');
			}
			if (me.beforRender && Ext.isFunction(me.beforRender)) {
				result = me.beforRender(result, metaData, record, rowIndex, colIndex);
			}
			return result;
		};
		this.callParent(arguments);
	}
});