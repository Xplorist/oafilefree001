Ext.define('Extux.form.action.Submit', {
	extend : 'Ext.form.action.Action',
	alternateClassName : 'Ext.form.Action.Submit',
	alias : 'formaction.uxsubmit',

	type : 'submit',
	method : 'post',
	timeout : 3000,
	fileUpload : false,
	success : Ext.emptyFn,
	failure : Ext.emptyFn,

	createCallback : function() {
		var me = this, undef;
		return {
			success : me.onSuccess,
			failure : me.onFailure,
			scope : me,
			timeout : this.timeout,
			upload : me.fileUpload ? me.onSuccess : undef
		};
	},

	// inherit docs
	run : function() {
		var me = this,
			fields = me.fields, field,
			isValid = true;
		if (!fields || fields.length == 0)
			return;
		for (var i = 0; i < fields.length; i++) {
			field = fields[i];
			if (field.isFileUpload()) {
				me.fileUpload = true;
			}
			if (!field.validate()) {
				isValid = false;
				break;
			}
		}
		if (me.clientValidation === false || isValid) {
			me.doSubmit();
		} else {
			me.failureType = Ext.form.action.Action.CLIENT_INVALID;
			return false;
		}
	},

	doSubmit : function() {
		var me = this,
			ajaxOptions = Ext.apply(me.createCallback(), {
				url : me.getUrl(),
				method : me.getMethod(),
				headers : me.headers
			}),
			jsonSubmit = me.jsonSubmit,
			paramsProp = jsonSubmit ? 'jsonData' : 'params', formEl, formInfo, field;

		if (me.fileUpload) {
			formInfo = me.buildForm();
			ajaxOptions.form = formInfo.formEl;
			ajaxOptions.isUpload = true;
		} else {
			ajaxOptions[paramsProp] = me.getParams(jsonSubmit);
		}

		Ext.Ajax.request(ajaxOptions);
		if (formInfo) {
			Ext.removeNode(formInfo.formEl);
			for (i = 0; i < me.fields.length; ++i) {
				field = me.fields[i];
				if (field.rendered && field.isFileUpload()) {
					field.reset();
				}
			}
		}
	},

	getValues : function() {
		var me = this, field, data,
			values = {};
		for (var i = 0; i < this.fields.length; i++) {
			field = this.fields[i];
			if (!field.isFileUpload()) {
				data = field.getSubmitData(true)
			}
			if (Ext.isObject(data)) {
				for (name in data) {
					if (data.hasOwnProperty(name)) {
						val = data[name];

						if (includeEmptyText && val === '') {
							val = field.emptyText || '';
						}

						if (values.hasOwnProperty(name)) {
							bucket = values[name];

							if (!isArray(bucket)) {
								bucket = values[name] = [bucket];
							}

							if (isArray(val)) {
								values[name] = bucket.concat(val);
							} else {
								bucket.push(val);
							}
						} else {
							values[name] = val;
						}
					}
				}
			}
		}
	},
	getParams : function(useModelValues) {
		var falseVal = false,
			configParams = this.params || {},
			fieldParams = this.getValues();
		return Ext.apply({}, fieldParams, configParams);
	},

	buildForm : function() {
		var me = this,
			fieldsSpec = [], formSpec, formEl,
			params = me.getParams(),
			uploadFields = [],
			uploadEls = [],
			len = me.fields.length, field, key, value, v, vLen, el;

		for (i = 0; i < len; ++i) {
			field = me.fields[i];

			// can only have a selected file value after being rendered
			if (field.rendered && field.isFileUpload()) {
				uploadFields.push(field);
			}
		}

		for (key in params) {
			if (params.hasOwnProperty(key)) {
				value = params[key];

				if (Ext.isArray(value)) {
					vLen = value.length;
					for (v = 0; v < vLen; v++) {
						fieldsSpec.push(me.getFieldConfig(key, value[v]));
					}
				} else {
					fieldsSpec.push(me.getFieldConfig(key, value));
				}
			}
		}

		formSpec = {
			tag : 'form',
			action : me.getUrl(),
			method : me.getMethod(),
			target : me.target || '_self',
			style : 'display:none',
			cn : fieldsSpec
		};

		// Set the proper encoding for file uploads
		if (uploadFields.length) {
			formSpec.encoding = formSpec.enctype = 'multipart/form-data';
		}

		// Create the form
		formEl = Ext.DomHelper.append(Ext.getBody(), formSpec);

		len = uploadFields.length;

		for (i = 0; i < len; ++i) {
			el = uploadFields[i].extractFileInput();
			formEl.appendChild(el);
			uploadEls.push(el);
		}

		return {
			formEl : formEl,
			uploadFields : uploadFields,
			uploadEls : uploadEls
		};
	},

	getFieldConfig : function(name, value) {
		var config = {
			tag : 'input',
			type : 'hidden',
			name : name,
			value : Ext.String.htmlEncode(value)
		};
		if(this.multiple){
			config.multiple = 'multiple';
		}
		return config;
	},

	onSuccess : function(response) {
		var success = true,
			result = this.processResponse(response);
		if (result !== true && !result.success) {
			this.failureType = Ext.form.action.Action.SERVER_INVALID;
			success = false;
		}
		this.success(result, success);
	},
	onFailure : function(response) {
		this.response = response;
		this.failureType = Ext.form.action.Action.CONNECT_FAILURE;
		this.failure(response, false);
	},
	handleResponse : function(response) {
		var rs, errors, i, len, records, result;

		try {
			result = Ext.decode(response.responseText);
		} catch (e) {
			result = {
				success : false,
				errors : []
			};
		}
		return result;
	}
});

Ext.define("Extux.form.field.SimpleMultiFile", {
	extend : 'Ext.form.field.Trigger',
	alias : ['widget.uxfilefield', 'widget.simplemultifile'],
	alternateClassName : ['Ext.form.FileUploadField', 'Ext.ux.form.FileUploadField', 'Ext.form.File'],
	uses : ['Ext.button.Button', 'Ext.layout.component.field.Field'],

	isFormField : true,
	buttonText : '上傳',
	buttonOnly : true,
	autoHeight : true,
	buttonMargin : 3,
	fieldBodyCls : Ext.baseCSSPrefix + 'form-file-wrap',
	readOnly : false,
	triggerNoEditCls : '',
	componentLayout : 'triggerfield',
	childEls : ['fileInputEl', 'buttonEl', 'buttonEl-btnEl', 'browseButtonWrap'],

	url : contextPath + '/pub/affix!upload.action',
	allowExts: null,
	multiple: true,
	multiFile : true,
	affixItemTpl : ['<tpl for="affixItems"><div id="affix-{affixId}">', 
		'<label title="{fileSize}" class="affix-item-trigger" affixid="{affixId}" style="background:url({parent.contextPath}/workflow/base/file-ext/{fileImg}) no-repeat;padding-left: 20px;height: 18px;line-height: 18px;cursor: pointer;">{fileOldName}</label>', 
		'<tpl if="!parent.readOnly">', 
		'<a class="affix-{affixId}-trigger" affixid="{affixId}" href="javascript:void(0);" style="margin-left:5px;">删除</a></tpl>',
		'</div>',
		'</tpl>'],
	fileFieldSubTpl: [ // note: {id} here is really {inputId}, but {cmpId} is available
        '<input id="{id}" type="{type}" {inputAttrTpl}',
            ' size="1"', // allows inputs to fully respect CSS widths across all browsers
            '<tpl if="multiple"> multiple="multiple"</tpl>',
            '<tpl if="name"> name="{name}"</tpl>',
            '<tpl if="mime"> accept="{mime}"</tpl>',
            '<tpl if="value"> value="{[Ext.util.Format.htmlEncode(values.value)]}"</tpl>',
            '<tpl if="placeholder"> placeholder="{placeholder}"</tpl>',
            '{%if (values.maxLength !== undefined){%} maxlength="{maxLength}"{%}%}',
            '<tpl if="readOnly"> readonly="readonly"</tpl>',
            '<tpl if="disabled"> disabled="disabled"</tpl>',
            '<tpl if="tabIdx"> tabIndex="{tabIdx}"</tpl>',
            '<tpl if="fieldStyle"> style="{fieldStyle}"</tpl>',
        ' class="{fieldCls} {typeCls} {editableCls}" autocomplete="off"/>',
        {
            disableFormats: true
        }
    ],

	initComponent : function() {
		var me = this;
		me.callParent();
	},

	onRender : function() {
		var me = this, inputEl;

		me.callParent(arguments);

		inputEl = me.inputEl;
		inputEl.dom.name = '';
		me.inputEl.affixItems = new Array();

		me.fileInputEl.dom.name = me.getName();
		me.fileInputEl.on({
			scope : me,
			change : me.onFileChange
		});

		if (me.buttonOnly) {
			me.inputCell.setDisplayed(false);
		}

		me.browseButtonWrap.dom.style.width = (me.browseButtonWrap.dom.lastChild.offsetWidth + me.buttonEl.getMargin('lr')) + 'px';
		if (Ext.isIE) {
			me.buttonEl.repaint();
		}
		if (me.affixNo) {
			Ext.defer(function() {
				var no = me.affixNo;
				delete me.affixNo;
				me.setValue(no);
			}, 200);
		}
		if (me.readOnly) {
			var p = me.buttonEl.parent();
			p.setStyle('display', 'none');
		}
	},

	getTriggerMarkup : function() {
		var me = this, result,
			btn = Ext.widget('button', Ext.apply({
				id : me.id + '-buttonEl',
				ui : me.ui,
				disabled : me.disabled,
				text : me.buttonText,
				cls : Ext.baseCSSPrefix + 'form-file-btn',
				preventDefault : false,
				style : me.buttonOnly ? '' : 'margin-left:' + me.buttonMargin + 'px'
			}, me.buttonConfig)),
			btnCfg = btn.getRenderTree(),
			inputElCfg = {
				id : me.id + '-fileInputEl',
				cls : Ext.baseCSSPrefix + 'form-file-input',
				tag : 'input',
				type : 'file',
				size : 1
			},
			ext,mime ='';
			if(me.multiple){
				inputElCfg.multiple = 'multiple';
			}
		if(me.allowExts && me.allowExts.length > 0){
			for(var i=0;i<me.allowExts.length;i++){
				ext = me.allowExts[i];
				if(ext.indexOf('/') == -1){
					ext = me._getFileMime(ext);
				}
				if(ext)mime=mime+ext+';';
			}
		}
		if(mime){
			inputElCfg.accept = mime.substring(0, mime.length-1);
		}
		if (me.disabled) {
			inputElCfg.disabled = true;
		}
		btnCfg.cn = inputElCfg;
		result = '<td id="' + me.id + '-browseButtonWrap">' + Ext.DomHelper.markup(btnCfg) + '</td>';
		btn.destroy();
		return result;
	},

	createFileInput : function() {
		var me = this,
			ext,mime ='';
		if(me.allowExts && me.allowExts.length > 0){
			for(var i=0;i<me.allowExts.length;i++){
				ext = me.allowExts[i];
				if(ext.indexOf('/') == -1){
					ext = me._getFileMime(ext);
				}
				if(ext)mime=mime+ext+';';
			}
		}
		if(mime)mime = mime.substring(0, mime.length-1);
		me.fileInputEl = me.buttonEl.createChild({
			name : me.getName(),
			id : me.id + '-fileInputEl',
			cls : Ext.baseCSSPrefix + 'form-file-input',
			tag : 'input',
			type : 'file',
			accept : mime||'*/*',
			size : 1
		});
		me.fileInputEl.on({
			scope : me,
			change : me.onFileChange
		});
	},

	onFileChange : function() {
		var me = this,
			value = this.fileInputEl.dom.value;
		me.lastValue = null;
		Extux.form.field.SimpleMultiFile.superclass.setValue.call(this, value);

		if (!value)
			return;
		var submit = Ext.ClassManager.instantiateByAlias('formaction.uxsubmit', {
			url : this.url,
			fields : [this],
			params : {
				groupNo : me.getAffixValue()
			},
			success : function(result, success) {
				me.el.unmask();
				if (success) {
					var affix, ext;
					for (var i = 0; i < result.data.length; i++) {
						affix = result.data[i];
						if (!me._hasAffix(affix)) {
							ext = me.getFileExt(affix.fileOldName);
							me.inputEl.affixItems.push({
								affixId : affix.affixId,
								affixNo : affix.afffixGroupNo,
								fileName : affix.fileName,
								fileOldName : affix.fileOldName,
								fileSize : me._formatFileSize(affix.fileSize),
								fileRemark : affix.fileRemark,
								fileImg : me.getFileImg(ext)
							});
							me.fireEvent('affixadd', affix);
						}
					}
					if(me.inputEl.affixItems.length > 0){
						me.setAffixValue(me.inputEl.affixItems[0].affixNo);
					}
					me.onAffixGroupChange();
				} else {
					Ext.Msg.alert('提示', '上傳文件失敗:' + (result.message || result.errorMsgDesc || '未知異常'));
				}
			},
			failure : function(response, success) {
				me.el.unmask();
				Ext.Msg.alert('提示', '上傳文件異常:' + (response.responseText));
			}
		});
		me.el.mask('正在上傳...');
		submit.run();
	},
	_formatFileSize : function(fileSize) {
		var size = '';
		if (fileSize < 1024) {
			size = fileSize;
			size += 'B';
		} else if (fileSize > 1024 && fileSize < 1048576) {
			size = fileSize / 1024;
			size = Math.round(size * 100) / 100;
			size += 'KB';
		} else if (fileSize > 1048576) {
			size = fileSize / 1048576;
			size = Math.round(size * 100) / 100;
			size += 'MB';
		} else {
			size = fileSize;
		}
		return size;
	},
	//當附件內容有變時觸發
	onAffixGroupChange : function() {
		var me = this,
			v = me.getAffixValue();
		Ext.Ajax.request({
			url : contextPath + '/pub/affix!getGroupAffix.action?groupNo=' + v + '&_d=' + (new Date().getTime()),
			success : function(response, opts) {
				var obj = Ext.decode(response.responseText);
				if (obj.success) {
					me.inputEl.affixItems.length = 0;
					for (var i = 0; i < obj.data.length; i++) {
						var affix = obj.data[i],
							ext = me.getFileExt(affix.fileOldName);
						me.inputEl.affixItems.push({
							affixId : affix.affixId,
							affixNo : affix.afffixGroupNo,
							fileName : affix.fileName,
							fileOldName : affix.fileOldName,
							fileSize : me._formatFileSize(affix.fileSize),
							fileRemark : affix.fileRemark,
							fileImg : me.getFileImg(ext)
						});
					}
					me.fireEvent('affixchange', v, me.inputEl.affixItems);
					me._updateAffixItemsContent();
				}
			},
			failure : function(response, opts) {
				Ext.Msg.alert('提示', '獲取附件' + me.affixNo + '信息失敗')
			}
		});
		
	},
	_hasAffix : function(f) {
		var me = this,
			exists = false, affix;
		for (var i = 0; i < me.inputEl.affixItems.length; i++) {
			affix = me.inputEl.affixItems[i];
			if (f.id == affix.id) {
				affix = true;
				break;
			}
		}
		return exists;
	},

	setValue : function(affixNo) {
		if (!this.rendered)
			return;
		var me = this,
			v = me.getAffixValue();
		if (v == affixNo)
			return;
		me.setAffixValue(affixNo);
		me.onAffixGroupChange();
	},
	setReadOnly : function(readOnly) {
		if (readOnly != this.readOnly) {
			this.readOnly = readOnly;
			this.updateLayout();
			if(!this.buttonEl)return;
			if (this.readOnly) {
				this.buttonEl.parent().setStyle('display', 'none');;
			} else {
				this.buttonEl.parent().setStyle('display', '');
			}
		}
	},
	getValue : function() {
		return this.getAffixValue();
	},
	setAffixValue: function(value) {
		var me = this;
        if (me.inputEl) {
            me.inputEl.affixNo = value;
        }
    },
	getAffixValue: function() {
        var me = this;
        return (me.inputEl ? me.inputEl.affixNo : '')||'';
    },
    getModelData: function() {
        var me = this,
            data = null;
        if (!me.disabled) {
            data = {};
            data[me.getName()] = me.getValue();
        }
        return data;
    },
    getSubmitData: function(){
    	var me = this,
            data = null,
            val;
        if (!me.disabled) {
            val = me.getAffixValue();
            if (val !== null) {
                data = {};
                data[me.getName()] = val;
            }
        }
        return data;
    },
    getRawValue: function(){
    	return this.getAffixValue();
    },
	getFileExt : function(fileName) {
		return (-1 !== fileName.indexOf('.')) ? fileName.replace(/.*[.]/, '') : '';
	},
	getFileImg : function(ext) {
		if (ext == '7z' || ext == 'doc' || ext == 'docx' || ext == 'html' || ext == 'jpg' || ext == 'pdf' || ext == 'png' || ext == 'pps' || ext == 'ppt' || ext == 'pptx' || ext == 'tif' || ext == 'txt' || ext == 'xls' || ext == 'xlsx' || ext == 'xml' || ext == 'zip') {
			return ext + '.png';
		}
		return 'unknown.png';
	},
	reset : function() {
		var me = this;
		if (me.rendered) {
			me.fileInputEl.remove();
			me.createFileInput();
			me.inputEl.dom.value = '';
		}
	},

	onDisable : function() {
		this.callParent();
		this.disableItems();
	},

	disableItems : function() {
		var file = this.fileInputEl;
		if (file) {
			file.dom.disabled = true;
		}
		this['buttonEl-btnEl'].dom.disabled = true;
	},

	onEnable : function() {
		var me = this;
		me.callParent();
		me.fileInputEl.dom.disabled = false;
		this['buttonEl-btnEl'].dom.disabled = false;
	},

	isFileUpload : function() {
		return true;
	},

	extractFileInput : function() {
		var fileInput = this.fileInputEl.dom;
		this.reset();
		return fileInput;
	},

	onDestroy : function() {
		Ext.destroyMembers(this, 'fileInputEl', 'buttonEl');
		this.callParent();
	},
	/* --覆蓋的方法-- */
	getSubTplMarkup : function() {
		var me = this,
			subTplData = this.getSubTplData(),
			field = this.getTpl('fileFieldSubTpl').apply(subTplData),
			affixItems = me._getAffixItemsContent(subTplData);
		return '<table id="' + me.id + '-triggerWrap" class="' + Ext.baseCSSPrefix + 'form-trigger-wrap" cellpadding="0" cellspacing="0"><tbody><tr>' + '<td id="' + me.id + '-inputCell" class="' + Ext.baseCSSPrefix + 'form-trigger-input-cell">' + field + '</td>' + me.getTriggerMarkup() + '</tr><tr>' + '<td id="' + me.id + '-affix-items-cell" class="' + Ext.baseCSSPrefix + 'form-trigger-affix-item-cell" style="font-size:12px;">' + (affixItems || '') + '</td>' + '</tr></tbody></table>';
	},
	_updateAffixItemsContent : function() {
		var me = this,
			affixItemsContent = this._getAffixItemsContent(),
			triggerWrap = Ext.get(me.id + '-affix-items-cell'),
			itemTriggers = triggerWrap.query('.affix-item-trigger'), itemTrigger, itemLabel;
		//解除原item-trigger事件绑定
		for (var i = 0; i < itemTriggers.length; i++) {
			itemTrigger = Ext.get(itemTriggers[i]);
			itemLabel = Ext.get(itemTrigger.next());
			itemTrigger.un('click');
			if(itemLabel)itemLabel.un('click');
		}
		//更新附件内容
		triggerWrap.update(affixItemsContent);
		itemTriggers = triggerWrap.query('.affix-item-trigger');
		//绑定原item-trigger事件绑定
		for (var i = 0; i < itemTriggers.length; i++) {
			itemTrigger = Ext.get(itemTriggers[i]);
			itemLabel = Ext.get(itemTrigger.next());
			if(itemLabel)itemLabel.on('click', me._removeAffixItem, me, itemTrigger);
			itemTrigger.on('click', me._fileDownload, me, itemTrigger.getAttribute('affixid'));
		}
		
		if(!me.multiFile && me.inputEl.affixItems.length > 0){
			me.buttonEl.parent().setStyle('display', 'none');;
		}
		if(!me.multiFile && me.inputEl.affixItems.length == 0){
			me.buttonEl.parent().setStyle('display', '');;
		}
	},
	_removeAffixItem : function(e, itemTrigger) {
		var me = this,
			a = Ext.get(itemTrigger),
			affixId = a.getAttribute('affixid'),
			affixItem = Ext.get('affix-' + affixId),
			oldHeight = me.getHeight(), newHeight;
		if (!affixId)
			return;
		me.el.mask('正在删除...');
		Ext.Ajax.request({
			url : contextPath + '/pub/affix!removeAffix.action?affixId=' + affixId + '&_d=' + (new Date().getTime()),
			success : function(response, opts) {
				me.el.unmask();
				var obj = Ext.decode(response.responseText);
				if (obj.success) {
					var affix;
					for (var i = 0; i < me.inputEl.affixItems.length; i++) {
						affix = me.inputEl.affixItems[i];
						if (affix.affixId == affixId) {
							break;
						}
						affix = null;
					}
					if (affix) {
						Ext.Array.remove(me.inputEl.affixItems, affix);
						me.fireEvent('affixchange', me.getAffixValue(), me.inputEl.affixItems);
						if (me.inputEl.affixItems.length == 0) {
							me.setAffixValue('');
							if(!me.multiFile && me.inputEl.affixItems.length == 0){
								me.buttonEl.parent().setStyle('display', '');;
							}
						}
						me.fireEvent('affixremove', affix);
					}
					a.un('click');
					Ext.get(a.prev()).un('click');
					affixItem.remove();
					newHeight = me.getHeight();
					if (newHeight != oldHeight) {
						me.fireEvent('heightchange', newHeight, oldHeight);
					}
				} else {
					Ext.Msg.alert('提示', '刪除文件失敗，請稍後重試')
				}
			},
			failure : function(response, opts) {
				me.unmask();
				Ext.Msg.alert('提示', '刪除文件失敗，請稍後重試')
			}
		});
	},
	_getAffixItemsContent : function(subTplData) {
		if (!subTplData) {
			subTplData = this.getSubTplData();
		}
		return this.getTpl('affixItemTpl').apply(subTplData);
	},

	getSubTplData : function() {
		var me = this,
			data = me.callParent(),
			readOnly = me.readOnly === true,
			editable = me.editable !== false,mime = '',ext;
		if(me.allowExts && me.allowExts.length > 0){
			for(var i=0;i<me.allowExts.length;i++){
				ext = me.allowExts[i];
				if(ext.indexOf('/') == -1){
					ext = me._getFileMime(ext);
				}
				if(ext)mime=mime+ext+';';
			}
		}
		return Ext.apply(data, {
			mime : mime,
			multiple: me.multiple,
			contextPath : contextPath,
			editableCls : (readOnly || !editable) ? ' ' + me.triggerNoEditCls : '',
			readOnly : !editable || readOnly,
			affixItems : me.inputEl ? me.inputEl.affixItems : []
		});
	},
	_fileDownload : function(e, ele, affixId) {
		var me = this;
		if (Ext.isFunction(window.top.downloadAndOpenFileById)) {
			window.top.downloadAndOpenFileById(affixId);
		} else {
			window.open(contextPath + '/pub/affix!download.action?affixId=' + affixId);
		}
	},
	_getFileMime: function(ext){
		if(ext == '323')return 'text/h323';
else if(ext == 'acx')return 'application/internet-property-stream';
else if(ext == 'ai')return 'application/postscript';
else if(ext == 'aif')return 'audio/x-aiff';
else if(ext == 'aifc')return 'audio/x-aiff';
else if(ext == 'aiff')return 'audio/x-aiff';
else if(ext == 'asf')return 'video/x-ms-asf';
else if(ext == 'asr')return 'video/x-ms-asf';
else if(ext == 'asx')return 'video/x-ms-asf';
else if(ext == 'au')return 'audio/basic';
else if(ext == 'avi')return 'video/x-msvideo';
else if(ext == 'axs')return 'application/olescript';
else if(ext == 'bas')return 'text/plain';
else if(ext == 'bcpio')return 'application/x-bcpio';
else if(ext == 'bin')return 'application/octet-stream';
else if(ext == 'bmp')return 'image/bmp';
else if(ext == 'c')return 'text/plain';
else if(ext == 'cat')return 'application/vnd.ms-pkiseccat';
else if(ext == 'cdf')return 'application/x-cdf';
else if(ext == 'cer')return 'application/x-x509-ca-cert';
else if(ext == 'class')return 'application/octet-stream';
else if(ext == 'clp')return 'application/x-msclip';
else if(ext == 'cmx')return 'image/x-cmx';
else if(ext == 'cod')return 'image/cis-cod';
else if(ext == 'cpio')return 'application/x-cpio';
else if(ext == 'crd')return 'application/x-mscardfile';
else if(ext == 'crl')return 'application/pkix-crl';
else if(ext == 'crt')return 'application/x-x509-ca-cert';
else if(ext == 'csh')return 'application/x-csh';
else if(ext == 'css')return 'text/css';
else if(ext == 'dcr')return 'application/x-director';
else if(ext == 'der')return 'application/x-x509-ca-cert';
else if(ext == 'dir')return 'application/x-director';
else if(ext == 'dll')return 'application/x-msdownload';
else if(ext == 'dms')return 'application/octet-stream';
else if(ext == 'doc')return 'application/msword';
else if(ext == 'dot')return 'application/msword';
else if(ext == 'dvi')return 'application/x-dvi';
else if(ext == 'dxr')return 'application/x-director';
else if(ext == 'eps')return 'application/postscript';
else if(ext == 'etx')return 'text/x-setext';
else if(ext == 'evy')return 'application/envoy';
else if(ext == 'exe')return 'application/octet-stream';
else if(ext == 'fif')return 'application/fractals';
else if(ext == 'flr')return 'x-world/x-vrml';
else if(ext == 'gif')return 'image/gif';
else if(ext == 'gtar')return 'application/x-gtar';
else if(ext == 'gz')return 'application/x-gzip';
else if(ext == 'h')return 'text/plain';
else if(ext == 'hdf')return 'application/x-hdf';
else if(ext == 'hlp')return 'application/winhlp';
else if(ext == 'hqx')return 'application/mac-binhex40';
else if(ext == 'hta')return 'application/hta';
else if(ext == 'htc')return 'text/x-component';
else if(ext == 'htm')return 'text/html';
else if(ext == 'html')return 'text/html';
else if(ext == 'htt')return 'text/webviewhtml';
else if(ext == 'ico')return 'image/x-icon';
else if(ext == 'ief')return 'image/ief';
else if(ext == 'iii')return 'application/x-iphone';
else if(ext == 'ins')return 'application/x-internet-signup';
else if(ext == 'isp')return 'application/x-internet-signup';
else if(ext == 'jfif')return 'image/pipeg';
else if(ext == 'jpe')return 'image/jpeg';
else if(ext == 'jpeg')return 'image/jpeg';
else if(ext == 'jpg')return 'image/jpeg';
else if(ext == 'js')return 'application/x-javascript';
else if(ext == 'latex')return 'application/x-latex';
else if(ext == 'lha')return 'application/octet-stream';
else if(ext == 'lsf')return 'video/x-la-asf';
else if(ext == 'lsx')return 'video/x-la-asf';
else if(ext == 'lzh')return 'application/octet-stream';
else if(ext == 'm13')return 'application/x-msmediaview';
else if(ext == 'm14')return 'application/x-msmediaview';
else if(ext == 'm3u')return 'audio/x-mpegurl';
else if(ext == 'man')return 'application/x-troff-man';
else if(ext == 'mdb')return 'application/x-msaccess';
else if(ext == 'me')return 'application/x-troff-me';
else if(ext == 'mht')return 'message/rfc822';
else if(ext == 'mhtml')return 'message/rfc822';
else if(ext == 'mid')return 'audio/mid';
else if(ext == 'mny')return 'application/x-msmoney';
else if(ext == 'mov')return 'video/quicktime';
else if(ext == 'movie')return 'video/x-sgi-movie';
else if(ext == 'mp2')return 'video/mpeg';
else if(ext == 'mp3')return 'audio/mpeg';
else if(ext == 'mpa')return 'video/mpeg';
else if(ext == 'mpe')return 'video/mpeg';
else if(ext == 'mpeg')return 'video/mpeg';
else if(ext == 'mpg')return 'video/mpeg';
else if(ext == 'mpp')return 'application/vnd.ms-project';
else if(ext == 'mpv2')return 'video/mpeg';
else if(ext == 'ms')return 'application/x-troff-ms';
else if(ext == 'mvb')return 'application/x-msmediaview';
else if(ext == 'nws')return 'message/rfc822';
else if(ext == 'oda')return 'application/oda';
else if(ext == 'p10')return 'application/pkcs10';
else if(ext == 'p12')return 'application/x-pkcs12';
else if(ext == 'p7b')return 'application/x-pkcs7-certificates';
else if(ext == 'p7c')return 'application/x-pkcs7-mime';
else if(ext == 'p7m')return 'application/x-pkcs7-mime';
else if(ext == 'p7r')return 'application/x-pkcs7-certreqresp';
else if(ext == 'p7s')return 'application/x-pkcs7-signature';
else if(ext == 'pbm')return 'image/x-portable-bitmap';
else if(ext == 'pdf')return 'application/pdf';
else if(ext == 'pfx')return 'application/x-pkcs12';
else if(ext == 'pgm')return 'image/x-portable-graymap';
else if(ext == 'pko')return 'application/ynd.ms-pkipko';
else if(ext == 'pma')return 'application/x-perfmon';
else if(ext == 'pmc')return 'application/x-perfmon';
else if(ext == 'pml')return 'application/x-perfmon';
else if(ext == 'pmr')return 'application/x-perfmon';
else if(ext == 'pmw')return 'application/x-perfmon';
else if(ext == 'png')return 'image/png';
else if(ext == 'pot,')return 'application/vnd.ms-powerpoint';
else if(ext == 'ppm')return 'image/x-portable-pixmap';
else if(ext == 'pps')return 'application/vnd.ms-powerpoint';
else if(ext == 'ppt')return 'application/vnd.ms-powerpoint';
else if(ext == 'prf')return 'application/pics-rules';
else if(ext == 'ps')return 'application/postscript';
else if(ext == 'pub')return 'application/x-mspublisher';
else if(ext == 'qt')return 'video/quicktime';
else if(ext == 'ra')return 'audio/x-pn-realaudio';
else if(ext == 'ram')return 'audio/x-pn-realaudio';
else if(ext == 'ras')return 'image/x-cmu-raster';
else if(ext == 'rgb')return 'image/x-rgb';
else if(ext == 'rmi')return 'audio/mid';
else if(ext == 'roff')return 'application/x-troff';
else if(ext == 'rtf')return 'application/rtf';
else if(ext == 'rtx')return 'text/richtext';
else if(ext == 'scd')return 'application/x-msschedule';
else if(ext == 'sct')return 'text/scriptlet';
else if(ext == 'setpay')return 'application/set-payment-initiation';
else if(ext == 'setreg')return 'application/set-registration-initiation';
else if(ext == 'sh')return 'application/x-sh';
else if(ext == 'shar')return 'application/x-shar';
else if(ext == 'sit')return 'application/x-stuffit';
else if(ext == 'snd')return 'audio/basic';
else if(ext == 'spc')return 'application/x-pkcs7-certificates';
else if(ext == 'spl')return 'application/futuresplash';
else if(ext == 'src')return 'application/x-wais-source';
else if(ext == 'sst')return 'application/vnd.ms-pkicertstore';
else if(ext == 'stl')return 'application/vnd.ms-pkistl';
else if(ext == 'stm')return 'text/html';
else if(ext == 'svg')return 'image/svg+xml';
else if(ext == 'sv4cpio')return 'application/x-sv4cpio';
else if(ext == 'sv4crc')return 'application/x-sv4crc';
else if(ext == 'swf')return 'application/x-shockwave-flash';
else if(ext == 't')return 'application/x-troff';
else if(ext == 'tar')return 'application/x-tar';
else if(ext == 'tcl')return 'application/x-tcl';
else if(ext == 'tex')return 'application/x-tex';
else if(ext == 'texi')return 'application/x-texinfo';
else if(ext == 'texinfo')return 'application/x-texinfo';
else if(ext == 'tgz')return 'application/x-compressed';
else if(ext == 'tif')return 'image/tiff';
else if(ext == 'tiff')return 'image/tiff';
else if(ext == 'tr')return 'application/x-troff';
else if(ext == 'trm')return 'application/x-msterminal';
else if(ext == 'tsv')return 'text/tab-separated-values';
else if(ext == 'txt')return 'text/plain';
else if(ext == 'uls')return 'text/iuls';
else if(ext == 'ustar')return 'application/x-ustar';
else if(ext == 'vcf')return 'text/x-vcard';
else if(ext == 'vrml')return 'x-world/x-vrml';
else if(ext == 'wav')return 'audio/x-wav';
else if(ext == 'wcm')return 'application/vnd.ms-works';
else if(ext == 'wdb')return 'application/vnd.ms-works';
else if(ext == 'wks')return 'application/vnd.ms-works';
else if(ext == 'wmf')return 'application/x-msmetafile';
else if(ext == 'wps')return 'application/vnd.ms-works';
else if(ext == 'wri')return 'application/x-mswrite';
else if(ext == 'wrl')return 'x-world/x-vrml';
else if(ext == 'wrz')return 'x-world/x-vrml';
else if(ext == 'xaf')return 'x-world/x-vrml';
else if(ext == 'xbm')return 'image/x-xbitmap';
else if(ext == 'xla')return 'application/vnd.ms-excel';
else if(ext == 'xlc')return 'application/vnd.ms-excel';
else if(ext == 'xlm')return 'application/vnd.ms-excel';
else if(ext == 'xls')return 'application/vnd.ms-excel';
else if(ext == 'xlt')return 'application/vnd.ms-excel';
else if(ext == 'xlw')return 'application/vnd.ms-excel';
else if(ext == 'xof')return 'x-world/x-vrml';
else if(ext == 'xpm')return 'image/x-xpixmap';
else if(ext == 'xwd')return 'image/x-xwindowdump';
else if(ext == 'z')return 'application/x-compress';
else if(ext == 'zip')return 'application/zip';
	}
});

