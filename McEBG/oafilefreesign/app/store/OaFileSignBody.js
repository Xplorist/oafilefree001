/**
 * 文件簽核作業
 * @author S7194487
 * @date 2016/06/06 08時59分
 */
Ext.define('OA.store.OaFileSignBody', {
	extend : 'Ext.data.Store',
	//store所關聯的model
	model : 'OA.model.OaFileSignBody',
	//存儲代理
	proxy : {
		//代理的類型
		type : 'ajax',
		//開啟cache
		noCache : false,
		//請求方式
		actionMethods : {
			read : 'POST'
		},
		//指定CURD的url
		api : {
	        read : contextPath + '/oaFileFreeSign/oaFileFreeSign_queryBodyList.action',
			create : contextPath + '/oaFileFreeSign/oaFileFreeSign_addBody.action',
			update : contextPath + '/oaFileFreeSign/oaFileFreeSign_updateBody.action',
			destroy : contextPath + '/oaFileFreeSign/oaFileFreeSign_deleteBodyById.action'
		},
		//讀取的配置
		reader : {
			type : 'json',
			root : 'oaFileBodyList'
		},
		//回寫的配置
		writer : {
			type : 'json',
			root : 'oaFileBodyList',
			allowSingle : false
		}
	}
});