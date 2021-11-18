Ext.require([
'Extux.form.field.PdTableCombox', 
'Extux.grid.column.PdTableColumn', 
'Extux.grid.column.LinkedColumn', 
'Extux.grid.column.ButtonColumn', 
'Extux.grid.plugin.CellTipPlugin', 
'Extux.flash.FlexPaper',
'Extux.form.field.MultiFile'
]);

/**
 * 多附件上傳支持
 */
Ext.define('Extux.form.MultiFileUpload', {
	extend : 'Ext.window.Window',
	alias : 'widget.multifileuploadwin',
	border : false,
	readOnly : false,
	uploading : false,
	groupNo : null,
	width : 600,
	modal : true,
//	closeAction : 'hide',
	afffixState : true,//控制附件狀態是否隱藏
	fileFilter : Ext.emptyFn(),

	//初始化組建
	initComponent : function() {
		var me = this,
			delable = window.juri ? window.juri.juriCheck('btnDelete') : true,
			editable = window.juri ? window.juri.juriCheck('btnDelete') : true, loginUser;
		Ext.Ajax.request({
			url : contextPath + '/pub/queryLoginUserInfo.action',
			success : function(response, opts) {
				loginUser = Ext.decode(response.responseText);
			},
			failure : function(response, opts) {
				Ext.Msg.alert('獲取登錄信息', '獲取登錄用戶信息錯誤!')
			}
		});

		Ext.apply(me, {
			height : me.readOnly ? 200 : 300,
			layout : {
				type : 'vbox',
				align : 'stretch'
			},
			items : [{
				xtype : 'form',
				autoHeight : true,
				bodyPadding : '5 10 0 10',
				border : false,
				hidden : me.readOnly,
				items : [{
					xtype : 'fieldset',
					hidden : me.afffixState ? false : true,
					title : '附件狀態',
					autoHeight : true,
					items : [{
						xtype : 'radiogroup',
						width : 350,
						labelWidth : 80,
						fieldLabel : '機密等級',
						items : [{
							boxLabel : '一般',
							name : 'affixLevel',
							inputValue : '1',
							checked : true
						}, {
							boxLabel : '密',
							name : 'affixLevel',
							inputValue : '2'
						}, {
							boxLabel : '機密',
							name : 'affixLevel',
							inputValue : '3'
						}, {
							boxLabel : '極機密',
							name : 'affixLevel',
							inputValue : '4'
						}]
					}, {
						xtype : 'radiogroup',
						labelWidth : 80,
						fieldLabel : '可否下載',
						width : 225,
						items : [{
							boxLabel : '可以',
							name : 'isDownloadable',
							inputValue : 'Y',
							checked : true
						}, {
							boxLabel : '否',
							name : 'isDownloadable',
							inputValue : 'N'
						}]
					}]
				}, {
					layout : 'hbox',
					border : false,
					autoHeight : true,
					items : [{
						xtype : 'multifilefield',
						name : "txtFile",
						margin : '0 10 10 3',
						buttonText : '瀏覽...',
						msgTarget : 'under',
						width : 400,
						listeners : {
							change : function(txt, value) {
								if (!value)
									return;
								var pathSplit = value.indexOf('/') == -1 ? "\\" : "/";
								var lastsplit = value.lastIndexOf(pathSplit),
									fileName = value.substring(lastsplit + 1, value.length),
									ext = fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length);
								if (me.fileFilter) {
									me.fileFilter(txt, value, fileName, ext);
								}
							}
						}
					}, {
						id : 'btnUpload',
						itemId: 'btnUpload',
						xtype : 'button',
						text : "上傳",
						handler : function() {
							me.uploadFile();
						}
					}, {
						xtype : 'hidden',
						name : 'groupNo'
					}]
				}]
			}, {
				xtype : 'grid',
				flex : 1,
				plugins : [Ext.create('Ext.grid.plugin.CellEditing', {
					clicksToEdit : 1,
					listeners : {
						beforeedit : function(editor, e) {
							if (me.readOnly)
								return false;
							if (loginUser && e.record.get('creater') == loginUser.userNo) {
								return true;
							} else {
								return false;
							}
						}
					}
				}), Ext.create('Extux.grid.plugin.CellTipPlugin')],
				store : Ext.create('Ext.data.Store', {
					fields : [{
						name : 'affixId',//主鍵ID
						type : 'number'//data_length=22
					}, {
						name : 'afffixGroupNo',//分???
						type : 'string'//data_length=20
					}, {
						name : 'itemNo',//項次
						type : 'number'//data_length=22
					}, {
						name : 'uploadDate',//上傳日期
						type : 'date'//data_length=7
					}, {
						name : 'uploadUser',//上傳人
						type : 'string'//data_length=200
					}, {
						name : 'uploadIp',//上傳IP
						type : 'string'//data_length=20
					}, {
						name : 'subSystem',//系統別
						type : 'string'//data_length=10
					}, {
						name : 'fileRemark',//文件備注
						type : 'string'//data_length=50
					}, {
						name : 'fileOldName',//文件原名
						type : 'string'//data_length=100
					}, {
						name : 'fileSize',//文件大小
						type : 'number'//data_length=22
					}, {
						name : 'isEnable',//資料是否有效
						type : 'string'//data_length=1
					}, {
						name : 'creater',//創建人
						type : 'string'//data_length=10
					}, {
						name : 'createDate',//創建時間
						type : 'date'//data_length=7
					}, {
						name : 'ownerDept',//資料所屬部門
						type : 'string'//data_length=10
					}, {
						name : 'modifyUser',//修改人
						type : 'string'//data_length=10
					}, {
						name : 'modifyDate',//修改時間
						type : 'date'//data_length=7
					}, {
						name : 'affixLevel',//附件等級 1一般件 2密件 3機密件 4極機密件
						type : 'string'//data_length=22
					}, {
						name : 'isDownloadable',//是否可下載YN
						type : 'string'//data_length=1
					}, {
						name : 'userPurview',//是否有權限
						type : 'string'//data_length=1
					}],
					proxy : {
						type : 'ajax',
						api : {
							read : contextPath + '/pub/affix!getGroupAffix.action'
						},
						reader : {
							type : 'json',
							root : 'data'
						}
					}
				}),
				buttonAlign : 'right',
				buttons : [{
					scale : 'medium',
					width : 120,
					itemId : 'btnSave',
					text : '保存(S)',
					tooltip : 'Ctrl+Alt+S',
					hidden : me.readOnly,
					handler : function() {
						me.syncAffixInfo();
						me.updateAffixGroupNoIfZero();
						me.close();
					}
				}],
				columns : [Ext.create('Ext.grid.RowNumberer'), {
					xtype : 'buttoncolumn',
					width : 60,
					header : '下载/删除',
					align : 'center',
					items : [{
						icon : contextPath + '/resources/img/icons/disk_download.png',
						tooltip : '下载',
						handler : function(view, rowIdx, cellIndex, e) {
							var affix = view.store.getAt(rowIdx);
							window.open(contextPath + '/pub/affix!download.action?affixId=' + affix.get('affixId'));
						},
						beferRender : function(item, meta, record, row, col, store, view) {
							return record.get('userPurview') == 'Y' && record.get('isDownloadable') == 'Y';
						}
					}, {
						icon : contextPath + '/resources/img/icons/delete.png',
						tooltip : '删除',
						handler : function(view, rowIdx, cellIndex, e) {
							var affix = view.store.getAt(rowIdx);
							Ext.Msg.confirm('刪除附件', '你確定要刪除<font color="red">' + affix.get('fileOldName') + '</font>附件嗎？', function(btnId) {
								if (btnId == 'yes') {
									Ext.Ajax.request({
										url : contextPath + '/pub/affix!removeAffix.action?affixId=' + affix.get('affixId'),
										success : function(response, opts) {
											var obj = Ext.decode(response.responseText);
											if (obj.success) {
												view.store.removeAt(rowIdx);
												if (obj.count == 0) {
													me.fireEvent('removeaffixno', me, affix.afffixGroupNo);
													me.setAffixNo(null);
												}
											} else {
												Ext.Msg.alert('刪除附件', '刪除附件信息錯誤!')
											}
										},
										failure : function(response, opts) {
											Ext.Msg.alert('刪除附件', '無法提交服務器刪除附件!')
										}
									});
								}
							})
						},
						beferRender : function(item, meta, record, row, col, store, view) {
							if (me.readOnly)
								return false;
							return (record.get('userPurview') == 'Y' && delable) || (loginUser && record.get('creater') == loginUser.userNo);
						}
					}]
				}, {
					xtype : 'linkedcolumn',
					width : 150,
					align : 'center',
					text : '文件(點擊預覽)',// dataType is string
					dataIndex : 'fileOldName',//文件原名
					getStyle : function(v, meta) {
						meta.style = 'text-align:left;';
					},
					handler : function(view, recordIndex, cellIndex, e, record, row) {
						if (record.get('userPurview') == 'Y' || (loginUser && record.get('creater') == loginUser.userNo)) {
							me.preViewAffix(record);
						} else {
							Ext.Msg.alert('查看附件', '你無權查看此附件！');
						}
					}
				}, {
					xtype : 'pdtablecolumn',
					tableName : 'PD_AFFIX',
					columnName : 'AFFIX_LEVEL',
					width : 80,
					align : 'center',
					text : '附件等級',// dataType is number
					dataIndex : 'affixLevel'//附件等級 1一般件 2密件 3機密件 4極機密件
				}, {
					xtype : 'datecolumn',
					format : 'Y/m/d',
					width : 80,
					align : 'center',
					text : '上傳日期',// dataType is date
					dataIndex : 'uploadDate'//上傳日期
				}, {
					width : 80,
					align : 'center',
					text : '上傳人',// dataType is string
					dataIndex : 'uploadUser'//上傳人
				}, {
					width : 100,
					text : '上傳IP',// dataType is string
					align : 'center',
					dataIndex : 'uploadIp'//上傳IP
				}, {
					width : 80,
					text : '文件大小',// dataType is number
					align : 'center',
					dataIndex : 'fileSize',//文件大小
					renderer : function(v) {
						return Ext.util.Format.number((v / 1024), '0.00') + 'KB';
					}
				}, {
					width : 150,
					align : 'center',
					text : '文件備注',// dataType is string
					dataIndex : 'fileRemark',//文件備注
					field : {
						xtype : 'textareafield',
						maxLength : 25,
						tip : '文件備注'
					}
				}, {
					width : 50,
					text : '下載',// dataType is string
					hidden : me.readOnly,
					align : 'center',
					dataIndex : 'isDownloadable',//是否可下載YN
					renderer : function(v) {
						if (v == 'Y') {
							return '是'
						} else {
							return '否';
						}
					},
					field : {
						xtype : 'combobox',
						store : Ext.create('Ext.data.Store', {
							fields : ['abbr', 'name'],
							data : [{
								"abbr" : "Y",
								"name" : "是"
							}, {
								"abbr" : "N",
								"name" : "否"
							}]
						}),
						queryMode : 'local',
						displayField : 'name',
						valueField : 'abbr'
					}
				}],
				viewConfig : {
					getRowClass : function(record, rowIndex, rowParams, store) {
						return (record.get("userPurview") == 'Y' || (loginUser && record.get('creater') == loginUser.userNo)) ? "" : "noJuri";
					}
				},
				listeners : {
					select : function(sm, record, idx) {
						var level = record.get('affixLevel'),
							download = record.get('isDownloadable');
						me.down('form').getForm().getFields().each(function(f) {
							if (f.getName() == 'affixLevel') {
								f.setValue(level == f.inputValue);
							} else if (f.getName() == 'isDownloadable') {
								f.setValue(download == f.inputValue);
							}
						});
					}
				}
			}],
			listeners : {
				afterrender : function(cont) {
					if (me.groupNo) {
						me.setAffixNo(me.groupNo);
					}
					var keyMap = cont.getKeyMap();
					keyMap.on(27, me.onEsc, me);
					keyMap.on(Ext.EventObject.U, function() {
						var btn = me.down('#btnUpload');
						btn.handler();
					}, me);
					keyMap.on(Ext.EventObject.S, function() {
						var btnSave = me.down('#btnSave');
						btnSave.handler();
					}, me);
				},
				beforehide : function(win) {
					win.down('form').getForm().clearInvalid();
				},
				show : function(p) {
					p.getKeyMap().enable();
					if (p.readOnly) {
						p.down('gridpanel').focus();
					} else {
						//p.down('filefield').focus();
					}
				},
				hide : function(p) {
					p.getKeyMap().disable();
					Ext.defer(function() {
						me.focus();
					}, 100);
				}
			}
		});
		me.callParent(arguments);
		me.addEvents('updateaffixno');
	},
	updateAffixGroupNoIfZero : function() {
		var me = this,
			grid = me.down('gridpanel');
		if (grid.getStore().getCount() == 0) {
			me.fireEvent('updateAffixGroupNoIfZero');
		}
	},

	//更新附件信息
	syncAffixInfo : function() {
		var me = this,
			grid = me.down('gridpanel'),
			sm = grid.getSelectionModel(),
			rs = sm.getSelection(),
			form = me.down('form').getForm(),
			store = grid.store;

		if (Ext.isArray(rs) && rs.length > 0) {
			form.getFields().each(function(f) {
				if (f.getName() == 'affixLevel') {
					if (f.getValue() == true) {
						rs[0].set('affixLevel', f.inputValue);
					}
				} else if (f.getName() == 'isDownloadable') {
					if (f.getValue() == true) {
						rs[0].set('isDownloadable', f.inputValue);
					}
				}
			});
		}
		var mr = store.getUpdatedRecords() || [],
			data = [];
		if (mr.length > 0) {
			Ext.each(mr, function(r) {
				data.push(r.data);
			});
			Ext.Ajax.request({
				url : contextPath + '/pub/affix!updateAffix.action',
				jsonData : {
					data : data
				},
				success : function(response, opts) {
					Ext.each(mr, function(r) {
						r.commit();
					});
				},
				failure : function(response, opts) {
					Ext.Msg.alert('同步信息', '提交附件信息錯誤,無法提交附件信息到服務器!');
				}
			});
		}
	},
	//附件預覽
	preViewAffix : function(record) {
		var me = this;
//		me.el.mask('正在讀取附件信息...');
		window.top.consultAffixById(record.get('affixId'));
//		Ext.Ajax.request({
//			url : contextPath + '/pub/affix!previewAffix.action',
//			params : {
//				affixId : record.get('affixId')
//			},
//			method : 'POST',
//			callback : function(options, success, response) {
//				me.el.unmask();
//				if (success) {
//					var obj = Ext.decode(response.responseText);
//					if (obj.success) {
//						var content;
//						if (obj.contentType == 'swf') {
//							Ext.create('Ext.window.Window', {
//								title : record.get('fileOldName'),
//								height : 600,
//								width : 800,
//								maximizable : true,
//								maximized : true,
//								autoScroll : true,
//								layout : 'fit',
//								items : [{
//									xtype : 'flexpaper',
//									swfFile : contextPath + '/previewTmp/' + obj.fileName
//								}]
//							}).show();
//						} else if (obj.contentType == 'html') {
//							Ext.create('Ext.window.Window', {
//								title : record.get('fileOldName'),
//								height : 600,
//								width : 800,
//								maximizable : true,
//								maximized : true,
//								autoScroll : true,
//								layout : 'fit',
//								html : obj.content
//							}).show();
//						}
//					} else {
//						Ext.Msg.alert('預覽文件', '服務器無法提供此附件的預覽');
//					}
//				} else {
//					Ext.Msg.alert('預覽文件', '提取文件附件錯誤');
//				}
//			}
//		});
	},
	//設置附件編號
	setAffixNo : function(affixNo) {
		if (this.rendered) {
			var grid = this.down('gridpanel'),
				store = grid.store;
			affixNo = affixNo || '';
			Ext.merge(store.proxy.extraParams, {
				groupNo : affixNo
			});
			this.down('hiddenfield[name=groupNo]').setValue(affixNo);
			if (affixNo) {
				store.load();
			} else {
				store.removeAll();
			}
		}
		this.groupNo = affixNo;
		this.setTitle((affixNo || '') + ' 文件信息')
	},
	//設置附件編號
	getAffixNo : function() {
		if (this.rendered) {
			var form = this.down('form'),
				affixNo = form.down('hiddenfield[name=groupNo]').getValue();
			return affixNo;
		} else {
			return null;
		}
	},
	setReadOnly : function(readonly) {
		this.readOnly = readonly;
		if (!this.rendered) {
			this.doAutoRender();
			this.hide();
		}
		this.down('form').setVisible(!readonly);
	},
	//上傳文件
	uploadFile : function() {
		var me = this,
			grid = me.down('gridpanel'),
			store = grid.store,
			fpanel = me.down('form'),
			txtfile = fpanel.down('multifilefield[name=txtFile]');
		if (!txtfile.getValue()) {
			txtfile.markInvalid("請選擇要上傳的文件");
			return;
		} else {
			txtfile.clearInvalid();
		}
		me.uploading = true;
		me.body.mask('正在上传...');
		fpanel.getForm().submit({
			url : contextPath + '/pub/affix!upload.action',
			success : function(fp, rs) {
				me.uploading = false;
				me.body.unmask();
				var data = rs.result.data;
				if (!me.groupNo && data && data.length > 0) {
					me.groupNo = data[0].afffixGroupNo;
					me.down('hiddenfield[name=groupNo]').setValue(me.groupNo);
					Ext.merge(store.proxy.extraParams, {
						groupNo : me.groupNo
					});
					me.fireEvent('updateaffixno', me, me.groupNo);
				}
				store.load();
			},
			failure : function(form, action) {
				me.uploading = false;
				me.body.unmask();
				switch (action.failureType) {
					case Ext.form.action.Action.CLIENT_INVALID :
						Ext.Msg.alert('上传失败', '上传文件路径读取异常');
						break;
					case Ext.form.action.Action.CONNECT_FAILURE :
						Ext.Msg.alert('上传失败', '连接服务器失败');
						break;
					case Ext.form.action.Action.SERVER_INVALID :
						Ext.Msg.alert('上传失败', action.result.message||action.result.errorMsgDesc);
				}
			}
		});
	},
	//清除文件
	cleanFile : function() {
		var me = this,
			store = grid = me.down('gridpanel').store,
			form = me.down('form').getForm();
		store.removeAll();
		form.reset();
	}
});
/**
 * 上傳文件窗口 Ext.define('Extux.window.MultiFileUploadWindow', { extend :
 * 'Ext.window.Window', alias : 'widget.multifileuploadwindow', width : 800,
 * height : 400, closeAction : 'hide', readOnly : false, initComponent :
 * function() { var me = this; Ext.apply(me, { layout : 'fit', border : false,
 * items : [{ xtype : 'multifileupload', readOnly : me.readOnly }], listeners : {
 * scope : me, afterrender : function(win) { var mul =
 * win.down('multifileupload'); mul.on('updateaffixno', me.updateAffixNo, me);
 * mul.on('removeAffixNo', me.removeAffixNo, me); }, beforehide : function(win) {
 * var upload = win.down('multifileupload'); if (upload.uploading) {
 * Ext.Msg.alert('上傳附件', '系統正在上傳附件信息,請稍等'); return false; } } } });
 * me.callParent(arguments); }, removeAffixNo : function(panel, affixNo) {
 * this.fireEvent('removeaffixno', panel, affixNo); }, updateAffixNo :
 * function(panel, affixNo) { this.fireEvent('updateaffixno', panel, affixNo); },
 * setAffixNo : function(affixNo) { var multifileupload =
 * this.down('multifileupload'); if (this.rendered) {
 * multifileupload.setAffixNo(affixNo); } else { multifileupload.groupNo =
 * affixNo; } this.setTitle((affixNo || '') + ' 文件信息') }, getAffixNo :
 * function() { var me = this, multifileupload = me.down('multifileupload');
 * return multifileupload.groupNo; }, setReadOnly : function(readonly) { var me =
 * this, multifileupload = me.down('multifileupload');
 * multifileupload.setReadOnly(readonly); }, //清除文件 cleanFile : function() { var
 * me = this, multifileupload = me.down('multifileupload');
 * multifileupload.cleanFile(); } });
 */
/**
 * 文件column
 */
Ext.define('Extux.grid.column.MultiFileUploadColumn', {
	extend : 'Ext.grid.column.Column',
	alias : ['widget.multifileuploadcolumn'],
	alternateClassName : 'Ext.grid.MultiFileColumn',

	actionIdRe : new RegExp(Ext.baseCSSPrefix + 'multi-action-column'),

	actionSelector : 'x-multi-action-column',
	afffixState : true,
	sortable : false,
	uploadWin : null,
	readOnly : false,
    viewText: null, //用戶自己決定有附件顯示的內容   默認為附件編號
	emptyText : '無附件',
	//構造方法
	constructor : function(config) {
		var me = this,
			cfg = Ext.apply({}, config),
			tooltip = config.tooltip || me.tooltip || {};

		me.renderer = function(v, meta, record, row, col, store, view) {
			//響應用戶自己的renderer
			if (Ext.isFunction(cfg.format)) {
				v = cfg.format(v, meta, record, row, col, store, view);
			}
			var style = '';
			if (!v && !me.emptyText) {
				return '';
			}
			if (!v) {
				style = 'color: #6B7476;';
			}
			//在請求前，調用item.beferRender，如果返回false，則不添加這個action button
			if (Ext.isFunction(me.beferRender) && me.beferRender.call(me, v, meta, record, me.uploadWin) === false) {
				return '';
			}
			var tip = '';
			if (Ext.isString(tooltip)) {
				tip += tooltip;
			} else if (tooltip.title) {
				tip += tooltip.title;
			} else if (tooltip.html) {
				tip += tooltip.html;
			}
			if (Ext.isFunction(me.getTipContent)) {
				var tipContent = me.getTipContent.call(me, meta, record, row, col, store, view);
				if (tipContent && Ext.isString(tipContent)) {
					tip += ': ' + tipContent;
				}
			}
			tip += 'data-qtitle="' + tip + '" ';
			var value=v;
			if(!Ext.isEmpty(v) && !Ext.isEmpty(me.viewText)){
			    value=me.viewText;
			}
			v = '<a href="#" ' + tip + ' class="' + me.actionSelector + ' ' + Ext.baseCSSPrefix + 'action-linked-col ' + (me.disabled ? Ext.baseCSSPrefix + 'item-disabled' : ' ') + ' ' + (Ext.isFunction(me.getClass) ? me.getClass.apply(me.scope || me.scope || me, arguments) : (me.iconCls || '')) + '"' + ' style="' + style + '">' + (value || me.emptyText) + '</a>';
			return v;
		};

		me.callParent([cfg]);

	},
	destroy : function() {
		delete this.renderer;
		delete this.uploadWin
		return this.callParent(arguments);
	},
	processEvent : function(type, view, cell, rowIdx, cellIndex, e) {
		var me = this,
			target = e.getTarget(),
			match = target.className.match(me.actionIdRe),
			fn = this.beforeAlert,
			record = view.store.getAt(rowIdx);
		var key = type == 'keydown' && e.getKey();
		if (match) {
			if (type == 'click' || (key == e.ENTER || key == e.SPACE)) {
				me.destoryUploadWin();
				me.initUploadWin();
				if (Ext.isFunction(fn) && fn.call(me, record, me.uploadWin) === false) {
					return false;
				}
				me.uploadWin.show();
				me.uploadWin.loadRecord = record;
				me.uploadWin.setAffixNo(record.get(me.dataIndex));
			} else if (type == 'mousedown') {
				return false;
			}
		}
		return me.callParent(arguments);
	},
	initUploadWin: function(){
		this.uploadWin = Ext.create('Extux.form.MultiFileUpload', {
			readOnly : this.readOnly,
			fileFilter : this.fileFilter,
			afffixState : this.afffixState
		});
		this.uploadWin.hide();
		this.uploadWin.on('updateaffixno', this.updateAffixNo, this);
		this.uploadWin.on('removeaffixno', this.removeAffixNo, this);
	},
	destoryUploadWin: function(){
		if(this.uploadWin && !this.uploadWin.isDestroyed){
			this.uploadWin.close();
		}
		if(this.uploadWin){
			delete this.uploadWin;
		}
	},
	updateAffixNo : function(panel, affixNo) {
		var me = this;
		if (me.uploadWin.loadRecord) {
			if (this.affixChange) {
				this.affixChange(me.uploadWin.loadRecord, affixNo);
			} else {
				me.uploadWin.loadRecord.set(this.dataIndex, me.uploadWin.getAffixNo());
			}
		}
	},
	removeAffixNo : function(panel, affixNo) {
		var me = this;
		if (me.uploadWin.loadRecord) {
			if (this.affixChange) {
				this.affixChange(me.uploadWin.loadRecord, null);
			} else {
				me.uploadWin.loadRecord.set(this.dataIndex, null);
			}
		}
	},
	affixChange : null
});

Ext.define('Extux.field.MultiFileUploadField', {
	extend : 'Ext.container.Container',
	alias : 'widget.multifileuploadfield',
	mixins : {
		field : 'Ext.form.field.Field'
	},
	readOnly : false,
	disabled : false,
	isFormField : true,
	afffixState : true,
	uploadWin : null,
	labelWidth : 100,
	labelAlign : 'left',
	fieldLabel : '附件信息',
	labelSeparator : ':',
	text : '上傳附件',
	viewText : '查看附件',
	fileText : null,
	hotKey : 'v',
	hotSelector : null,
	name : 'multiaffix',
	width : 300,
	buttonMargin:'0 0 0 4',
	containerMargin:'1 0 3 0',
	initComponent : function() {
		var me = this;
		if (this.readOnly) {
			this.text = this.viewText;
		}
		Ext.apply(this, {
			border : false,
			margin : this.containerMargin,
			layout : {
				type : 'hbox',
				align : 'top'
			},
			items : [{
				xtype : 'label',
				cls : 'x-form-item-label',
				width : this.labelWidth,
				style : 'text-align: ' + this.labelAlign,
				html : this.fieldLabel + me.labelSeparator
			}, {
				itemId : 'multibutton',
				margin : this.buttonMargin,
				xtype : 'button',
				text : this.text,
				hotKey : this.hotKey,
				hotSelector : this.hotSelector,
				tooltip : 'Ctrl+Alt+V',
				disabled : this.disabled,
				handler : function() {
					var affixNo = me.down('#multihiddenfield').getValue();
					me.onClick(affixNo);
				}
			}, {
				itemId : 'multihiddenfield',
				xtype : 'hiddenfield',
				name : this.name
			}]
		});

		this.callParent();
	},
	initUploadWin: function(){
		this.uploadWin = Ext.create('Extux.form.MultiFileUpload', {
			readOnly : this.readOnly,
			fileFilter : this.fileFilter,
			afffixState : this.afffixState
		});
		this.uploadWin.hide();
		this.uploadWin.on('updateaffixno', this.updateAffixNo, this);
		this.uploadWin.on('removeaffixno', this.removeAffixNo, this);
		this.uploadWin.on('updateAffixGroupNoIfZero', this.removeAffixGroupNo, this);
	},
	destoryUploadWin: function(){
		if(this.uploadWin && !this.uploadWin.isDestroyed){
			this.uploadWin.close();
		}
		if(this.uploadWin){
			delete this.uploadWin;
		}
	},
	destroy : function() {
		this.destoryUploadWin();
		return this.callParent(arguments);
	},
	removeAffixGroupNo : function() {
		var me = this;
		me.setValue(null);
		me.destoryUploadWin();
	},
	setReadOnly : function(bo) {
		var me = this,
			btn = this.down('#multibutton');
		this.readOnly = bo;
		if (this.readOnly) {
			btn.setText(this.viewText);
		} else {
			btn.setText(this.text);
		}
		if (this.uploadWin && !this.uploadWin.isDestroyed) {
			if (this.readOnly) {
				btn.setText(this.viewText);
				me.uploadWin.down('#btnSave').hide();
			} else {
				btn.setText(this.text);
				me.uploadWin.down('#btnSave').show();
			}
			me.uploadWin.setReadOnly(bo);
		}
	},
	updateAffixNo : function(panel, affixNo) {
		this.setValue(affixNo);
		if(this.fileText!=null){
		    this.down('#multibutton').setText(this.fileText);
		}else{
		    this.down('#multibutton').setText(affixNo);
		}
	},
	removeAffixNo : function(panel, affixNo) {
		this.setValue(affixNo);
		this.down('#multibutton').setText(this.readOnly ? this.viewText : this.text);
	},
	onClick : function(affixNo) {
		var me = this,
			fn = this.beforeAlert;
		if (Ext.isFunction(fn) && fn.call(me, record, me.uploadWin) === false) {
			return false;
		}
		me.initUploadWin();
		me.uploadWin.show();
		me.uploadWin.setAffixNo(affixNo);
	},
	beforeAlert : null,
	getValue : function() {
		return this.down('#multihiddenfield').getValue();
	},
	setValue : function(v) {
		this.down('#multihiddenfield').setValue(v);
		this.down('#multibutton').setText(v || this.readOnly ? this.viewText : this.text);
	},
	//form自動獲取fieldValues
	getModelData : function(includeEmptyText) {
		var me = this,
			data = null;
		if (!me.disabled) {
			data = {};
			data[me.getName()] = me.getValue();
		}
		return data;
	},
	//form自動獲取fieldValues
	getSubmitData : function(includeEmptyText) {
		var me = this,
			data = null;
		if (!me.disabled) {
			data = {};
			data[me.getName()] = me.getValue();
		}
		return data;
	}
});