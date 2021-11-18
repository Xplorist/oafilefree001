/**
 * 文件簽核作業
 * @author S7194487
 * @date 2016/06/06 08時59分
 */
Ext.define('OA.model.OaFileSignBody', {
	extend : 'Ext.data.Model',
	//model 的主鍵
	idProperty : 'fileSignBodyId',
	//model 的字段
	fields : [{
		name : 'fileSignBodyId',//主鍵ID
		type : 'number'
	}, {
		name : 'fileSignHeadId',//外鍵ID
		type : 'number'
	}, {
		name : 'signTaskOrder',//簽核任務序號
		type : 'number'
	}, {
		name : 'signTaskName',//簽核任務名稱
		type : 'string'
	}, {
		name : 'signEmpNo',//簽核人工號
		type : 'string'
	}, {
		name : 'signEmpName',//簽核人姓名
		type : 'string'
	}, {
		name : 'empNo',//工號
		type : 'string'
	}, {
		name : 'empName',//姓名
		type : 'string'
	}, {
		name : 'deptNo',//部門
		type : 'string'
	}, {
		name : 'deptName',//部門
		type : 'string'
	}, {
		name : 'isEnable',//有效否
		type : 'string'
	}, {
		name : 'creater',//創建人
		type : 'string'
	}, {
		name : 'createDate',//創建日期
		type : 'date'
	}, {
		name : 'ownerDept',//資料所屬部門
		type : 'string'
	}, {
		name : 'modifyUser',//修改人
		type : 'string'
	}, {
		name : 'modifyDate',//修改日期
		type : 'date'
	}, {
		name : 'signAxisX',
		type : 'string'
	}, {
		name : 'signAxisY',
		type : 'string'
	}, {
		name : 'pageNum',
		type : 'string'
	}, {
		name : 'copyNum',
		type : 'number'
	}, {
		name : 'isResponsible',
		type : 'string'
	}, {
		name : 'auditFocus',
		type : 'string'
	},{
	    name:'mailAddress',// 簽核人郵箱
		type : 'string'
	}]
});