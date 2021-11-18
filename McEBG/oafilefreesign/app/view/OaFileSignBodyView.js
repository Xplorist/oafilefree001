/**
 * 文件簽核審核人列表
 * @author S7194487
 * @date 2016/06/06 08時59分
 */
Ext.define('OA.view.OaFileSignBodyView', {
	extend : 'Ext.grid.Panel',
	alias : 'widget.oafilesignbody',

	store : 'OaFileSignBody',
	hotKey : 2,
	plugins : [{
		ptype : 'gridhotkeysup'
	}, {
		ptype : 'celltipplugin'
	}, {
		ptype : 'cellediting',
		clicksToEdit : 1
	}],

	validations : [{
		type : 'presence',
		field : 'signTaskName',
		fieldName : '簽核任務名稱'
	}, {
		type : 'presence',
		field : 'signEmpNo',
		fieldName : '簽核人工號'
	}, {
		type : 'presence',
		field : 'signEmpName',
		fieldName : '簽核人姓名'
	}, {
		type : 'presence',
		field : 'isResponsible',
		fieldName : '是否審核責任者'
	}/*, {
		type : 'presence',
		field : 'auditFocus',
		fieldName : '審核重點'
	}*/],
	/*
	 * 初始化組建的方法 initComponent範本方法是一個重要的初始化步驟，對於一個元件。
	 * initComponent方法必須包含一個callParent調用，以確保父類的initComponent方法也被稱為。
	 * initComponent 在AbstractComponent 的構造方法中調用 他的執行是在組建的構造方法被執行前
	 */
	initComponent : function() {
		this.columns = this.buildColumns();
		this.dockedItems = this.buildDockedItems();
		this.callParent(arguments);
	},
	/*
	 * 創建菜單
	 */
	buildDockedItems : function() {
		var me = this;
		return [{
			xtype : 'toolbar',
			dock : 'top',
			items : [{
				text : '新增' + '(A)',
				icon : contextPath + '/resources/img/icons/page_add.png',
				scope : me,
				tooltip : 'Ctrl+Alt+A',
				hotKey : 'A',
				hotSelector : 'oafilesignbody',
				juriAction : 'btnAdd',
				itemId : 'btnAdd',
				listeners : {
					scope : me,
					click : function() {
						me.onBtnAdd();
					}
				}
			}, '-', {
				text : '保存 ' + '(S)',
				scope : me,
				juriAction : 'btnSave',
				icon : contextPath + '/resources/img/icons/page_save.png',
				tooltip : 'Ctrl+Alt+S',
				hotKey : 'S',
				itemId : 'btnSave',
				hotSelector : 'oafilesignbody',
				listeners : {
					scope : me,
					click : function() {
						me.onBtnSave();
					}
				}
			}, '-', {
				text : '刪除 ' + '(D)',
				scope : me,
				juriAction : 'btnDelete',
				icon : contextPath + '/resources/img/icons/page_delete.png',
				tooltip : 'Ctrl+Alt+D',
				hotKey : 'D',
				itemId : 'btnDelete',
				hotSelector : 'oafilesignbody',
				listeners : {
					scope : me,
					click : function() {
						me.onBtnDelete();
					}
				}
			}, '-', {
				text : '撤銷 ' + '(C)',
				icon : contextPath + '/resources/img/icons/page_cancel.png',
				scope : me,
				juriAction : 'btnCancel',
				tooltip : 'Ctrl+Alt+C',
				hotKey : 'C',
				itemId : 'btnCancel',
				hotSelector : 'oafilesignbody',
				listeners : {
					scope : me,
					click : function() {
						me.onBtnCancel();
					}
				}
			}, '<font size="2" color="red">注：簽名份數默認為1,如有同一簽核人需多次簽核的情況,則將簽名份數設置為此簽核人需簽核的次數</font>']
		}];
	},
	/*
	 * 創建列
	 */
	buildColumns : function() {
		var me = this;
		return [{
			text : '序號',// dataType is number,
			align : "center",
			width : 40,
			dataIndex : 'signTaskOrder',
			sortable:false,
			renderer : function(value, field) {
				field.style = 'text-align:right !important;cursor: pointer;';
				return value;
			}
		}, {
			text : '簽核任務名稱<font color="red">*</font>',
			align : "center",
			width : 160,
			dataIndex : 'signTaskName',
			sortable:false,
			editor : {
				xtype : 'textfield',
				listeners : {
					change : function(txt, isValid, eOpts) {
						var t = charLen(txt.value);
						var val = txt.value;
						if (t > 36) {
							Ext.Msg.alert(sysTitle, '不合格原因最多輸入36個字符(一個中文是2個字符)。', function() {
								var i = 0;
								do {
									val = val.substr(0, 36 - i);
									var t = charLen(val);
									i++;
								} while (t > 36);
								me.getSelectionModel().getSelection()[0].set('signTaskName', val);
							});

						} else {
							//驗證是否已經存在該代碼
						}
					}
				},
				allowBank : false
			},
			renderer : function(value, field) {
				field.style = 'text-align:left !important;cursor: pointer;';
				return value;
			}

		}, {
			width : 90,
			align : 'center',
			text : '簽核人工號<font color="red">*</font>',
			dataIndex : 'signEmpNo',
			sortable:false,
			field : {
				xtype : "queryablefield",
				emptyText : 'Ctrl+↓查詢',
				winWidth : 580,
				queryTip : "工號/姓名/單位代碼/單位名稱",
				queryTitle : "人員信息查詢",
				allowBlank : true,
				dataModel : 'OA.model.OaFileSignBody',
				queryDataUrl : '/hr/oaFileSign/oaFileSign_queryDeptNo.action',
				dataColumns : [Ext.create('Ext.grid.RowNumberer'), {
					align : 'center',
					width : 70,
					text : '工號',
					dataIndex : 'empNo',
					renderer : function(value, meta) {
						meta.style = 'text-align : center!important;cursor:pointer;';
						return value;
					}
				}, {
					align : 'center',
					width : 70,
					text : '姓名',
					dataIndex : 'empName',
					renderer : function(value, meta) {
						meta.style = 'text-align : left!important;cursor:pointer;';
						return value;
					}
				}, {
					align : 'center',
					width : 70,
					text : '單位代碼',
					dataIndex : 'deptNo',
					renderer : function(value, meta, record, rowIdx) {
						meta.style = 'text-align : left!important;cursor:pointer;';
						return value;

					}
				}, {
					align : 'center',
					width : 300,
					text : '郵箱',
					dataIndex : 'mailAddress',
					renderer : function(value, meta, record, rowIdx) {
						meta.style = 'text-align : left!important;cursor:pointer;';
						return value;
					}
				}],
				listeners : {
					beforeWinShow : function(txt, win) {
						win.down('grid').store.proxy.extraParams = {
							keyword : win.down('#txtMiniSearch').getValue()
						}
						txt.storeData.getProxy().setReader({
							type : 'json',
							root : 'deptList'
						});
					},
					onWinClose : function(txt, win) {
						txt.focus(true);
					},
					selectedRecord : function(txt, win, record) {
						var selected = me.getSelectionModel().getSelection()[0];
						selected.set('signEmpNo', record.data.empNo);
						selected.set('signEmpName', record.data.empName);
						selected.set('mailAddress', record.data.mailAddress);
					}
				},
				allowBlank : false
			}
		}, {
			width : 80,
			align : 'center',
			text : '簽核人姓名',
			dataIndex : 'signEmpName',
			sortable:false,
			renderer : function(value, meta) {
				meta.style = 'text-align : center!important;cursor:pointer;';
				return value;
			}
		},{
			width : 240,
			align : 'center',
			text : '簽核人郵箱',
			dataIndex : 'mailAddress',
			sortable:false,
			renderer : function(value, meta) {
				meta.style = 'text-align : left!important;cursor:pointer;';
				return value;
			}
		}, {
			header : '是否審核責任者'+'<font color="red">*</font>',// dataType is string,
			style : 'text-align:center',
			metaAlign : "center",
			width : 110,
			dataIndex : 'isResponsible',//
			xtype : 'pdtablecolumn',
			tableName : 'OA_FILE_SIGN_BODY',
			columnName : 'IS_RESPONSIBLE',
			sortable:false
		},  {
			text : '審核重點<font color="red">*</font>',
			align : "center",
			width : 250,
			dataIndex : 'auditFocus',
			sortable:false,
			editor : {
				xtype : 'textarea',
				height:40,
				listeners : {
					change : function(txt, isValid, eOpts) {
						var t = charLen(txt.value);
						var val = txt.value;
						if (t > 300) {
							Ext.Msg.alert(sysTitle, '審核重點最多輸入300個字符(一個中文是2個字符)。', function() {
								var i = 0;
								do {
									val = val.substr(0, 300 - i);
									var t = charLen(val);
									i++;
								} while (t > 300);
								me.getSelectionModel().getSelection()[0].set('auditFocus', val);
							});

						} else {
							//驗證是否已經存在該代碼
						}
					}
				},
				allowBank : false
			},
			renderer : function(value, field) {
				field.style = 'text-align:left !important;cursor: pointer;';
				return value;
			}

		}, {
			width : 70,
			align : 'center',
			text : '簽名份數'+'<font color="red">*</font>',
			dataIndex : 'copyNum',
			sortable:false,
			field : {
				xtype : 'numberfield',
				minValue : 1,
				decimalPrecision : 0
			},
			renderer : function(value, meta) {
				meta.style = 'text-align : right!important;cursor:pointer;';
				return value;
			}
		}, {
			dataIndex : 'fileSignBodyId',
			hidden : true
		}];
	},
	//新增按鈕處理事件
	onBtnAdd : function() {
		var me = this;
		me.fireEvent('btnAddClick', me, me.getStore());
	},
	//删除按钮处理事件
	onBtnDelete : function() {
		var me = this;
		var records = me.getSelectionModel()/* 获得当前grid的选择模式 */.getSelection()/* 获得当前选择的records */;
		me.fireEvent('btnDeleteClick', me, me.getStore(), records.length > 0 ? records[0] : null);
	},
	//保存按鈕處理事件
	onBtnSave : function() {
		var me = this;
		me.fireEvent('btnSaveClick', me, me.getStore());
	},
	//撤銷按鈕處理事件
	onBtnCancel : function() {
		var me = this;
		me.fireEvent('btnCancelClick', me, me.getStore());
	}
});