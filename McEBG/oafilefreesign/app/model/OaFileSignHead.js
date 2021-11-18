/**
 * 文件簽核作業
 * @author S7194487
 * @date 2016/06/06 08時59分
 */
Ext.define('OA.model.OaFileSignHead', {
	extend : 'Ext.data.Model',
	// model 的主鍵
	idProperty : 'fileSignHeadId',
	// model 的字段
	fields : [{
		name : 'fileSignHeadId',// 主鍵ID
		type : 'number'
	}, {
		name : 'formNo',// 申請單號
		type : 'string'
	}, {
		name : 'empNo',// 申請人工號
		type : 'string'
	}, {
		name : 'empName',// 申請人姓名
		type : 'string'
	}, {
		name : 'applyDate',// 申請日期
		type : 'date',
		convert : dateTransFormat
	}, {
		name : 'deptNo',// 申請部門
		type : 'string'
	}, {
		name : 'deptName',// 申請部門
		type : 'string'
	}, {
		name : 'pageType',// 頁面類型
		type : 'string'
	}, {
		name : 'applyFileNo',// 申請附件
		type : 'string'
	}, {
		name : 'signFileNo',// 簽核附件
		type : 'string'
	}, {
		name : 'signFileName',// 簽核名稱
		type : 'string'
	}, {
		name : 'signFilePath',// 簽核路徑
		type : 'string'
	}, {
		name : 'signPurport',// 主旨
		type : 'string'
	}, {
		name : 'remark',// 備註
		type : 'string'
	}, {
		name : 'state',// 單據狀態:0開立1,確認2:核准S:審核中X:駁回)
		type : 'string'
	}, {
		name : 'isEnable',// 有效否
		type : 'string'
	}, {
		name : 'creater',// 創建人
		type : 'string'
	}, {
		name : 'createDate',// 創建日期
		type : 'date',
		convert : dateTransFormat
	}, {
		name : 'ownerDept',// 資料所屬部門
		type : 'string'
	}, {
		name : 'modifyUser',// 修改人
		type : 'string'
	}, {
		name : 'modifyDate',// 修改日期
		type : 'date',
		convert : dateTransFormat
	},/*
		 * 附件屬性
		 */{
		name : 'afffixGroupNo',// 分???
		type : 'string'// data_length=20
	}, {
		name : 'filePath',// 文件路徑
		type : 'string'// data_length=50
	}, {
		name : 'fileName',// 文件新名
		type : 'string'// data_length=100
	}, {
		name : 'fileOldName',// 文件原名
		type : 'string'// data_length=100
	}, {
		name : 'isChange',// 是否縮放
		type : 'string'
	}, {
		name : 'signaturePosition',// 簽名位置
		type : 'string'
	}, {
		name : 'additionFile',
		type : 'string'
	}, {
		name : 'showPageType',
		type : 'string'
	}, {
		name : 'totalPageNum',
		type : 'number'
	}, {
		name : 'importantGrade',// 重要等級
		type : 'string'
	}, {
		name : 'isSecret',// 保密性
		type : 'string'
	}, {
		name : 'secretGrade',//機密等級
		type : 'string'
	}, {
		name : 'secretGradeDesc',//機密等級
		type : 'string'
	},{
	    name:'onlyWebShow',// 只在web端顯示
		type : 'string'
	}]
});