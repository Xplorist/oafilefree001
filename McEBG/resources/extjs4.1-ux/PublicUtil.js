/**
 * 同步post請求服務器
 * @param {} url 請求地址
 * @param {} param 請求參數
 * @return responseText
 */
var syncPostRequest = function(url, param) {
	var jsonData, formData, responseText;
	if (Ext.isString(param)) {
		formData = param;
	} else {
		jsonData = param;
	}
	Ext.Ajax.request({
		url : url,
		async : false,
		params : formData,
		jsonData : jsonData,
		success : function(response, opts) {
			responseText = response.responseText;
		},
		failure : function(response, opts) {
			Ext.Msg.alert('同步请求错误', '同步请求服务器"' + url + '"错误!');
		}
	});
	return Ext.decode(responseText);
};
var doRequest = function(url, params) {
	var jsonData, formData, res;
	Ext.Ajax.request({
		url : url,
		method : 'POST',
		async : false,
		params : params,
		success : function(response, opts) {
			res = response;
		},
		failure : function(response, opts) {
			Ext.Msg.alert('同步请求错误', '同步请求服务器"' + url + '"错误!');
		}
	});
	if (res.status == 200) {
		try {
			return Ext.decode(res.responseText);
		} catch (e) {
			return res.responseText;
		}
	} else {
		Ext.Msg.alert('提示', '服務器無法響應你的請求，請聯繫資訊人員處理。');
	}
};
window.leftFit = function(str, len, ch) {
	if (str.toString().length > len)
		return str;

	for (var i = 0; i < len - str.toString().length; i++) {
		str = ch + str;
	}
	return str;
};
/**
 * 從網頁的url中獲取 get參數的值
 */
function GetQueryString(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	var r = window.location.search.substr(1).match(reg);
	if (r != null){
	    return unescape(r[2]);
	}else{
	    r = window.top.location.search.substr(1).match(reg);
	    if(r!=null){
	        return unescape(r[2]);
	    }
	}	
	return 'juri';
};
Ext.merge(Ext.form.field.VTypes, {
	validIP : function(val, field) {
		return Ext.isIp(val);
	},
	validIPText : '錯誤的IP地址，請檢查輸入',
	validNum : function(val, field) {
		return (/^[0-9]+$/).test(val);
	},
	validNumText : '錯誤的數字，此欄位只允許輸入數字',
	//一般編號的驗證，允許字母數字和中杠
	validNo : function(val, field) {
		return (/^[A-Za-z0-9\-_]+$/).test(val);
	},
	validNoText : '錯誤的編號，只允許數據字母數字、中杠和下劃線',
	//部門編號的驗證
	validDeptNo : function(val, field) {
		return (/^[A-Za-z0-9]+$/).test(val);
	},
	validDeptNoText : '錯誤的部門編號，只允許數據字母數字',
	//员工编号的驗證
	validEmpNo : function(val, field) {
		return (/^[A-Za-z0-9]+$/).test(val);
	},
	validEmpNoText : '錯誤的員工編號，只允許數據字母數字',
	validIdNum : function(val, field){
		return (/^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/).test(val);
	},
	validIdNumText : '錯誤的身份證號，請填寫正確的身份證信息',
	//驗證手機號
	validPhoneNum :function(val, field){
		return (/^1[3|4|5|7|8]\d{9}$/.test(val));
	},
	validPhoneNumText : '錯誤的手機號，請填寫正確的中國手機號碼'
});
//驗證IP
Ext.isIp = function(ip) {
	if (!ip)
		return false;
	var exp = /^(([1-9]|([1-9]\d)|(1\d\d)|(2([0-4]\d|5[0-5])))\.)(([0-9]|([1-9]\d)|(1\d\d)|(2([0-4]\d|5[0-5])))\.){2}([1-9]|([1-9]\d)|(1\d\d)|(2([0-4]\d|5[0-5])))$/;
	return exp.test(ip);
};
/* 常用的驗證 */
window.Validator = {
	/**
	 * 是否空
	 * @param {} val
	 * @return {Boolean}
	 */
	isNull : function(val) {
		if (val && val.length !== 0) { //用Ext.isEmpty
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
		return !isNaN(val); //用Ext.isNumber
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
		return (val instanceof Date) || (val.search('d{4}-d{2}-d{2}') == 0) //用Ext.isDate
		    || (val.search('d{4}-d{2}-d{2} {2}:{2}:{2}') == 0);
	}
};

/**
 * 時間格式化函數,用於extjs app下的model的時間字段conver
 * @param {} val
 * @param {} rec
 * @return {}
 */
converDateFormats = ['Y-m-d H:i:s', 'Y-m-d\\TH:i:s'];//格式化字符
function convertFormatDate(val, rec) {
	var retVal = null;
	if (val) {
		Ext.each(converDateFormats, function(formatStr) {
			retVal = Ext.Date.parse(val, formatStr, true);
			if (!!retVal) {
				return false;
			} else {
				retVal = val;
			}
		});
	}
	return retVal;
}

function charLen(val){
    var len=0;
    for(var i=0;i<val.length;i++){
        var a=val.charAt(i);
        if(a.match(/[^\x00-\xff]/ig)!=null){
            len+=2;
        }else{
            len+=1;
        }
    }
    return len;
}

//浮點型數據精確加法
function add(v1,v2){
	var a,b,c,d,e;
    var arg1=v1.toString().split(".");
    if(arg1.length>1){
        a=arg1[1].length;
    }else{
        a=0;
    }
    var arg2=v2.toString().split(".");
    if(arg2.length>1){
        b=arg2[1].length;
    }else{
        b=0;
    }
    d=Number(v1.toFixed(Math.max(a,b)).toString().replace(".",""))
    e=Number(v2.toFixed(Math.max(a,b)).toString().replace(".",""))
    c=Math.pow(10,Math.max(a,b))
    return (d+e)/c;
}

//浮點型數據精確減法
function sub(v1,v2){
	var a,b,c,d,e;
    var arg1=v1.toString().split(".");
    if(arg1.length>1){
        a=arg1[1].length;
    }else{
        a=0;
    }
    var arg2=v2.toString().split(".");
    if(arg2.length>1){
        b=arg2[1].length;
    }else{
        b=0;
    }
    d=Number(v1.toFixed(Math.max(a,b)).toString().replace(".",""))
    e=Number(v2.toFixed(Math.max(a,b)).toString().replace(".",""))
    c=Math.pow(10,Math.max(a,b))
    return (d-e)/c;
}

//浮點型數據精確乘法
function mul(v1,v2){
	var a,b,c,d,e;
    var arg1=v1.toString().split(".");
    if(arg1.length>1){
        a=arg1[1].length;
    }else{
    	a=0;
    }
    var arg2=v2.toString().split(".");
    if(arg2.length>1){
        b=arg2[1].length;
    }else{
    	b=0;
    }
    c=Number(v1.toFixed(Math.max(a,b)).toString().replace(".",""))
    d=Number(v2.toFixed(Math.max(a,b)).toString().replace(".",""))
    e=Math.pow(100,Math.max(a,b))
    return (c*d)/e;
}

//浮點型數據精確除法    scale暫時未考慮
function div(v1,v2,scale){
	var a,b,c,d,e;
    var arg1=v1.toString().split(".");
    if(arg1.length>1){
        a=arg1[1].length;
    }else{
    	a=0;
    }
    var arg2=v2.toString().split(".");
    if(arg2.length>1){
        b=arg2[1].length;
    }else{
    	b=0;
    }
    c=Number(v1.toFixed(Math.max(a,b)).toString().replace(".",""))
    d=Number(v2.toFixed(Math.max(a,b)).toString().replace(".",""))
    e=Math.pow(10,b-a);
    return c/d*e;
}
