/**
 * 參數化方式國際化,對頁面的國際化下拉框操作
 * 
 * @author FredHe
 */
var initI18NByUrl = function(combo) {
	store = combo.store;
	var params = Ext.urlDecode(window.location.search.substring(1));
	if (params.lang) {
		// check if there's really a language with that language code
		var record = store.findRecord('code', params.lang, null, null, null,
				true);
		// if language was found in store assign it as current value in
		// combobox
		if (record) {
			combo.setValue(record.data.language);
		}
	}
	if (params.lang) {

		var url = Ext.util.Format.format(contextPath+"/pub/locale"+contextPath+"-lang-{0}.js",params.lang);

		Ext.Ajax.request({
					url : url,
					success : function(response, opts) {
						eval(response.responseText);
						// i18N = Ext.create('Ext.FormElement.I18N');

					},
					failure : function(response, opts) {
						Ext.Msg.alert(i18N.systitle, '未找到國際化文件!', function() {
									window.location.search = ''
								});
					}
				});
	} else {

	}
};
/**
 * 由指定的驗證規則求出REC的錯誤,返回一個EXT的錯誤對象
 * 
 * @author FredHe
 */
var validate = function(validations, rec, grid) {
	var errors = Ext.create('Ext.data.Errors'), validators = Ext.data.validations, length, validation, field, valid, type, i, columns = grid.columns, disField, store = grid
			.getStore(), recIndex = store.indexOf(rec) + 1;
	if (validations) {
		length = validations.length;
		for (i = 0; i < length; i++) {
			validation = validations[i];
			field = validation.field || validation.name;
			type = validation.type;
			valid = validators[type](validation, rec.get(field));
			Ext.each(columns, function(column) {
						if (column.dataIndex == field) {
							disField = column.text;
							return false;
						}
					});
			if (!valid) {
				errors.add({
							field : disField,
							message : validation.message
									|| validators[type + 'Message']
						});
			}
		}
		if (errors.length > 0)
			errors.recIndex = recIndex; // 這里給errors增加一個自定義屬性記錄行數
	}

	return errors;
}
/**
 * 將Ext的Form表單所有FIELD置為空
 * 
 * @author FredHe
 */
var resetToEmpty = function(form) {
	var me = form;
	me.batchLayouts(function() {
				me.getFields().each(function(f) {
							f.originalValue = ''; // 將FIELD的初始值設為空,以便重置的時候,將它置為空
							f.reset();
						});
			});
	return me;
};

/* 統一console打印 */
window.log = function(obj) {
	if (window.console) {
		console.log(obj);
	} else {
		alert(obj);
	}
};
/**
 * 日期快捷方法
 * @type 
 */
window.DateUtil = {
	/**
	 * 獲取一天的開始
	 * @param {} date
	 * @return {}
	 */
	getDayStart : function(date) {
		var y = date.getYear(), m = date.getMonth(), d = date.getDate();
		return new Date(y, m, d);
	},
	/**
	 * 獲取一天的結束
	 * @param {} date
	 * @return {}
	 */
	getDayEnd : function(date) {
		var y = date.getYear(), m = date.getMonth(), d = date.getDate();
		return new Date(y, m, d + 1);
	},
	/**
	 * 比較兩個日期的大小(d1>=d2)
	 * @param {} d1
	 * @param {} d2
	 * @return {Boolean}
	 */
	compareDate : function(d1, d2) {
		if(!d1 || !d2){
			return false;
		}
		return DateUtil.getDayStart(d1).getTime() >= DateUtil.getDayStart(d2).getTime()
	}
};
/**
 * 簡單的ajax調用post請求
 * 
 * @param url
 *            請求地址（從應用程序開始的絕對路徑）
 * @param param
 *            要請求的參數
 * @param fn
 *            請求結果的囘調函數:function(json: responseJson, bool: requestState)
 */
window.doajax = function(url, param, fn) {
	jQuery.ajax({
				type : "POST",
				url : contextPath + url,
				data : param,
				dataType : "json",
				success : function(response, textStatus) {
					fn.call(this, response, true);
				},
				error : function(XMLHttpRequest, textStatus, errorThrown) {
					fn.call(this, errorThrown, false);
				}
			});
};
window.doRequest = function(url, param) {
	var data = jQuery.ajax({
		type : "POST",
		data : param,
		url : contextPath + url,
		async : false
	});
	if (data.status == 200) {
		try {
			return jQuery.parseJSON(data.responseText);
		} catch (e) {
			return data.responseText;
		}
	} else {
		Ext.alert('提示','服務器無法響應你的請求，請聯繫資訊人員處理。');
	}
};
/**
 * 加載權限控制
 * 
 * @param container
 *            需要加載權限的容器
 * @param controler
 *            控制器
 */
window.LoadControl = function(container, controler) {
	if (controler instanceof Array) {
		for (var i = 0; i < controler.length; i++) {
			var p = controler[i];
			if (p == null || p.length == 0) {
				continue;
			}
			var c = container.down("#" + p);
			if (c) {
				c.setDisabled(false);
			}
		}
	} else {
		if (controler == null || controler.length == 0) {
			return;
		}
		var c = container.down("#" + controler);
		if (c) {
			c.setDisabled(false);
		}
	}
};
window.decodeObject = function(obj, i) {
	var msg = '', level;
	if (i) {
		level = i;
	} else {
		level = 0;
	}
	if (level >= 3)
		return leftFit(obj.toString(), level, '&nbsp;&nbsp;&nbsp;');
	if (typeof obj == 'string') {
		return obj.toString();
	}
	for (var key in obj) {
		if (obj.hasOwnProperty(key)) {
			if (typeof obj[key] !== 'object') {
				msg += leftFit((key.toString() + " -> " + obj[key] + '<br>'),
						level, '&nbsp;&nbsp;&nbsp;');
			} else {
				msg += leftFit((key.toString() + " -> <br>"
								+ decodeObject(obj[key], level + 1) + '<br>'),
						level, '&nbsp;&nbsp;&nbsp;');
			}
		}
	}
	return msg;
};
window.leftFit = function(str, len, ch) {
	if(str.toString().length>len)
		return str;
	
	for (var i = 0; i < len-str.toString().length; i++) {
		str = ch + str;
	}
	return str;
};
Ext.isIp = function(ip){
	if(ip=="")return false;
	var exp= /^(([1-9]|([1-9]\d)|(1\d\d)|(2([0-4]\d|5[0-5])))\.)(([0-9]|([1-9]\d)|(1\d\d)|(2([0-4]\d|5[0-5])))\.){2}([1-9]|([1-9]\d)|(1\d\d)|(2([0-4]\d|5[0-5])))$/;
	return exp.test(ip);
}
/* 常用的驗證 */
window.Validator = {
	/**
	 * 是否空
	 * @param {} val
	 * @return {Boolean}
	 */
	isNull : function(val) {
		if (val && val.length !== 0) {
			return false;
		}
		return true;
	},
	/**
	 * 是否數字
	 * @param {} val
	 * @return {}
	 */
	isNumber : function(val) {
		return !isNaN(val);
	},
	/**
	 * 是否IP
	 * @param {} val
	 * @return {Boolean}
	 */
	isIP : function(val) {
		if (Validator.isNull(val))
			return false;
		return Ext.isIp(val);
	},
	/**
	 * 是否Mail
	 * @param {} val
	 * @return {Boolean}
	 */
	isEmail : function(val) {
		if (Validator.isNull(val))
			return false;
		return val.search('^[\\w-]+(\\.[\\w-]+)*@[\\w-]+(\\.[\\w-]+)+$') == 0;
	},
	/**
	 * 是否日期
	 * @param {} val
	 * @return {Boolean}
	 */
	isDate : function(val) {
		if (Validator.isNull(val))
			return false;
		return (val instanceof Date) || (val.search('d{4}-d{2}-d{2}') == 0)
				|| (val.search('d{4}-d{2}-d{2} {2}:{2}:{2}') == 0);
	}
};

//驗證工號是否有效 F1930230 2011-8-12
function verifyEmployeeNo(employeeNo){
	var json = doRequest('/juri/manage/queryEmpName.action',{empNo:employeeNo});
	return json.success;
}

//驗證部門是否有效 F1930230 2011-8-12
function verifyDptNo(deptNo){
	var json = doRequest('/pub/queryDeptName.action',{deptNo:deptNo});
	return json.success;
}

/**
 * 在刪除前，查詢相關表有多少條相關記錄
 */
function countRecord(tableName,columnField,value){
	var response;
	if(Ext.isObject(columnField)){
		response = doRequest('/pub/countRecord2.action',Ext.merge({tableName: tableName},columnField));
	}else{
		response = doRequest('/pub/countRecord.action',{tableName: tableName,columnField: columnField,value: value});
	}
	if(response && response.success){
		return response.data;
	}else{
		return false;
	}
}
/**
 * 獲取 下一個 sequence值
 */
function getNextPkSeqNum(){
	var response = doRequest('/pub/getNextPkSeqNum.action');
	if(response && response.success){
		return response.data;
	}else{
		return null;
	}
}
function queryRelateRecord(tableName,options){
	var response = $.ajax({
		type: "POST",
		url: contextPath+"/pub/queryRelateRecord.action",
		data: Ext.encode({tableName: tableName, options: options instanceof Array?options:[options]}),
		processData: false,
		contentType: 'application/json',
		async: false
	});
	if (response.status == 200) {
		try {
			return jQuery.parseJSON(response.responseText).data;
		} catch (e) {
			return false;
		}
	} else {
		Ext.alert('提示','服務器無法響應你的請求，請聯繫資訊人員處理。');
	}
}