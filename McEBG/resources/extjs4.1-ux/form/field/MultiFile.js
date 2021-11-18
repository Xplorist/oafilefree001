Ext.define("Extux.form.field.MultiFile", {
    extend: 'Ext.form.field.Trigger',
    alias: ['widget.multifilefield'],
    uses: ['Ext.button.Button', 'Ext.layout.component.field.Field'],

    //<locale>
    /**
     * @cfg {String} buttonText
     * The button text to display on the upload button. Note that if you supply a value for
     * {@link #buttonConfig}, the buttonConfig.text value will be used instead if available.
     */
    buttonText: 'Browse...',
    //</locale>

    /**
     * @cfg {Boolean} buttonOnly
     * True to display the file upload field as a button with no visible text field. If true, all
     * inherited Text members will still be available.
     */
    buttonOnly: false,

    /**
     * @cfg {Number} buttonMargin
     * The number of pixels of space reserved between the button and the text field. Note that this only
     * applies if {@link #buttonOnly} = false.
     */
    buttonMargin: 3,

    /**
     * @cfg {Object} buttonConfig
     * A standard {@link Ext.button.Button} config object.
     */

    /**
     * @event change
     * Fires when the underlying file input field's value has changed from the user selecting a new file from the system
     * file selection dialog.
     * @param {Ext.ux.form.FileUploadField} this
     * @param {String} value The file value returned by the underlying file input field
     */

    /**
     * @property {Ext.Element} fileInputEl
     * A reference to the invisible file input element created for this upload field. Only populated after this
     * component is rendered.
     */

    /**
     * @property {Ext.button.Button} button
     * A reference to the trigger Button component created for this upload field. Only populated after this component is
     * rendered.
     */

    /**
     * @cfg {String} [fieldBodyCls='x-form-file-wrap']
     * An extra CSS class to be applied to the body content element in addition to {@link #fieldBodyCls}.
     */
    fieldBodyCls: Ext.baseCSSPrefix + 'form-file-wrap',

    /**
     * @cfg {Boolean} readOnly
     * Unlike with other form fields, the readOnly config defaults to true in File field.
     */
    readOnly: true,

    /**
     * Do not show hand pointer over text field since file choose dialog is only shown when clicking in the button
     * @private
     */
    triggerNoEditCls: '',

    // private
    componentLayout: 'triggerfield',

    // private. Extract the file element, button outer element, and button active element.
    childEls: ['fileInputEl', 'buttonEl', 'buttonEl-btnEl', 'browseButtonWrap'],

    // private
    onRender: function() {
        var me = this,
            inputEl;

        me.callParent(arguments);

        inputEl = me.inputEl;
        inputEl.dom.name = ''; //name goes on the fileInput, not the text input

        me.fileInputEl.dom.name = me.getName();
        me.fileInputEl.on({
            scope: me,
            change: me.onFileChange
        });

        if (me.buttonOnly) {
            me.inputCell.setDisplayed(false);
        }

        // Ensure the trigger cell is sized correctly upon render
        me.browseButtonWrap.dom.style.width = (me.browseButtonWrap.dom.lastChild.offsetWidth + me.buttonEl.getMargin('lr')) + 'px';
        if (Ext.isIE) {
            me.buttonEl.repaint();
        }
    },

    /**
     * Gets the markup to be inserted into the subTplMarkup.
     */
    getTriggerMarkup: function() {
        var me = this,
            result,
            btn = Ext.widget('button', Ext.apply({
                id: me.id + '-buttonEl',
                ui: me.ui,
                disabled: me.disabled,
                text: me.buttonText,
                cls: Ext.baseCSSPrefix + 'form-file-btn',
                preventDefault: false,
                style: me.buttonOnly ? '' : 'margin-left:' + me.buttonMargin + 'px'
            }, me.buttonConfig)),
            btnCfg = btn.getRenderTree(),
            inputElCfg = {
                id: me.id + '-fileInputEl',
                cls: Ext.baseCSSPrefix + 'form-file-input',
                tag: 'input',
                type: 'file',
                multiple: "multiple",
                size: 1
            };
        if (me.disabled) {
            inputElCfg.disabled = true;
        }
        btnCfg.cn = inputElCfg;
        result = '<td id="' + me.id + '-browseButtonWrap">' + Ext.DomHelper.markup(btnCfg) + '</td>';
        btn.destroy();
        return result;
    },

    /**
     * @private
     * Creates the file input element. It is inserted into the trigger button component, made
     * invisible, and floated on top of the button's other content so that it will receive the
     * button's clicks.
     */
    createFileInput : function() {
        var me = this;
        me.fileInputEl = me.buttonEl.createChild({
            name: me.getName(),
            id: me.id + '-fileInputEl',
            cls: Ext.baseCSSPrefix + 'form-file-input',
            tag: 'input',
            type: 'file',
            multiple: "multiple",
            size: 1
        });
        me.fileInputEl.on({
            scope: me,
            change: me.onFileChange
        });
    },

    /**
     * @private Event handler fired when the user selects a file.
     */
    onFileChange: function() {
        this.lastValue = null; // force change event to get fired even if the user selects a file with the same name
        var fs = this.fileInputEl.dom.files, f = '';
        if(fs){
        for(var i=0;i<fs.length;i++){
        	f += fs[i].name+';';
        }}else{
        	f = this.fileInputEl.dom.value;
        }
        this.superclass.setValue.call(this, f);
    },

    /**
     * Overridden to do nothing
     * @method
     */
    setValue: Ext.emptyFn,

    reset : function(){
        var me = this;
        if (me.rendered) {
            me.fileInputEl.remove();
            me.createFileInput();
            me.inputEl.dom.value = '';
        }
        me.callParent();
    },

    onDisable: function(){
        this.callParent();
        this.disableItems();
    },
    
    disableItems: function(){
        var file = this.fileInputEl;
        if (file) {
            file.dom.disabled = true;
        }
        this['buttonEl-btnEl'].dom.disabled = true;
    },

    onEnable: function(){
        var me = this;
        me.callParent();
        me.fileInputEl.dom.disabled = false;
        this['buttonEl-btnEl'].dom.disabled = false;
    },

    isFileUpload: function() {
        return true;
    },

    extractFileInput: function() {
        var fileInput = this.fileInputEl.dom;
        this.reset();
        return fileInput;
    },

    onDestroy: function(){
        Ext.destroyMembers(this, 'fileInputEl', 'buttonEl');
        this.callParent();
    }
});