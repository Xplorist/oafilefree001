/**
 * 文件簽核審核人列表
 * @author S7194487
 * @date 2016/06/06 08時59分
 */
Ext.define('OA.view.addHeadWin', {
	extend : 'Ext.window.Window',
	alias : 'widget.addheadwin',
	title : '文件簽核信息',

	modal : true,
	closeAction : 'destroy',
	overflowY : 'auto',
	hidden : false,
	border : false,
	height : 400,
	width : 850,
	buttonAlign : 'center',
	buttons : [{
		xtype : 'button',
		itemId : 'addSaveBtn',
		text : '保存(S)',
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

	items : [{
		xtype : 'form',
		height : 340,
		overflowY : 'auto',
		trackResetOnLoad : true,
		frame : true,
		bodyCls : 'x-border-layout-ct',
		defaults : {
			xtype : 'fieldcontainer'
		},
		items : [{
			layout : {
				type : 'table',
				columns : 3
			},
			defaults : {
				labelAlign : 'right',
				labelWidth : 95,
				width : 250,
				margin : "10 0 0 0"
			},
			items : [{
				xtype : 'textfield',
				fieldLabel : '申請單號',
				readOnly : true,
				name : 'formNo'
			}, {
				xtype : 'datefield',
				fieldLabel : '申請日期',
				readOnly : true,
				name : 'applyDate',
				format : 'Y/m/d'
			}, {
				xtype : 'textfield',
				fieldLabel : '申請人工號',
				name : 'empNo',
				readOnly : true
			}, {
				xtype : 'textfield',
				fieldLabel : '申請人姓名',
				name : 'empName',
				readOnly : true
			}, {
				xtype : 'textfield',
				fieldLabel : '申請單位代碼',
				name : 'deptNo',
				readOnly : true
			}, {
				xtype : 'textfield',
				fieldLabel : '申請單位名稱',
				name : 'deptName',
				readOnly : true,
				margin : '10 0 5 0'
			}, {
				xtype : 'pdtablecombox',
				fieldLabel : '重要等級<font color=red>*</font>',
				name : 'importantGrade',
				tableName : 'OA_FILE_SIGN_HEAD',
				columnName : 'IMPORTANT_GRADE',
				value : '1'
			},
			//			{
			//				xtype : 'pdtablecombox',
			//				fieldLabel : '機密等級<font color=red>*</font>',
			//				name : 'secretGrade',
			//				tableName : 'OA_FILE_SIGN_HEAD',
			//				columnName : 'SECRET_GRADE'
			//								,value : '4'
			//			}, 
			{
				xtype : 'combobox',
				fieldLabel : '機密等級<font color=red>*</font>',
				name : 'secretGrade',
				value : '4',
				valueField : 'value',
				displayField : 'name',
				editable : false,
				store : Ext.create('Ext.data.Store', {
					fields : ['value', 'name'],
					data : [{
						"value" : "1",
						"name" : "極機密"
					}, {
						"value" : "2",
						"name" : "機密"
					}, {
						"value" : "3",
						"name" : "密"
					}, {
						"value" : "4",
						"name" : "一般"
					}
					]
				})
			}, {
				xtype : 'fieldcontainer',
				fieldLabel : '',
				labelWidth : 80,
				labelAlign : 'right',
				layout : 'hbox',
				items : [{
					xtype : 'button',
					itemId : 'secretGradeId',
					text : '點擊查看說明'
				}]
			}, {
				id : 'onlyWebShowId',
				name : 'onlyWebShow',
				xtype : 'checkboxfield',
				fieldLabel : '只在web端簽核',
				colspan : 3
			},  {
				xtype : 'textfield',
				fieldLabel : '文件主旨<font color=red>*</font>',
				width : 500,
				colspan : 3,
				name : 'signPurport',
				emptyText : '最多輸入30個字',
				maxLength : 60,
				listeners : {
					change : function(txt, isValid, eOpts) {
						var count = txt.maxLength;
						var t = charLen(txt.value);
						var val = txt.value;
						if (t > count) {
							Ext.Msg.alert(sysTitle, '最多' + count + '個字符(一個中文是2個字符)。', function() {
								var i = 0;
								do {
									val = val.substr(0, count - i);
									var t = charLen(val);
									i++;
								} while (t > count);
								txt.setValue(val);
							});
						}
					}
				}

			}, {
				fieldLabel : '簽核文件<font color=red>*</font>',
				align : "center",
				name : 'applyFileNo',
				xtype : 'simplemultifile',
				mime : "application/pdf",
				allowExts : ['pdf'],
				multiple : false,
				multiFile : false,
				colspan : 6,
				width : 500,
				listeners : {
					affixchange : function(affixNo, affixs) {
						var me = this, affix, ext;
						if (affixs.length > 0) {
							affix = affixs[0];
							ext = me.getFileExt(affix.fileName);
							if (ext.toLowerCase() != 'pdf') {
								Ext.Ajax.request({
									url : contextPath + '/oaFileFreeSign/oaFileFreeSign_removeAffix.action',
									params : {
										affixNo : affixNo
									}
								});
								Ext.defer(function() {
									me.setValue(null);
								}, 100);
								Ext.Msg.alert(sysTitle, '簽核文件類型必須是<label style="color:red;">pdf</label>');
								return;
							}
						}
						if (affixNo && affixs.length > 0) {
							Ext.Ajax.request({
								url : contextPath + '/oaFileFreeSign/oaFileFreeSign_queryTotalPage.action',
								params : {
									affixNo : affixNo
								},
								success : function(response, opts) {
									var result = Ext.decode(response.responseText);
									if (result.success) {
										var pageType = result.pageType;
										if (result.isSizeSpec == "Y") {//符合A4標準尺寸
											if (result.totalPageNum > 10) {
												Ext.Msg.alert(sysTitle, '此Pdf共計' + result.totalPageNum + '頁，簽核時，將顯示前10頁');
											}
											
											me.up().up().down('hidden[name=totalPageNum]').setValue(result.totalPageNum);
											me.up().up().down('hidden[name=pageType]').setValue(pageType);
											console.log(result.totalPageNum);
											console.log(me.up().up().down('hidden[name=totalPageNum]').value);
										} else if (result.isSizeSpec == "N") {
											Ext.Ajax.request({
												url : contextPath + '/oaFileFreeSign/oaFileFreeSign_removeAffix.action',
												params : {
													affixNo : affixNo
												}
											});
											Ext.Msg.alert(sysTitle, '僅支持<label style="color:red;">A4/A3標準尺寸</label>的pdf，請重新上傳');
											Ext.defer(function() {
												me.setValue(null);
											}, 100);
										}

									} else {
										Ext.Ajax.request({
											url : contextPath + '/oaFileFreeSign/oaFileFreeSign_removeAffix.action',
											params : {
												affixNo : affixNo
											}
										});
										Ext.Msg.alert(sysTitle, result.message);
										Ext.defer(function() {
											me.setValue(null);
										}, 100);
									}
								},
								failure : function(response, opts) {
									Ext.Msg.alert(sysTitle, '獲取文件頁數失敗');
									Ext.Ajax.request({
										url : contextPath + '/oaFileFreeSign/oaFileFreeSign_removeAffix.action',
										params : {
											affixNo : affixNo
										}
									});
									Ext.defer(function() {
										me.setValue(null);
									}, 100);
								}
							});
						} else if (affixNo && affixs.length == 0) {
							Ext.Ajax.request({
								url : contextPath + '/hr/oaFileSign/oaFileSign_removeAffix.action',
								params : {
									affixNo : affixNo
								}
							});
						}
					}
				}
			}, {
				fieldLabel : '附加檔案',
				align : "center",
				name : 'additionFile',
				xtype : 'simplemultifile',
				allowExts : ['doc', 'docx', 'xls', 'xlsx', 'pdf', 'jpg', 'png', 'tif'],
				colspan : 6,
				width : 500
			}, {
				xtype : 'pdtablecombox',
				fieldLabel : ' 簽名位置<font color=red>*</font>',
				name : 'signaturePosition',
				tableName : 'OA_FILE_SIGN_HEAD',
				columnName : 'SIGNATURE_POSITION',
				colspan : 3
			}, {
				xtype : 'displayfield',
				fieldLabel : '提示',
				value : '上傳的簽核文件格式為<label style="color: red;">pdf</label>，必須<label style="color: red;">可讀可寫</label>，且僅支持<label style="color: red;">A4/A3標準尺寸</label><br/>' + '最多簽核<label style="color: red;">10頁</label>，超出的頁數將不顯示<br/>',
				colspan : 3,
				width : 700
			}, {
				name : 'fileSignHeadId',
				xtype : 'hidden'
			}, {
				xtype : 'hidden',
				fieldLabel : '簽核當編號',
				name : 'signFileNo'
			}, {
				xtype : 'hidden',
				fieldLabel : '路徑',
				name : 'signFilePath'
			}, {
				xtype : 'pdtablecombox',
				fieldLabel : '狀態',
				width : 210,
				name : 'state',
				tableName : 'OA_FILE_SIGN_HEAD',
				columnName : 'STATE',
				hidden : true,
				readOnly : true
			}, {
				xtype : 'hidden',
				fieldLabel : '頁面類型',
				name : 'pageType'
			}, {
				xtype : 'hidden',
				fieldLabel : '文件頁數',
				name : 'totalPageNum'
			}]

		}]
	}]

})
