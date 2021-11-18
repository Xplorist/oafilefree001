if (window.top.isLogined === undefined)
	window.top.isLogined = false;

Ext.onReady(function() {
	if (!window.top.isLogined) {
		Ext.Ajax.request({
			url : contextPath + '/login!isLogin.action',
			success : function(response, opts) {
				if (response.responseText == 'true') {
					window.top.isLogined = true;
				}
			},
			failure : function(response, opts) {
				Ext.Msg.alert('提示', '驗證登錄用戶異常');
			}
		});
	}
	Ext.Ajax.on('beforerequest', function(conn, opt) {
		if(!opt.url || opt.url.indexOf('/workflow/') == -1)return;
		if (!window.top.isLogined) {
			var plugin = document.getElementById('foxjcplugin'),
				localUser = window.top.loginUser;
			if (!localUser) {
				if (!plugin && Ext.isReady) {
					plugin = document.body.insertAdjacentHTML('afterEnd', '<object id="foxjcplugin" type="application/x-foxjc" width="0" height="0"></object>');
					plugin = document.getElementById('foxjcplugin');
				}
				if (plugin && plugin.getPcLoginUser) {
					localUser = plugin.getPcLoginUser();
				}
			}
			if (localUser) {
				var url = opt.url;
				if (url.indexOf('?') == -1) {
					url = url + '?pcUser=' + localUser;
				} else {
					url = url + '&pcUser=' + localUser;
				}
				opt.url = url;
			} else if(window.loginUser){
				var url = opt.url;
				if (url.indexOf('?') == -1) {
					url = url + '?pcUser=' + window.loginUser.userNo;
				} else {
					url = url + '&pcUser=' + window.loginUser.userNo;
				}
				opt.url = url;
			} else {
				Ext.Ajax.request({
					async : false,
					url : contextPath + '/login!getLoginUserInfo.action',
					success : function(response) {
						var obj = Ext.decode(response.responseText);
						if(obj.success){
							window.loginUser = obj;
							var url = opt.url;
							if (url.indexOf('?') == -1) {
								url = url + '?pcUser=' + window.loginUser.userNo;
							} else {
								url = url + '&pcUser=' + window.loginUser.userNo;
							}
							opt.url = url;
						}else{
							Ext.Msg.alert('提示', '無法獲取登錄用戶');
						}
					},
					failure : function(response) {
						Ext.Msg.alert('提示', '無法獲取登錄用戶');
					}
				});
			}
		}
	});
});

Ext.define('Foxjc.Esign', {
	singleton : true,
	/**
	 * 開始簽核
	 * 
	 * <pre>
	 * startProcessByFormNo( 
	 *      String formNo, 
	 *      final List&lt;FoxModel&gt; modeles,
	 *      String userOrderId, 
	 *      String userOrderNo, 
	 *      String userOrderDescribe,
	 *      final String scopeCode, 
	 *      Map&lt;String,Object&gt; vars,
	 *      String specificUser 
	 *  )
	 * </pre>
	 * 
	 * @param userOrderIds 用戶orderIds，多單據id使用','連接
	 * @param userOrderNos 用戶orderNos，多單據orderNo使用','連接
	 * @param userOrderDescribe 業務系統的關鍵信息描述
	 * @param scopeCode 簽核作用域
	 * @param vars 簽核上下文
	 * @param multiOrder boolean = true：把多單據ids和nos直接傳輸到服務器，把他當作一個ids使用，進行簽核 =
	 *            false：把ids和nos分割成數組，後臺形成多次啟動簽核
	 * @param specificUser 指定操作用戶（如果登錄無效)
	 */
	startSign : function(config) {
		var me = this;
		if (!config.formNo) {
			Ext.Msg.alert('初始化簽核', '傳入formNo不能為空，請檢查傳入參數');
		} else if (!config.userOrderId) {
			Ext.Msg.alert('初始化簽核', '傳入userOrderId不能為空，請檢查傳入參數');
		} else if (config.userOrderId.length > 600) {
			Ext.Msg.alert('初始化簽核', '你選擇的單據太多了');
		} else if (!config.userOrderNo) {
			Ext.Msg.alert('初始化簽核', '傳入userOrderNo不能為空，請檢查傳入參數');
		} else if (config.userOrderNo.length > 600) {
			Ext.Msg.alert('初始化簽核', '你選擇的單據太多了');
		} else if (!config.userOrderDescribe) {
			Ext.Msg.alert('初始化簽核', '傳入userOrderDescribe不能為空，請檢查傳入參數');
		} else if (config.userOrderDescribe.length > 100) {
			Ext.Msg.alert('初始化簽核', '傳入的userOrderDescribe最多100個字');
		} else if (!config.scopeCode) {
			Ext.Msg.alert('初始化簽核', '傳入scopeCode不能為空，請檢查傳入參數');
		} else {
			me.createSignConfigWindow(config);
		}
	},
	createSignConfigWindow : function(data) {
		var me = this;
		var win = Ext.create('Extux.window.SignWindow', {
			id : 'sign-build-win',
			height : 330,
			width : 490,
			formNo : data.formNo,
			config : {
				userOrderId : data.userOrderId,
				userOrderNo : data.userOrderNo,
				userOrderDescribe : data.userOrderDescribe,
				scopeCode : data.scopeCode,
				/*
				 * vars 裏可以包含:
				 orderLevel : data.orderLevel,//表單等級：1一般2次重要3重要4非常重要5極重要
				 secret : data.secret,//機密等級：1一般2機密
				 autoForkFlow: data.autoForkFlow//通用表單可以設置允許自動設置並行會簽
				 */
				vars : data.vars || {},
				multiOrder : data.multiOrder || false,
				newTaskType : data.newTaskType || 'userAddTask',
				calculation : data.calculation === false ? false : true,//是否演算路徑
				specificUser : data.specificUser
			},
			beforeLoadModel : data.beforeLoadModel || Ext.emptyFn,
			beforeSubmit : data.beforeSubmit || Ext.emptyFn,
			afterSubmit : data.afterSubmit || Ext.emptyFn,
			title : data.userOrderNo + '審核配置'
		});
		win.on({
			show : function() {
				if (Ext.isFunction(data.beforeShowWindow)) {
					data.beforeShowWindow();
				}
			},
			close : function() {
				if (Ext.isFunction(data.afterShowWindow)) {
					data.afterShowWindow();
				}
			}
		});
		win.show();
	}
});

Ext.data.Types.OBJECT = {
	convert : function(v) {
		return (!v) ? [] : (typeof v == 'string') ? Ext.decode(v) : v;
	},
	sortType : Ext.data.SortTypes.none,
	type : 'object'
};
Ext.draw.Surface.override({
	onAdd : function(sprite) {
		var group = sprite.group,
			draggable = sprite.draggable, groups, ln, i;
		if (group) {
			groups = [].concat(group);
			ln = groups.length;
			for (i = 0; i < ln; i++) {
				group = groups[i];
				this.getGroup(group).add(sprite);
			}
			delete sprite.group;
			sprite.groupId = group;
		}
		if (draggable) {
			sprite.initDraggable();
		}
	}
});
Ext.define('Extux.model.TaskModel', {
	extend : 'Ext.data.Model',
	//model 的主鍵
	idProperty : 'modelId',
	//model 的字段
	fields : [{
		name : 'modelId',
		type : 'string'
	}, {
		name : 'formId',
		type : 'string'
	}, {
		name : 'modelNo',
		type : 'string'
	}, {
		name : 'modelLevel',
		type : 'int'
	}, {
		name : 'taskLevel',
		type : 'int'
	}, {
		name : 'modelOrder',
		type : 'int'
	}, {
		name : 'modelName',
		type : 'string'
	}, {
		name : 'signerScope',
		type : 'string'
	}, {
		name : 'allowEmpty',
		type : 'string'
	}, {
		name : 'signActorType',
		type : 'string'
	}, {
		name : 'performType',
		type : 'string'
	}, {
		name : 'form',
		type : 'string'
	}, {
		name : 'layout',
		type : 'string'
	}, {
		name : 'autoExecute',
		type : 'string'
	}, {
		name : 'modelType',
		type : 'string'
	}, {
		name : 'modelForm',
		type : 'string'
	}, {
		name : 'signActores',
		type : 'object'
	}, {
		name : 'signActoresStore',
		type : 'object'
	}, {
		name : 'transitiones',
		type : 'object'
	}, {
		name : 'taskType',
		type : 'string'
	}]
});

Ext.define('Extux.form.field.SignEmpEnumField', {
	extend : 'Ext.form.field.ComboBox',
	alias : 'widget.signempenumfield',
	multiSelect: true,
	allValueField: [],
	
	initComponent : function() {
		var me = this;
		Ext.apply(me, {
			store : Ext.create('Ext.data.Store', {
				fields : ['scopeCode', 'actorEmpNo', 'actorEmpName', 'actorEmpEmail']/*,
				proxy : {
					actionMethods : {
						create : "POST",
						read : "POST",
						update : "POST",
						destroy : "POST"
					},
					type : 'ajax',
					url : contextPath + '/workflow/formManager!queryModelEnumActor.action',
					reader : {
						type : 'json',
						root : 'data'
					}
				}*/
			}),
			queryMode : 'local',
			displayField : 'actorEmpName',
			valueField : 'actorEmpNo',
			listConfig : {
				loadingText : '正在加載...',
				emptyText : '未設置有效審核人',
				getInnerTpl : function() {
					return '{actorEmpName}/{actorEmpEmail}';
				}
			}
		});
		this.callParent(arguments);
	},
	loadData : function(actors){
		var me = this,
			store = me.store;
		store.removeAll();
		me.reset();
		this.allValueField.length = 0;
		store.loadData(actors);
	},

	setValue : function(value) {
		var me = this,
			store = me.store,
			r = me.editRecord, grid, win;
		if (store.indexOf(value) != -1) {
			this.callParent(value);
		} else if (Ext.isArray(value) && value.length > 0) {
			/*var v = value[0];
			if (store.indexOf(v) != -1) {
				this.callParent([v]);
				this.allValueField = v.data;
			} else {
				var r = store.findRecord('actorEmpNo', v.actorEmpNo);
				this.callParent([r]);
				this.allValueField = r.data;
			}*/
			this.allValueField.length = 0;
			for(var i=0;i<value.length;i++){
				this.allValueField.push(value[i].data||value[i]);
			}
			this.callParent([value]);
		}else{
			this.callParent(me.emptyText);
		}
	},
	getValue : function() {
		var me = this,
			store = me.store,
			v = me.value;
		if (this.allValueField.length > 0) {
			return [].concat(this.allValueField);
		} else {
			return [];
		}
	},
	isEqual: function(v1, v2) {
        if(v1 == v2)return true;
        if(!v1 || !v2)return false;
        if(v1.length != v2.length)return false;
        var a1 = [], a2 = [];
        for(var i=0;i<v1.length;i++){
        	a1.push(v1[i].actorEmpNo);
        }
        Ext.Array.sort(a1);
        for(var i=0;i<v2.length;i++){
        	a2.push(v2[i].actorEmpNo);
        }
        Ext.Array.sort(a2);
        for(var i=0;i<a1.length;i++){
        	if(a1[i] != a2[i])return false;
        }
        return true;
    },
    findRecord: function(field, value) {
        var ds = this.store,
        	v = Ext.isString(value)?value:value.actorEmpNo,
            idx = ds.findExact(field, v);
        return idx !== -1 ? ds.getAt(idx) : false;
    }
});

Ext.define('Extux.form.field.SignEmpField', {
	extend : 'Ext.form.field.Base',
	alias : 'widget.signempfield',
	requires : ['Ext.util.Format', 'Ext.XTemplate'],

	width : null,
	height : null,

	fieldSubTpl : ['<ul id="{id}" title="{displayTip}"', 
		'<tpl if="fieldStyle"> style="{fieldStyle}"</tpl> ', 
		'class="{fieldCls} x-form-field x-form-text">', 
		'<tpl for="emps">', 
		'<li class="{parent.itemSelector}" empno="{actorEmpNo}"><label>{actorEmpName}-{actorEmpEmail}</label>', 
		'<tpl if="!parent.readOnly">', 
		'<a class="{parent.itemTriggerSelector}" style="cursor: pointer;color:red;">X</a>', 
		'</tpl>', 
		'</li>', 
		'</tpl>', 
		'<tpl if="!readOnly"><li><a class="ux-form-multiemp-add-label" href="#">{addLabelText}</a></li></tpl>', 
		'</ul>', {
		compiled : true,
		disableFormats : true
	}],
	fieldStyle : 'width:100%;height:auto;',
	fieldCls : Ext.baseCSSPrefix + 'form-multiemp-field',
	addLabelText : '新增',
	addItemWin : null,
	addItemWinTitle : '查詢人員',
	queryEmpStore : null,

	htmlEncode : false,

	validateOnChange : false,
	itemTriggerImgSrc : contextPath + '/resources/img/icons/cross.png',

	initEvents : Ext.emptyFn,
	itemSelector : 'ext-field-multi-emp-item',
	itemTriggerSelector : 'ext-field-multi-emp-item-trigger',

	submitValue : true,
	dirty : false,
	inquery : false,
	actores : [],
	
	focusable: true,
	focusCls : 'form-multiemp-field-selected',
	

	initComponent : function() {
		var me = this;
		var model = Ext.ModelManager.getModel('Commons.self.EmpBs');
		if (!model) {
			Ext.define('Commons.self.EmpBs', {
				extend : 'Ext.data.Model',
				fields : [{
					name : 'empNo',
					type : 'string'
				}, {
					name : 'empName',
					type : 'string'
				}, {
					name : 'empSex',
					type : 'string'
				}, {
					name : 'deptNo',
					type : 'string'
				}, {
					name : 'deptName',
					type : 'string'
				}, {
					name : 'ssbu',
					type : 'string'
				}, {
					name : 'empPhone',
					type : 'string'
				}, {
					name : 'mailAddress',
					type : 'string'
				}]
			});
		}
		me.queryEmpStore = new Ext.data.Store({
			model : 'Commons.self.EmpBs',
			autoLoad : false,
			pageSize : 10,
			proxy : {
				extraParams : me.extraParams,
				type : 'ajax',
				url : contextPath + '/pub/queryEmpIgnoreSite.action',
				reader : {
					type : 'json',
					totalProperty : 'totalCount',
					messageProperty : 'message',
					root : 'data'
				}
			},
			reload : function(param, fn, scope) {
				var me = this;
				if (param) {
					me.getProxy().extraParams = Ext.merge(me.getProxy().extraParams, param);
				}
				me.currentPage = 1;
				me.removeAll();
				me.load({
					scope : me,
					callback : function(records, operation, success) {
						if (!success) {
							Ext.alert('加載數據異常', decodeObject(operation.error), function() {
								empTxt.win.down('#txtEmpSearch').focus(true);
							});
						} else {
							if (fn instanceof Function) {
								fn.call(scope || me, records);
							}
						}
					}
				});
			}
		});

		this.wrapFocusCls = this.fieldCls + '-focus';
		this.callParent(arguments);
		me.setGrowSizePolicy();
	},

	setGrowSizePolicy : function() {
		if (this.grow) {
			this.shrinkWrap |= 1; // width must shrinkWrap
		}
	},
	isDirty : function() {
		return true;
	},

	isValid : function() {
		return true;
	},
	onChange : function() {
		this.callParent();
		this.autoSize();
	},
	validate : function() {
		return true;
	},
	updateContent : function() {
		var me = this;
		if (me.actores.length > 0) {
			me._updateContent();
			me.initEvents();
			if (me.signActorType == '1' && me.getValue().length == 1) {
				me._hideAddLabel()
			} else {
				me._showAddLabel()
			}
		} else {
			me._updateContent();
		}
	},
	_updateContent : function() {
		var me = this;
		if (!me.rendered) {
			return;
		}
		me.el.down('.x-form-item-body').update(me.getSubTplMarkup());
		if (!this.readOnly) {
			var addLabel = this.el.down('.ux-form-multiemp-add-label');
			this.mon(addLabel, 'click', this.onAddItemLabelClick, this);
		}
	},
	reset : function() {
		var me = this;
		me.beforeReset();
		me.setValue([]);
		me.clearInvalid();
		delete me.wasValid;
	},
	//獲取表單提交的數據
	getSubmitData : function() {
		var me = this,
			data = null, val;
		if (!me.disabled && me.submitValue && !me.isFileUpload()) {
			val = me.getSubmitValue();
			if (val !== null) {
				data = {};
				var v = [];
				for (var i = 0; i < this.actores.length; i++) {
					v.push(this.actores[i].actorEmpName);
				}
				data[me.getName()] = v.join(',');
			}
		}
		return data;
	},

	getSubmitValue : function() {
		return this.processRawValue(this.getRawValue());
	},
	getValue : function() {
		var me = this,
			val = me.actores;
		me.value = val;
		return val;
	},

	setValue : function(value) {
		var me = this;
		me.setRawValue(me.valueToRaw(value));
		me.dirty = true;
		me.updateContent();
		return me.rawValue;
	},
	getRawValue : function() {
		var me = this,
			v = me.actores;
		me.rawValue = v;
		return v.length == 0 ? null : v;
	},

	setRawValue : function(value) {
		var me = this, raw;
		value = value || [];
		if (me.rawValue) {
			raw = me.rawValue;
		}
		me.rawValue = value;
		me.fireEvent('change', me.rawValue, me.actores);
		me.actores = me.rawValue;
		delete raw;

		return value;
	},
	//	getEmpNameByNo : function(empNo){
	//		for (var i = 0; i < this.empNos.length; i++) {
	//			if(this.empNos[i] == empNo){
	//				return this.empNames[i];
	//			}
	//		}
	//	},
	//轉換原始值
	transformRawValue : function(value) {
		return value;
	},
	//
	valueToRaw : function(value) {
		return Ext.clone(value);
	},

	rawToValue : function(rawValue) {
		return rawValue;
	},

	processRawValue : function(value) {
		return value;
	},

	//獲取需要顯示的value
	getDisplayValue : function() {
		return this.getDisplayTip();
	},
	//獲取提示的tip
	getDisplayTip : function() {
		var v = [];
		for (var i = 0; i < this.actores.length; i++) {
			v.push(this.actores[i].actorEmpName);
		}
		return v.join(',');
	},

	afterFirstLayout : function() {
		this.callParent();
		if (Ext.isIE && this.disabled) {
			var el = this.inputEl;
			if (el) {
				el.dom.unselectable = 'on';
			}
		}

		this.mon(Ext.getBody(), 'mousedown', this.onItemElBlur, this);
	},
	onItemElBlur : function(e) {
		var me = this,
			box = me.el.getBox(),
			xy = e.getXY(),
			inbox = false;
		if (me.inquery)return;
		if (xy[0] > box.x && xy[0] < (box.x + box.width) && xy[1] > box.y && xy[1] < (box.y + box.height)) {
			inbox = true;
		} else {
			inbox = false;
		}
		if(inbox)return;
		if(!me.inEditing){
			me.fireEvent('focus', me, e);
			me.inEditing = true;
		}else{
			me.fireEvent('blur', me, e);
			me.inEditing = false;
		}
	},
	//點擊新增，彈出窗口，添加人員
	onAddItemLabelClick : function() {
		var me = this;
		if (!me.addItemWin) {
			me.addItemWin = Ext.create('Ext.window.Window', {
				title : me.addItemWinTitle,
				height : 370,
				width : 450,
				layout : 'fit',
				autoHeight : true,
				closeAction : 'hide',
				items : [{
					xtype : 'grid',
					border : false,
					columns : [Ext.create('Ext.grid.RowNumberer', {
						width : 35
					}), {
						header : '工號',
						dataIndex : 'empNo',
						align : "center",
						flex : 4,
						menuDisabled : true,
						sortable : false,
						renderer : function(value, field) {
							field.style = 'text-align:left !important;cursor: pointer;'
							return value;
						}
					}, {
						header : '姓名',
						dataIndex : 'empName',
						align : "center",
						flex : 3,
						menuDisabled : true,
						sortable : false,
						renderer : function(value, field) {
							field.style = 'text-align:left !important;cursor: pointer;'
							return value;
						}
					}, {
						header : '性別',
						dataIndex : 'empSex',
						align : "center",
						flex : 2,
						menuDisabled : true,
						sortable : false,
						renderer : function(val) {
							return val == '0' ? '女' : val == '1' ? '男' : '';
						}
					}, {
						header : '部門編號',
						dataIndex : 'deptNo',
						align : "center",
						flex : 4,
						menuDisabled : true,
						sortable : false
					}, {
						header : 'SSBU',
						dataIndex : 'ssbu',
						align : "center",
						flex : 3,
						menuDisabled : true,
						sortable : false
					}],
					bbar : [{
						flex : 1,
						xtype : 'pagingtoolbar',
						border : false,
						store : me.queryEmpStore
					}],
					store : me.queryEmpStore,
					tbar : [{
						itemId : 'txtEmpSearch',
						xtype : 'textfield',
						fieldCls: 'no-hot-key',
						//cls : 'search',
						listeners : {
							scope : me,
							specialkey : function(field, e) {
								if (e.getKey() == e.ENTER) {
									e.stopEvent();
									me.handlerQueryEmp(field.getValue());
								}
							}
						}
					}, {
						text : '查詢',
						scope : me,
						icon : contextPath + '/resources/img/icons/page_find.png',
						handler : function() {
							var keyword = me.addItemWin.down('#txtEmpSearch').getValue();
							me.handlerQueryEmp(keyword);
						}
					}, {
						xtype : 'component',
						html : '查詢字段：工號/姓名/部門編號'
					}],
					onStoreLoad: function(store,rs,success){
						var grid = this,
							sm = grid.getSelectionModel();
						//me.callParent(arguments);
						Ext.defer(function(){
						if(rs.length>0){
							sm.selectByPosition({
								row : 0,
								column : 1
							});
						}
						grid.view.focus();
						},300);
					},
					viewConfig : {
						listeners : {
							itemkeydown : {
								fn : function(view, record, item, index, e, options) {
									if (e.keyCode == e.ENTER) {
										me.handlerSelectedEmp(record);
									} else if (e.keyCode == e.F && e.ctrlKey && e.altKey) {
										me.addItemWin.down('#txtEmpSearch').focus(true);
									}
								}
							}
						}
					},
					listeners : {
						scope : me,
						itemdblclick : function(view, record, item, index, e) {
							me.handlerSelectedEmp(record);
						},
						afterrender: function(grid){
							var map = new Ext.util.KeyMap({
								target : grid.view.el,
								binding : [{
									key : Ext.EventObject.PAGE_DOWN,
									fn : function(key, e) {
										e.stopEvent();
										me.gotoNextPage(grid);
									}
								}, {
									key : Ext.EventObject.PAGE_UP,
									fn : function(key, e) {
										e.stopEvent();
										me.gotoPrePage(grid);
									}
								}]
							})
						}
					}
				}],
				listeners : {
					show : function(win) {
						me.inquery = true;
						Ext.defer(function() {
							me.addItemWin.down('#txtEmpSearch').focus();
						}, 100);
					},
					hide : function(win) {
						me.inquery = false;
					}
				}
			});
		}
		if (me.getValue().length == 1) {
			var alertMsg = '人員列表中任一人員審核通過,此節點即通過.<br>是否繼續?';
			if (me.signActorType == '3') {
				alertMsg = '列表中人员提交後会自動拆分为審核節點.<br>是否繼續?';
			}
			Ext.Msg.confirm('新增人員', alertMsg, function(btnId) {
				if (btnId == 'yes') {
					me.addItemWin.show();
				}
			});
		} else {
			me.addItemWin.show();
		}
	},
	gotoPrePage: function(grid){
		var pagingtoolbar = grid.down('pagingtoolbar');
		if(!pagingtoolbar)return;
		pagingtoolbar.movePrevious();
	},
	gotoNextPage: function(grid){
		var pagingtoolbar = grid.down('pagingtoolbar');
		if(!pagingtoolbar)return;
		pagingtoolbar.moveNext();
	},
	handlerSelectedEmp : function(record) {
		var me = this;
		me.actores.push({
			actorEmpEmail : record.get('mailAddress'),
			actorEmpName : record.get('empName'),
			actorEmpNo : record.get('empNo')
		});
		me.updateContent();
		if(me.signActorType == '1' && me.actores.length == 1){
			me._hideAddLabel();
		}
		me.addItemWin.hide();
	},
	_hideAddLabel: function(){
		var addLabel = this.el.down('.ux-form-multiemp-add-label');
		addLabel.setStyle('display', 'none');
	},
	_showAddLabel: function(){
		var addLabel = this.el.down('.ux-form-multiemp-add-label');
		addLabel.setStyle('display', '');
	},
	handlerQueryEmp : function(keyword) {
		var me = this,
			win = me.addItemWin,
			grid = win.down('grid'),
			sm = grid.getSelectionModel(),
			store = me.queryEmpStore;
		store.reload({
			keyword : escape(keyword)
		}, function() {
		}, me);
	},
	initEvents : function() {
		var me = this,
			el = me.el,
			items = el.query('.' + me.itemTriggerSelector), item;
		for (var i = 0; i < items.length; i++) {
			item = Ext.get(items[i]);
			me.mon(item, 'click', me.onItemTriggerClick, me, item);
		}
		me.callParent(arguments);
	},
	getFocusEl : function() {
		return Ext.get(this.el.query('.x-form-multiemp-field')[0]);
	},
	onItemTriggerClick : function(e, trigger, el) {
		var me = this,
			item = el.parent(),
			empNo = item.getAttribute('empno'),
			idx = -1;
		for (var i = 0; i < me.actores.length; i++) {
			if (me.actores[i].actorEmpNo == empNo) {
				idx = i;
			}
		}
		me.mun(item, 'click', me.onItemTriggerClick, me, item);
		me.actores.splice(idx, 1);
		if(me.signActorType == '1' && me.actores.length == 0){
			me._showAddLabel();
		}
		item.remove();
	},
	getSubTplData : function() {
		var me = this;
		return Ext.apply(me.callParent(), {
			emps : me.actores,
			displayTip : me.getDisplayTip(),
			fieldCls : me.fieldCls,
			fieldStyle : me.fieldStyle,
			addLabelText : me.addLabelText,
			readOnly : me.readOnly,
			itemSelector : me.itemSelector,
			itemTriggerImgSrc : me.itemTriggerImgSrc,
			itemTriggerSelector : me.itemTriggerSelector
		});
	},
	afterRender : function() {
		this.autoSize();
		this.callParent();
	},
	autoSize : function() {
		var me = this;
		if (me.grow && me.rendered) {
			me.autoSizing = true;
			me.updateLayout();
		}
	},
	setSize : function(width, height) {
		var me = this;

		// support for standard size objects
		if (width && typeof width == 'object') {
			height = width.height;
			width = width.width;
		}

		// Constrain within configured maxima
		if (typeof width == 'number') {
			me.width = Ext.Number.constrain(width, me.minWidth, me.maxWidth);
		} else if (width === null) {
			delete me.width;
		}

		if (typeof height == 'number') {
			me.height = Ext.Number.constrain(height, me.minHeight, me.maxHeight);
		} else if (height === null) {
			delete me.height;
		}

		if (me.rendered && me.isVisible()) {
			me.updateLayout({
				isRoot : false
			});
		}
		return me;
	},

	afterComponentLayout : function() {
		var me = this, width;

		me.callParent(arguments);
		if (me.autoSizing) {
			width = me.inputEl.getWidth();
			if (width !== me.lastInputWidth) {
				me.fireEvent('autosize', me, width);
				me.lastInputWidth = width;
				delete me.autoSizing;
			}
		}
	}
});

Ext.define('Extux.grid.plugin.SignEmpCellEditing', {
	extend : 'Ext.grid.plugin.CellEditing',
	alias : 'plugin.signempcellediting',

	clicksToEdit : 1,
	showEditor : function(ed, context, value) {
		var me = this,
			record = context.record,
			columnHeader = context.column,
			sm = me.grid.getSelectionModel(),
			selection = sm.getCurrentPosition();

		me.context = context;
		me.setActiveEditor(ed);
		me.setActiveRecord(record);
		me.setActiveColumn(columnHeader);

		if (sm.selectByPosition && (!selection || selection.column !== context.colIdx || selection.row !== context.rowIdx)) {
			sm.selectByPosition({
				row : context.rowIdx,
				column : context.colIdx
			});
		}
		//在編輯前，把editor和record綁定
		ed.field.editRecord = record;
		ed.startEdit(me.getCell(record, columnHeader), value);
		me.editing = true;
		me.scroll = me.view.el.getScroll();
	},
	completeEdit : function() {
		var activeEd = this.getActiveEditor();
		if (activeEd) {
			activeEd.completeEdit();
			//編輯後，解除editor和record的綁定
			activeEd.field.reset();
			delete activeEd.field.editRecord;
			delete activeEd.field.allValueField;
			this.editing = false;
		}
	},
	getEditor : function(record, column) {
		var me = this,
			editors = me.editors,
			editorId = column.getItemId(),
			editorSelector = editorId;
		//如果是多編輯器模式
		if (column.multiEditor) {
			editorSelector = editorId + '-' + record.get(column.selectField);
		}
		editor = editors.getByKey(editorSelector);
		if (editor) {
			return editor;
		} else {
			editor = column.getEditor(record);
			if (!editor) {
				return false;
			}
			if (!(editor instanceof Ext.grid.CellEditor)) {
				editor = new Ext.grid.CellEditor({
					editorId : editorSelector,
					field : editor,
					ownerCt : me.grid,
					completeEdit : function(remainVisible) {
						var me = this,
							field = me.field, value;
						if (!me.editing) {
							return;
						}
						if (field.assertValue) {
							field.assertValue();
						}
						value = me.getValue();
						if (!field.isValid()) {
							if (me.revertInvalid !== false) {
								me.cancelEdit(remainVisible);
							}
							return;
						}
						if (String(value) === String(me.startValue) && me.ignoreNoChange) {
							me.hideEdit(remainVisible);
							return;
						}
						if (me.fireEvent('beforecomplete', me, value, me.startValue) !== false) {
							value = me.getValue();
							if (Ext.isString(value) && me.updateEl && me.boundEl) {
								me.boundEl.update(value);
							}else if(me.boundEl){
								var p = me.editingPlugin,
									c = p.activeColumn,
									r = p.activeRecord,
									m = '',
									html,
									innerCell = me.boundEl.first();
								html = c.renderer ? c.renderer(value, m, r):value;
								if(innerCell){
									innerCell.update(html);
								}else{
									me.boundEl.update(html);
								}
							}
							me.hideEdit(remainVisible);
							me.fireEvent('complete', me, value, me.startValue);
						}
					}
				});
			} else {
				editor.ownerCt = me.grid;
			}
			editor.editingPlugin = me;
			editor.isForTree = me.grid.isTree;
			editor.on({
				scope : me,
				specialkey : me.onSpecialKey,
				complete : me.onEditComplete,
				canceledit : me.cancelEdit
			});
			editors.add(editorSelector, editor);
			return editor;
		}
	},
	initFieldAccessors : function(columns) {
		columns = [].concat(columns);
		var me = this, c,
			cLen = columns.length, column;
		for (c = 0; c < cLen; c++) {
			column = columns[c];
			Ext.applyIf(column, {
				getEditor : function(record, defaultField) {
					return me.getColumnField(this, defaultField, record);
				},
				setEditor : function(field) {
					me.setColumnField(this, field);
				}
			});
		}
	},
	getColumnField : function(columnHeader, defaultField, record) {
		var field = null;
		if (columnHeader.multiEditor && Ext.isArray(columnHeader.editor)) {
			for (var i = 0; i < columnHeader.editor.length; i++) {
				if (columnHeader.editor[i].fieldSelector == record.get(columnHeader.selectField)) {
					field = columnHeader.editor[i];
					if (!field.isFormField) {
						field = Ext.ComponentManager.create(field, this.defaultFieldXType);
						columnHeader.editor[i] = field;
					}
					break;
				}
			}
		} else {
			field = columnHeader.field || columnHeader.editor;
		}
		if (!field && defaultField) {
			field = defaultField;
		}

		if (field) {
			if (Ext.isString(field)) {
				field = {
					xtype : field
				};
			}
			if (!field.isFormField) {
				field = Ext.ComponentManager.create(field, this.defaultFieldXType);
			}
			columnHeader.field = field;
			Ext.apply(field, {
				name : columnHeader.dataIndex,
				'signActorType' : record.get('signActorType')
			});
			return field;
		}
	},
	listeners : {
		beforeedit : function(editingPlugin, e) {
			if (e.field == 'modelName') {
				return e.record.get('modelNo').indexOf('Countersign-') != -1;
			}
			if (e.field == 'signActores') {
				var scope = e.record.get('signerScope');
				if (scope == '0') {
					return false;
				} else if (scope == '1') {
					return true;
				} else if (scope == '2') {
					return true;
				} else if (scope == '3') {
					var editor = editingPlugin.getEditor(e.record, e.column);
					if(editor.field.xtype == 'signempenumfield' && e.record.data.signActoresStore){
						editor.field.loadData(e.record.data.signActoresStore);
					}
					return true;
				}
			}
			if (e.record.get('modelType') == 'TaskModel' || e.record.get('modelType') == 'CustomModel') {
				return true;
			}
			return false;
		}
	}
});

Ext.define('Extux.window.SignWindow', {
	extend : 'Ext.window.Window',
	alias : 'widget.signwindow',

	formNo : null,
	config : null,
	store : null,
	maximizable: true,
	beforeSubmit : Ext.emptyFn(),
	afterSubmit : Ext.emptyFn(),
	requires : ['Extux.grid.column.ButtonColumn'],
	beforeLoadModel : Ext.emptyFn(),
	layout : 'card',

	initComponent : function() {
		var me = this;

		me.store = Ext.create('Ext.data.Store', {
			model : 'Extux.model.TaskModel',
			filterOnLoad : true
		});
		me.modelesStore = Ext.create('Ext.data.Store', {
			fields : ['customFlowId', 'formId', 'empNo', 'customName', {
				type : 'object',
				name : 'modeles'
			}],
			autoLoad: me.formNo != undefined,
			proxy : {
				type : 'ajax',
				url : contextPath + '/workflow/formManager!queryUserCustomFlowList.action?specificUser=' + (me.config.specificUser || ''),
				reader : {
					type : 'json',
					root : 'flows'
				},
				extraParams : {
					formNo : me.formNo
				}
			}
		});

		Ext.applyIf(me, {
			frame : true,
			modal : true,
			items : [{
				border : false,
				xtype : 'grid',
				store : me.store,
				tbar : [{
					text : '查看路徑',
					tooltip : '路徑查看',
					scope : me,
					handler : function() {
						me.lookAuditDetail('nextPage')
					}
				}, {
					itemId : 'addSignActor',
					text : '插入會簽',
					tooltip : '在所選之後插入簽核',
					scope : me,
					disabled : true,
					handler : me.addSignActor
				}, '->', {
					itemId : 'customFlow',
					xtype : 'combobox',
					editable : false,
					fieldLabel : '模版',
					labelWidth : 35,
					labelAlign : 'right',
					store : me.modelesStore,
					queryMode : 'remote',
					displayField : 'customName',
					valueField : 'customFlowId',
					listeners : {
						scope : me,
						change : me.selectCustomModelesChange
					}
				}, {
					icon : contextPath + '/resources/img/icons/disk.png',
					scope : me,
					handler : me.saveAsCustomModel
				}, {
					icon : contextPath + '/resources/img/icons/delete.png',
					scope : me,
					handler : me.removeCustomFlow
				}],
				columns : [{
					menuDisabled: true,
					draggable: false,
					sortable: false,
					width : 30,
					align : 'right',
					text : '次序',
					dataIndex : 'modelOrder',
					renderer : function(v, m, r) {
						return r.get('modelLevel') + '-' + v;
					}
				}, {
					menuDisabled: true,
					draggable: false,
					sortable: false,
					text : '任務',
					dataIndex : 'modelName',
					field : {}
				}, {
					menuDisabled: true,
					draggable: false,
					sortable: false,
					text : '類型',
					width : 60,
					hidden : true,
					align : 'center',
					dataIndex : 'modelType',
					renderer : function(v) {
						if (v == 'CustomModel') {
							return '協辦任務';
						} else if (v == 'DecisionModel') {
							return '決策節點';
						} else if (v == 'EndModel') {
							return '結束節點';
						} else if (v == 'ForkModel') {
							return '分支節點';
						} else if (v == 'JoinModel') {
							return '合并節點';
						} else if (v == 'StartModel') {
							return '開始節點';
						} else if (v == 'TaskModel') {
							return '任務節點';
						}
					}
				}, {
					menuDisabled: true,
					draggable: false,
					sortable: false,
					hidden : true,
					text : '必須',
					width : 34,
					align : 'center',
					dataIndex : 'allowEmpty',
					renderer : function(v) {
						return v == 'Y' ? '否' : '是';
					}
				}, {
					menuDisabled: true,
					draggable: false,
					sortable: false,
					text : '審核人',
					width : 250,
					dataIndex : 'signActores',
					renderer : function(v, mate, r) {
						if (r.get('signerScope') == '0') {
							mate.style = 'color:blue';
						}
						var t = '<ul>',
							hasOrder = v.length > 1;
						for (var i = 0; i < v.length; i++) {
							t += '<li>' +(hasOrder?('簽核順序'+(i+1)+': '):'') + v[i].actorEmpName + '/' + v[i].actorEmpEmail + '</li>';
						}
						t += '</ul>';
						return t;
					},
					multiEditor : true,
					selectField : 'signerScope',
					editor : [{
						fieldSelector : '1',
						xtype : 'signempfield'
					}, {
						fieldSelector : '2',
						xtype : 'signempfield'
					}, {
						fieldSelector : '3',
						xtype : 'signempenumfield'
					}]
				}, {
					menuDisabled: true,
					draggable: false,
					sortable: false,
					xtype : 'buttoncolumn',
					width : 20,
					items : [{
						icon : contextPath + '/resources/img/icons/delete.png',
						tooltip : '刪除此任務',
						handler : function(grid, rowIndex, colIndex) {
							var r = grid.getStore().getAt(rowIndex);
							Ext.Msg.confirm('刪除審核任務', '你確定要刪除<font color="red">' + r.get('modelName') + '</font>審核任務麼？', function(btnId) {
								if (btnId == 'yes') {
									me.removeSignActor(r);
								}
							});
						},
						beferRender : function(item, meta, record) {
							return (record.get('allowEmpty') == 'Y');
						}
					}]
				}],
				selType : 'cellmodel',
				plugins : [Ext.create('Extux.grid.plugin.SignEmpCellEditing')],
				listeners : {
					scope : me,
					selectionchange : me.selectSignActor,
					hide : function(grid) {
						var celleditting = grid.editingPlugin;
						//完成所有編輯狀態
						celleditting.completeEdit();
					}
				}
			}, {
				xtype : 'panel',
				border : false,
				tbar : [{
					text : '流程配置',
					tooltip : '配置流程具體審核人',
					scope : me,
					handler : function() {
						me.restoreSignDataFromDrawing();
						me.lookAuditDetail('prevPage');
					}
				}, {
					text: '自動拆分會簽',
					scope: me,
					handler: function(btn){
						me.autoSplitFlow();
					}
				}],
				autoScroll : true,
				layout: 'fit',
				items : [{
					xtype : 'uxiframe',
					border : 1,
					src : contextPath + '/workflow/flow-display.jsp',
					loadData: function(nodes){
						if(this.rendered && this.getWin().loadData){
							this.getWin().loadData(nodes);
						}else{
							var iframe = this;
							iframe.on('load', function(){
								iframe.getWin().loadData(nodes);
							});
						}
					},
					hasChange: function(){
						if(this.rendered && this.getWin().hasChange){
							return this.getWin().hasChange();
						}
						return false;
					},
					getData: function(){
						if(this.rendered && this.getWin().getData){
							return this.getWin().getData();
						}
						return [];
					}
				}],
				listeners : {
					show: function(tab){
						me.redrawSignView();
					}
				}
			}],
			listeners : {
				show : function(win) {
					me.body.mask('正在獲取審核路徑...');

					Ext.Ajax.request({
						url : contextPath + '/workflow/orderManger!queryFoxFormAndActor.action?specificUser=' + (me.config.specificUser || ''),
						jsonData : {
							formNo : me.formNo,
							scopeCode : me.config.scopeCode,
							vars : me.config.vars,
							calculation : me.config.calculation
						},
						success : function(response, opts) {
							me.body.unmask();
							var obj = Ext.decode(response.responseText);
							if (obj) {
								me.form = obj;
								me.store.clearFilter();
								me.store.removeAll();
								//加載模版
								if (me.form.characteristic) {//有特徵碼
									me.modelesStore.reload({
										formNo : me.formNo,
										characteristic : me.form.characteristic
									});
								}
								if(Ext.isFunction(me.beforeLoadModel)){
									me.beforeLoadModel(obj.modeles);
								}
								me.store.loadData(obj.modeles);
								me.down('#btnStartSign').enable();
								me.store.each(function(r) {
									r.data.modelOrder = 0;
									r.data.modelLevel = 0;
									/*if(r.data.signerScope == '3'){
										r.data.signActoresStore = r.data.signActores;
										r.data.signActores = [];
									}*/
								});
								me.sortSignTask(me.store);
								me.store.filterBy(function(item) {
									return (item.data.modelType == 'TaskModel' || item.data.modelType == 'CustomModel');
								});
								me.store.sort([{
									property : 'modelLevel',
									direction : 'ASC'
								}, {
									property : 'modelOrder',
									direction : 'ASC'
								}]);
								//判斷是否通用表單
								if(me.form.formType == '2'){
									//如果是通用表單，可以設置是否機密
								}
								me.down('#orderSecret').setValue(me.form.secret||'1');
							} else {
								Ext.Msg.alert('獲取流程配置', '獲取流程配置為空，請聯繫系統管理員處理');
							}
						},
						failure : function(response, opts) {
							me.body.unmask();
							Ext.Msg.alert('獲取流程配置', '獲取流程配置異常，請稍候重試');
						}
					});
				},
				beforeclose: function(win){
					var grid = win.down('grid');
					if(grid.editingPlugin.activeEditor){
						grid.editingPlugin.completeEdit();
					}
				}
			},
			buttons : [{
				itemId : 'orderSecret',
				xtype : 'combobox',
				fieldLabel : '機密等級',
				name : 'secret',
				store : Ext.create('Ext.data.Store', {
					fields : ['abbr', 'name'],
					data : [
						{"abbr" : "1","name" : "一般"}, 
						{"abbr" : "2","name" : "機密"}
						]
				}),
				value : '1',
				labelWidth: 60,
				width: 120,
				editable : false,
				queryMode : 'local',
				displayField : 'name',
				valueField : 'abbr'
			},'->', {
				itemId : 'btnStartSign',
				text : '提交簽核',
				scale : 'medium',
				width : 60,
				disabled : true,
				handler : me.startSign,
				scope : me
			}, {
				text : '取消',
				scale : 'medium',
				width : 60,
				handler : function() {
					var grid = me.down('grid'),
						celleditting = grid.editingPlugin;
					celleditting.cancelEdit();
					me.close();
				}
			}]
		});
		this.callParent();
	},
	selectCustomModelesChange : function(cbox, newValue, oldValue) {
		var me = this,
			store = cbox.store,
			len = store.getCount(), r;
		for (var i = 0; i < len; i++) {
			if (store.getAt(i).get('customFlowId') == newValue) {
				r = store.getAt(i);
				break;
			}
		};
		me.store.clearFilter();
		me.store.removeAll();
		me.store.loadData(r.data.modeles);
		
		me.store.each(function(r) {
			r.data.modelOrder = 0;
			r.data.modelLevel = 0;
		});
		me.sortSignTask(me.store);
		me.store.filterBy(function(item) {
			return (item.data.modelType == 'TaskModel' || item.data.modelType == 'CustomModel');
		});
		me.store.sort([{
			property : 'modelLevel',
			direction : 'ASC'
		}, {
			property : 'modelOrder',
			direction : 'ASC'
		}]);
	},
	/**
	 * 刪除客制化模版
	 */
	removeCustomFlow : function() {
		var me = this,
			cbox = me.down('#customFlow'),
			selectModel = cbox.getValue(),
			store = cbox.store,
			len = store.getCount();
		if (selectModel) {
			var r = null;
			for (var i = 0; i < len; i++) {
				if (store.getAt(i).get('customFlowId') == selectModel) {
					r = store.getAt(i);
					break;
				}
			}
			Ext.Msg.confirm('刪除模版', '你確定要刪除<label style="color:red;">' + r.get('customName') + '</label>模版麼?', function(btn) {
				if (btn == 'yes') {
					//保存為客制化的模版
					me.body.mask('正在刪除模版...');
					Ext.Ajax.request({
						url : contextPath + '/workflow/formManager!removeUserCustomFlowModel.action?specificUser=' + (me.config.specificUser || ''),
						method : 'post',
						params : {
							customFlowId : selectModel
						},
						success : function(response) {
							me.body.unmask();
							if (response.responseText == 'OK') {
								me.modelesStore.reload({
									formNo : me.formNo,
									characteristic : me.form.characteristic
								}, function(records, operation, success) {
									if (records.length > 0) {
										cbox.select(records[0]);
									} else {
										me.store.removeAll();
										me.store.loadData(me.form.modeles);
										me.store.clearFilter();
										me.store.each(function(r) {
											r.data.modelOrder = 0;
											r.data.modelLevel = 0;
										});
										me.sortSignTask(me.store);
										me.store.filterBy(function(item) {
											return (item.data.modelType == 'TaskModel' || item.data.modelType == 'CustomModel');
										});
										me.store.sort([{
											property : 'modelLevel',
											direction : 'ASC'
										}, {
											property : 'modelOrder',
											direction : 'ASC'
										}]);
									}
								});
							} else {
								Ext.Msg.alert('刪除模版', '刪除模版失敗');
							}
						},
						failure : function(response) {
							me.body.unmask();
							Ext.Msg.alert('刪除模版', '刪除模版服務器異常');
						}
					});
				}
			});
		} else {
			Ext.Msg.alert('刪除模版', '你沒有選擇一個模版');
		}
	},
	/**
	 * 保存為客制化模版
	 */
	saveAsCustomModel : function() {
		var me = this,
			grid = me.down('grid'),
			celleditting = grid.editingPlugin,
			store = me.store,
			items = store.isFiltered() ? store.snapshot.items : store.data.items,
			ln = items.length,
			error = '', r, ndn, actor,
			modeles = [];
		if (me.committing === true) {
			return;
		}
		//完成所有編輯狀態
		celleditting.completeEdit();
		for (var i = 0; i < ln; i++) {
			r = items[i];
			if (r.get('modelType') == 'TaskModel' || r.get('modelType') == 'CustomModel') {
				actor = r.get('signActores');
				if (actor && actor.length > 0) {
					continue;
				} else {
					error = '任務<font color="red">' + r.get('modelName') + '</font>沒有審核人<br/>';
				}
			}
		}
		if (error) {
			Ext.Msg.alert('提交簽核', '<font color="red">驗證數據失敗</font>:<br>' + error);
			me.down('#btnStartSign').enable();
			return;
		}
		for (var i = 0; i < ln; i++) {
			r = items[i];
			modeles.push(r.data);
		}
		me.body.mask('正在保存模版...');
		Ext.Msg.prompt('保存模版', '請確認模板信息并輸入模版的名稱:', function(btn, text) {
			if (btn == 'ok') {
				//保存為客制化的模版
				Ext.Ajax.request({
					url : contextPath + '/workflow/formManager!saveUserCustomFlowModel.action?specificUser=' + (me.config.specificUser || ''),
					method : 'post',
					params : {
						formId : me.form.formId,
						characteristic : me.form.characteristic,//特徵碼
						customName : text,
						modeles : Ext.encode(modeles)
					},
					success : function(response) {
						me.body.unmask();
						if (response.responseText == 'OK') {
							me.modelesStore.reload({
								formNo : me.formNo,
								characteristic : me.form.characteristic
							});
						} else {
							Ext.Msg.alert('保存模版', '保存模版失敗');
						}
					},
					failure : function(response) {
						me.body.unmask();
						Ext.Msg.alert('保存模版', '保存模版服務器異常');
					}
				});
			} else {
				me.body.unmask();
			}
		});
	},
	//刷新任務的排序
	sortSignTask : function(s) {
		var rs = s.isFiltered() ? s.snapshot.items : s.data.items,
			ln = rs.length, r,
			currentLevel = 1,
			maxLevel = 0, outs, outsize, transitione, next,
			hasChange = true,
			hasMaxLevel = true;
		for (var i = 0; i < ln; i++) {
			r = rs[i];
			r.data.modelOrder = 1;
			r.data.modelLevel = 1;
		}
		while (hasMaxLevel) {
			if (!hasChange) {
				currentLevel++;
			}
			hasMaxLevel = false;
			hasChange = false;
			for (var i = 0; i < ln; i++) {
				r = rs[i];
				if (currentLevel != r.data.modelLevel) {
					continue;
				}
				hasMaxLevel = true;
				outs = r.data.transitiones;
				outsize = outs.length;
				for (var j = 0; j < outsize; j++) {
					transitione = outs[j];
					next = this.getNodeByNo(s, transitione.toTarget);
					if (currentLevel + j > next.data.modelLevel) {
						next.set('modelLevel', currentLevel + j);
						hasChange = true;
					}
					if (r.data.modelOrder + 1 + j > next.data.modelOrder) {
						next.set('modelOrder', r.data.modelOrder + 1 + j);
						hasChange = true;
					}
				}
			}
		}
	},
	//查找節點，根據name
	getNodeByNo : function(s, name) {
		var rs = s.isFiltered() ? s.snapshot.items : s.data.items,
			ln = rs.length, r;
		for (var i = 0; i < ln; i++) {
			if (rs[i].data.modelNo == name) {
				r = rs[i];
				break;
			}
		}
		return r;
	},
	//查找開始節點
	getSignPathStart : function(s) {
		var rs = s.isFiltered() ? s.snapshot.items : s.data.items,
			ln = rs.length, r;
		for (var i = 0; i < ln; i++) {
			if (rs[i].data.modelType == 'StartModel') {
				r = rs[i];
				break;
			}
		}
		return r;
	},
	redrawSignView : function(){
		var me = this,
			iframe = me.down('uxiframe'),
			store = me.store,
			items = store.isFiltered() ? store.snapshot.items : store.data.items,
			ln = items.length,
			nodes = [];
		//if(iframe.loaded)return;
		for (var i = 0, node ; i < ln; i++) {
			node = items[i].data;
			if(!node.modelName)node.modelName = node.modelNo;
			nodes.push(node);
		}
		iframe.loadData(nodes);
		iframe.loaded = true;
	},
	autoSplitFlow: function(){
		var me = this,
			iframe = me.down('uxiframe');
		var data = iframe.getData();
		
		function requestAutoSplitFlow(mode){
			Ext.Ajax.request({
				url : contextPath + '/workflow/orderManger!autoSplitFlow.action?mode='+mode,
				jsonData : data,
				success : function(response, opts) {
					var result = Ext.decode(response.responseText);
					iframe.loadData(result);
					iframe.loaded = true;
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
			bodyStyle: 'border-width: 0px;',
			items : {
				bodyStyle: 'background-color: #ced9e7;border-width: 0px;padding: 10px;',
				border: false,
				html: '請點擊你需要的功能按鈕：<br/>1、智能會簽: 不同節點名稱，或者不同作業部門人員拆分為並行簽核.<br/>2、最大拆分會簽: 所有會簽節拆分為並行簽核.'
			},
			buttons: [{
				text: '1: 智能會簽',
				handler: function(){
					requestAutoSplitFlow(1);
					this.up('window').close();
				}
			}, {
				text: '2: 最大拆分會簽',
				handler: function(){
					requestAutoSplitFlow(2);
					this.up('window').close();
				}
			}]
		}).show();
	},
	restoreSignDataFromDrawing: function(){
		var me = this,
			iframe = me.down('uxiframe'),
			store = me.store,
			items = store.isFiltered() ? store.snapshot.items : store.data.items;
		if(1 || iframe.hasChange()){
			var data = iframe.getData();
			me.store.clearFilter();
			me.store.removeAll();
			//加載模版
			if(Ext.isFunction(me.beforeLoadModel)){
				me.beforeLoadModel(data);
			}
			
			me.store.loadData(data);
			me.down('#btnStartSign').enable();
			
			me.store.each(function(r) {
				r.data.modelOrder = 0;
				r.data.modelLevel = 0;
			});
			me.sortSignTask(me.store);
			me.store.filterBy(function(item) {
				return (item.data.modelType == 'TaskModel' || item.data.modelType == 'CustomModel');
			});
			me.store.sort([{
				property : 'modelLevel',
				direction : 'ASC'
			}, {
				property : 'modelOrder',
				direction : 'ASC'
			}]);
		}
	},
	/*redrawSignView : function(panel) {
		var me = this,
			store = me.store,
			items = store.isFiltered() ? store.snapshot.items : store.data.items,
			draw = panel.down('draw'),
			surface = draw.surface,
			ln = items.length,
			maxLevel = 0,
			maxOrder = 0, start;
		me.draw = draw;
		surface.removeAll(true);
		for (var i = 0; i < ln; i++) {
			if (items[i].data.modelLevel > maxLevel) {
				maxLevel = items[i].data.modelLevel;
			}
			if (items[i].data.modelOrder > maxOrder) {
				maxOrder = items[i].data.modelOrder;
			}
		}
		draw.setWidth(maxLevel * 80 + 20);
		draw.setHeight(maxOrder * 40 + 20);
		this.drawNode(store);
		this.drawTransition(store);
	},
	drawNode : function(s, n) {
		var items = s.isFiltered() ? s.snapshot.items : s.data.items,
			ln = items.length, node;
		for (var i = 0; i < ln; i++) {
			node = items[i];
			this.drawSignTask(node, node.data.modelOrder, node.data.modelLevel);
		}
	},
	drawTransition : function(s) {
		var me = this,
			items = s.isFiltered() ? s.snapshot.items : s.data.items,
			ln = items.length, start, end, out;
		for (var i = 0; i < ln; i++) {
			start = items[i];
			if (start.data.transitiones && start.data.transitiones.length > 0) {
				for (var j = 0; j < start.data.transitiones.length; j++) {
					out = start.data.transitiones[j];
					end = me.getNodeByNo(s, out.toTarget);
					if (end) {
						me.linkedSignPath(start, end);
					}
				}
			}
		}
	},
	getNextNode : function(s, r) {
		if (!r) {
			r = this.getSignPathStart(s);
		}
		var outs = r.data.transitiones,
			ln = outs.length,
			next = [], transitione, target;
		for (var i = 0; i < ln; i++) {
			transitione = outs[i];
			target = this.getNodeByNo(s, transitione.toTarget);
			next.push(target);
		}
		return next;
	},
	drawSignTask : function(task, order, level) {
		var me = this,
			draw = me.draw,
			surface = draw.surface,
			nodeType = task.data.modelType,
			node = task.data, x, y, config;
		x = level * 80 - 20;
		y = order * 40 - 20;
		if (nodeType == 'StartModel') {//開始節點
			config = {
				modelNo : node.modelNo,
				type : "image",
				nodeType : 'StartModel',
				width : 32,
				height : 32,
				src : contextPath + '/workflow/base/flow-32/start_event_empty.png',
				x : x - 16,
				y : y - 16,
				ins : [],
				outs : []
			};
		} else if (nodeType == 'EndModel') {//結束節點
			config = {
				modelNo : node.modelNo,
				type : "image",
				nodeType : 'EndModel',
				width : 32,
				height : 32,
				src : contextPath + '/workflow/base/flow-32/end_event_terminate.png',
				x : x - 16,
				y : y - 16,
				ins : [],
				outs : []
			};
		} else if (nodeType == 'TaskModel') {//審核任務
			config = [{
				type : "rect",
				groupType : 'taskPanel',
				nodeType : 'TaskModel',
				modelNo : node.modelNo,
				signerScope : node.signerScope,
				allowEmpty : node.allowEmpty,
				width : 60,
				height : 30,
				x : x - 30,
				y : y - 15,
				fill : '#C4FFC4',
				opacity : 0.5,
				stroke : '#400000',
				'stroke-width' : 1,
				ins : [],
				outs : [],
				group : node.modelNo
			}, {
				type : "text",
				groupType : 'taskTitle',
				nodeType : 'TaskModel',
				modelNo : node.modelNo,
				text : node.modelName,
				x : x - 20,
				y : y - 6,
				fill : "#000040",
				font : "12px simsun",
				group : node.modelNo
			}, {
				type : "text",
				groupType : 'taskHandler',
				nodeType : 'TaskModel',
				text : "",
				modelNo : node.modelNo,
				x : x - 20,
				y : y + 10,
				fill : "#000040",
				font : "12px simsun",
				group : node.modelNo,
				emps : node.signActores,
				listeners : {
					render : function(txt) {
						me.updateEmpName(txt);
					}
				}
			}];
		} else if (nodeType == 'CustomModel') {//協辦處理
			config = [{
				type : "rect",
				groupType : 'taskPanel',
				nodeType : 'CustomModel',
				modelNo : node.modelNo,
				signerScope : node.signerScope,
				allowEmpty : node.allowEmpty,
				width : 60,
				height : 30,
				x : x - 30,
				y : y - 15,
				fill : '#C4FFC4',
				opacity : 0.5,
				stroke : '#400000',
				'stroke-width' : 1,
				ins : [],
				outs : [],
				group : node.modelNo
			}, {
				type : "text",
				groupType : 'taskTitle',
				nodeType : 'CustomModel',
				modelNo : node.modelNo,
				text : node.modelName,
				x : x - 20,
				y : y - 6,
				fill : "#000040",
				font : "12px simsun",
				group : node.modelNo
			}, {
				type : "text",
				groupType : 'taskHandler',
				nodeType : 'CustomModel',
				text : "",
				modelNo : node.modelNo,
				x : x - 20,
				y : y + 10,
				fill : "#000040",
				font : "12px simsun",
				group : node.modelNo,
				emps : node.signActores,
				listeners : {
					render : function(txt) {
						me.updateEmpName(txt);
					}
				}
			}];
		} else if (nodeType == 'ForkModel') {//並行分支
			config = {
				type : "image",
				nodeType : 'ForkModel',
				modelNo : node.modelNo,
				width : 32,
				height : 32,
				src : contextPath + '/workflow/base/flow-32/gateway_parallel.png',
				x : x - 16,
				y : y - 16,
				ins : [],
				outs : []
			};
		} else if (nodeType == 'DecisionModel') {//條件分支
			config = {
				type : "image",
				nodeType : 'DecisionModel',
				modelNo : node.modelNo,
				width : 32,
				height : 32,
				src : contextPath + '/workflow/base/flow-32/gateway_exclusive.png',
				x : x - 16,
				y : y - 16,
				ins : [],
				outs : []
			};
		} else if (nodeType == 'JoinModel') {//分支合併
			config = {
				type : "image",
				nodeType : 'JoinModel',
				modelNo : node.modelNo,
				width : 32,
				height : 32,
				src : contextPath + '/workflow/base/flow-32/gateway_parallel.png',
				x : x - 16,
				y : y - 16,
				ins : [],
				outs : []
			};
		} else if (nodeType == 'TransitionModel') {//連接線
			//me.isDrawingTransitionModel;
			return;
		}
		var nodes = surface.add(config);
		var nodes = [].concat(nodes);
		for (var i = 0; i < nodes.length; i++) {
			nodes[i].show(true);
		}
		if (nodeType == 'TaskModel' || nodeType == 'CustomModel') {
			me.updateEmpName(nodes[2]);
		}
	},
	updateEmpName : function(txt) {
		var ln = txt.emps.length,
			empNames = [];
		for (var i = 0; i < ln; i++) {
			empNames.push(txt.emps[i].actorEmpName);
		}
		txt.setText(empNames.join("\n"));
	},
	linkedSignPath : function(n1, n2) {
		var me = this,
			draw = me.draw,
			surface = draw.surface,
			items = surface.items.items,
			ln = items.length, s1, s2, b1, b2, sx, sy, ex, ey;
		for (var i = 0; i < ln; i++) {
			if (items[i].modelNo == n1.data.modelNo) {
				if (items[i].nodeType == 'TaskModel' || items[i].nodeType == 'CustomModel') {
					s1 = surface.getGroup(items[i].groupId).items[0];
				} else {
					s1 = items[i];
				}
			} else if (items[i].modelNo == n2.data.modelNo) {
				if (items[i].nodeType == 'TaskModel' || items[i].nodeType == 'CustomModel') {
					s2 = surface.getGroup(items[i].groupId).items[0];
				} else {
					s2 = items[i];
				}
			}
		}
		if (s1 == null || s2 == null)
			return;
		b1 = s1.getBBox();
		b2 = s2.getBBox();
		sx = b1.x + b1.width / 2;
		sy = b1.y + b1.height + 1;
		ex = b2.x + b2.width / 2;
		ey = b2.y - 1;
		var line = surface.add({
			type : "path",
			nodeType : 'TransitionModel',
			path : 'M' + sx + ' ' + sy + 'L' + ex + ' ' + ey,
			stroke : '#004080',
			'stroke-width' : 2
		});
		line.show(true);
	},*/
	/**
	 * 插入會簽
	 */
	addSignActor : function() {
		var me = this,
			grid = me.down('grid'),
			editingPlugin = grid.editingPlugin,
			sm = grid.getSelectionModel(),
			r = sm.getSelection(),
			store = grid.store, newRecord;
		if (r && r.length > 0) {
			editingPlugin.completeEdit();
			store.clearFilter();
			var current = r[0],
				currentIdx = store.indexOf(current),
				next = me.getNodeByNo(store, current.data.transitiones[0].toTarget),
				nextTaskNo = next.get('modelNo'),
				newTaskNo = 'Countersign-' + (Ext.idSeed++);
			for (var i = 0; i < store.getCount(); i++) {
				var o = store.getAt(i);
				if (o.data.modelOrder > current.data.modelOrder)
					o.data.modelOrder++;
			}
			store.insert(currentIdx + 1, {
				modelOrder : current.data.modelOrder + 1,
				modelLevel : current.data.modelLevel,
				modelNo : newTaskNo,
				modelName : '會簽',
				signerScope : '2',
				allowEmpty : 'Y',
				signActorType : '1',
				taskLevel: '1',
				taskType : me.config.newTaskType,
				performType : 'any',
				modelType : 'TaskModel',
				signActores : [],
				transitiones : []
			});
			newRecord = store.getAt(currentIdx + 1);
			current.data.transitiones[0].toTarget = newTaskNo;
			newRecord.data.transitiones.length = 0;
			newRecord.data.transitiones.push({
				toTarget : nextTaskNo
			});
			store.filterBy(function(item) {
				return (item.data.modelType == 'TaskModel' || item.data.modelType == 'CustomModel');
			});
			me.store.sort([{
				property : 'modelLevel',
				direction : 'ASC'
			}, {
				property : 'modelOrder',
				direction : 'ASC'
			}]);
		} else {
			Ext.Msg.alert('插入會簽', '請先選擇插入會簽的任務(在其之後插入會簽)');
		}
	},
	//詳細路徑查看
	lookAuditDetail : function(opt) {
		var me = this;
		var layout = me.getLayout();
		if (opt == 'nextPage' && layout.getNext()) {
			layout.next();
		} else if (opt == 'prevPage' && layout.getPrev()) {
			layout.prev();
		}
	},
	//刪除會簽
	removeSignActor : function(r) {
		var me = this,
			grid = me.down('grid'),
			editingPlugin = grid.editingPlugin,
			store = grid.store;
		if (r) {
			editingPlugin.completeEdit();
			store.clearFilter();
			var current = r,
				currentIdx = store.indexOf(current),
				next = me.getNodeByNo(store, current.data.transitiones[0].toTarget),
				ln = store.getCount(), transitiones;
			for (var i = 0; i < ln; i++) {
				transitiones = store.getAt(i).data.transitiones;
				if (transitiones && transitiones.length > 0) {
					for (var j = 0; j < transitiones.length; j++) {
						if (transitiones[j].toTarget == current.data.modelNo) {
							transitiones[j].toTarget = next.data.modelNo;
						}
					}
				}
			}
			store.removeAt(currentIdx);
			/*
			 * for (var i = currentIdx; i < store.getCount(); i++) { var o =
			 * store.getAt(i); o.data.modelOrder--; }
			 */
			store.filterBy(function(item) {
				return (item.data.modelType == 'TaskModel' || item.data.modelType == 'CustomModel');
			});
			me.store.sort([{
				property : 'modelLevel',
				direction : 'ASC'
			}, {
				property : 'modelOrder',
				direction : 'ASC'
			}]);
		}
	},
	/**
	 * 選擇一個簽核人員
	 */
	selectSignActor : function(sm, r) {
		if(!r || r.length == 0)return;
		var r = r[0];
		var form = r.data.form;//定制字段：0前後禁止會簽1後禁止會簽2前禁止會簽3簽核允許會簽
		if(!form)form = '3';//默認允許會簽
		if ((form == '2' || form == '3')) {
			if (r.get('modelType') == 'CustomModel' || r.get('modelType') == 'TaskModel') {
				this.down('#addSignActor').enable();
				return;
			}
		}
		this.down('#addSignActor').disable();
	},
	/**
	 * 開始簽核
	 */
	startSign : function() {
		var me = this,
			grid = me.down('grid'),
			celleditting = grid.editingPlugin,
			store = me.store,
			items = store.isFiltered() ? store.snapshot.items : store.data.items,
			ln = items.length,
			error = '', r, ndn, actor,
			modeles = [],
			jsonData = null;

		celleditting.completeEdit();
		var currentPanel = me.layout.getActiveItem();
		if(currentPanel.xtype == 'panel'){
			me.restoreSignDataFromDrawing();
		}
		//完成所有編輯狀態
		me.down('#btnStartSign').disable();
		me.body.mask('正在提交簽核...');
		var actors = [];
		Ext.defer(function() {
			var sModelForm;
			for (var i = 0; i < ln; i++) {
				r = items[i];
				//處理動態表單
				sModelForm = r.get('modelForm');
				if(sModelForm){
					try{
						sModelForm = Ext.decode(sModelForm);
						if(sModelForm && sModelForm.modelFields && sModelForm.modelFields.length>0){
						}else{
							r.set('modelForm', null)
						}
					}catch(e){
						r.set('modelForm', null)
					}
				}
				if (r.get('modelType') == 'TaskModel' || r.get('modelType') == 'CustomModel') {
					//驗證審核是否為空
					actor = r.get('signActores');
					if (actor && actor.length > 0) {
						for (var j = 0; j < actor.length; j++) {
							if (!Ext.Array.contains(actors, actor[j].actorEmpNo)) {
								actors.push(actor[j].actorEmpNo);
							}
						}
						continue;
					} else {
						error = '任務<font color="red">' + r.get('modelName') + '</font>沒有審核人<br/>';
					}
				}
			}
			if (error) {
				Ext.Msg.alert('提交簽核', '<font color="red">驗證數據失敗</font>:<br>' + error);
				me.down('#btnStartSign').enable();
				me.body.unmask();
				return;
			}
			//驗證本部門主管是否有簽名檔
			var response = Ext.Ajax.request({
				url : contextPath + '/workflow/orderManger!validUserManagerPersonal.action?emps=' + (actors.join(',')),
				async : false
			});
			if (response) {
				var as = Ext.decode(response.responseText),
					msg = '';
				if (as.errorMsg) {
					Ext.Msg.alert('提交簽核', as.errorMsgDesc);
					me.down('#btnStartSign').enable();
					me.body.unmask();
					return;
				}
				if (as.length > 0) {
					for (var i = 0; i < as.length; i++) {
						msg += '<label style="color:red;">' + as[i].empName + '</label>沒有上傳簽名，暫無法提交簽核<br/>';
					}
					msg += '請聯繫相關人員，上傳簽核系統個人簽名，如有問題：請聯繫資訊 宋傑(565-37056)';
					Ext.Msg.alert('提交簽核', msg);
					me.down('#btnStartSign').enable();
					me.body.unmask();
					return;
				}
			}

			if (me.committing === true) {
				return;
			}
			me.committing = true;

			for (var i = 0; i < ln; i++) {
				r = items[i];
				modeles.push(r.data);
			}
			if(!me.config.vars){
				me.config.vars = {};
			}
			me.config.vars.secret = me.down('#orderSecret').getValue();
			jsonData = {
				formNo : me.formNo,
				modeles : modeles,
				userOrderId : me.config.userOrderId,
				userOrderNo : me.config.userOrderNo,
				userOrderDescribe : me.config.userOrderDescribe,
				scopeCode : me.config.scopeCode,
				multiOrder : me.config.multiOrder,
				vars : me.config.vars
			};
			if (Ext.isFunction(me.beforeSubmit)) {
				//me.beforeSubmit(me.formNo, jsonData);
				if (me.beforeSubmit(me.formNo, jsonData) === false) {
					me.close();
					return false;
				}
			}
			var callback = function(success, formOrder, jsonData) {
				if (Ext.isFunction(me.afterSubmit)) {
					me.afterSubmit(success, formOrder, jsonData);
				}
			}
			Ext.Ajax.request({
				url : contextPath + '/workflow/orderManger!startProcessByFormNo.action?specificUser=' + (me.config.specificUser || ''),
				jsonData : jsonData,
				success : function(response, opts) {
					me.committing = false;
					me.body.unmask();
					me.down('#btnStartSign').enable();
					var obj = Ext.decode(response.responseText),
						rs = false;
					if (obj.success) {
						if (jsonData.multiOrder) {
							rs = !!obj.formOrder.orderId;
						} else {
							rs = obj.formOrderList.length > 0;
						}
						if (rs) {
							callback(true, obj, jsonData);
							me.close();
						} else {
							Ext.Msg.alert('提交簽核', '提交簽核失敗，請重試!');
							callback(false, obj, jsonData);
						}
					} else {
						Ext.Msg.alert('提交簽核', '提交簽核失敗:' + obj.message);
						callback(false, obj, jsonData);
					}
				},
				failure : function(response, opts) {
					me.committing = false;
					me.body.unmask();
					me.down('#btnStartSign').enable();
					Ext.Msg.alert('提交簽核', '提交簽核失敗，請稍候重試!');
					callback(false, null, jsonData);
				}
			});
		}, 100);
	}
});