/**
 * @desc:GRID hotKey Support!use It;
 * @date：2012/09/12
 * @author:FredHe
 */
Ext.define('Extux.grid.plugin.GridHotKeySup', {
	extend : 'Ext.AbstractPlugin',
	alias : 'plugin.gridhotkeysup',
	/**
	 * @method The init method is invoked after initComponent method has been
	 *         run for the client Component. The supplied implementation is
	 *         empty. Subclasses should perform plugin initialization, and set
	 *         up bidirectional links between the plugin and its client
	 *         Component in their own implementation of this method.
	 * @param {Ext.Component} client The client Component which owns this
	 *            plugin.
	 */
	init : function(grid) {
		var me = this;
		me.view = grid.getView();
		me.pagetoolbar = grid.down('pagingtoolbar');
		// me.pagetoolbar = coms.length > 0 ? coms[0] : null;
		if (me.pagetoolbar) {
			Ext.apply(me.pagetoolbar, {
				thumbPage : me.thumbPage,
				initKeyMap : me.initKeyMap
			});
			me.pagetoolbar.on("render", Ext.bind(me.initKeyMap, me.pagetoolbar, [me.view]), me.pagetoolbar, {
				single : true
			});
		}
		me.editing = me.getCellEditingPlugin(grid);
		me.selModel = grid.getSelectionModel();
		// if (!me.editing || !me.selModel instanceof Ext.selection.CellModel)
		// return;
		if (me.editing)
			Ext.apply(me.editing, {
				onSpecialKey : me.onSpecialKey,
				startEdit : me.startEdit
			});
		if (me.selModel && me.selModel instanceof Ext.selection.CellModel)
			Ext.apply(me.selModel, {
				onEditorKeyMove : me.onEditorKeyMove,
				onEditorTab : me.onEditorTab,
				onKeyUp : me.onKeyUp,
				onKeyDown : me.onKeyDown,
				onKeyHome : me.onKeyHome,
				onKeyEnd : me.onKeyEnd,
				onKeyLeft : me.onKeyLeft,
				onKeyRight : me.onKeyRight,
				initKeyNav : me.initKeyNav
			});
		Ext.apply(me.view, {
			walkCells : me.walkCells
		});
		if (me.editing) {
			me.view.un('render', me.editing.initKeyNavHeaderEvents, me.editing);
			me.view.on('render', me.initKeyNavHeaderEvents, me.editing, {
				single : true
			});
		}
	},
	// 翻頁
	thumbPage : function(direction, view) {
		var pageData, currPage, pageCount, afterText,
			me = this;
		var viewFocus = function(store, view) {
			if (!store.isLoading()) {
				var selModel = view.getSelectionModel();
				if (selModel) {
					selModel.select(0);
				}
				view.el.focus();
				return true;
			}
			return false;
		};
		if (!view.rendered) {
			return;
		}
		pageData = me.getPageData();
		currPage = pageData.currentPage;
		pageCount = pageData.pageCount;
		switch (direction) {
			case 'U' :
				if (currPage > 1)
					me.movePrevious();
				break;
			case 'N' :
				if (currPage < pageCount)
					me.moveNext();
				break;
			case 'H' :
				if (currPage !== 1)
					me.moveFirst();
				break;
			case 'E' :
				if (currPage !== pageCount)
					me.moveLast();
				break;
		}
		var store = me.store;
		var inId = setInterval(function() {
			doFlag = viewFocus(store, view);
			if (doFlag) {
				clearInterval(inId);
			}
		}, 100);
	},
	initKeyMap : function(view) {
		var me = this;
		if (!view.rendered) {
			view.on('render', Ext.Function.bind(me.initKeyMap, me, [view], 0), me, {
				single : true
			});
			return;
		}
		view.el.set({
			tabIndex : -1
		});
		Ext.create('Ext.util.KeyMap', {
			target : view.el,
			binding : [{
				key : Ext.EventObject.PAGE_UP, // 上一頁
				fn : Ext.Function.bind(me.thumbPage, me, ['U', view])

			}, {
				key : Ext.EventObject.PAGE_DOWN, // 下一頁
				fn : Ext.Function.bind(me.thumbPage, me, ['N', view])
			}, {
				key : Ext.EventObject.HOME, // 第一頁
				ctrl : true,
				fn : Ext.Function.bind(me.thumbPage, me, ['H', view])
			}, {
				key : Ext.EventObject.END, // 最后頁
				ctrl : true,
				fn : Ext.Function.bind(me.thumbPage, me, ['E', view])
			}]
		});

	},
	initKeyNav : function(view) {
		var me = this;
		if (!view.rendered) {
			view.on('render', Ext.Function.bind(me.initKeyNav, me, [view], 0), me, {
				single : true
			});
			return;
		}
		view.el.set({
			tabIndex : -1
		});
		// view.el has tabIndex -1 to allow for
		// keyboard events to be passed to it.
		me.keyNav = new Ext.util.KeyNav({
			target : view.el,
			ignoreInputFields : true,
			up : me.onKeyUp,
			down : me.onKeyDown,
			right : me.onKeyRight,
			left : me.onKeyLeft,
			enter : me.onKeyTab,
			tab : me.onKeyTab,
			home : me.onKeyHome,
			end : me.onKeyEnd,
			scope : me
		});

	},

	startEdit : function(record, columnHeader) {
		var me = this,
			context = me.getEditingContext(record, columnHeader), value, ed;
		// Complete the edit now, before getting the editor's target
		// cell DOM element. Completing the edit causes a row refresh.
		// Also allows any post-edit events to take effect before continuing
		me.completeEdit();

		// Cancel editing if EditingContext could not be found (possibly because
		// record has been deleted by an intervening listener), or if the grid
		// view is not currently visible
		if (!context || !me.grid.view.isVisible(true)) {
			return false;
		}

		record = context.record;
		columnHeader = context.column;

		// See if the field is editable for the requested record
		if (columnHeader && !columnHeader.getEditor(record)) {
			/*if(context.colIdx+1 > me.grid.headerCt.gridDataColumns.length){
				me.startEdit(record, 0)
			}else{
				me.startEdit(record, context.colIdx+1)
			}*/
			return false;
		}

		value = record.get(columnHeader.dataIndex);
		context.originalValue = context.value = value;
		if (me.beforeEdit(context) === false || me.fireEvent('beforeedit', me, context) === false || context.cancel) {
			/*if(context.colIdx+1 > me.grid.headerCt.gridDataColumns.length){
				me.startEdit(record, 0)
			}else{
				me.startEdit(record, context.colIdx+1)
			}*/
			return false;
		}

		ed = me.getEditor(record, columnHeader);

		// Whether we are going to edit or not, ensure the edit cell is scrolled
		// into view
		me.grid.view.cancelFocus();
		me.view.suspendEvents(false);
		me.view.focusCell({
			row : context.rowIdx,
			column : context.colIdx
		});
		me.view.resumeEvents();
		if (ed) {
			me.editTask.delay(15, me.showEditor, me, [ed, context, value]);
			return true;
		}
		return false;
	},
	getCellEditingPlugin : function(grid) {
		var i = 0,
			plugins = grid.plugins,
			ln = plugins.length;
		for (; i < ln; i++) {
			if (plugins[i] instanceof Ext.grid.plugin.CellEditing) {
				return plugins[i];
			}
		}
	},
	/**
	 * @param {Object} position The current row and column: an object containing
	 *            the following properties: - row - The row index - column - The
	 *            column index
	 * @param {String} direction 'up', 'down', 'right' and 'left'
	 * @param {Ext.EventObject} e event
	 * @param {Boolean} preventWrap Set to true to prevent wrap around to the
	 *            next or previous row.
	 * @param {Function} verifierFn A function to verify the validity of the
	 *            calculated position. When using this function, you must return
	 *            true to allow the newPosition to be returned.
	 * @param {Object} scope Scope to run the verifierFn in
	 * @returns {Object} newPosition An object containing the following
	 *          properties: - row - The row index - column - The column index
	 * @private
	 */
	walkCells : function(pos, direction, e, preventWrap, verifierFn, scope) {

		// Caller (probably CellModel) had no current position. This can happen
		// if the main el is focused and any navigation key is presssed.
		if (!pos) {
			return;
		}

		var me = this,
			row = pos.row,
			column = pos.column,
			rowCount = me.store.getCount(),
			firstCol = me.getFirstVisibleColumnIndex(),
			lastCol = me.getLastVisibleColumnIndex(),
			newPos = {
				row : row,
				column : column
			},
			activeHeader = me.headerCt.getHeaderAtIndex(column);

		// no active header or its currently hidden
		if (!activeHeader || activeHeader.hidden) {
			return false;
		}

		e = e || {};
		direction = direction.toLowerCase();
		switch (direction) {
			case 'right' :
				// has the potential to wrap if its last
				if (column === lastCol) {
					// if bottom row and last column, deny right
					if (preventWrap || row === rowCount - 1) {
						return false;
					}
					if (!e.ctrlKey) {
						// otherwise wrap to nextRow and firstCol
						newPos.row = row + 1;
						newPos.column = firstCol;
					}
					// go right
				} else {
					if (!e.ctrlKey) {
						newPos.column = column + me.getRightGap(activeHeader);
					} else {
						newPos.column = lastCol;
					}
				}
				break;

			case 'left' :
				// has the potential to wrap
				if (column === firstCol) {
					// if top row and first column, deny left
					if (preventWrap || row === 0) {
						return false;
					}
					if (!e.ctrlKey) {
						// otherwise wrap to prevRow and lastCol
						newPos.row = row - 1;
						newPos.column = lastCol;
					}
					// go left
				} else {
					if (!e.ctrlKey) {
						newPos.column = column + me.getLeftGap(activeHeader);
					} else {
						newPos.column = firstCol;
					}
				}
				break;

			case 'up' :
				// if top row, deny up
				if (row === 0) {
					return false;
					// go up
				} else {
					if (!e.ctrlKey) {
						newPos.row = row - 1;
					} else {
						newPos.row = 0;
					}
				}
				break;

			case 'down' :
				// if bottom row, deny down
				if (row === rowCount - 1) {
					return false;
					// go down
				} else {
					if (!e.ctrlKey) {
						newPos.row = row + 1;
					} else {
						newPos.row = rowCount - 1;
					}
				}
				break;
			case 'home' :
				if (row === 0) {
					return false;
				} else {
					newPos.row = 0
				}
				break;
			case 'end' :
				if (row === rowCount - 1) {
					return false;
				} else {
					newPos.row = rowCount - 1
				}
				break;
		}

		if (verifierFn && verifierFn.call(scope || window, newPos) !== true) {
			return false;
		} else {
			return newPos;
		}
	},
	onKeyUp : function(e, t) {
		var me = this,
			editingPlugin = me.getCurrentPosition().view.editingPlugin;
		this.keyNavigation = true;
		if (editingPlugin && me.wasEditing) {
			me.onEditorKeyMove(editingPlugin, e, 'up');
		} else {
			this.move('up', e);
		}
		this.keyNavigation = false;
	},

	onKeyDown : function(e, t) {
		var me = this,
			editingPlugin = me.getCurrentPosition().view.editingPlugin;
		this.keyNavigation = true;
		if (editingPlugin && me.wasEditing) {
			me.onEditorKeyMove(editingPlugin, e, 'down');
		} else {
			this.move('down', e);
		}
		this.keyNavigation = false;
	},

	onKeyLeft : function(e, t) {
		var me = this,
			editingPlugin = me.getCurrentPosition().view.editingPlugin;
		this.keyNavigation = true;
		if (editingPlugin && me.wasEditing) {
			me.onEditorKeyMove(editingPlugin, e, 'left');
		} else {
			this.move('left', e);
		}
		this.keyNavigation = false;
	},

	onKeyRight : function(e, t) {
		var me = this,
			editingPlugin = me.getCurrentPosition().view.editingPlugin;
		this.keyNavigation = true;
		if (editingPlugin && me.wasEditing) {
			me.onEditorKeyMove(editingPlugin, e, 'right');
		} else {
			this.move('right', e);
		}
		this.keyNavigation = false;
	},
	onKeyHome : function(e, t) {
		var me = this,
			editingPlugin = me.getCurrentPosition().view.editingPlugin;
		this.keyNavigation = true;
		if (editingPlugin && me.wasEditing) {
			me.onEditorKeyMove(editingPlugin, e, 'home');
		} else {
			this.move('home', e);
		}
		this.keyNavigation = false;
	},
	onKeyEnd : function(e, t) {
		var me = this,
			editingPlugin = me.getCurrentPosition().view.editingPlugin;
		this.keyNavigation = true;
		if (editingPlugin && me.wasEditing) {
			me.onEditorKeyMove(editingPlugin, e, 'end');
		} else {
			this.move('end', e);
		}
		this.keyNavigation = false;
	},
	onEditorTab : function(editingPlugin, e) {
		var me = this,
			direction = e.shiftKey ? 'left' : 'right',
			position = me.move(direction, e);

		// Navigation had somewhere to go.... not hit the buffers.
		if (position) {
			// If we were able to begin editing clear the wasEditing flag. It
			// gets set during navigation off an active edit.
			if (editingPlugin.startEditByPosition(position)) {
				me.wasEditing = false;
			}
			// If we could not continue editing...
			// Set a flag that we should go back into editing mode upon next
			// onKeyTab call
			else {
				me.wasEditing = true;
				if (!position.columnHeader.dataIndex) {
					me.onEditorTab(editingPlugin, e);
				}
			}
		} else {
			if (editingPlugin.newRecFn) {
				editingPlugin.newRecFn();
			}
		}
	},
	onSpecialKey : function(ed, field, e) {
		var me = this,
			grid = me.grid,
			sm = grid.getSelectionModel(),
			view = me.view,
			pagetoolbar = grid.down("pagingtoolbar"),
			keyValue = e.getKey(), direction;
		var comDateNumFlag = (field instanceof Ext.form.field.ComboBox || field instanceof Ext.form.field.Date || field instanceof Ext.form.field.Number);
		if (keyValue === e.TAB || (keyValue === e.ENTER && !e.ctrlKey)) {
			e.stopEvent();
			if (ed) {
				// Allow the field to act on tabs before onEditorTab, which ends
				// up calling completeEdit. This is useful for picker type
				// fields.
				ed.onEditorTab(e);
			}
			if (sm.onEditorTab) {
				sm.onEditorTab(me, e);
			}
		}
		switch (keyValue) {
			case e.DOWN :
				if (e.ctrlKey || comDateNumFlag)
					return;
				direction = 'down';
				break;
			case e.UP :
				if (e.ctrlKey || field.isExpanded || field instanceof Ext.form.field.Number)
					return;
				direction = 'up';
				break;
			case e.HOME :
				// if (!e.ctrlKey)
				// return;
				direction = 'home';
				break;
			case e.END :
				// if (!e.ctrlKey)
				// return;
				direction = 'end';
				break;
		}
		if (direction != null) {
			e.stopEvent();
			if (sm.onEditorKeyMove) {
				sm.onEditorKeyMove(me, e, direction);
			}
		}
		if (keyValue == e.PAGE_DOWN) {
			if (pagetoolbar) {
				pagetoolbar.thumbPage('N', view);
			}
		}
		if (keyValue == e.PAGE_UP) {
			if (pagetoolbar) {
				pagetoolbar.thumbPage('U', view);
			}
		}
		if (keyValue == e.HOME && e.ctrlKey) {
			if (pagetoolbar) {
				pagetoolbar.thumbPage('H', view);
			}
		}
		if (keyValue == e.END && e.ctrlKey) {
			if (pagetoolbar) {
				pagetoolbar.thumbPage('E', view);
			}
		}
		if (e.ctrlKey && e.altKey) {
			me.completeEdit();
			// view.el.focus();
		}
	},
	onEditorKeyMove : function(editingPlugin, e, direction) {
		var me = this,
			position = me.move(direction, e);
		// Navigation had somewhere to go.... not hit the buffers.
		if (position) {
			// If we were able to begin editing clear the wasEditing flag. It
			// gets set during navigation off an active edit.
			if (editingPlugin.startEditByPosition(position)) {
				me.wasEditing = false;
			}
			// If we could not continue editing...
			// Set a flag that we should go back into editing mode upon next
			// onKeyTab call
			else {
				me.wasEditing = true;
				if (!position.columnHeader.dataIndex) {
					me.onEditorKeyMove(editingPlugin, e, direction);
				}
			}
		}
	},
	initKeyNavHeaderEvents : function() {
		var me = this;
		me.keyNav = Ext.create('Ext.util.KeyNav', me.view.el, {
			esc : me.onEscKey,
			scope : me
		});
		var map = me.keyNav.map;
		if (map) {
			map.addBinding({
				key : Ext.EventObject.F2,
				fn : function(){
					me.grid.resetFocus(true);
				},
				scope : me
			});
		}
	},

	/**
	 * @method The destroy method is invoked by the owning Component at the time
	 *         the Component is being destroyed. The supplied implementation is
	 *         empty. Subclasses should perform plugin cleanup in their own
	 *         implementation of this method.
	 */
	destroy : function() {
		var me = this;
		delete me.editing;
		delete me.selModel;
		delete me.view;
		delete me.pagetoolbar;
	}

});
/**
 * @method:對所有具有hotKey的控件加熱鍵支持，通過按ctrl+alt+'字母鍵'
 */
function giveMeHotKey() {
	var hotComs = Ext.ComponentQuery.query('component[hotKey]');
	// 創建KEYMAP集合
	var keyHashMap = new Ext.util.HashMap();
	Ext.hotkey = {
		KeyMap :  new Ext.util.KeyMap({
			target : Ext.getDoc()
		})
	}
	
	var hotkeyPanel = [], 
		hotkeyCmp = [],
		item, hotKey;
	//篩選所遇需要處理焦點的panel
	for(var i=0;i<hotComs.length;i++){
		item = hotComs[i];
		hotKey = item.hotKey;
		if (Ext.isNumber(hotKey)) {
			hotkeyPanel[hotKey-1] = item;
		}else{
			hotkeyCmp.push(item);
		}
	}
	Ext.hotkey.panels = hotkeyPanel;
	//初始化所有需要處理焦點的panel
	for(var i=0;i<hotkeyPanel.length;i++){
		item = hotkeyPanel[i];
		initHotkeyPanel(item);
	}
	//處理所有的熱鍵控件
	for(var i=0;i<hotkeyCmp.length;i++){
		item = hotkeyCmp[i];
		Ext.hotkey.KeyMap.addBinding({
			key : item.hotKey,
			alt : true,
			ctrl : true,
			fn : hotkeyCmpFocus,
			scope : item
		});
	}
	if(!Ext.hotkey.lastSelectedPanelIdx){
		item = Ext.hotkey.panels[0];
		if(item && item.hotkeyFocus){
			item.hotkeyFocus();
		}
	}
	
	/*
	 * 熱鍵tip顯示
	 */
	window.regionTip = false;
	Ext.getDoc().on({
		'keydown' : function(evt, el, o) {
			if (window.regionTip === false && evt.ctrlKey && evt.altKey) {
				window.regionTip = true;
				Ext.each(Ext.hotkey.panels, function(com) {
					if(!com)return;
					if (com.hotTip && com.getPosition) {
						var win = Ext.WindowManager.getActiveWindow();
						if(win && !win.isParent(com)){
							return;
						}
						var tabpanel = com.up('tabpanel');
						if (tabpanel) {
							var tabs = tabpanel.query('tab');
							if (tabs && tabs.length > 0) {
								var tpIndex = com.tpIndex;
								if (Ext.isNumber(tpIndex)) {
									if (tabs[tpIndex] && tabs[tpIndex].active) {
										com.hotTip.showAt(com.getPosition());
									}
								} else {
									alert('請在容器中配置tpIndex，就是它位于TABPANEL中的索引！');
									return;
								}
							}

						} else {
							var upContainer = com.up('container');
							if (upContainer && !(com.isHidden() || upContainer.isHidden())) {
								com.hotTip.showAt(com.getPosition());
							}
						}
					}
				});
			}
		},
		'keyup' : function(evt, el, o) {
			if (!(evt.ctrlKey && evt.altKey)) {
				if(window.regionTip === false)return;
				window.regionTip = false;
				Ext.each(Ext.hotkey.panels, function(com) {
					if(!com)return;
					com.hotTip.hide();
				});
			}
		}
	});
}

function hotkeyCmpFocus(key, e) {
	if (this.disabled || !this.rendered)
		return;
	var win = Ext.WindowManager.getActiveWindow(),
		focusPanel = Ext.hotkey.panels[Ext.hotkey.lastSelectedPanelIdx-1],
		target = Ext.get(e.target),
		floatPanel = target.hasCls('x-layer') ? target : target.up('.x-layer'),
		eventPanel = null;
	if(win && focusPanel){
		if(win.isParent(focusPanel)){
			eventPanel = focusPanel;
		}else{
			eventPanel = win;
		}
	}else if(!win){
		//事件源於浮動窗口
		if(floatPanel){
			eventPanel = Ext.getCmp(floatPanel.id);
		}else if(focusPanel){
			eventPanel = focusPanel;
		}else{
			var p = Ext.getCmp(target.id),
				eventNodeName = target.dom.nodeName.toLowerCase();
			if(eventNodeName == 'body'){
				eventPanel = Ext.getCmp(target.down('.x-panel').id);
			}else{
				try{eventPanel = Ext.getCmp(target.up('.x-panel').id);}catch(e){}
			}
		}
	}else{
		eventPanel = win;
	}
	if(eventPanel && eventPanel.isParent(this)){
		if (this instanceof Ext.form.field.Text || this.isXType('search')) {
			this.focus();
		} else {
			var upWin = this.up('window');
			if (upWin) {
				if (!upWin.isHidden()) {
					this.fireEvent("click", this);
				}
			}  else {
				if (this.el && !this.hidden) {
					this.fireEvent("click", this);
				}
			}
		}
	}
		
	/*var win = Ext.WindowManager.getActiveWindow();
	if(win && !win.isParent(this)){
		return;
	}
	var target = Ext.get(e.target),upwin,
		uppanel = this.up('container[hotKey]');
	if(uppanel && uppanel.hotKey != Ext.hotkey.lastSelectedPanelIdx){
		return;
	}
	uppanel = this.el.up('.x-layer');
	upwin = target.hasCls('x-layer') ? target : target.up('.x-layer');
	if((uppanel == null && upwin == null) || (uppanel && upwin && uppanel.id == upwin.id)){
		if (this instanceof Ext.form.field.Text || this.isXType('search')) {
			this.focus();
		} else {
			var upWin = this.up('window');
			if (upWin) {
				if (!upWin.isHidden()) {
					this.fireEvent("click", this);
				}
			}  else {
				if (this.el && !this.hidden) {
					this.fireEvent("click", this);
				}
			}
		}
	}*/
};
function gridPanelFocus(key, e, childEvent){
	if(this.hotKey == Ext.hotkey.lastSelectedPanelIdx){
		return ;
	}
	if (this.store.getCount() > 0) {
		this.resetFocus();
	} else {
		this.view.focus();
	}
	if(childEvent !== true){
		for(var i=0;i<Ext.hotkey.panels.length;i++){
			if(!Ext.hotkey.panels[i] || !Ext.hotkey.panels[i].el)continue;
			if(Ext.hotkey.panels[i].el && Ext.hotkey.panels[i].el.hasCls('selected-grid')){
				Ext.hotkey.panels[i].el.removeCls('selected-grid');
			}
		}
		if(this.rendered){
			this.el.addCls('selected-grid');
		}else{
			this.addCls('selected-grid');
		}
		Ext.hotkey.lastSelectedPanelIdx = this.hotKey;
		if(Ext.isFunction(this.onhotkey)){
			this.onhotkey();
		}
	}
}
function formPanelFocus(key, e, childEvent){
	var fields = this.getForm().getFields(),
		len = fields.items.length,
		field, firstField;
	
	if(this.hotKey == Ext.hotkey.lastSelectedPanelIdx){
		return ;
	}
	for(var i=0;i < len;i++){
		field = fields.items[i];
		if(field.isFormField && !field.disabled && !field.readOnly){
			firstField = field;break;
		}
	}
	if(firstField){
		firstField.focus();
	}else{
		fields.items[0].focus(true);
	}
	if(childEvent !== true){
		for(var i=0;i<Ext.hotkey.panels.length;i++){
			if(!Ext.hotkey.panels[i] || !Ext.hotkey.panels[i].el)continue;
			if(Ext.hotkey.panels[i].el.hasCls('selected-grid')){
				Ext.hotkey.panels[i].el.removeCls('selected-grid');
			}
		}
		if(this.rendered){
			this.el.addCls('selected-grid');
		}else{
			this.addCls('selected-grid');
		}
		Ext.hotkey.lastSelectedPanelIdx = this.hotKey;
		if(Ext.isFunction(this.onhotkey)){
			this.onhotkey();
		}
	}
}
function layoutPanelFocus(key, e){
	var panel = this,
		form = panel.down('form'),
		grid = panel.down('grid');
	if(this.hotKey == Ext.hotkey.lastSelectedPanelIdx){
		return ;
	}
	if(form){
		formPanelFocus.call(form, key, e, true)
	}else if(grid){
		gridPanelFocus.call(grid, key, e, true);
	}
	if(Ext.hotkey.panels[Ext.hotkey.lastSelectedPanelIdx-1]){
		Ext.hotkey.panels[Ext.hotkey.lastSelectedPanelIdx-1].el.removeCls('selected-grid');
	}
	if(this.rendered){
		this.el.addCls('selected-grid');
	}else{
		this.addCls('selected-grid');
	}
	Ext.hotkey.lastSelectedPanelIdx = this.hotKey;
	if(Ext.isFunction(this.onhotkey)){
		this.onhotkey();
	}
}
//field獲得焦點時，保證form獲得焦點
function onFormFieldFocus(field){
	var panel = this;
	panel.lastEditField = field;
	if(!panel.el.hasCls('selected-grid')){
		for(var i=0;i<Ext.hotkey.panels.length;i++){
			if(!Ext.hotkey.panels[i] || !Ext.hotkey.panels[i].el)continue;
			if(Ext.hotkey.panels[i].el.hasCls('selected-grid')){
				Ext.hotkey.panels[i].el.removeCls('selected-grid');
			}
		}
		panel.el.addCls('selected-grid');
		Ext.hotkey.lastSelectedPanelIdx = this.hotKey;
		if(Ext.isFunction(panel.onhotkey)){
		panel.onhotkey();
	}
	}
}
function initHotkeyPanel(panel){
	if(!panel)return;
	var hotKey = panel.hotKey,
		keyMap = Ext.hotkey.KeyMap,
		fn;
	panel.hotTip = Ext.create('Ext.tip.Tip', {
		cls : 'hotKeyTip',
		width : 20,
		hidden : true,
		bodyStyle : {
			background : '#6FA0DD'
		},
		html : '<div style="font-size: 14px;color:#FFFF00;font-weight: bold; width:100%; text-align:center;">' + hotKey + '</div>'
	});
	if(panel instanceof Ext.form.Panel){
		panel.hotkeyFocus = formPanelFocus;
		//綁定formField的熱鍵支持
		var fields = panel.getForm().getFields(),
			len = fields.items.length,
			field;
		for(var i=0;i < len;i++){
			field = fields.items[i];
			if(field.isFormField && !field.disabled){
				field.on('focus', onFormFieldFocus, panel);
			}
		}
	}else if(panel instanceof Ext.grid.Panel){
		panel.hotkeyFocus = gridPanelFocus;
		if(panel.view.el){
			panel.view.el.on('focus', panel.hotkeyFocus, panel);
		}else{
			panel.on('afterrender', function(){
				Ext.defer(function(){panel.view.el.on('focus', panel.hotkeyFocus, panel);}, 100);
			});
		}
	}else{
		panel.hotkeyFocus = layoutPanelFocus;
	}
	//綁定熱鍵
	keyMap.addBinding({
		key : [hotKey+96, hotKey + 48],
		alt : true,
		ctrl : true,
		fn : panel.hotkeyFocus,
		scope : panel
	});
}
