/**
 * 文件簽核預覽彈出框
 * @author S7194487
 * @date 2016/06/15 08時59分
 */
Ext.define('OA.view.FilePreviewWin', {
	extend : 'Ext.window.Window',
	alias : 'widget.filepreviewwin',
	title : '文件簽核信息預覽',
	modal : true,
	maximized : true,
	closeAction : 'destroy',
	autoScroll : true,
	buttonAlign : 'center',
	signBlock : [],

	initComponent : function() {
		var me = this;
		Ext.apply(me, {
			buttons : [{
				xtype : 'button',
				itemId : 'submitBtn',
				text : '提交(S)',
				hotKey : 'S',
				tooltip : 'Ctrl+Alt+S',
				iconCls : 'icon-page-save',
				hotSelector : 'filepreviewwin'

			}, '-', {
				xtype : 'button',
				itemId : 'addCancelBtn',
				text : '取消(C)',
				hotKey : 'C',
				tooltip : 'Ctrl+Alt+C',
				hotSelector : 'filepreviewwin',
				iconCls : 'icon-page-cancel',
				listeners : {
					click : {
						fn : function() {
							me.close();
						}
					}
				}
			}],
			items : [{
				xtype : 'label',
				width : 1060,
				itemId : 'message',
				html : '請<label style="color:blue;">拖動</label>簽名到合適的位置'
			}, {
				width : 1060,
				itemId : 'order-view',
				xtype : 'component',
				listeners : {
					resize : function(c, width, height, oldWidth, oldHeight) {
					}
				}
			}],
			listeners : {
				close : function(w) {
					me.cleanSignMark();
				},
				show : function() {
					me.signBlock.length = 0;
				}
			}
		});
		this.callParent();
	},
	initSignMarkContextMenu: function(args){
		var me = this,
			subMenu = [];
		function moveSignMarkToPageNum(signMark, pageNum, args){
			var pos = signMark.getPosition(true);
			signMark.setPosition(pos[0], pos[1]%args.pageHeight+(pageNum-1)*args.pageHeight);
		}
		for(var i=0;i<args.pageCount;i++){
			subMenu.push({
				text: '第'+(i+1)+'頁',
				toPageNum: i+1,
				handler : function(){
					moveSignMarkToPageNum(me.signMarkContextMenu.bindSignMark, this.toPageNum, args);
					me.signMarkContextMenu.hide();
				}
			});
		}
		me.signMarkContextMenu = new Ext.menu.Menu({
			float : true,
			items : [{
				text : "移動到",
				iconCls : 'leaf',
				menu: subMenu
			}]
		});
	},
	//增加一個簽名
	addSignMark : function(taskId, taskName, userName, x, y, pageType, args) {
		console.log(taskId);
		var me = this;
		var listeners = {
            contextmenu : function(e, ele) {
				e.preventDefault();
				e.stopEvent();
				me.signMarkContextMenu.bindSignMark = Ext.fly(ele).up('.sign-mark');
				me.signMarkContextMenu.bindSignMark = Ext.getCmp(me.signMarkContextMenu.bindSignMark.id);
				me.signMarkContextMenu.showAt(e.getXY());
			}
        };
        //判斷如果是A3紙張，現有簽名需要縮小A3.scale比例
		if (pageType == "2") {
			var sign = Ext.create('Ext.Component', {
				id : 'sign-' + taskId,
				cls : 'sign-mark',
				html : '<table style="width:69px;height:32px;"><tr><td style="text-align: center;width:76px;height:37px;">' + userName + '</td></tr></table>',
				style : 'border:dashed 1px #A0A0A0;cursor: move;font-family:simsun;font-size:14px;font-weight:bold;color:#A0A0A0;background-color: #FF8040;',
				listeners : {
					afterrender : function(s) {
						s.el.position('absolute', 10, x, y);
						var drag = new Extux.util.DragUtil(s);
						drag.startDrag = me.startDrag;
						s.drag = drag;
						s.mon(s.getEl(), listeners);
					}
				}
			});
		} else {
			var sign = Ext.create('Ext.Component', {
				id : 'sign-' + taskId,
				cls : 'sign-mark',
				html : '<table style="width:98px;height:45px;"><tr><td style="text-align: center;width:108px;height:52px;">' + userName + '</td></tr></table>',
				style : 'border:dashed 1px #A0A0A0;cursor: move;font-family:simsun;font-size:14px;font-weight:bold;color:#A0A0A0;background-color: #FF8040;',
				listeners : {
					afterrender : function(s) {
						s.el.position('absolute', 10, x, y);
						var drag = new Extux.util.DragUtil(s);
						drag.startDrag = me.startDrag;
						s.drag = drag;
						s.mon(s.getEl(), listeners);
					}
				}
			});
		}

		this.add(sign);
		this.signBlock.push(sign);
	},
	//清除所有簽名
	cleanSignMark : function() {
		for (var i = 0; i < this.items.keys.length; i++) {
			if (this.items.keys[i].lastIndexOf('sign-', 0) === 0) {
				this.items.removeAtKey(this.items.keys[i--]);
			}
		}
	},
	//獲取簽名位置
	getSignMarkPositions : function() {
		var me = this,
			ids = [],
			signMarks = [], sign, id, pos,
			exception = false;
		for (var i = 0; i < this.signBlock.length; i++) {
			sign = this.signBlock[i];
			if (sign.id.lastIndexOf('sign-', 0) === 0) {
				id = sign.id.replace('sign-', '');
				if (!id)
					continue;
				pos = sign.drag.getFloatOverTarget();
				if (!pos) {
					exception = true;
					var taskUser = sign.el.query('td:first'),
						taskUser = taskUser.length > 0 ? taskUser[0].innerText : '未知節點';
					Ext.Msg.alert('提示', '請設置<font color="red">' + taskUser + '</font>簽名節點的位置');
					break;
				}
				signMarks.push({
					fileSignBodyId : id,
					pageNum : pos.pageNum,
					signAxisX : pos.left,
					signAxisY : pos.top
				});
			}
		}
		if (exception)
			return false;
		return signMarks;
	},
	startDrag : function(x, y) {
		var dragTarget = Ext.get(this.dragElId);
		dragTarget.setStyle('background-color', 'white');
	}
})
