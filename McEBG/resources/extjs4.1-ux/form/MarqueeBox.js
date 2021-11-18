/**
 * 消息Field 有消息隊列，可以延時顯示的組件
 */
Ext.define('Extux.form.MarqueeBox', {
	extend : 'Ext.form.Label',
	alias : 'widget.marqueebox',
	requires : ['Ext.util.Format'],

	marqueeContent : new Array(),
	messageColor : new Array(),
	fontcolor : null,
	marqueeDelay : 500,
	marqueeId : null,
	nowExec : false,
	preMsg : null,

	tplDesc : null,

	initComponent : function() {
		var em = this;
		this.fontcolor = new Array('#040147', '#C0621D', '#FF1717');
		var descTplMarkup = ['<table style="font-size:12px"><tr><td style="width:150px">創建者:&nbsp;{creater}	</td><td style="width:250px">創建時間:&nbsp;{createDate:date("Y-m-d H:i:s")}</td><td style="width:150px">修改者:&nbsp;{modifyUser}</td><td style="width:250px">修改時間:&nbsp;{modifyDate:date("Y-m-d H:i:s")}</td><td style="width:150px">資料所屬部門:&nbsp;{ownerDept}</td></tr></table>'];
		this.tplDesc = Ext.create('Ext.Template', descTplMarkup);

		this.callParent();
		Ext.apply(this, {
			html : '...'
		});
	},
	/*
	 * getrun : function() { var em = this; return function() { if (!em.nowExec) {
	 * try { em.nowExec = true; var str = em.marqueeContent.shift(); var level =
	 * em.messageColor.shift(); if (em.preMsg && em.preMsg == str && level < 2) {
	 * level++; } em.preMsg = str; level = level ? level : 0; if (str) {
	 * em.setText('<font style="font-size:12px;color:' + em.fontcolor[level] +
	 * '">' + str + '</font>', false); } else { // clearInterval(em.marqueeId); } }
	 * finally { em.nowExec = false; } } }; }, start : function() {
	 * this.marqueeId = setInterval(this.getrun(), this.marqueeDelay); },
	 */
	/* 添加新消息 */
	addMessage : function(val, level) {
		this.setText('<font style="font-size:12px">' + val + '</font>', false);
		/*
		 * this.marqueeContent.push(val); if (level) {
		 * this.messageColor.push(level); } else { this.messageColor.push(0); }
		 */
	},
	/* 顯示一條記錄的詳細信息 */
	showDetail : function(record) {
		if (record && record instanceof Ext.data.Model) {
			var desc = this.tplDesc.applyTemplate(record.data);
			this.addMessage(desc, 0);
		}
	}
});