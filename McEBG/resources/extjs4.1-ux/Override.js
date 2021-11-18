if(!window.contextPath){
	contextPath = '/McEBG'
}
Ext.Loader.setConfig({
	enabled : true,
	paths : {
		'Extux' : contextPath + '/resources/extjs4.1-ux',
		"Ext" : contextPath + '/resources/extjs4.1'
	}
});
Ext.form.Field.prototype.msgTarget = 'side';

//////////////////
/*Ext.focusElStack = [];
Ext.Element.prototype.focus = function(defer, dom){
	var me = this,
        scrollTop,
        body;
    dom = dom || me.dom;
    body = (dom.ownerDocument || DOC).body || DOC.body;
    try {
        if (Number(defer)) {
            Ext.defer(me.focus, defer, me, [null, dom]);
        } else {
    		var elId = me.id,
	        	idx = Ext.Array.indexOf(Ext.focusElStack, elId);
	        if(idx == -1){
	        	Ext.focusElStack.push(elId);
	        	//console.log('1 put focus on '+elId+': '+Ext.focusElStack.join(', '));
	        }else{
	        	Ext.focusElStack.length = idx+1;
	        	//console.log('1 return focus on '+elId+': '+Ext.focusElStack.join(', '));
	        }
            
            dom.focus();
            if (dom.offsetHeight > Element.getViewHeight()) {
                scrollTop = body.scrollTop;
            }
            if (scrollTop !== undefined) {
                body.scrollTop = scrollTop;
            }
        }
    } catch(e) {
    }
    return me;
};
Ext.AbstractComponent.prototype.onFocus = function(e){
	var me = this,
        focusCls = me.focusCls,
        focusEl = me.getFocusEl();
    if (!me.disabled) {
    	console.log('2 put focus on ');
    	var elId = me.el.id,
        	idx = Ext.Array.indexOf(Ext.focusElStack, elId);
        if(idx == -1){
        	Ext.focusElStack.push(elId);
        	//console.log('2 put focus on '+elId+': '+Ext.focusElStack.join(', '));
        }else{
        	Ext.focusElStack.length = idx+1;
        	//console.log('2 return focus on '+elId+': '+Ext.focusElStack.join(', '));
        }
        me.preFocus(e);
        if (focusCls && focusEl) {
            focusEl.addCls(me.addClsWithUI(focusCls, true));
        }
        if (!me.hasFocus) {
            me.hasFocus = true;
            me.fireEvent('focus', me, e);
        }
    }
};
Ext.Component.prototype.hide = function() {
    var me = this;

    me.showOnParentShow = false;
    if (!(me.rendered && !me.isVisible()) && me.fireEvent('beforehide', me) !== false) {
        me.hidden = true;
        if (me.rendered) {
            me.onHide.apply(me, arguments);
            var id,i;
		    for(i=Ext.focusElStack.length-1;i>=0;i--){
		    	id=Ext.focusElStack[i];
		    	if(!me.el.down('#'+id)){
		    		break;
		    	}
		    }
		    if(i >= 0){
		    	Ext.focusElStack.length = i+1;
		    	//console.log('3 return focus on '+id+': '+Ext.focusElStack.join(', '));
		    	try {
					//console.log('3 focus on: '+id);
	    			var cmp = Ext.getCmp(id),
	    				el = Ext.get(id);
					if(cmp){
						cmp.focus();
					}else{
						el.focus();
					}
				} catch (e) {
					//console.log('can not focus on ' + id);
				}
		    }
        }
    }
    return me;
};*/
////////////////
Ext.focusElStack = []
Ext.Element.prototype.focus = function(defer, dom){
	var me = this,
        scrollTop,
        body;
    dom = dom || me.dom;
    body = (dom.ownerDocument || DOC).body || DOC.body;
    try {
        if (Number(defer)) {
            Ext.defer(me.focus, defer, me, [null, dom]);
        } else {
    		var elId = me.id,
	        	idx = Ext.Array.indexOf(Ext.focusElStack, elId);
	        if(idx == -1){
	        	Ext.focusElStack.push(elId);
	        	//console.log('1 put focus on '+elId+': '+Ext.focusElStack.join(', '));
	        }else{
	        	Ext.focusElStack.length = idx+1;
	        	//console.log('1 return focus on '+elId+': '+Ext.focusElStack.join(', '));
	        }
            
            dom.focus();
            if (dom.offsetHeight > Element.getViewHeight()) {
                scrollTop = body.scrollTop;
            }
            if (scrollTop !== undefined) {
                body.scrollTop = scrollTop;
            }
        }
    } catch(e) {
    }
    return me;
};
Ext.override(Ext.AbstractComponent, {
    onFocus: function() {
        this.callParent(arguments);
        var elId = this.id,
        	idx = Ext.Array.indexOf(Ext.focusElStack, elId);
        if(idx == -1){
        	Ext.focusElStack.push(elId);
        	//console.log('2 put focus on '+elId+': '+Ext.focusElStack.join(', '));
        }else if(idx+1 < Ext.focusElStack.length){
        	Ext.focusElStack.length = idx+1;
        	//console.log('2 return focus on '+elId+': '+Ext.focusElStack.join(', '));
        }
        if (Ext.FocusManager.enabled && this.hasFocus) {
            Array.prototype.unshift.call(arguments, this);
            Ext.FocusManager.onComponentFocus.apply(Ext.FocusManager, arguments);
        }
    },
    onBlur: function() {
        this.callParent(arguments);
        var elId = this.id,
        	idx = Ext.Array.indexOf(Ext.focusElStack, elId);
        if(idx != -1){
        	Ext.focusElStack.length = idx;
        	//console.log('3 return blur on '+elId+': '+Ext.focusElStack.join(', '));
        }
        if (Ext.FocusManager.enabled && !this.hasFocus) {
            Array.prototype.unshift.call(arguments, this);
            Ext.FocusManager.onComponentBlur.apply(Ext.FocusManager, arguments);
        }
    },
    onDestroy: function() {
        this.callParent(arguments);
        if (Ext.FocusManager.enabled) {
            Array.prototype.unshift.call(arguments, this);
            Ext.FocusManager.onComponentDestroy.apply(Ext.FocusManager, arguments);
        }
    }
});
Ext.override(Ext.Component, {
    afterHide: function() {
        this.callParent(arguments);
        //console.log('on hide '+this.id);
        var id,i;
	    for(i=Ext.focusElStack.length-1;i>=0;i--){
	    	id=Ext.focusElStack[i];
	    	if(!this.el || !this.el.down('#'+id)){
	    		break;
	    	}
	    }
	    if(i >= 0){
	    	Ext.focusElStack.length = i+1;
	    	//console.log('4 return focus on '+id+': '+Ext.focusElStack.join(', '));
	    	try {
				//console.log('3 focus on: '+id);
    			var cmp = Ext.getCmp(id),
    				el = Ext.get(id);
				if(cmp){
					cmp.focus();
				}else{
					el.focus();
				}
			} catch (e) {
				//console.log('can not focus on ' + id);
			}
	    }
        if (Ext.FocusManager.enabled) {
            Array.prototype.unshift.call(arguments, this);
            Ext.FocusManager.onComponentHide.apply(Ext.FocusManager, arguments);
        }
    }
});
        
Ext.WindowManager.getActiveWindow = function(){
	var me = this,
        stack = me.zIndexStack,
        len = stack.length,
        comp;

    for (var i = len - 1; i >= 0; i--) {
        comp = stack[i];
        if(!comp.isVisible() || comp.el.dom.style.display == 'none')continue;
        if(comp instanceof Ext.tip.Tip)continue;
        if(comp instanceof Ext.panel.Panel) {
           return comp;
        }
    }
    return null;
};
Ext.Component.prototype.isParent = function(child) {
	var me = this,
		parent = child.getBubbleTarget();
	if (parent) {
		for (; parent; parent = parent.getBubbleTarget()) {
			if (me === parent) {
				return true;
			}
		}
	}
	return false;
};
Ext.Msg.onLeftRightKey = function(key, e){
	if(key == Ext.EventObject.LEFT){
		var items = this.dockedItems.items[1].items.items,
			len = items.length,
			item, leftItem;
		for(var i=0;i<len;i++){
			item = items[i];
			if(item.hidden)continue;
			if(item.hasCls('x-btn-focus')){
				break;
			}else{
				leftItem = item;
			}
		}
		if(leftItem){
			leftItem.focus();
		}
	}else if(key == Ext.EventObject.RIGHT){
		var items = this.dockedItems.items[1].items.items,
			len = items.length,
			item, rightItem = null, preItem = null;
		for(var i=0;i<len;i++){
			item = items[i];
			if(item.hidden)continue;
			if(preItem && preItem.hasCls('x-btn-focus')){
				rightItem = item;break;
			}else{
				preItem = item;
				continue;
			}
		}
		if(rightItem){
			rightItem.focus();
		}
	}
};
Ext.Msg.on('show', function(){
	var keymap = this.getKeyMap();
	if(!keymap)return;
	keymap.addBinding({
		key : [Ext.EventObject.LEFT,Ext.EventObject.RIGHT],
		alt : false,
		ctrl : false,
		fn : this.onLeftRightKey,
		scope : this
	});
});
Ext.Msg.on('hide', function(){
	var keymap = this.getKeyMap();
	if(!keymap)return;
	keymap.removeBinding({
		key : [Ext.EventObject.LEFT,Ext.EventObject.RIGHT],
		alt : false,
		ctrl : false,
		fn : this.onLeftRightKey,
		scope : this
	});
});
//複寫window，msg，顯示時屏蔽底層快捷鍵響應
//Ext.Component.prototype.show = function(animateTarget, cb, scope) {
//	var me = this,
//		rendered = me.rendered;
//
//	if (rendered && me.isVisible()) {
//		if (me.toFrontOnShow && me.floating) {
//			me.toFront();
//		}
//	} else {
//		if (me.fireEvent('beforeshow', me) !== false) {
//			me.hidden = false;
//			if (!rendered && (me.autoRender || me.floating)) {
//				me.doAutoRender();
//				rendered = me.rendered;
//			}
//
//			if (rendered) {
//				me.beforeShow();
//				me.onShow.apply(me, arguments);
//				me.afterShow.apply(me, arguments);
//			}
//		} else {
//			me.onShowVeto();
//		}
//	}
//	//增加代碼
//	if(this.$className == 'Ext.window.Window'){
//		console.log(this)
//	}
//	return me;
//};
//Ext.panel.Panel.prototype.close = function() {
//	if (this.fireEvent('beforeclose', this) !== false) {
//		this.doClose();
//	}
//	//增加代碼
//	if(this.$className == 'Ext.window.Window'){
//		console.log(this)
//	}
//};
//ext從服務器讀取json時，自動轉換日期格式
//常見日期格式Y-m-d H:i:s,Y-m-d,Y-m-d\\TH:i:s
Ext.data.Types.DATE.convert = function(v) {
	var df = this.dateFormat, parsed;
	var defaultFormat = ['Y-m-d\\TH:i:s','Y-m-d H:i:s','Y-m-d'];
	if (!v) {
		return null;
	}
	if (Ext.isDate(v)) {
		return v;
	}
	if (df) {
		if (defaultFormat.indexOf(df) != -1){
			return Ext.Date.parse(v, df);
		}
		if (df == 'timestamp') {
			return new Date(v * 1000);
		}
		if (df == 'time') {
			return new Date(parseInt(v, 10));
		}
		return Ext.Date.parse(v, df);
	}

	parsed = Date.parse(v);
	if(parsed){
		return new Date(parsed);
	}else{
		var r;
		for(var i=0;i<defaultFormat.length;i++){
			try{
				r = Ext.Date.parse(v, defaultFormat[i]);
				if(Ext.isDate(r))return r;
			}catch(e){
			}
		}
	}
};
//覆蓋text的maxlength驗證
String.getBlength = function(str) {
    for (var i = str.length, n = 0; i--; ) {
        n += str.charCodeAt(i) > 255 ? 2 : 1;
    }
    return n;
}

/**
 * textField增加提示長度功能
 * @param {} newVal
 * @param {} oldVal
 */
Ext.form.field.Text.prototype.onChange = function(newVal, oldVal) {
	if (this.validateOnChange) {
		this.validate();
	}
	this.checkDirty();
	if(this.inEditor !== true && this.maxLength < Number.MAX_VALUE){
		
			if(!this.lengthTip){
			this.lengthTip = Ext.create('Ext.tip.ToolTip', {
				target : this.el,
				html : '',
				autoHide: true,
				trackMouse: false
			});
			this.lengthTip.doAutoRender();
			
		}
			var txt = this,
			len = String.getBlength(newVal),
			msg = Ext.String.format('輸入字節提示:<label style="{0}">{1}/{2}</label>', len > this.maxLength?'color:red;font-size:14px;':'', len, this.maxLength);
			txt.lengthTip.update(msg);
			Ext.defer(function(){
				if(this.hasFocus){
					var box = txt.getBox(),
						tipbox = txt.lengthTip.getBox();
					txt.lengthTip.showAt([box.x+txt.labelWidth, box.y+box.height]);
					if(!tipbox.width){
						tipbox = txt.lengthTip.getBox();
						txt.lengthTip.showAt([box.x+txt.labelWidth, box.y+box.height]);
					}
				}
			},100);
	}
	
};
Ext.form.field.Text.override({afterRender :function() {
	var me = this,
		el = me.inputEl;
	this.autoSize();
    this.callParent();
	//配置autoTipLargeContent = true，則自動提示超出的內容
	if (me.autoTipLargeContent){
		var getTextWidth = function(text) {
			var textLength = text.length;
			//所有漢字 12px
			var chineseCharCount = text.replace(/[^\u4e00-\u9fa5]/g, '');
			//大寫字母 8px
			var uppercaseCharCount = text.match(/[A-Z]/g) || [];
			//小寫字母 6px
			var lowercaseCharCount = text.match(/[a-z]/g) || [];
			//數字 7px
			var numCharCount = text.match(/[\d]/g) || [];
			//中杠 4px
			var gangCharCount = text.match(/[-]/g) || [];
			//空格 4px
			var spaceCharCount = text.match(/[\s]/g) || [];
			//下劃線 7px
			var enCharCount = text.match(/[_]/g) || [];
			//. 4px
			var dotCharCount = text.match(/[.]/g) || [];
			var otherCharCount = textLength - chineseCharCount.length - uppercaseCharCount.length - lowercaseCharCount.length - spaceCharCount.length - enCharCount.length - dotCharCount.length - numCharCount.length - gangCharCount.length;
			//計算內容應該的寬度
			return (chineseCharCount.length * 12) + (uppercaseCharCount.length * 8) + (lowercaseCharCount.length * 6) + (enCharCount.length * 7) + (dotCharCount.length * 4) + (otherCharCount * 4) + (spaceCharCount.length * 4) + (numCharCount.length * 7) + (gangCharCount.length * 4) + 10;
		}
		el.on('mouseover', function(){
			if(!me.tip){
				me.tip = Ext.create('Ext.tip.ToolTip', {
					trackMouse : false,//提示跟隨鼠標移動
					autoHide: false,
					autoShow : false,
					target : el,
					listeners : {
						beforeshow: function(){
							if(!this.html)return false;
						}
					}
				});
				me.tip.doAutoRender();
			}
			var fieldWidth = el.getWidth(),
				text = me.getValue(),
				txtWidth = getTextWidth(text);
			if (txtWidth >= fieldWidth) {
				var pos = el.getBox();
				me.tip.update(text);
				me.tip.showAt([pos.x, pos.y + el.getHeight()]);
			} else {
				me.tip.update('');
				me.tip.hide();
				return false;
			}
		});
		el.on('mouseout', function(){
			if(me.tip){
				me.tip.hide();
			}
		});
	}
}});
/**
 * textField銷毀之後去除tip
 * @param {} newVal
 * @param {} oldVal
 */
Ext.form.field.Text.prototype.beforeDestroy = function() {
	if(this.lengthTip){
		this.lengthTip.close();
	}
	this.callParent();
};

Ext.form.field.TextArea.prototype.onChange = function(newVal, oldVal) {
	if (this.validateOnChange) {
		this.validate();
	}
	this.checkDirty();
	if(this.inEditor !== true && this.maxLength < Number.MAX_VALUE){
		if(!this.lengthTip){
			this.lengthTip = Ext.create('Ext.tip.ToolTip', {
				target : this.el,
				html : '',
				autoHide: true,
				trackMouse: false
			});
			this.lengthTip.doAutoRender();
			
		}
		var txt = this,
			len = String.getBlength(newVal),
			msg = Ext.String.format('輸入字節提示:<label style="{0}">{1}/{2}</label>', len > this.maxLength?'color:red;font-size:14px;':'', len, this.maxLength);
		txt.lengthTip.update(msg);
		Ext.defer(function(){
			var box = txt.getBox(),
				tipbox = txt.lengthTip.getBox();
			txt.lengthTip.showAt([box.x + box.width-tipbox.width, box.y + box.height - tipbox.height]);
			if(!tipbox.width){
				tipbox = txt.lengthTip.getBox();
				txt.lengthTip.showAt([box.x + box.width-tipbox.width, box.y + box.height - tipbox.height]);
			}
		},100);
	}
};
Ext.form.field.TextArea.prototype.beforeDestroy = function() {
	if(this.lengthTip){
		this.lengthTip.close();
	}
	this.callParent();
}

//處理store提交的validate
if (Ext.data.validations) {
	Ext.apply(Ext.data.validations, {
		presenceMessage : '不能為空',
		formatMessage : '格式不正確',
		inclusionMessage : '只能取特定的值',
		exclusionMessage : '不能填這個值',
		emailMessage : '郵箱格式不正確'
	});
}
//1=length
//2=bLength 字節長度限制
//3=notNull
//4=max 支持number，date
//5=min 支持number，date
//6=inclusion 包含
//7=exclusion 排除
//8=regexp 
//9=fun 自定方法驗證
//複寫和擴展驗證器
Ext.data.validations.length = function(config, value, fieldName) {
	if (value === undefined || value === null) {
		return false;
	}
	var length = value.length,
		min = config.min,
		max = config.max;

	if(min && length < min){
		return '<label style="color:red;">'+(fieldName||'')+'</label>長度必須大於'+min+'字符';
	}else if (max && length > max) {
		return '<label style="color:red;">'+(fieldName||'')+'</label>長度必須小於'+max+'字符';
	} else {
		return true;
	}
};
Ext.data.validations.bLength = function(config, value, fieldName) {
	if (value === undefined || value === null) {
		return false;
	}
	var length = Ext.isString(value)?String.getBlength(value):value.length,
		min = config.min,
		max = config.max;

	if(min && length < min){
		return '<label style="color:red;">'+(fieldName||'')+'</label>長度必須大於'+min+'字節';
	}else if (max && length > max) {
		return '<label style="color:red;">'+(fieldName||'')+'</label>長度必須小於'+max+'字節';
	} else {
		return true;
	}
};
Ext.data.validations.notNull = function(config, value, fieldName) {
	if (value === undefined || value === null || value === '') {
		return '<label style="color:red;">'+(fieldName||'')+'</label>不允許為空';
	}
	return true;
};
Ext.data.validations.max = function(config, value, fieldName) {
	if (value === undefined || value === null || value === '') {
		return true;
	}
	if(Ext.isString(value)){
		var len = String.getBlength(value),
		max = config.max;
		if (max && len > max) {
			return '<label style="color:red;">'+(fieldName||'')+'</label>長度必須小於'+max+'字節';
		} else {
			return true;
		}
	}else if(Ext.isNumber(value)){
		max = config.max;
		if (value > max) {
			return '<label style="color:red;">'+(fieldName||'')+'</label>最大值為<label style="color:red;">'+max+'</label>';
		} else {
			return true;
		}
	}else if(Ext.isDate(value)){
		if (value.getTime() > config.max.getTime()) {
			var format = config.format || 'Y-m-d';
			return '<label style="color:red;">'+(fieldName||'')+'</label>最大日期為<label style="color:red;">'+Ext.Date.format(config.max, format)+'</label>';
		} else {
			return true;
		}
	}
	return true;
};
Ext.data.validations.min = function(config, value, fieldName) {
	if (value === undefined || value === null || value === '') {
		return true;
	}
	if(Ext.isString(value)){
		var len = String.getBlength(value),
		min = config.min;
		if (min !== undefined && len < min) {
			return '<label style="color:red;">'+(fieldName||'')+'</label>長度必須大於'+max+'字節';
		} else {
			return true;
		}
	}else if(Ext.isNumber(value)){
		min = config.min;
		if (value < min) {
			return '<label style="color:red;">'+(fieldName||'')+'</label>最小值為<label style="color:red;">'+min+'</label>';
		} else {
			return true;
		}
	}else if(Ext.isDate(value)){
		if (value.getTime() > config.min.getTime()) {
			var format = config.format || 'Y-m-d';
			return '<label style="color:red;">'+(fieldName||'')+'</label>最小日期為<label style="color:red;">'+Ext.Date.format(config.min, format)+'</label>';
		} else {
			return true;
		}
	}
	return true;
};
Ext.data.validations.inclusion = function(config, value, fieldName){
	if(Ext.isArray(config.list) && Ext.Array.indexOf(config.list,value) != -1){
		return true;
	}else if(Ext.isArray(config.list)){
		return '<label style="color:red;">'+(fieldName||'')+'</label>值必須包含在['+config.list.join(',')+']中';
	}
	return true;
}
Ext.data.validations.exclusion = function(config, value, fieldName){
	if(Ext.isArray(config.list) && Ext.Array.indexOf(config.list,value) != -1){
		return '<label style="color:red;">'+(fieldName||'')+'</label>值不允許包含['+config.list.join(',')+']值';
	}
	return true;
}
Ext.data.validations.regexp = function(config, value, fieldName){
	if(config.regexp){
		var re = new RegExp(config.regexp);
		if(!re.test(value)){
			return '<label style="color:red;">'+(fieldName||'')+'</label>正則驗證失敗';
		}
	}
	return true;
}
Ext.data.validations.fun = function(config, value, fieldName, record){
	if(Ext.isFunction(config.fun)){
		return config.fun(config, value, fieldName, record);
	}
	return true;
}

Ext.data.Model.prototype.validate = function() {
	var errors = new Ext.data.Errors(),
		validations = this.validations,
		modelIdx = this.store?(this.store.indexOfTotal(this) + 1):-1,
		validators = Ext.data.validations, length, validation, field, valid, fieldName, type, i;

	if (validations) {
		length = validations.length;

		for (i = 0; i < length; i++) {
			validation = validations[i];
			field = validation.field || validation.name;
			fieldName = validation.fieldName;
			type = validation.type;
			try{
			valid = validators[type](validation, this.get(field), fieldName, this);
			}catch(e){
				alert('驗證數據異常，請聯繫資訊處理');
			}

			if (Ext.isString(valid) || valid === false) {
				errors.add({
					field : field,
					fieldName : fieldName,
					modelIdx : modelIdx,
					message : validation.message || valid || validators[type + 'Message']
				});
			}
		}
	}
	return errors;
};
Ext.data.Store.prototype.filterNew = function(item) {
	return item.phantom === true;
};
Ext.data.Store.prototype.filterUpdated = function(item) {
	return item.dirty === true && item.phantom !== true;
};
Ext.data.Store.prototype.syncRemoved = function(options) {
	var me = this,
		operations = {},
		toDestroy = me.getRemovedRecords(),
		needsSync = false;
	if (toDestroy.length > 0) {
		operations.destroy = toDestroy;
		needsSync = true;
	}
	if (needsSync && me.fireEvent('beforesync', operations) !== false) {
		options = options || {};
		me.proxy.batch(Ext.apply(options, {
			operations : operations,
			listeners : me.getBatchListeners()
		}));
	}
	return me;
};
Ext.form.field.Text.prototype.getErrors = function(value) {
	var me = this,
		errors = [],
		validator = me.validator,
		validations = this.validations,
		emptyText = me.emptyText,
		allowBlank = me.allowBlank,
		vtype = me.vtype,
		vtypes = Ext.form.field.VTypes,
		regex = me.regex,
		label = (me.fieldLabel||'此欄位'),
		format = Ext.String.format, msg, length;

	value = value || me.processRawValue(me.getRawValue());

	if (value.length < 1 || (value === me.emptyText && me.valueContainsPlaceholder)) {
		if (!allowBlank) {
			errors.push('<label style="color:red;">'+label+'</label> 不允許為空');
		}
		return errors;
	}
	
	if (Ext.isFunction(validator)) {
		msg = validator.call(me, value);
		if (msg !== true) {
			errors.push(msg);
		}
	}
	
	if (validations) {
		length = validations.length;

		for (i = 0; i < length; i++) {
			validation = validations[i];
			type = validation.type;
			try{
				valid = validators[type](validation, value, label, this);
			}catch(e){
				alert('驗證數據異常，請聯繫資訊處理');
			}

			if (Ext.isString(valid) || valid === false) {
				errors.push(
					validation.message || valid || validators[type + 'Message']
				);
			}
		}
	}

	

	if (value.length < me.minLength) {
		errors.push(format(me.minLengthText, me.minLength));
	}

	var blen = Ext.isString(value)?String.getBlength(value):value.length;
	if (blen > me.maxLength) {
		errors.push('<label style="color:red;">'+label+'</label> 不允許超過'+me.maxLength+'字節,當前共計'+blen+'字節');
	}

	if (vtype) {
		if (!vtypes[vtype](value, me)) {
			errors.push(me.vtypeText || vtypes[vtype + 'Text']);
		}
	}

	if (regex && !regex.test(value)) {
		errors.push(me.regexText || me.invalidText);
	}

	return errors;
};
Ext.override(Ext.form.Panel, {
	getInvalidMessage : function(){
		var me = this,
			form = me.getForm(),
			msg = [],
			fields = form.getFields(),
			len = fields.items.length,
			field = null;
		for(var i=0;i<len;i++){
			field = fields.items[i];
			if(Ext.isFunction(field.getErrors)){
				msg = msg.concat(field.getErrors());
			}
		}
		return msg;
	},
	isValid : function() {
		return this.getForm().isValid();
	},
	isDirty : function() {
		return this.getForm().isDirty();
	}
});
//////////////////
// 容器选择样式
Ext.override(Ext.container.AbstractContainer, {
	getTopContainer : function() {
		if (Ext.container.AbstractContainer.top) {
			return Ext.container.AbstractContainer.top;
		}
		var top = this, t;
		while (true) {
			t = top.up('container');
			if (t) {
				top = t;
			} else {
				break;
			}
		}
		if (top) {
			Ext.container.AbstractContainer.top = top;
		}
		return top;
	},
	unselectedCmp : function() {
		this.removeCls('selected-grid');
	},
	selectedCmp : function() {
		/*
		 * var up = this.up(); if(up){ cmp = up.getSeletedCmp(); if(cmp){
		 * cmp.unselectedCmp(); } //up.selectedCmp() }
		 */
		var cmp = this.getTopContainer().getSelectedCmp();
		if (cmp) {
			cmp.unselectedCmp();
		}
		if (this.unselected !== true) {
			this.addCls('selected-grid');
		}
	},
	isSelected : function() {
		return this.el.hasCls('selected-grid');
	},
	getSelectedCmp : function() {
		var el = this.el.down('.selected-grid');
		if (!el)
			return null;
		return Ext.getCmp(el.id);
	}
});

if (Ext.MessageBox.msg) {
	Ext.apply(Ext.MessageBox.msg, {
		autoScroll : true
	});
}
/**
 * 設計grid仿焦點和通用熱鍵支持
 * @author f1930235
 * @date 2011.10.24
 */
Ext.override(Ext.grid.Panel, {
	emptyText : '<div align="center" style="letter-spacing: 2px; font-family: 新細明體;font-size: 12px;color: #C0C0C0;">無數據顯示</div>',
	validateRecords : function(validations, records) {
		var errors = [];
		if(validations && records && records.length > 0){
			var len = records.length;
			for (i = 0; i < len; i++) {
				errors.push(this.validateRecord(validations, records[i]));
			}
		}
		return errors;
	},
	validateRecord : function(validations, record) {
		var errors = new Ext.data.Errors(),
			validators = Ext.data.validations, length, validation, modelIdx, field, valid, type, i;
		if (validations) {
			length = validations.length;
			modelIdx = !!record.index ? record.index + 1 : this.getStore().indexOf(record) + 1;
			errors.index = modelIdx;
			for (i = 0; i < length; i++) {
				validation = validations[i];
				field = validation.field || validation.name;
				fieldName = validation.fieldName;
				type = validation.type;
				validation.context = record;
				valid = validators[type](validation, record.get(field));
				if (!valid) {
					errors.add({
						field : field,
						fieldName : fieldName,
						modelIdx : modelIdx,
						message : validation.message || validators[type + 'Message']
					});
				}
			}
		}
		return errors;
	},
	validates : function(models) {
		models = models || [];
		var errors = [];
		for (var i = 0; i < models.length; i++) {
			//var error = this.validate(validations, models[i]);
			var error = models[i].validate();
			if (!error.isValid())
				errors = errors.concat(error.items);
		}
		return errors;
	},
	getInvalidMessage : function(){
		var me = this,
			store = me.store,
			rs = null,
			errors,
			e,
			msg = [],
			len;
		rs = store.data.filterBy(function(r){
			return r.phantom === true || r.dirty === true;
		}).items
		errors = me.validates(rs);
		len = errors.length;
		var idx=0;
		for(var i=0;i<len;i++){
			e = errors[i];
			if(idx!=e.modelIdx){
			    idx=e.modelIdx;
			    msg.push('<label style="color:blue;">第'+e.modelIdx+'條</label>：');
			}
			msg.push('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+e.message);
		}
		return msg;
	},
	isValid : function() {
		var me = this,
			store = me.store,
			validations = this.validations,
			rs = null,
			result = true,
			errors;
		rs = store.data.filterBy(function(r){
			return r.phantom === true || r.dirty === true;
		}).items
		if(validations){
			this.errors = this.validateRecords(validations, rs);
			for (var i = 0; i < this.errors.length; i++) {
				if (!this.errors[i].isValid()) {
					result = false;
					break;
				}
			}
		}
		if(!result)return result;
		
		errors = me.validates(rs);
		return errors.length == 0;
	},
	isDirty : function() {
		var store = this.getStore();
		var models = store.getModifiedRecords();
		if (models.length > 0) {
			// alert(models.length);
			return true;
		} else
			return false;
	},
	/**
	 * <pre>
	 * bo -> is editing 
	 * options -> {record: record,field: field}
	 * </pre>
	 */
	resetFocus : function(bo, options) {
		var me = this,
			grid = me.view instanceof Ext.grid.LockingView ? me.normalGrid : me,
			store = grid.getStore(),
			sm = grid.getSelectionModel(),
			count = store.getCount(),
			pos = sm.position ? (sm.position||{}) : (sm.getCurrentPosition()||{}),
			ops = options || (me.editingPlugin?(me.editingPlugin.lastEditCell || {}):{}),
			startColumn = grid.columns[0] instanceof Ext.grid.RowNumberer ? 1 : 0,
			row = (options&&options.record) ? store.indexOf(options.record) : pos.row ? pos.row : 0,
			col = pos.column ? pos.column : startColumn,
			edit = bo === true;
		if(ops.field){
			var cls = grid.headerCt.gridDataColumns;
			for (var i = 0; i < cls.length; i++) {
				if (cls[i].dataIndex === ops.field) {
					col = i;
				}
			}
		}
		if (count == 0) {
			me.fireEvent('focusOnNoData', me);
			return;
		}
		if (row >= count) {
			row = count - 1;
		}
		if (edit && me.editingPlugin) {
			grid.view.focus(false);
			//遍曆，找到能编辑的欄位
			var i,
				startFilterIdx = col,
				len = grid.headerCt.gridDataColumns.length,
				column,
				firstEditColumn = null,
				lastEditColumn = null;
			if(!grid.headerCt.gridDataColumns[col].field){
				col = -1;
				for(i=0;i<len;i++){
					column = grid.headerCt.gridDataColumns[i];
					if(!column.field)continue;
					lastEditColumn = i;
					if(!firstEditColumn)firstEditColumn = i;
					if(i>startFilterIdx && col == -1){
						col = i;
					}
				}
				if(col == -1){
					col = firstEditColumn;
				}
			}
			var editing = me.editingPlugin.startEditByPosition({
				row : row,
				column : col||0
			});
			if(editing === false){
				sm.setCurrentPosition({
                    row: row,
                    column: col+1
                });
			}
		} else {
			sm.selectByPosition({
				row : row,
				column : col
			});
			grid.view.focus(false);
		}
	},
	destroy : function() {
		if(this.editingPlugin && this.editingPlugin.ptype == 'cellediting' && this.editingPlugin.activeEditor){
			this.editingPlugin.cancelEdit();
		}
		this.callParent(arguments);
	}
});


Ext.data.Connection.override({
	onComplete : function(request) {
		var me = this,
			options = request.options, result, success, response;

		try {
			result = me.parseStatus(request.xhr.status);
		} catch (e) {

			result = {
				success : false,
				isException : false
			};
		}
		success = result.success;

		if (success) {
			response = me.createResponse(request);
			if (me.fireEvent('requestcomplete', me, response, options) !== false) {
				Ext.callback(options.success, options.scope, [response, options]);
			}
		} else {
			if (result.isException || request.aborted || request.timedout) {
				response = me.createException(request);
			} else {
				response = me.createResponse(request);
			}
			if(result.isException){
				var t = response.responseText;
				if(/^{.*}$/.test(t)){
					t = Ext.decode(t);
					t = t.errorMsgDesc || t.message
				}
				t = t.replace(/\^/g, '"');
				Ext.Msg.alert('提示', '<font color="red">'+t+'</font>');
			}
			me.fireEvent('requestexception', me, response, options);
			Ext.callback(options.failure, options.scope, [response, options]);
		}
		Ext.callback(options.callback, options.scope, [options, success, response]);
		delete me.requests[request.id];
		return response;
	}
});
Ext.Ajax.onComplete = function(request) {
	var me = this,
		options = request.options, result, success, response;

	try {
		result = me.parseStatus(request.xhr.status);
	} catch (e) {

		result = {
			success : false,
			isException : false
		};
	}
	success = result.success;

	if (success) {
		response = me.createResponse(request);
		if (me.fireEvent('requestcomplete', me, response, options) !== false) {
			Ext.callback(options.success, options.scope, [response, options]);
		}
	} else {
		if (result.isException || request.aborted || request.timedout) {
			response = me.createException(request);
		} else {
			response = me.createResponse(request);
		}
		if(result.isException){
			var t = response.responseText;
			if(/^{.*}$/.test(t)){
				t = Ext.decode(t);
				t = t.errorMsgDesc || t.message
			}
			t = t.replace(/\^/g, '"');
			Ext.Msg.alert('提示', '<font color="red">'+t+'</font>');
		}
		me.fireEvent('requestexception', me, response, options);
		Ext.callback(options.failure, options.scope, [response, options]);
	}
	Ext.callback(options.callback, options.scope, [options, success, response]);
	delete me.requests[request.id];
	return response;
};

Ext.override(Ext.grid.CellEditor, {

	getValue : function() {
		if (this.field.getXType() === 'checkboxfield' || this.field.getXType() === 'checkbox') {
			return this.field.getSubmitValue();
		} else {
			return this.field.getValue();
		}
	}
});
Ext.override(Ext.grid.plugin.CellEditing, {
	onEditComplete : function(ed, value, startValue) {
        var me = this,
            grid = me.grid,
            activeColumn = me.getActiveColumn(),
            sm = grid.getSelectionModel(),
            record;

        if (activeColumn) {
            record = me.context.record;

            me.setActiveEditor(null);
            me.setActiveColumn(null);
            me.setActiveRecord(null);
    
            if (!me.validateEdit()) {
                return;
            }

            
            
            if (!record.isEqual(value, startValue)) {
                record.set(activeColumn.dataIndex, value);
            }

            
            if (sm.setCurrentPosition) {
                sm.setCurrentPosition(sm.getCurrentPosition());
            }
            grid.getView().getEl(activeColumn).focus();

            me.context.value = value;
            me.fireEvent('edit', me, me.context);
            me.lastEditCell = {
            	record : me.context.record,
            	field: me.context.field
            };
        }
    },
    cancelEdit: function() {
        var me = this,
            activeEd = me.getActiveEditor(),
            viewEl = me.grid.getView().getEl(me.getActiveColumn()),
            editRecord = this.activeRecord,
            editField = this.activeColumn?this.activeColumn.dataIndex:null;

        me.setActiveEditor(null);
        me.setActiveColumn(null);
        me.setActiveRecord(null);
        if (activeEd) {
            activeEd.cancelEdit();
            viewEl.focus();
            me.callParent(arguments);
        }
        me.lastEditCell = {
        	record : editRecord,
        	field: editField
        };
    },
    onCellClick: function(view, cell, colIdx, record, row, rowIdx, e) {
        if(!view.expanderSelector || !e.getTarget(view.expanderSelector)) {
            this.startEdit(record, view.getHeaderAtIndex(colIdx));
        }
        if(view.selModel){
        	view.selModel.selectedColumnIdx = colIdx;
        }
    }
});
//解決grid在window中按下esc，退出窗口
Ext.override(Ext.selection.CellModel, {
	initKeyNav: function(view) {
        var me = this;
        if (!view.rendered) {
            view.on('render', Ext.Function.bind(me.initKeyNav, me, [view], 0), me, {single: true});
            return;
        }
        view.el.set({
            tabIndex: -1
        });
        me.keyNav = new Ext.util.KeyNav({
            target: view.el,
            ignoreInputFields: true,
            up: me.onKeyUp,
            down: me.onKeyDown,
            right: me.onKeyRight,
            left: me.onKeyLeft,
            tab: me.onKeyTab,
            esc: function(){
            	var win = view.up('window');
            	if(win){
            		win.close();
            	}
            },
            scope: me
        });
    }
});
Ext.override(Ext.selection.RowModel, {
	initKeyNav: function(view) {
        var me = this;

        if (!view.rendered) {
            view.on('render', Ext.Function.bind(me.initKeyNav, me, [view], 0), me, {single: true});
            return;
        }
        view.el.set({
            tabIndex: -1
        });
        me.keyNav = new Ext.util.KeyNav({
            target: view,
            ignoreInputFields: true,
            eventName: 'itemkeydown',
            processEvent: function(view, record, node, index, event) {
                event.record = record;
                event.recordIndex = index;
                return event;
            },
            up: me.onKeyUp,
            down: me.onKeyDown,
            right: me.onKeyRight,
            left: me.onKeyLeft,
            pageDown: me.onKeyPageDown,
            pageUp: me.onKeyPageUp,
            home: me.onKeyHome,
            end: me.onKeyEnd,
            space: me.onKeySpace,
            enter: me.onKeyEnter,
            esc: function(){
            	var win = view.up('window');
            	if(win){
            		win.close();
            	}
            },
            scope: me
        });
    },
    setCurrentPosition: function(pos){
        if (pos) {
        	this.deselect(pos.row);
            this.selectByPosition(pos);
        }
    },
    getCurrentPosition: function() {
        var firstSelection = this.selected.items[0];
        if (firstSelection) {
            return {
                row: this.store.indexOf(firstSelection),
                column: this.selectedColumnIdx||0
            };
        }
    }
});

Ext.override(Ext.form.Panel, {
	// 清空所有值
	clean : function() {
		this.getForm().getFields().each(function(f) {
			f.value = undefined;
			f.initField();
		});
	},
	// resetOriginalValue
	resetOriginalValue : function() {
		this.getForm().getFields().each(function(f) {
			f.resetOriginalValue();
		});
	},
	// reset
	setReadOnly : function(bo) {
		this.getForm().getFields().each(function(f) {
			f.setReadOnly(bo);
		});
	}
});
Ext.override(Ext.toolbar.Paging, {
	cleanInfo : function() {
		var me = this;
		me.child('#inputItem').setValue('1');
		me.child('#afterTextItem').setText(Ext.String.format(this.afterPageText, 0));
		me.child('#first').setDisabled(true);
		me.child('#prev').setDisabled(true);
		me.child('#next').setDisabled(true);
		me.child('#last').setDisabled(true);
		me.updateInfo();
	},
	getPagingItems : function() {
		var me = this;

		return [{
			itemId : 'first',
			tooltip : me.firstText,
			overflowText : me.firstText,
			iconCls : Ext.baseCSSPrefix + 'tbar-page-first',
			disabled : true,
			handler : me.moveFirst,
			scope : me
		}, {
			itemId : 'prev',
			tooltip : me.prevText,
			overflowText : me.prevText,
			iconCls : Ext.baseCSSPrefix + 'tbar-page-prev',
			disabled : true,
			handler : me.movePrevious,
			scope : me
		}, '-', me.beforePageText, {
			xtype : 'numberfield',
			itemId : 'inputItem',
			name : 'inputItem',
			cls : Ext.baseCSSPrefix + 'tbar-page-number',
			allowDecimals : false,
			minValue : 1,
			hideTrigger : true,
			enableKeyEvents : true,
			keyNavEnabled : false,
			selectOnFocus : true,
			submitValue : false,
			isFormField : false,
			width : me.inputItemWidth,
			margins : '-1 2 3 2',
			listeners : {
				scope : me,
				keydown : me.onPagingKeyDown,
				blur : me.onPagingBlur
			}
		}, {
			xtype : 'tbtext',
			itemId : 'afterTextItem',
			text : Ext.String.format(me.afterPageText, 1)
		}, '-', {
			itemId : 'next',
			tooltip : me.nextText,
			overflowText : me.nextText,
			iconCls : Ext.baseCSSPrefix + 'tbar-page-next',
			disabled : true,
			handler : me.moveNext,
			scope : me
		}, {
			itemId : 'last',
			tooltip : me.lastText,
			overflowText : me.lastText,
			iconCls : Ext.baseCSSPrefix + 'tbar-page-last',
			disabled : true,
			handler : me.moveLast,
			scope : me
		}, '-', {
			itemId : 'refresh',
			tooltip : me.refreshText,
			overflowText : me.refreshText,
			iconCls : Ext.baseCSSPrefix + 'tbar-loading',
			handler : me.doRefresh,
			hidden : true,
			scope : me
		}];
	}
});
Ext.override(Ext.form.field.ComboBox, {
	doQuery: function(queryString, forceAll, rawQuery) {
        queryString = queryString || '';

        
        
        var me = this,
            qe = {
                query: queryString,
                forceAll: forceAll,
                combo: me,
                cancel: false
            },
            store = me.store,
            isLocalMode = me.queryMode === 'local',
            needsRefresh;

        if (me.fireEvent('beforequery', qe) === false || qe.cancel) {
            return false;
        }

        
        queryString = qe.query;
        forceAll = qe.forceAll;

        
        if (forceAll || (queryString.length >= me.minChars)) {
            
            me.expand();

            
            if (!me.queryCaching || me.lastQuery !== queryString) {
                me.lastQuery = queryString;

                if (isLocalMode) {
                    
                    store.suspendEvents();
                    needsRefresh = me.clearFilter();
                    if (queryString || !forceAll) {
                        me.activeFilter = new Ext.util.Filter({
                            root: 'data',
                            property: me.displayField,
                            value: queryString,
                            anyMatch: me.anyMatch
                        });
                        store.filter(me.activeFilter);
                        needsRefresh = true;
                    } else {
                        delete me.activeFilter;
                    }
                    store.resumeEvents();
                    if (me.rendered && needsRefresh) {
                        me.getPicker().refresh();
                    }
                } else {
                    
                    me.rawQuery = rawQuery;

                    
                    
                    if (me.pageSize) {
                        
                        me.loadPage(1);
                    } else {
                        store.load({
                            params: me.getParams(queryString)
                        });
                    }
                }
            }

            
            if (me.getRawValue() !== me.getDisplayValue()) {
                me.ignoreSelection++;
                me.picker.getSelectionModel().deselectAll();
                me.ignoreSelection--;
            }

            if (isLocalMode) {
                me.doAutoSelect();
            }
            if (me.typeAhead) {
                me.doTypeAhead();
            }
        }
        return true;
    }
});
/**
 * 修復chrome觸發tab事件異常
 */
Ext.override(Ext.form.field.Base, {
	fireKey: function(e){
		if(e.browserEvent.keyCode == 0 && e.browserEvent.keycode == 9){
			e.keyCode = 9;
			e.charCode = 9;
		}
        if(e.isSpecialKey()){
        	var eventObject = new Ext.EventObjectImpl(e);
        	if(eventObject.keyCode == 0){
        		eventObject.keyCode = e.keyCode;
        	}
            this.fireEvent('specialkey', this, eventObject);
        }
    }
});
Ext.override(Ext.Array, {
	equals: function(array1, array2){
		var len1 = array1.length,
            len2 = array2.length,
            i;
        if (array1 === array2) {
            return true;
        }
        if (len1 !== len2) {
            return false;
        }
        for (i = 0; i < len1; ++i) {
            if (array1[i] !== array2[i]) {
                return false;
            }
        }
        return true;
	}
});
Ext.override(Ext.util.KeyMap, {
	addBinding : function(binding){
        var keyCode = binding.key,
            processed = false,
            key,
            keys,
            keyString,
            i,
            len;

        if (Ext.isArray(binding)) {
            for (i = 0, len = binding.length; i < len; i++) {
                this.addBinding(binding[i]);
            }
            return;
        }
        if(!keyCode || (!binding.handler && !binding.fn))return;

        if (Ext.isString(keyCode)) {
            keys = [];
            keyString = keyCode.toUpperCase();

            for (i = 0, len = keyString.length; i < len; ++i){
                keys.push(keyString.charCodeAt(i));
            }
            keyCode = keys;
            processed = true;
        }

        if (!Ext.isArray(keyCode)) {
            keyCode = [keyCode];
        }

        if (!processed) {
            for (i = 0, len = keyCode.length; i < len; ++i) {
                key = keyCode[i];
                if (Ext.isString(key)) {
                    keyCode[i] = key.toUpperCase().charCodeAt(0);
                }
            }
        }

        this.bindings.push(Ext.apply({
            keyCode: keyCode
        }, binding));
    },
    removeBinding: function(binding){
        var me = this,
            bindings = me.bindings,
            len = bindings.length,
            i, item, keys;
            
        if (me.processing) {
            me.bindings = bindings.slice(0);
        }
        
        keys = me.processKeys(binding.key);
        for (i = 0; i < len; ++i) {
            item = bindings[i];
            if (item.fn === binding.fn && item.scope === binding.scope) {
                if (binding.alt == item.alt && binding.crtl == item.crtl && binding.shift == item.shift) {
                    if (Ext.Array.equals(item.keyCode, keys)) {
                        Ext.Array.erase(me.bindings, i, 1);
                        return;
                    }
                }
            }
        }
    },
    processKeys: function(keyCode){
        var processed = false,
            key, keys, keyString, len, i;
            
        if (Ext.isString(keyCode)) {
            keys = [];
            keyString = keyCode.toUpperCase();

            for (i = 0, len = keyString.length; i < len; ++i){
                keys.push(keyString.charCodeAt(i));
            }
            keyCode = keys;
            processed = true;
        }

        if (!Ext.isArray(keyCode)) {
            keyCode = [keyCode];
        }

        if (!processed) {
            for (i = 0, len = keyCode.length; i < len; ++i) {
                key = keyCode[i];
                if (Ext.isString(key)) {
                    keyCode[i] = key.toUpperCase().charCodeAt(0);
                }
            }
        }
        return keyCode;
    }
});

/**
 * 以下是全局回車轉TAB事件注入適用于Form頁面 適用于Ext4.1.1 FredHe
 */
function globalTabEnter() {
	if (Ext.isIE) {
		window.document.attachEvent("onkeydown", function(e) {
			var e = window.event;
			var src = e.srcElement.type;
			var el = Ext.get(e.srcElement);
			if(el.hasCls('no-hot-key'))return;
			var buttonNeed = false,
				checkbox = false,
				gridEditor = false,
				picker = false,
				searchfield = false; // 判斷是否是tabpanel的按鈕,是否是checkbox,是否是GRID中的EDITOR
			var tmp = e.srcElement.innerHTML;
			if (src == 'button' && tmp) {
				if (tmp.indexOf("x-tab-inner") != -1)
					buttonNeed = true;
			}
			tmp = e.srcElement.attributes.getNamedItem("role");
			if (src == 'button' && tmp) {
				if (tmp.value == "checkbox") {
					checkbox = true;
				}
			}
			checkbox = false; // 暫時永久不管CHECKBOX了
			var tmppn = e.srcElement;
			for (i = 0; i < 11; i++) {
				tmppn = tmppn.parentNode;
				if (tmppn) {
					if (tmppn.className) {
						if (tmppn.className.length > 0 && tmppn.className.indexOf("x-grid-editor") != -1) {
							gridEditor = true;
							break;
						}
						if (tmppn.className.indexOf("search") != -1) {
							searchfield = true;
						}
						if (tmppn.className.indexOf("x-tbar-page-number") != -1) {
							pageNumfield = true;
						}
					}
				} else {
					break;
				}
			}
			// 求出是否是picker設備
			var tmppn = e.srcElement;
			var tmppnId = tmppn.id.substr(0, tmppn.id.lastIndexOf('-'));
			var cmp = Ext.getCmp(tmppnId);
			if (cmp) {
				if (cmp.isExpanded || cmp.notTab) {
					picker = true;
				}
			}
			if (e.keyCode == 13 && ((src == 'text' && !gridEditor) || checkbox || buttonNeed))
				e.keyCode = 9;
		});
	} else {
		window.document.addEventListener("keydown", function(e) {
			e == null ? e = window.event : e;
			var src;
			var el = Ext.get(e.srcElement);
			if(el.hasCls('no-hot-key'))return;
			src = e.srcElement.type;
			var buttonNeed = false,
				checkbox = false,
				gridEditor = false,
				picker = false,
				searchfield = false,
				pageNumfield = false; // 判斷是否是tabpanel的按鈕,是否是checkbox,是否是GRID中的EDITOR
			
			var tmp = e.srcElement.innerHTML;
			if (src == 'button' && tmp) {
				if (tmp.indexOf("x-tab-inner") != -1)
					buttonNeed = true;
			}
			tmp = e.srcElement.attributes.getNamedItem("role");
			if (src == 'button' && tmp) {
				if (tmp.value == "checkbox") {
					checkbox = true;
				}
			}
			checkbox = false; // 暫時永久不管CHECKBOX了
			var tmppn = e.srcElement;
			for (i = 0; i < 11; i++) {
				tmppn = tmppn.parentNode;
				if (tmppn) {
					if (tmppn.className) {
						if (tmppn.className.indexOf("x-grid-editor") != -1) {
							gridEditor = true;
							break;
						}
						if (tmppn.className.indexOf("search") != -1) {
							searchfield = true;
						}
						if (tmppn.className.indexOf("x-tbar-page-number") != -1) {
							pageNumfield = true;
						}
					}
				} else {
					break;
				}
			}
			// 求出是否是picker設備
			var tmppn = e.srcElement;
			var tmppnId = tmppn.id.substr(0, tmppn.id.lastIndexOf('-'));
			var cmp = Ext.getCmp(tmppnId);
			if (cmp) {
				if (cmp.isExpanded || cmp.notTab) {
					picker = true;
				}
			}
			if (e.keyCode == 13 && ((src == 'text' && !gridEditor) || checkbox || buttonNeed) && (!picker) && !searchfield && !pageNumfield) {
				e.stopImmediatePropagation();// 立即停止此事件的傳播
				e.stopPropagation();
				e.preventDefault();// 阻止默認的事件處理
				var keyboardEvent = document.createEvent("KeyboardEvent");
				keyboardEvent.initKeyboardEvent("keydown", true, false, window, 'U+0009', 0, false,false,false,false,false); // 自定義一個TAB事件

				keyboardEvent.keycode = 9;
				e.target.dispatchEvent(keyboardEvent);
			}
		}, true);

	}

};
globalTabEnter();
/**
 * 時間格式化函數,用於extjs app下的model的時間字段conver
 * @param {} val
 * @return {}
 * @deprecated
 */
function dateTransFormat(val) {
	if (val) {
		if (Ext.typeOf(val) == 'string') {
			return Ext.Date.parse(val, 'Y-m-d\\TH:i:s');
		} else if (Ext.typeOf(val) == 'date') {
			return val;
		} else {
			return new Date(val);
		}
		//		return Ext.Date.parse(Ext.util.Format.date(val, 'Y-m-d\\TH:i:s'),
		//				'Y-m-d\\TH:i:s');
	} else {
		return null;
	}
};

///**
// * Grid對應View重新刷新頁面時的操作，針對單元格合併，
// * 但可以編輯的情況，可以給View增加noNeedRefresh屬性，
// * 當為true時，不需要重新刷新頁面，則合併的單元格可以保留
// * 當為false時，需要重新刷新頁面，為正常
// */
//Ext.override(Ext.grid.View, {
//	refresh: function() {
//        var me = this;
//        me.setNewTemplate();
//        if(!me.noNeedRefresh){
//        	me.callParent(arguments);
//        }
//        me.doStripeRows(0);
//        me.headerCt.setSortState();
//    }
//});