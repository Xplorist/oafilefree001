/**
 * 文件簽核作業
 * @author S7194487
 * @date 2016/06/06 08時59分
 */
Ext.define('OA.view.OaFileSignHeadView', {
	extend : 'Ext.grid.Panel',
	alias : 'widget.oafilesignhead',

	store : 'OaFileSignHead',
	hotKey : 1,

	plugins : [{
		ptype : 'gridhotkeysup'
	}, {
		ptype : 'celltipplugin'
	}, {
		ptype : 'cellediting',
		clicksToEdit : 1
	}],

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
				xtype : 'button',
				itemId : 'btnQueryMenu',
				juriAction : 'btnDetailQuery',
				text : '條件查詢' + '(Q)',
				hotKey : 'Q',
				hotSelector : 'oafilesignhead',
				tooltip : 'Ctrl+Alt+Q',
				icon : contextPath + '/resources/img/icons/page_find.png',
				listeners : {
					click : function() {
						if (!this.panel.rendered) {
							this.panel.doAutoRender();
							var pos = this.getPosition(),
								y = pos[1] + this.getHeight();
							this.panel.showAt(pos[0] - 10, y + 5);
						} else if (!this.panel.isHidden()) {
							this.panel.hide();
						} else {
							var pos = this.getPosition(),
								y = pos[1] + this.getHeight();
							this.panel.showAt(pos[0] - 10, y + 5);
						}
					}
				},
				panel : Ext.create('Ext.panel.Panel', {
					floating : true,
					width : 260,
					height : 200,
					frame : true,
					modal : true,
					bodyPadding : '10 0 3 0',
					layout : {
						type : 'vbox',
						align : 'stretch'
					},
					minWidth : 200,
					items : [{
						xtype : 'fieldcontainer',
						fieldLabel : '申請單號',
						labelWidth : 80,
						labelAlign : 'right',
						layout : 'hbox',
						getData : function() {// 獲取表單值的方法
							var txt = this.down('textfield');
							return {
								'formNo' : txt.getRawValue()
							};
						},
						items : [{
							xtype : 'textfield',
							width : 150,
							emptyText : '申請單號',
							stripCharsRe : /\s/
						}]
					}, {
						xtype : 'fieldcontainer',
						fieldLabel : '申請日期起',
						labelWidth : 80,
						labelAlign : 'right',
						layout : 'hbox',
						getData : function() {// 獲取表單值的方法
							var txt = this.down('datefield');
							return {
								'applyDateStart' : txt.getRawValue()
							};
						},
						items : [{
							xtype : 'datefield',
							width : 150,
							emptyText : '申請日期範圍(起)'
						}]
					}, {
						xtype : 'fieldcontainer',
						fieldLabel : '申請日期止',
						labelWidth : 80,
						labelAlign : 'right',
						layout : 'hbox',
						getData : function() {// 獲取表單值的方法
							var txt = this.down('datefield');
							return {
								'applyDateEnd' : txt.getRawValue()
							};
						},
						items : [{
							xtype : 'datefield',
							width : 150,
							emptyText : '申請日期範圍(止)'
						}]
					}, {
						xtype : 'fieldcontainer',
						fieldLabel : '状态',
						labelWidth : 80,
						labelAlign : 'right',
						layout : 'hbox',
						getData : function() {// 獲取表單值的方法
							var txt = this.down('textfield');
							return {
								'state' : txt.getValue()
							};
						},
						items : [{
							xtype : 'pdtablecombox',
							emptyText : '状态',
							tableName : 'OA_FILE_SIGN_HEAD',
							columnName : 'STATE',
							width : 150
						}]
					}, {
						xtype : 'container',
						items : [{
							text : '確定(Y)',
							xtype : 'button',
							tooltip : 'Ctrl+Alt+Y',
							hotKey : 'Y',
							icon : contextPath + '/resources/img/icons/page_find.png',
							margin : '10 0 0 30',
							listeners : {
								scope : me,
								click : function() {
									me.onBtnConditionQuery();
								}
							}
						}, {
							text : '取消(C)',
							xtype : 'button',
							hotKey : 'C',
							tooltip : 'Ctrl+Alt+C',
							iconCls : 'icon-page-cancel',
							margin : '10 0 0 20',
							listeners : {
								scope : me,
								click : function() {
									me.onCloseQuery();
								}
							}
						}]
					}],
					listeners : {
						afterrender : function(cmp) {
							var keyMap = cmp.getKeyMap();
							keyMap.on(27, function() {
								cmp.hide();
							}, me);
						},
						show : function(cmp) {
							cmp.down('textfield').focus(true, 100);
						}
					}
				})
			}, '-', {
				itemId : 'btnAdd',
				text : '新增' + '(A)',
				juriAction : 'btnAdd',
				icon : contextPath + '/resources/img/icons/page_add.png',
				scope : me,
				tooltip : 'Ctrl+Alt+A',
				hotKey : 'A',
				hotSelector : 'oafilesignhead',
				listeners : {
					scope : me,
					click : function() {
						me.onBtnAdd();
					}
				}
			}, '-', {
				itemId : 'btnDelete',
				juriAction : 'btnDelete',
				text : '刪除 ' + '(D)',
				scope : me,
				icon : contextPath + '/resources/img/icons/page_delete.png',
				tooltip : 'Ctrl+Alt+D',
				hotKey : 'D',
				hotSelector : 'oafilesignhead',
				listeners : {
					scope : me,
					click : function() {
						me.onBtnDelete();
					}
				}
			}, '-', {
				itemId : 'btnConfirm',
				juriAction : 'btnYes',
				text : '確認 ' + '(Y)',
				scope : me,
				icon : contextPath + '/resources/img/icons/accept.png',
				tooltip : 'Ctrl+Alt+Y',
				hotKey : 'Y',
				hotSelector : 'oafilesignhead',
				//					juriAction : 'btnYes',
				listeners : {
					scope : me,
					click : function() {
						me.onBtnSure();
					}
				}
			}, '-', {
				itemId : 'btnRevert',
				juriAction : 'btnNo',
				text : '還原 ' + '(N)',
				scope : me,
				icon : contextPath + '/resources/img/icons/arrow_undo.png',
				tooltip : 'Ctrl+Alt+N',
				hotKey : 'N',
				hotSelector : 'oafilesignhead',
				listeners : {
					scope : me,
					click : function() {
						me.onBtnBack();
					}
				}
			}, '-', {
				itemId : 'btnSign',
				juriAction : 'btnSign',
				text : '呈簽' + '(T)',
				icon : contextPath + '/resources/img/icons/page_go.png',
				scope : me,
				tooltip : 'Ctrl+Alt+T',
				hotKey : 'T',
				hotSelector : 'oafilesignhead',
				listeners : {
					scope : me,
					click : function() {
						me.onBtnPreview();
					}
				}
			}, '-', {
				itemId : 'btnPlayVideo',
				text : '查看幫助視頻' + '(V)',
				icon : contextPath + '/resources/img/icons/dvd_start.png',
				scope : me,
				tooltip : 'Ctrl+Alt+V',
				hotKey : 'V',
				hotSelector : 'oafilesignhead',
				listeners : {
					scope : me,
					click : function() {
						me.onBtnPlayVideo();
					}
				}
			}]
		}, {
			xtype : 'toolbar',
			dock : 'bottom',
			weight : 2,
			items : [{
				xtype : 'searchfield',
				listeners : {
					scope : me,
					specialkey : function(field, e) {
						if (e.getKey() == e.ENTER) {
							me.onBtnQuery(field.getValue());
						}
					},
					click : function() {
						me.down('searchfield').focus(true);
					}
				}
			}, {
				text : '查詢' + '(F)',
				hotKey : 'F',
				tooltip : 'Ctrl+Alt+F',
				juriAction : 'btnQuery',
				hotSelector : 'oafilesignhead',
				icon : contextPath + '/resources/img/icons/page_find.png',
				listeners : {
					scope : me,
					click : function() {
						me.onBtnQuery(me.down('searchfield').getValue());
					}
				}
			}, '<font color="blue">申請單號/主旨</font>']
		}, {
			xtype : 'pagingtoolbar',
			firstText : '首頁',
			lastText : '尾頁',
			store : me.store,
			dock : 'bottom',
			displayMsg : '顯示 {0} - {1} 條,共 {2} 條 ',
			emptyMsg : '無查詢結果',
			displayInfo : true,
			listeners : {
				change : function(pa, pageData, eOpts) {
					me.resetFocus(false);
				}
			}
		}];
	},
	/*
	 * 創建列
	 */
	buildColumns : function() {
		var me = this;
		return [Ext.create('Ext.grid.RowNumberer', {
			width : 35
		}), {
			header : '申請單號',// dataType is string,
			align : "center",
			width : 130,
			dataIndex : 'formNo',//申請單號
			xtype : 'linkedcolumn',
			handler : function(column, view, recordIndex, cellIndex, e, record, row) {
				me.onBtnView(e);
			},
			format : function(value, field) {
				field.style = 'text-align:center !important;cursor: pointer;';
				return value;
			}
		}, {
			header : '申請日期',// dataType is date,
			align : "center",
			width : 100,
			dataIndex : 'applyDate',//申請日期
			xtype : 'datecolumn',
			format : 'Y/m/d'
		}, {
			header : '申請人',
			align : 'left',
			style : 'text-align:center',
			width : 110,
			readOnly : true,
			dataIndex : 'empNo',
			renderer : function(value, meta, rec) {
				return value + '-' + rec.get('empName');
			},
			hidden : true
		}, {
			header : '申請單位',
			align : 'left',
			style : 'text-align:center',
			width : 120,
			readOnly : true,
			dataIndex : 'deptNo',
			renderer : function(value, meta, rec) {
				return value + '-' + rec.get('deptName');
			},
			hidden : true
		}, {
			header : '重要等級',// dataType is string,
			style : 'text-align:center',
			metaAlign : "center",
			width : 85,
			dataIndex : 'importantGrade',//單據狀態:0開立,1確認,2:核准,S:審核中,X:駁回)
			xtype : 'pdtablecolumn',
			tableName : 'OA_FILE_SIGN_HEAD',
			columnName : 'IMPORTANT_GRADE',
			readOnly : true
		},
		//				{
		//					header : '保密等級',// dataType is string,
		//					style : 'text-align:center',
		//					metaAlign : "center",
		//					width : 85,
		//					dataIndex : 'secretGrade',
		//					xtype : 'pdtablecolumn',
		//					tableName : 'OA_FILE_SIGN_HEAD',
		//					columnName : 'SECRET_GRADE',
		//					readOnly : true
		//				},
		{
			header : '保密等級',// dataType is string,
			style : 'text-align:center',
			metaAlign : "center",
			width : 85,
			dataIndex : 'secretGradeDesc'
//			,field : {
//				xtype : 'combobox',
//				value : '4',
//				valueField : 'value',
//				displayField : 'name',
//				editable : false,
//				store : Ext.create('Ext.data.Store', {
//					fields : ['value', 'name'],
//					data : [{
//						"value" : "1",
//						"name" : "極機密"
//					}, {
//						"value" : "2",
//						"name" : "機密"
//					}, {
//						"value" : "3",
//						"name" : "密"
//					}, {
//						"value" : "4",
//						"name" : "一般"
//					}]
//				})
//			}
		}, {
			header : '主旨',// dataType is string,
			align : "center",
			width : 230,
			dataIndex : 'signPurport',//主旨
			renderer : function(value, meta) {
				meta.style = 'text-align:left !important;cursor: pointer;height:23px;';
				return value;
			}
		}, {
			header : '原文件',
			align : 'center',
			style : 'text-align:center',
			width : 130,
			dataIndex : 'applyFileNo',
			afffixState : false,
			xtype : 'linkedcolumn',
			handler : function(view, rowIdx, cellIdx, e, record, row) {
				//				if (Ext.isFunction(window.top.consultAffixById)) {
				//					window.top.consultAffixByNo(record.data.applyFileNo);
				//				} else {
				window.open(contextPath + '/pub/affix!download.action?affixNo=' + record.data.applyFileNo);
				//				}
			}
		}, {
			header : '簽核檔',
			align : 'center',
			style : 'text-align:center',
			width : 130,
			dataIndex : 'signFileNo',
			afffixState : false,
			xtype : 'linkedcolumn',
			handler : function(view, rowIdx, cellIdx, e, record, row) {
				//me.fireEvent('ftpDownSign', me, record);
				//				if (Ext.isFunction(window.top.consultAffixById)) {
				//					window.top.consultAffixByNo(record.data.signFileNo);
				//				} else {
				window.open(contextPath + '/pub/affix!download.action?affixNo=' + record.data.signFileNo);
				//				}
			}
		}, {
			header : '狀態',// dataType is string,
			style : 'text-align:center',
			metaAlign : "center",
			width : 85,
			dataIndex : 'state',//單據狀態:0開立,1確認,2:核准,S:審核中,X:駁回)
			xtype : 'pdtablecolumn',
			tableName : 'OA_FILE_SIGN_HEAD',
			columnName : 'STATE',
			readOnly : true
		}, {
			header : '簽核進度',
			width : 60,
			align : 'center',
			xtype : 'buttoncolumn',
			items : [{
				tooltip : '查看進度',
				icon : contextPath + '/resources/img/icons/comment_edit.png',
				handler : function(view, rowIndex, cellIndex, e) {
					me.fireEvent('queryProcess', me, me.store, rowIndex, 1);
				},
				beferRender : function(item, meta, record, row, col, store, view) {
					if (record.get('state') != '0' && record.get('state') != '1') {
						return true;
					} else {
						meta.tdCls = '';
						return false;
					}
				}
			}]

		}, {
			header : '操作',
			width : 75,
			align : 'center',
			xtype : 'buttoncolumn',
			items : [{
				tooltip : '作廢',
				text : '作廢',
				icon : contextPath + '/resources/img/icons/cancel.png',
				handler : function(view, rowIndex, cellIndex, e, record) {
					var record = view.store.getAt(rowIndex);
					me.fireEvent('cancelOrder', me, me.store, rowIndex, record);
				},
				beferRender : function(item, meta, record, row, col, store, view) {
					if (record.get('state') == 'X') {
						return true;
					} else {
						meta.tdCls = '';
						return false;
					}
				}
			}]

		}, {

			dataIndex : 'empName',
			hidden : true
		}, {

			dataIndex : 'deptName',
			hidden : true
		}, {

			dataIndex : 'fileSignHeadId',
			hidden : true
		}, {

			dataIndex : 'filePath',
			hidden : true
		}, {

			dataIndex : 'fileOldName',
			hidden : true
		}, {

			dataIndex : 'fileName',
			hidden : true
		}];
	},
	//單號鏈接處理事件
	onBtnView : function(record) {
		var me = this;
		me.fireEvent('btnViewClick', me, me.getStore(), record);
	},
	//模糊查询
	onBtnQuery : function(keyword) {
		var me = this,
			store = me.getStore();
		me.fireEvent('btnQueryClick', me, store, keyword);
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
	//確認
	onBtnSure : function() {
		var me = this;
		me.fireEvent('btnSureClick', me, me.getStore());
	},
	//還原
	onBtnBack : function() {
		var me = this;
		me.fireEvent('btnBackClick', me, me.getStore());
	},
	//關閉查詢框
	onCloseQuery : function() {
		var me = this,
			panel = me.down('#btnQueryMenu').panel;

		panel.hide();
	},
	//執行查詢功能
	onBtnConditionQuery : function() {
		var me = this,
			condition = me.getQueryCondition();
		if (condition.applyDateStart != '' && condition.applyDateEnd != '') {
			if (condition.applyDateStart > condition.applyDateEnd) {
				Ext.Msg.alert(sysTitle, '申請日期起不能大於申請日期止.');
				return;
			}
		}
		me.fireEvent('btnConditionQueryClick', me, condition);
		me.onCloseQuery();
	},
	// 獲得查詢條件
	getQueryCondition : function() {
		var grid = this,
			panel = grid.down('#btnQueryMenu').panel,
			containers = panel.query('fieldcontainer'),
			condition = {};

		Ext.each(containers, function(container) {
			if (Ext.isFunction(container.getData)) {
				condition = Ext.merge(condition, container.getData());
			}
		});
		return condition;
	},
	//預覽按钮事件
	onBtnPreview : function() {
		var me = this;
		me.fireEvent('btnPreviewClick', me, me.getStore());
	},
	//列印按钮事件
	onBtnPrint : function() {
		var me = this;
		me.fireEvent('btnPrintClick', me, me.getStore());
	},
	onBtnPlayVideo : function() {
		var me = this;
		me.fireEvent('btnPlayVideoClick', me, me.getStore());
	}

});