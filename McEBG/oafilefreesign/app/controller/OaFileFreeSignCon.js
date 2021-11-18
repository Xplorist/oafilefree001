/**
 * 文件簽核審核人列表
 * @author S7194487
 * @date 2016/06/06 08時59分
 */
// var fileExts = ['7z', 'doc', 'docx', 'jpg', 'pdf', 'png', 'pps', 'ppt',
// 'pptx', 'tif', 'txt', 'xls', 'xlsx', 'xml', 'zip'];
Ext.define('OA.controller.OaFileFreeSignCon', {
	extend : 'Ext.app.Controller',
	// 應用程式 需要的model、store、views
	models : ['OaFileSignHead', 'OaFileSignBody'],
	stores : ['OaFileSignHead', 'OaFileSignBody'],
	views : ['OaFileSignHeadView', 'OaFileSignBodyView', 'addHeadWin', 'FileImportwin', 'FilePreviewWin', 'FlowShowWin', 'PlayVideoWin', 'SecretRemarkWin'],
	/**
	 * 您的應用程式啟動時調用一個範本方法. 這就是所謂的應用程式的啟動功能是執行之前, 給出了一個掛鉤點之前運行任何代碼創建視口.
	 */
	refs : [{
		ref : 'oaFileSignHeadView',
		selector : 'oafilesignhead'
	}, {
		ref : 'oaFileSignBodyView',
		selector : 'oafilesignbody'
	}, {
		ref : 'addHeadWin',
		selector : 'addheadwin',
		autoCreate : true,
		xtype : 'addheadwin'
	}, {
		ref : 'fileImportwin',
		selector : 'fileimportwin',
		autoCreate : true,
		xtype : 'fileimportwin'
	}, {
		ref : 'page',
		selector : 'viewport'
	}, {
		ref : 'filePreviewWin',
		selector : 'filepreviewwin',
		autoCreate : true,
		xtype : 'filepreviewwin'
	}, {
		ref : 'marqueebox',
		selector : 'marqueebox'
	}, {
		ref : 'flowShowWin',
		selector : 'flowshowwin',
		autoCreate : true,
		xtype : 'flowshowwin'
	}, {
		ref : 'playVideoWin',
		selector : 'playvideowin',
		autoCreate : true,
		xtype : 'playvideowin'
	}, {
		ref : 'secretRemarkWin',
		selector : 'secretremarkwin',
		autoCreate : true,
		xtype : 'secretremarkwin'
	}],
	/**
	 * 事件處理
	 */
	init : function() {
		var me = this;

		me.control({
			'viewport' : {
				afterrender : me.onViewRender
			}
		});

		me.control({
			'oafilesignhead' : {
				btnQueryClick : me.queryLike,// 模糊查詢
				btnConditionQueryClick : me.onQuery,// 精確查詢
				select : me.onSelectedRecord,// 選擇一行時顯示信息
				btnAddClick : me.onAddHead,// 新增
				btnDeleteClick : me.onDelete,// 刪除
				btnSureClick : me.onSure,// 確認
				btnBackClick : me.onBack,// 還原
				queryProcess : me.queryProcess,// 查看簽核進度
				cancelOrder : me.cancelOrder,// 作廢單據
				btnViewClick : me.onView,// 單號鏈接
				ftpDown : me.ftpDown,// 下載申請附件
				ftpDownSign : me.ftpDownSign,// 下載簽核當
				btnPreviewClick : me.onPreview,// 預覽
				selectionchange : me.handlerSelectedEmpType,
				btnPlayVideoClick : me.onPlayVideo

			}
		});
		me.control({
			'oafilesignbody' : {
				btnAddClick : me.onAddBody,// 新增
				btnDeleteClick : me.delApplyBody,// 刪除
				btnSaveClick : me.saveApplyBody,// 保存
				btnCancelClick : me.onCancel, // 撤銷
				beforeedit : function(editor, e, eOpts) {
					var grid = me.getOaFileSignHeadView(),
						headRec = grid.getSelectionModel().getSelection()[0];
					if (headRec.get('state') == '0' || headRec.get('state') == 'X') {// 開立和駁回
						if(headRec.get('signaturePosition') == 'A'){//簽名位置為每頁時，份數默認為1，不可編輯
							if (e.field == 'copyNum') {//簽名份數
								return false;
							}
						}
						return true;
					}
					return false;

				},
				edit : me.editBody

			},
			'addheadwin #addSaveBtn' : {
				click : me.saveHead
				// 保存
			},
			'addheadwin #btnUpload' : {
				click : me.onImport
				// 導入
			},
			'addheadwin #secretGradeId' : {
				click : me.showSecretRemarkWin
				// 保存
			},
			'filepreviewwin #submitBtn' : {
				click : me.onSubmit
				// 呈簽
			},
			'flowshowwin #addSaveBtn' : {
				click : me.saveFlow
				// 保存
			},
			'flowshowwin #autoSplitFlow' : {
				click : me.autoSplitFlow
				// 保存
			}
		});
		me.control('fileimportwin #inputSubmitButton', {
			click : me.importFixNo
			// 上傳文件
		});
	},
	// 在ext相關物件被綁定到dom後，觸發此事件
	onViewRender : function() {
		var me = this;
		// page = me.getPage();
		// 熱鍵
		giveMeHotKey();
		// 加載權限
		juriManager();
		// 在加載完成權限後，是查詢狂獲得焦點
		// page.down('searchfield').focus(true);
		autoForkFlow = false;// 並行會簽設置為否
	},
	// 詳細
	handlerSelectedEmpType : function(sm, records) {
		var me = this,
			oaFileSignHeadView = me.getOaFileSignHeadView(),
			oaFileSignBodyView = me.getOaFileSignBodyView(),
			marqueebox = me.getMarqueebox();
		if (records.length > 0) {
			var record = records[0];
			marqueebox.showDetail(record);
			if (record.data.state == '0') {// 0開立1,確認2:核准S:審核中X:駁回)
				oaFileSignHeadView.down('#btnAdd').setDisabled(false);
				oaFileSignHeadView.down('#btnDelete').setDisabled(false);
				oaFileSignHeadView.down('#btnConfirm').setDisabled(false);
				oaFileSignHeadView.down('#btnRevert').setDisabled(true);
				oaFileSignHeadView.down('#btnSign').setDisabled(true);
				oaFileSignBodyView.down('#btnAdd').setDisabled(false);
				oaFileSignBodyView.down('#btnSave').setDisabled(false);
				oaFileSignBodyView.down('#btnDelete').setDisabled(false);
				oaFileSignBodyView.down('#btnCancel').setDisabled(false);
			} else if (record.data.state == '1') {
				oaFileSignHeadView.down('#btnAdd').setDisabled(false);
				oaFileSignHeadView.down('#btnDelete').setDisabled(true);
				oaFileSignHeadView.down('#btnConfirm').setDisabled(true);
				oaFileSignHeadView.down('#btnRevert').setDisabled(false);
				oaFileSignHeadView.down('#btnSign').setDisabled(false);
				oaFileSignBodyView.down('#btnAdd').setDisabled(true);
				oaFileSignBodyView.down('#btnSave').setDisabled(true);
				oaFileSignBodyView.down('#btnDelete').setDisabled(true);
				oaFileSignBodyView.down('#btnCancel').setDisabled(true);
			} else if (record.data.state == '2') {
				oaFileSignHeadView.down('#btnAdd').setDisabled(false);
				oaFileSignHeadView.down('#btnDelete').setDisabled(true);
				oaFileSignHeadView.down('#btnConfirm').setDisabled(true);
				oaFileSignHeadView.down('#btnRevert').setDisabled(true);
				oaFileSignHeadView.down('#btnSign').setDisabled(true);
				oaFileSignBodyView.down('#btnAdd').setDisabled(true);
				oaFileSignBodyView.down('#btnSave').setDisabled(true);
				oaFileSignBodyView.down('#btnDelete').setDisabled(true);
				oaFileSignBodyView.down('#btnCancel').setDisabled(true);
			} else if (record.data.state == 'S') {
				oaFileSignHeadView.down('#btnAdd').setDisabled(false);
				oaFileSignHeadView.down('#btnDelete').setDisabled(true);
				oaFileSignHeadView.down('#btnConfirm').setDisabled(true);
				oaFileSignHeadView.down('#btnRevert').setDisabled(true);
				oaFileSignHeadView.down('#btnSign').setDisabled(true);
				oaFileSignBodyView.down('#btnAdd').setDisabled(true);
				oaFileSignBodyView.down('#btnSave').setDisabled(true);
				oaFileSignBodyView.down('#btnDelete').setDisabled(true);
				oaFileSignBodyView.down('#btnCancel').setDisabled(true);
			} else if (record.data.state == 'X') {
				oaFileSignHeadView.down('#btnAdd').setDisabled(false);
				oaFileSignHeadView.down('#btnDelete').setDisabled(true);
				oaFileSignHeadView.down('#btnConfirm').setDisabled(true);
				oaFileSignHeadView.down('#btnRevert').setDisabled(true);
				oaFileSignHeadView.down('#btnSign').setDisabled(true);
				oaFileSignBodyView.down('#btnAdd').setDisabled(true);
				oaFileSignBodyView.down('#btnSave').setDisabled(true);
				oaFileSignBodyView.down('#btnDelete').setDisabled(true);
				oaFileSignBodyView.down('#btnCancel').setDisabled(true);
			}
		}
	},
	// 導入申請附件
	onImport : function(grid, store) {
		var win = this.getFileImportwin();
		win.show();
	},
	importFixNo : function() {
		var me = this;
		var win = this.getFileImportwin();
		var form = win.down('form').getForm();

		var win1 = me.getAddHeadWin();
		var form1 = win1.down('form'),
			formvalues = form1.getForm().getFieldValues();

		var inputFile = win.down('#batchInputFile');
		var fileName = inputFile.getValue();

		if (!fileName) {
			Ext.Msg.alert('提示信息', '請選擇上傳文件！');
			return;
		}
		var lenght = fileName.lastIndexOf('.');
		var suffix = fileName.substr(lenght);
		// if (suffix != '.pdf' && suffix != '.tif') {
		if (suffix != '.pdf') {
			Ext.Msg.alert('提示信息', '請選擇pdf文件！');
			inputFile.reset();
		} else {
			// Ext.MessageBox.confirm('確認框', '您選擇的文件為' + fileName +
			// ',您確認要上傳此文件么？', function(btnId) {
			// if (btnId === 'yes') {
			win.el.mask('上傳中...');
			form.submit({
				url : contextPath + '/pub/affix!upload.action',
				success : function(form, action) {
					win.el.unmask();
					var obj = Ext.decode(action.response.responseText);
					if (obj.success) {
						var affixNo = obj.data[0].afffixGroupNo;
						form1.down('textfield[name=applyFileNo]').setValue(affixNo);
					} else {
						Ext.Msg.alert('提示信息', '上傳文件異常');
					}
					win.close();
				},
				failure : function(form, action) {
					win.el.unmask();
					showAjaxError(action.response);
				}
			});
			// }
			// });
		}

	},
	// 下載申請附件
	ftpDown : function(grid, record) {
		var applyFileNo = record.get('applyFileNo'),
			fileName = record.get('fileName'),
			fileOldName = record.get('fileOldName'),
			filePath = record.get('filePath');
		// window.top.downloadAndOpenFileByNo(applyFileNo);
		window.open(contextPath + '/hr/oaFileSign/oaFileSign_ftpDown.action?applyFileNo=' + applyFileNo);
	},
	// 下載簽核當文件
	ftpDownSign : function(grid, record) {
		var applyFileNo = record.get('applyFileNo'),
			signFileNo = record.get('signFileNo');
		window.open(contextPath + '/hr/oaFileSign/oaFileSign_ftpDownSign.action?applyFileNo=' + applyFileNo + '&signFileNo=' + record.get('signFileNo'));
	},

	// 單號鏈接
	onView : function(grid, store, record) {
		var me = this,
			win = me.getAddHeadWin();
		var form = win.down('form'),
			formvalues = form.getForm().getFieldValues();
		if (!record) {
			Ext.Msg.alert(sysTitle, '請先選擇要編輯的單頭記錄');
			return;
		}
		if (record.get('state') != '0') {
			win.down('form').getForm().getFields().each(function(f) {
				f.setReadOnly(true);
			});
			win.down('#addSaveBtn').hide();
			win.down('#addCancelBtn').hide();

		} else {
		}
		win.show();
		win.down('form').getForm().loadRecord(record);
		win.down('form').resetOriginalValue();
		win.record = record;

	},
	editBody : function(editor, e, eOpts) {
		if (e.field == "signEmpNo") {
			if (e.value && e.originalValue != e.value) {
				Ext.Ajax.request({
					url : contextPath + '/hr/oaFileSign/oaFileSign_queryEmpNo.action',
					method : 'POST',
					params : {
						'keyword' : e.value
					},
					success : function(response, opts) {
						var result = Ext.decode(response.responseText);
						var bean = result.deptList;

						if (bean.length == 0) {
							e.record.set('signEmpNo', '');
							e.record.set('signEmpName', '');
							e.record.set('mailAddress', '');
							Ext.Msg.alert(sysTitle, '不存在該人員信息');
							return;
						} else {
							e.record.set('signEmpName', bean[0].empName);
							e.record.set('mailAddress', bean[0].mailAddress);
						}
					},
					failure : function(response, opts) {
						Ext.Msg.alert(sysTitle, '驗證簽核人失敗');
					}
				})
			}
		}
	},
	// 模糊查詢
	queryLike : function(headGrid, headStore, keyword) {
		var me = this;
		var headGrid = me.getOaFileSignHeadView(),
			headStore = me.getOaFileSignHeadStore();
		var bGrid = me.getOaFileSignBodyView(),
			bStore = bGrid.store;
		var isModify = bStore.getModifiedRecords().length > 0 || headStore.getModifiedRecords().length > 0
		if (isModify) {
			Ext.Msg.alert(sysTitle, '單身有數據被修改，請先保存');
			return;
		}
		headStore.getProxy().api.read = contextPath + '/oaFileFreeSign/oaFileFreeSign_queryHeadLike.action';
		headStore.getProxy().extraParams = {
			keyword : keyword
		}
		headStore.currentPage = 1;
		headStore.load({
			callback : function(records, oprate, success) {
				if (records == null || records.length == 0) {
					headStore.removeAll();
					bStore.removeAll();
					if (success)
						Ext.Msg.alert(sysTitle, '查詢無數據.');
				} else {
					headGrid.resetFocus(false);
				}
			}
		})

	},
	// 精確查詢操作
	onQuery : function(grid, condition) {
		var me = this,
			store = grid.getStore();
		store.getProxy().api.read = contextPath + '/oaFileFreeSign/oaFileFreeSign_queryHeadByCondition.action';
		store.getProxy().extraParams = {
			'paramsStr' : Ext.encode(condition)
		};
		store.currentPage = 1;
		store.load({
			callback : function(records) {
				if (records.length == 0) {
					store.removeAll();
					me.getOaFileSignBodyView().getStore().removeAll();
					Ext.Msg.alert(sysTitle, '查詢無數據.');
				} else {
					grid.resetFocus(false);
				}
			}
		});
	},
	// 選中行查詢相關數據
	onSelectedRecord : function(selectionMd, selectionedRecs) {
		var me = this;
		// GRID的處理
		var bGrid = me.getOaFileSignBodyView(),
			bStore = bGrid.store;
		bStore.removeAll();
		bStore.getProxy().extraParams = {
			keyword : selectionedRecs.get('fileSignHeadId')
		};
		bStore.load({
			callback : function(records, operation, success) {
				if (records.length == 0) {
					var newRecord = Ext.ModelManager.create({}, bStore.model);
					newRecord.set('fileSignHeadId', selectionedRecs.get('fileSignHeadId'));
					newRecord.set('signTaskOrder', bStore.getCount() + 1);
					newRecord.set('copyNum', 1);
					newRecord.set('signTaskName', '承辦');
					newRecord.set('signEmpNo', selectionedRecs.get('empNo'));
					newRecord.set('signEmpName', selectionedRecs.get('empName'));
					newRecord.set('mailAddress', userInfo.mailAddress);
					newRecord.set('isEnable', 'Y');
					newRecord.set('creater', userInfo.getUserNo());
					newRecord.set('createDate', new Date());
					newRecord.set('ownerDept', userInfo.getDeptNo());
					newRecord.set('isResponsible', 'Y');
					bStore.add(newRecord);

					var newRecord1 = Ext.ModelManager.create({}, bStore.model);

					newRecord1.set('fileSignHeadId', selectionedRecs.get('fileSignHeadId'));
					newRecord1.set('signTaskOrder', bStore.getCount() + 1);
					newRecord1.set('copyNum', 1);
					newRecord1.set('signTaskName', '審核');
					newRecord1.set('signEmpNo', '');
					newRecord1.set('signEmpName', '');
					newRecord1.set('isEnable', 'Y');
					newRecord1.set('creater', userInfo.getUserNo());
					newRecord1.set('createDate', new Date());
					newRecord1.set('ownerDept', userInfo.getDeptNo());
					newRecord1.set('isResponsible', 'N');
					bStore.add(newRecord1);

					var newRecord2 = Ext.ModelManager.create({}, bStore.model);

					newRecord2.set('fileSignHeadId', selectionedRecs.get('fileSignHeadId'));
					newRecord2.set('signTaskOrder', bStore.getCount() + 1);
					newRecord2.set('copyNum', 1);
					newRecord2.set('signTaskName', '核准');
					newRecord2.set('signEmpNo', '');
					newRecord2.set('signEmpName', '');
					newRecord2.set('isEnable', 'Y');
					newRecord2.set('creater', userInfo.getUserNo());
					newRecord2.set('createDate', new Date());
					newRecord2.set('ownerDept', userInfo.getDeptNo());
					newRecord2.set('isResponsible', 'N');
					bStore.add(newRecord2);

				}

			}
		});

	},

	// 增加單身
	onAddBody : function(grid, store) {
		var me = this;
		var headGrid = me.getOaFileSignHeadView(),
			headStore = me.getOaFileSignHeadStore();
		var headRec = headGrid.getSelectionModel().getSelection()[0];
		var selectedRecord = grid.getSelectionModel().getSelection()[0];
		if (!headRec) {
			Ext.Msg.alert(sysTitle, '請選擇單頭記錄.');
			return;
		}
		if (!(headRec.get('state') == '0' || headRec.get('state') == 'X')) {
			Ext.Msg.alert(sysTitle, '开立或駁回状态才可新增.');
			return;
		}
		var isResponsible = "N";//審核責任者
		if (store.indexOf(selectedRecord) == -1) {
			isResponsible = "Y";
		} else {
			isResponsible = "N";
		}
		var newRecord = Ext.ModelManager.create({
			'fileSignHeadId' : headRec.get('fileSignHeadId'),
			'signTaskOrder' : store.indexOf(selectedRecord) + 2,
			'copyNum' : 1,
			'isEnable' : 'Y',
			'creater' : userInfo.getUserNo(),
			'createDate' : new Date(),
			'ownerDept' : userInfo.getDeptNo(),
			'isResponsible' : isResponsible
		}, store.model);
		var row = store.indexOf(selectedRecord) + 1;
		var position = {
			row : row,
			column : 1
		};
		store.insert(row, newRecord);
		store.each(function(r, i) {
			var r1 = i + 1;
			r.set('signTaskOrder', r1);
		});
		Ext.defer(function() {
			grid.editingPlugin.startEditByPosition(position);
		}, 100);
	},
	// 撤銷操作
	onCancel : function(grid, store) {
		var newRecs = store.getNewRecords();
		var upRecs = store.getUpdatedRecords();
		if (newRecs.length + upRecs.length > 0) {
			Ext.Msg.confirm(sysTitle, '你確定要撤銷修改么?', function(ok, btn, e) {
				if (ok == 'yes') {
					store.remove(newRecs);
					upRecs.forEach(function(record) {
						record.reject();
					});
					grid.resetFocus();
				}
			});
		} else {
			Ext.Msg.alert(sysTitle, '無數據可操作.');
		}
	},
	// 保存單身
	saveApplyBody : function() {
		var me = this;
		var grid = me.getOaFileSignBodyView();
		var store = grid.getStore();
		var lGrid = me.getOaFileSignHeadView();
		var lStore = lGrid.getStore();
		var bodyData = [];
		if (store.getModifiedRecords().length == 0) {
			Ext.Msg.alert(sysTitle, '沒有數據變更，不需要保存！');
			return;
		}
		if (!grid.isValid()) {
			ErrorMsg.errorAlert(sysTitle, grid.errors);
			return;
		}

		var errorMsg = '';
		headRec = lGrid.selModel.getSelection()
		if (headRec[0].get('importantGrade') == '2' || headRec[0].get('importantGrade') == '3') {//重要/極重要
			store.each(function(r, i) {
				if (r.get('auditFocus') == null || r.get('auditFocus') == "") {//按比例
					var r1 = i + 1;
					errorMsg = Ext.String.format('{0}<br>{1}審核重點不能為空!', errorMsg, '第' + r1 + '行');
				}
			});
		}
		if (!Ext.isEmpty(errorMsg)) {
			Ext.Msg.alert(sysTitle, errorMsg);
			return;
		}

		grid.el.mask('保存中...');
		store.each(function(r) {
			bodyData.push(r.data);
		});
		Ext.Ajax.request({
			url : contextPath + '/oaFileFreeSign/oaFileFreeSign_addSignEmp.action',
			method : 'POST',
			params : {
				'keyword' : Ext.encode(bodyData)
			},
			success : function(response, opts) {
				var obj = Ext.decode(response.responseText);
				grid.el.unmask();
				var selModel = grid.getSelectionModel(),
					selected = selModel.getSelection();
				selModel.select(selected[selected.length - 1]);
				store.loadData(obj.oaFileBodyList);
				store.commitChanges();
			},
			failure : function(response, opts) {
				grid.el.unmask();
				Ext.Msg.alert(sysTitle, '保存失敗.');
			}
		})
		// store.sync({
		// success : function(batch, options) {
		// grid.el.unmask();
		// var selModel = grid.getSelectionModel(),
		// selected = selModel.getSelection();
		// selModel.select(selected[selected.length - 1]);
		// },
		// failure : function(batch, options) {
		// grid.el.unmask();
		// Ext.Msg.alert(sysTitle, '保存失敗.');
		// }
		// });

	},
	// 刪除單身
	delApplyBody : function() {
		var me = this;
		var grid = me.getOaFileSignBodyView();
		var lGrid = me.getOaFileSignHeadView();
		var store = grid.getStore();
		var rec = grid.getSelectionModel().getSelection()[0];
		var headRec = me.getOaFileSignHeadView().getSelectionModel().getSelection()[0];
		if (!rec) {
			Ext.Msg.alert(sysTitle, '請選擇一條記錄！');
			return;
		}
		if (!(headRec.get('state') == '0' || headRec.get('state') == 'X')) {
			Ext.Msg.alert(sysTitle, '開立/駁回狀態下才可刪除！');
			return;
		}
		// if (store.getModifiedRecords().length > 0) {
		// Ext.Msg.alert(sysTitle, '有數據變更，請先保存！');
		// return;
		// }
		if (rec) {
			Ext.Msg.confirm(sysTitle, '是否確認刪除?此操作不能恢復.', function(ok, btn, e) {
				if (ok == 'yes') {
					if (rec.phantom) {
						store.remove(rec);
						grid.resetFocus(false);
					} else {
						Ext.Ajax.request({
							url : store.proxy.api.destroy,
							params : {
								'keyword' : rec.get('fileSignBodyId')
							},
							success : function(response, opts) {
								store.remove(rec);
								store.commitChanges();
							},
							failure : function(response, opts) {
								Ext.Msg.alert(sysTitle, '刪除失敗.');
							}
						})
					}

				}
			});
		} else {
			Ext.Msg.alert(sysTitle, '沒有需要操作的數據', function() {
				grid.resetFocus(false);
			});
		}

	},
	// 新增單頭
	onAddHead : function() {
		var me = this;
		var win = me.getAddHeadWin();
		var form = win.down('form');
		form.getForm().setValues({
			'applyDate' : new Date(),
			'empNo' : userInfo.getUserNo(),
			'empName' : userInfo.getUserName(),
			'deptNo' : userInfo.getDeptNo(),
			'deptName' : userInfo.getDeptName(),
			'state' : '0',
			'isEnable' : 'Y',
			'creater' : userInfo.getUserNo(),
			'ownerDept' : userInfo.getDeptNo(),
			'createDate' : new Date(),
			'isChange' : 'N',
			'signaturePosition' : 'H',
			'onlyWebShow' : 'N'
		});
		win.record = "";
		win.show();
		Ext.defer(function() {
			win.down('pdtablecombox[name=importantGrade]').focus();
		}, 100);
	},
	// 保存單頭
	saveHead : function(btn) {
		var me = this;
		var win = me.getAddHeadWin();
		var form = win.down('form'),
			formvalues = form.getForm().getFieldValues();
		var grid = me.getOaFileSignHeadView();
		var store = grid.getStore();
		if (!formvalues.applyDate) {
			Ext.Msg.alert(sysTitle, '申請日期不能為空.');
			return;
		};
		if (!formvalues.empNo) {
			Ext.Msg.alert(sysTitle, '申請人工號不能為空.');
			return;
		};
		if (!formvalues.empName) {
			Ext.Msg.alert(sysTitle, '申請人姓名不能為空.');
			return;
		};
		if (!formvalues.importantGrade) {
			Ext.Msg.alert(sysTitle, '重要等級不能為空.');
			return;
		};
		if (!formvalues.secretGrade) {
			Ext.Msg.alert(sysTitle, '保密性不能為空.');
			return;
		};
		if (!formvalues.applyFileNo) {
			Ext.Msg.alert(sysTitle, '簽核文件不能為空.');
			return;
		};
		if (!formvalues.signPurport) {
			Ext.Msg.alert(sysTitle, '文件主旨不能為空.');
			return;
		};
		// if (!formvalues.isChange) {
		// Ext.Msg.alert(sysTitle, '圖片是否縮放不能為空.');
		// return;
		// };
		// if (!formvalues.signaturePosition) {
		// Ext.Msg.alert(sysTitle, '簽名位置不能為空.');
		// return;
		// };
		var values = Ext.merge(formvalues, {
			applyFileNo : formvalues.applyFileNo
		});
		if (!form.getForm().isDirty()) {
			Ext.Msg.alert(sysTitle, '數據無異動，無需保存');
			return;
		}
		btn.disable();
		console.log(formvalues);
		console.log(values);
		win.el.mask('保存中...');
		Ext.Ajax.request({
			url : contextPath + '/oaFileFreeSign/oaFileFreeSign_saveHead.action',
			method : 'POST',
			params : {
				'paramsStr' : Ext.encode(values)
			},
			success : function(response, opts) {
				btn.enable();
				var obj = Ext.decode(response.responseText);
				if (form.down('hidden[name = fileSignHeadId]').getValue() == 0 || form.down('hidden[name = fileSignHeadId]').getValue() == "") {
					var newRecord = Ext.ModelManager.create(obj.head, store.model);
					var row = store.getCount();
					store.insert(0, newRecord);
					grid.resetFocus(false, {
						record : newRecord
					});
					form.resetOriginalValue();
					win.record = newRecord;
					win.close();
				} else {
					var records = grid.getSelectionModel()
					/* 获得当前grid的选择模式 */.getSelection()/* 获得当前选择的records */;
					var headRec = records[0];
					Ext.Object.each(obj.head, function(key, value, myself) {
						headRec.set(key, value);
					});
					headRec.commit();
					win.record.commit();
					win.close();
					grid.getView().refresh();
				}
			},
			failure : function(response, opts) {
				btn.enable();
				win.el.unmask();
				Ext.Msg.alert(sysTitle, '保存失败.');
			}
		});

	},
	// 刪除單頭及單身的所有數據
	onDelete : function() {
		var me = this;
		var page = me.getPage();

		var bGrid = me.getOaFileSignBodyView();
		var lGrid = me.getOaFileSignHeadView();
		var lStore = lGrid.getStore();
		var bStore = bGrid.getStore();
		var rec = bGrid.getSelectionModel().getSelection()[0];
		var headRec = me.getOaFileSignHeadView().getSelectionModel().getSelection()[0];

		if (!headRec) {
			Ext.Msg.alert(sysTitle, '請選擇一條記錄！');
			return;
		}
		if (!(headRec.get('state') == '0' || headRec.get('state') == 'X')) {
			Ext.Msg.alert(sysTitle, '開立/駁回狀態下才可刪除！');
			return;
		}

		if (bStore.getCount() > 0) {
			Ext.Msg.confirm(sysTitle, '存在單身您確定要一起刪除嗎?', function(btn, value) {
				if (btn == 'yes') {
					if (headRec.get('fileSignHeadId')) {
						page.getEl().mask('刪除中...');
						Ext.Ajax.request({
							url : contextPath + '/oaFileFreeSign/oaFileFreeSign_deleteHead.action',
							params : {
								keyword : headRec.get('fileSignHeadId'),
								applyFileNo : headRec.get('applyFileNo')
							},
							success : function(response, opts) {
								var data = Ext.decode(response.responseText);
								page.unmask();
								if (response.status == 200) {
									bStore.removeAll();
									lStore.remove(headRec);
								}
							},
							failure : function() {
								page.unmask();
								Ext.Msg.alert(sysTitle, '刪除失敗.');
							}
						});
					} else {
						bStore.removeAll();
					}
				}
			});
		} else {
			Ext.Msg.confirm(sysTitle, '您確定要刪除嗎?', function(btn, value) {
				if (btn == 'yes') {
					if (headRec.get('fileSignHeadId')) {
						page.getEl().mask('刪除中...');
						Ext.Ajax.request({
							url : contextPath + '/oaFileFreeSign/oaFileFreeSign_deleteHead.action',
							params : {
								keyword : headRec.get('fileSignHeadId')
							},
							success : function(response, opts) {
								var data = Ext.decode(response.responseText);
								page.unmask();
								if (response.status == 200) {
									bStore.removeAll();
									lStore.remove(headRec);
								}
							},
							failure : function() {
								page.unmask();
								Ext.Msg.alert(sysTitle, '刪除失敗.');
							}
						});
					} else {
						bStore.removeAll();
					}
				}
			});

		}

	},
	// 預覽
	onPreview : function(grid, store) {
		var me = this;
		var win = me.getFilePreviewWin();
		var recs = grid.getSelectionModel().getSelection();
		if (recs.length == 0) {
			Ext.Msg.alert(sysTitle, '請選擇記錄');
			return;
		}
		var record = recs[0];
		if (record.get('state') != '1') {
			Ext.Msg.alert(sysTitle, '確認狀態才可預覽');
			return;
		}
		var bodyGrid = me.getOaFileSignBodyView();
		bodyStore = bodyGrid.store;
		// var jointlySignCount = 0;
		// bodyStore.each(function(r) {
		// var signTaskName = r.get('signTaskName');
		// if (signTaskName.indexOf("會簽") > -1) {
		// jointlySignCount = jointlySignCount + 1;
		// }
		// });
		// if (jointlySignCount > 1) {
		// var autoForkFlowSelWin = me.getAutoForkFlowSelWin();
		// var forkFlowForm = autoForkFlowSelWin.down('form');
		// forkFlowForm.getForm().setValues({
		// 'isAutoForkFlow' : 'N'
		// });
		// autoForkFlowSelWin.show()
		// } else {
       console.log(record);
		var isFirstSign = true,
			totalPageNum = record.data.totalPageNum,
			maxPreviewPageCount = 10;
		if (record.data.signaturePosition == "T") {
			isFirstSign = false;
		}
		win.show();
		win.el.mask('預覽中,請稍後...');
		Ext.Ajax.request({
			url : contextPath + '/oaFileFreeSign/oaFileFreeSign_previewHead.action',
			params : {
				headId : record.get('fileSignHeadId'),
				applyFileNo : record.get('applyFileNo')
			},
			success : function(res) {
				var panel = win.down('#order-view');
				var rs = Ext.decode(res.responseText),
					paths = rs.paths,
					firstImgSize = rs.firstImgSize,
					imgs = [],
					pageNum = null,
					lastPageNum = 1;
				if (!paths || paths.length == 0) {
					Ext.Msg.alert(sysTitle, '文件轉換失敗，你上傳的文件存在錯誤，或者PDF是只讀的，請重新確認');
				}
				for (var i = 0; i < paths.length; i++) {
					pageNum = i + 1;
					if (!isFirstSign && totalPageNum > maxPreviewPageCount && i == maxPreviewPageCount - 1) {
						// imgs.push('<div style="text-align:
						// center;font-size:18px;color:blue;padding:
						// 10px;">因文件內容超過'+maxPreviewPageCount+'頁，此處省略，具體內容請查看原文件</div>');
						pageNum = totalPageNum;
					}
					imgs.push('<div style="text-align: center;font-weight: bold;color: red;border-bottom: 2px dashed red;">第' + pageNum + '頁</div>');
					imgs.push('<img class="book-page" pageNum="' + (i + 1) + '" src="' + contextPath + paths[i] + '" style="width:1024px;max-width:1024px;max-height:1448px;background-color:white;">');
					lastPageNum = i + 1;
					
					if (isFirstSign && totalPageNum > maxPreviewPageCount && i == maxPreviewPageCount - 1) {
						// imgs.push('<div style="text-align:
						// center;font-size:18px;color:blue;padding:
						// 10px;">因文件內容超過'+maxPreviewPageCount+'頁，此處省略，具體內容請查看原文件</div>');
						pageNum = totalPageNum;
					}
				}
				panel.update(imgs.join(''), true);

				
				var imgs = panel.el.query('img'),
				loadedImgCount = 0;
			for(var i=0,img;i<imgs.length;i++){
				img = Ext.get(imgs[i]);
				img.on('load', function(){
					//圖片加載完成
					loadedImgCount++;
					if(loadedImgCount == paths.length){
						//所有計算邏輯需要等到圖片加載完成之後
						me.afterImgLoaded(win, record, lastPageNum, firstImgSize,totalPageNum);
					}
				})
			}
				
				flag = true;
			},
			failure : function(res) {
				flag = false;
				Ext.Msg.alert(sysTitle, '預覽失敗.');
				win.el.unmask();
			}
		});

		// }

	},
	afterImgLoaded: function(win, record, lastPageNum, firstImgSize,totalPageNum){
		var me=this;
		var x = 10,
		y = 100;
		 console.log(record);
	var bodyGrid = me.getOaFileSignBodyView(),
		bodyStore = bodyGrid.getStore();
	/*
	 * left-offset=92px， 每個寬度110+間隔10=120px，每行放置7個 簽名高度70+間隔10=80
	 */
	var pageHeight = 1024 * firstImgSize[1] / firstImgSize[0];
	if (!pageHeight) {
		pageHeight = 1448;
	}
	var len = bodyStore.data.items.length,
		// var len = rs.len,
		rows = Math.ceil(len / 7),
		signBlockWidth = 120,
		signBlockHeight = 80;
	x = 92;
	
	if(record.get('signaturePosition')=='H'||record.get('signaturePosition')=='T'){//首頁或者尾頁
		if (record.get('signaturePosition')=='H') {
			y = pageHeight - rows * 80;
		} else if (record.get('signaturePosition')=='T') {
			// y = pageHeight * 10 - rows * 80;
			y = pageHeight * totalPageNum - rows * 80;
		}
		
		win.initSignMarkContextMenu({
			signs : bodyStore.data.items,
			pageCount : totalPageNum,
			pageHeight : pageHeight,
			offsetX : x,
			offsetY : y % pageHeight
		});
		var rowSignCount;
		for (i = 0; i < rows; i++) {
			rowSignCount = ((i < rows - 1 || len % 7 == 0) ? 7 : len % 7);
			for (j = 0; j < rowSignCount; j++) {
				var r = bodyStore.data.items[i * 7 + (rowSignCount - j) - 1].data;
				var copyNum = r.copyNum,
					args = {
						signs : bodyStore.data.items,
						pageCount : totalPageNum,
						offsetX : x,
						offsetY : y % pageHeight,
						x : x + j * 120,
						y : y - i * 80
					};
				if (copyNum == 1) {
					win.addSignMark(r.fileSignBodyId, r.signTaskName, r.signEmpName, args.x, args.y, record.get('pageType'), args);
				} else if (copyNum > 1) {
					for (m = 1; m <= copyNum; m++) {
						win.addSignMark(r.fileSignBodyId + "-" + m, r.signTaskName, r.signEmpName, args.x, args.y, record.get('pageType'), args);
					}
				}
			}
		}
	
	}else if(record.get('signaturePosition')=='A'){
		console.log(totalPageNum);
	   for(k=0;k<totalPageNum;k++){
		   console.log(pageHeight);
		   console.log(k);
		   console.log(rows);
		  
		 y = pageHeight * (k+1) - rows * 80;
		 console.log(y);
		 win.initSignMarkContextMenu({
			signs : bodyStore.data.items,
			pageCount : totalPageNum,
			pageHeight : pageHeight,
			offsetX : x,
			offsetY : y % pageHeight
		});
		var rowSignCount;
		for (i = 0; i < rows; i++) {
			rowSignCount = ((i < rows - 1 || len % 7 == 0) ? 7 : len % 7);
			for (j = 0; j < rowSignCount; j++) {
				var r = bodyStore.data.items[i * 7 + (rowSignCount - j) - 1].data;
				var copyNum = r.copyNum,
					args = {
						signs : bodyStore.data.items,
						pageCount : totalPageNum,
						offsetX : x,
						offsetY : y % pageHeight,
						x : x + j * 120,
						y : y - i * 80
					};
				if (copyNum == 1) {
					console.log(r.fileSignBodyId + "-" + (k+1));
//					win.addSignMark(r.fileSignBodyId+'-'+(k+1), r.signTaskName, r.signEmpName, args.x, args.y, record.get('pageType'), args);
					win.addSignMark(r.fileSignBodyId + "-" + (k+1), r.signTaskName, r.signEmpName, args.x, args.y, record.get('pageType'), args);
				} 
//				else if (copyNum > 1) {
//					for (m = 1; m <= copyNum; m++) {
//						win.addSignMark(r.fileSignBodyId + "-" + m, r.signTaskName, r.signEmpName, args.x, args.y, record.get('pageType'), args);
//					}
//				}
			}
		}
	   }
	}

	win.el.unmask();
	
	
	},
	// 並行會簽
	// 呈簽
	onSubmit : function(grid, store) {
		var me = this;
		var win = me.getFilePreviewWin();
		var grid = me.getOaFileSignHeadView();
		var store = grid.getStore();
		var selectedRec = grid.getSelectionModel().getSelection()[0];
		if (!selectedRec) {
			Ext.Msg.alert(sysTitle, '請先選擇條記錄!');
			return;
		}
		if (selectedRec.get('state') != 1) {
			Ext.Msg.alert(sysTitle, '確認狀態才可呈簽');
			return;
		}
		if (flag == false) {
			Ext.Msg.alert(sysTitle, '預覽失敗，此文件不能提交!');
			return;
		}
		var paramsStr = win.getSignMarkPositions();
		console.log(paramsStr);
		if (paramsStr === false) {
			return;
		} else if (paramsStr == null) {
			Ext.Msg.alert(sysTitle, '獲取簽名位置異常');
			return;
		}
		// Ext.Msg.confirm(sysTitle, '確定要呈簽此記錄嗎?', function(btnId) {
		// if (btnId == 'yes') {
		var fileSignHeadId = selectedRec.get('fileSignHeadId');
		win.el.mask('呈簽中,請稍後...');
		Ext.Ajax.request({
			method : 'POST',
			params : {
				'paramsStr' : Ext.encode(paramsStr),
				'keyword' : fileSignHeadId,
				'autoForkFlow' : autoForkFlow
				//				,'isSecret':selectedRec.get('isSecret')//保密性

			},
			url : contextPath + '/oaFileFreeSign/oaFileFreeSign_submitOafile.action',
			success : function(response, opts) {
				selectedRec.set('state', 'S');
				selectedRec.commit();
				// grid.loadRecord(record);
				win.el.unmask();
				win.close();
			},
			failure : function(response, opts) {
				win.el.unmask();
				Ext.Msg.alert(sysTitle, '呈簽數據時出錯.');
			}
		});
		// }
		// });
	},

	// 確認
	onSure : function(headGrid, headStore) {
		var me = this,
			flowWin = me.getFlowShowWin(),
			iframe = flowWin.down('uxiframe');
		var selected = headGrid.getSelectionModel().getSelection();
		var bodyData = [];
		if (selected.length == 0) {
			Ext.Msg.alert(sysTitle, '請選擇記錄');
		}
		var record = selected[0];
		if (!(record.get('state') == '0' || record.get('state') == 'X')) {
			Ext.Msg.alert(sysTitle, '開立/駁回狀態才可確認');
			return;
		}
		var bodyGrid = me.getOaFileSignBodyView(),
			bodyStore = bodyGrid.getStore();
		if (bodyStore.getCount() == 0) {
			Ext.Msg.alert(sysTitle, '請先添加签核人列表記錄');
			return;
		}
		if (bodyStore.getModifiedRecords().length > 0) {
			Ext.Msg.alert(sysTitle, '請先保存簽核人列表');
			return;
		}
		// bodyStore.each(function(r) {
		// bodyData.push(r.data);
		// });
		// var data = {
		// 'bodys' : bodyData
		// }

		var nodes = [];
		bodyStore.each(function(r) {
			nodes.push(r.data.signTaskName + ":" + r.data.signEmpNo + ":" + r.data.fileSignBodyId);
		});

		Ext.Ajax.request({
			url : contextPath + '/workflow/orderManger!buildFlow.action',
			jsonData : nodes,
			success : function(response, opts) {
				var result = Ext.decode(response.responseText);
				for(var i=0,record;i<bodyStore.getCount();i++){
					record = bodyStore.getAt(i);
					if(record.get('isResponsible') == 'Y'){
						for(var j=0,node;j<result.length;j++){
							node = result[j];
							if(record.data.fileSignBodyId == Number(node.modelNo)){
								node.taskLevel = 2;
							}
						}
					}
				}
				iframe.loadData(result);
				iframe.loaded = true;

				flowWin.show();
			},
			failure : function(response, opts) {

			}
		});
	},
	// 還原
	onBack : function(headGrid, headStore) {
		var me = this;
		var selected = headGrid.getSelectionModel().getSelection();
		if (selected.length == 0) {
			Ext.Msg.alert(sysTitle, '請選擇記錄');
		}
		var record = selected[0];
		if (record.get('state') != '1') {
			Ext.Msg.alert(sysTitle, '確認狀態才可還原');
			return;
		}
		// Ext.Msg.confirm(sysTitle, '是否還原？', function(btnId) {
		// if (btnId == 'yes') {
		me.getPage().getEl().mask('還原中……');
		Ext.Ajax.request({
			url : contextPath + '/oaFileFreeSign/oaFileFreeSign_backState.action',
			method : 'POST',
			params : {
				id : record.get('fileSignHeadId'),
				applyFileNo : record.get('applyFileNo')
			},
			success : function(response, opts) {
				me.getPage().getEl().unmask();
				record.set('state', '0');
				headGrid.getSelectionModel().deselect(record);
				headGrid.getSelectionModel().select(record);
				record.commit();
				headGrid.getView().refresh();
			},
			failure : function(response, opts) {
				me.getPage().getEl().unmask();
				Ext.Msg.alert(sysTitle, '還原失败.');
			}
		})
		// }
		//
		// });

	},
	queryProcess : function(grid, store, rowIndex, type) {
		var id = store.getAt(rowIndex).get('fileSignHeadId');
		newWin = window.open(contextPath + "/workflow/snapshot.jsp?userOrderId=" + id + "", "_blank");
	},
	// 作廢
	cancelOrder : function(grid, store, rowIndex, type) {
		var me = this;
		var record = store.getAt(rowIndex);
		var page = me.getPage();
		Ext.Msg.confirm(sysTitle, '是否作廢？', function(btnId) {
			if (btnId == 'yes') {
				page.getEl().mask('作廢中……');
				Ext.Ajax.request({
					url : contextPath + '/oaFileFreeSign/oaFileFreeSign_cancelOrder.action',
					method : 'POST',
					params : {
						id : record.get('fileSignHeadId')
					},
					success : function(response, opts) {
						page.getEl().unmask();
						record.set('state', 'N');// N為作廢狀態,作廢狀態無需查詢出來
						store.remove(record);
						store.commitChanges();
					},
					failure : function(response, opts) {
						page.getEl().unmask();
						Ext.Msg.alert(sysTitle, '作廢失败.');
					}
				})
			}
		})

	},

	// 自動拆分會簽
	autoSplitFlow : function() {
		var me = this,
			flowWin = me.getFlowShowWin(),
			iframe = flowWin.down('uxiframe');
		var data = iframe.getData();
		function requestAutoSplitFlow(mode) {
			Ext.Ajax.request({
				url : contextPath + '/workflow/orderManger!autoSplitFlow.action?mode=' + mode,
				jsonData : data,
				success : function(response, opts) {
					var result = Ext.decode(response.responseText);
					iframe.loadData(result);
					iframe.loaded = true;
					flowWin.show();
				},
				failure : function(response, opts) {
					Ext.Msg.alert('簽核提示', '自動拆分會簽異常.');
				}
			});
		}
		Ext.create('Ext.window.Window', {
			title : '簽核提示',
			height : 150,
			width : 400,
			layout : 'fit',
			bodyStyle : 'border-width: 0px;',
			items : {
				bodyStyle : 'background-color: #ced9e7;border-width: 0px;padding: 10px;',
				border : false,
				html : '請點擊你需要的功能按鈕：<br/>1、智能會簽: 不同節點名稱，或者不同作業部門人員拆分為並行簽核.<br/>2、最大拆分會簽: 所有會簽節拆分為並行簽核.'
			},
			buttons : [{
				text : '1: 智能會簽',
				handler : function() {
					requestAutoSplitFlow(1);
					this.up('window').close();
				}
			}, {
				text : '2: 最大拆分會簽',
				handler : function() {
					requestAutoSplitFlow(2);
					this.up('window').close();
				}
			}]
		}).show();
	},

	//	// 自動拆分會簽
	//	autoSplitFlow : function() {
	//		var me = this,
	//			flowWin = me.getFlowShowWin(),
	//			iframe = flowWin.down('uxiframe');
	//		var data = iframe.getData();
	//		Ext.Msg.alert('簽核提示', '1、相鄰會簽節拆分為並行簽核.<br/>2、相同節點名稱，或者相同作業部門人員按照順序簽核.', function(){
	//			Ext.Ajax.request({
	//				url : contextPath + '/workflow/orderManger!autoSplitFlow.action',
	//				jsonData : data,
	//				success : function(response, opts) {
	//					var result = Ext.decode(response.responseText);
	//					iframe.loadData(result);
	//					iframe.loaded = true;
	//	
	//					flowWin.show();
	//				},
	//				failure : function(response, opts) {
	//	
	//				}
	//			});
	//		});
	//	},
	saveFlow : function(btn) {
		var me = this,
			headGrid = me.getOaFileSignHeadView(),
			flowWin = me.getFlowShowWin(),
			iframe = flowWin.down('uxiframe');
		var selected = headGrid.getSelectionModel().getSelection();
		var record = selected[0];
		var flowContent = iframe.getData();
		var bodyGrid = me.getOaFileSignBodyView(),
			bodyStore = bodyGrid.getStore();
		var bodyData = [];
		bodyStore.each(function(r) {
			bodyData.push(r.data);
		});
		var data = {
			'bodys' : bodyData
		}
		btn.disable();
		me.getPage().getEl().mask('確認中……');
		Ext.Ajax.request({
			url : contextPath + '/oaFileFreeSign/oaFileFreeSign_sureState.action',
			method : 'POST',
			params : {
				flowContent : Ext.encode(flowContent),
				paramsStr : Ext.encode(data),
				fileSignHeadId : record.get('fileSignHeadId')
			},
			success : function(response, opts) {
				btn.enable();
				var obj = Ext.decode(response.responseText);
				if (obj.message == "") {
					me.getPage().getEl().unmask();
					record.set('state', '1');
					headGrid.getSelectionModel().deselect(record);
					headGrid.getSelectionModel().select(record);
					record.commit();
					flowWin.close();
					headGrid.getView().refresh();

				} else {
					me.getPage().getEl().unmask();
					flowWin.close();
					Ext.Msg.alert(sysTitle, obj.message);
				}
			},
			failure : function(response, opts) {
				btn.enable();
				me.getPage().getEl().unmask();
				Ext.Msg.alert(sysTitle, '確認失敗.');
			}
		})
	},
	onPlayVideo : function() {
		var me = this;
		me.getPlayVideoWin().show();
	},
	showSecretRemarkWin : function() {
		var me = this;
		me.getSecretRemarkWin().show();
	}
});
