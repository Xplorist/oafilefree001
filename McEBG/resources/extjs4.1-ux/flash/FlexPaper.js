(function() {

	var IE = document.all,
		URL = 'http://www.adobe.com/go/getflashplayer',
		JQUERY = typeof jQuery == 'function',
		RE = /(\d+)[^\d]+(\d+)[^\d]*(\d*)/,
		GLOBAL_OPTS = {
			// very common opts
			height : 800,
			width : '100%',
			//height : '100%',
			id : "_" + ("" + Math.random()).slice(9),
			Scale : 1.0, 
			// flashembed defaults
			allowfullscreen : true,
			allowscriptaccess : 'always',
			quality : 'high',

			// flashembed specific options
			version : [3, 0],
			onFail : null,
			expressInstall : null,
			w3c : false,
			cachebusting : false
		};

	if (IE) {
		GLOBAL_OPTS.cachebusting = true;
	}

	// version 9 bugfix: (http://blog.deconcept.com/2006/07/28/swfobject-143-released/)
	if (window.attachEvent) {
		window.attachEvent("onbeforeunload", function() {
			__flash_unloadHandler = function() {};
			__flash_savedUnloadHandler = function() {};
		});
	}

	// simple extend
	function extend(to, from) {
		if (from) {
			for (var key in from) {
				if (from.hasOwnProperty(key)) {
					to[key] = from[key];
				}
			}
		}
		return to;
	}

	// used by asString method	
	function map(arr, func) {
		var newArr = [];
		for (var i in arr) {
			if (arr.hasOwnProperty(i)) {
				newArr[i] = func(arr[i]);
			}
		}
		return newArr;
	}

	window.flashembed = function(root, opts, conf) {

		// root must be found / loaded	
		if (typeof root == 'string') {
			root = document.getElementById(root.replace("#", ""));
		}

		// not found
		if (!root) {
			return;
		}

		root.onclick = function() {
			return false;
		}

		if (typeof opts == 'string') {
			opts = {
				src : opts
			};
		}

		return new Flash(root, extend(extend({}, GLOBAL_OPTS), opts), conf);
	};

	// flashembed "static" API
	var f = extend(window.flashembed, {

		conf : GLOBAL_OPTS,

		getVersion : function() {
			var fo, ver;

			try {
				ver = navigator.plugins["Shockwave Flash"].description.slice(16);
			} catch (e) {

				try {
					fo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
					ver = fo && fo.GetVariable("$version");

				} catch (err) {
					try {
						fo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
						ver = fo && fo.GetVariable("$version");
					} catch (err2) {}
				}
			}

			ver = RE.exec(ver);
			return ver ? [ver[1], ver[3]] : [0, 0];
		},

		asString : function(obj) {

			if (obj === null || obj === undefined) {
				return null;
			}
			var type = typeof obj;
			if (type == 'object' && obj.push) {
				type = 'array';
			}

			switch (type) {

				case 'string' :
					obj = obj.replace(new RegExp('(["\\\\])', 'g'), '\\$1');

					// flash does not handle %- characters well. transforms "50%" to "50pct" (a dirty hack, I admit)
					obj = obj.replace(/^\s?(\d+\.?\d+)%/, "$1pct");
					return '"' + obj + '"';

				case 'array' :
					return '[' + map(obj, function(el) {
						return f.asString(el);
					}).join(',') + ']';

				case 'function' :
					return '"function()"';

				case 'object' :
					var str = [];
					for (var prop in obj) {
						if (obj.hasOwnProperty(prop)) {
							str.push('"' + prop + '":' + f.asString(obj[prop]));
						}
					}
					return '{' + str.join(',') + '}';
			}

			// replace ' --> "  and remove spaces
			return String(obj).replace(/\s/g, " ").replace(/\'/g, "\"");
		},

		getHTML : function(opts, conf) {

			opts = extend({}, opts);
			opts.id = opts.id + (" " + Math.random()).slice(9);

			/** ***** OBJECT tag and it's attributes ****** */
			var html = '<object width="' + opts.width + '" height="' + opts.height + '" id="' + opts.id + '" name="' + opts.id + '"';

			if (opts.cachebusting) {
				opts.src += ((opts.src.indexOf("?") != -1 ? "&" : "?") + Math.random());
			}

			if (opts.w3c || !IE) {
				html += ' data="' + opts.src + '" type="application/x-shockwave-flash"';
			} else {
				html += ' classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"';
			}

			html += '>';

			/** ***** nested PARAM tags ****** */
			if (opts.w3c || IE) {
				html += '<param name="movie" value="' + opts.src + '" />';
			}

			// not allowed params
			opts.width = opts.height = opts.id = opts.w3c = opts.src = null;
			opts.onFail = opts.version = opts.expressInstall = null;

			for (var key in opts) {
				if (opts[key]) {
					html += '<param name="' + key + '" value="' + opts[key] + '" />';
				}
			}

			/** ***** FLASHVARS ****** */
			var vars = "";

			if (conf) {
				for (var k in conf) {
					if (conf[k]) {
						var val = conf[k];
						vars += k + '=' + (/function|object/.test(typeof val) ? f.asString(val) : val) + '&';
					}
				}
				vars = vars.slice(0, -1);
				html += '<param name="flashvars" value=\'' + vars + '\' />';
			}

			html += "</object>";
			return html;
		},

		isSupported : function(ver) {
			return VERSION[0] > ver[0] || VERSION[0] == ver[0] && VERSION[1] >= ver[1];
		}

	});

	var VERSION = f.getVersion();

	function Flash(root, opts, conf) {

		// version is ok
		if (f.isSupported(opts.version)) {
			root.innerHTML = f.getHTML(opts, conf);

			// express install
		} else if (opts.expressInstall && f.isSupported([6, 65])) {
			root.innerHTML = f.getHTML(extend(opts, {
				src : opts.expressInstall
			}), {
				MMredirectURL : location.href,
				MMplayerType : 'PlugIn',
				MMdoctitle : document.title
			});

		} else {

			// fail #2.1 custom content inside container
			if (!root.innerHTML.replace(/\s/g, '')) {
				/*
				 * root.innerHTML = "<h2>Flash version " + opts.version + " or
				 * greater is required</h2>" + "<h3>" + (VERSION[0] > 0 ?
				 * "Your version is " + VERSION : "You have no flash plugin
				 * installed") + "</h3>" + (root.tagName == 'A' ? "<p>Click
				 * here to download latest version</p>" : "<p>Download
				 * latest version from <a href='" + URL + "'>here</a></p>");
				 */
				var pageHost = ((document.location.protocol == "https:") ? "https://" : "http://");

				root.innerHTML = "<a href='http://www.adobe.com/go/getflashplayer'><img src='" + pageHost + "www.adobe.com/images/shared/download_buttons/get_flash_player.gif' alt='Get Adobe Flash player' /></a>";

				if (root.tagName == 'A') {
					root.onclick = function() {
						location.href = URL;
					};
				}
			}

			// onFail
			if (opts.onFail) {
				var ret = opts.onFail.call(this);
				if (typeof ret == 'string') {
					root.innerHTML = ret;
				}
			}
		}

		// http://flowplayer.org/forum/8/18186#post-18593
		if (IE) {
			window[opts.id] = document.getElementById(opts.id);
		}

		// API methods for callback
		extend(this, {

			getRoot : function() {
				return root;
			},

			getOptions : function() {
				return opts;
			},

			getConf : function() {
				return conf;
			},

			getApi : function() {
				return root.firstChild;
			}

		});
	}

	// setup jquery support
	if (JQUERY) {

		// tools version number
		jQuery.tools = jQuery.tools || {
			version : '1.2.5'
		};

		jQuery.tools.flashembed = {
			conf : GLOBAL_OPTS
		};

		jQuery.fn.flashembed = function(opts, conf) {
			return this.each(function() {
				$(this).data("flashembed", flashembed(this, opts, conf));
			});
		};
	}

})();

Ext.define('Extux.flash.FlexPaper', {
	extend : 'Ext.Component',

	alias : 'widget.flexpaper',
	flashVersion : '9.0.115',

	backgroundColor : '#ffffff',
	statics : {
		EXPRESS_INSTALL_URL : 'http:/' + '/swfobject.googlecode.com/svn/trunk/swfobject/expressInstall.swf'
	},
	expressInstall : false,
	swfFile : '',
	GLOBAL_OPTS : {
		width : '100%',
		height : '100%',
		id : "_" + ("" + Math.random()).slice(9),
		allowfullscreen : true,
		allowscriptaccess : 'always',
		quality : 'high',
		version : [3, 0],
		onFail : null,
		expressInstall : null,
		w3c : false,
		cachebusting : false
	},
	config : {
		Scale : 1.0,
		ZoomTransition : 'easeOut',
		ZoomTime : 0.5,
		ZoomInterval : 0.2,
		FitPageOnLoad : false,
		FitWidthOnLoad : false,
		FullScreenAsMaxWindow : false,
		ProgressiveLoading : false,
		MinZoomSize : 0.5,
		MaxZoomSize : 5,
		SearchMatchAll : false,
		InitViewMode : 'Portrait',
		PrintPaperAsBitmap : false,
		ViewModeToolsVisible : true,
		ZoomToolsVisible : true,
		NavToolsVisible : true,
		CursorToolsVisible : true,
		SearchToolsVisible : true,
		localeChain : 'en_US'
	},

	renderTpl : ['<div id="{swfId}"></div>'],

	initComponent : function() {
		if (Ext.isIE) {
			GLOBAL_OPTS.cachebusting = true;
		}

		this.callParent();
	},

	beforeRender : function() {
		this.callParent();

		Ext.applyIf(this.renderData, {
			swfId : this.getSwfId()
		});
	},

	afterRender : function() {
		var me = this;

		me.callParent();

		var config = me.config;
		me.flash = flashembed(me.getSwfId(), {
			src : contextPath + '/resources/extjs4.1-ux/flash/FlexPaperViewer.swf',
			version : [10, 0],
			expressInstall : me.EXPRESS_INSTALL_URL
		}, {
			SwfFile : me.swfFile+'?_dc='+(new Date().getTime()) || '',
			Scale : config.Scale || 0.6,
			ZoomTransition : config.ZoomTransition || 'easeOut',
			ZoomTime : config.ZoomTime || 0.5,
			ZoomInterval : config.ZoomInterval || 0.2,
			FitPageOnLoad : config.FitPageOnLoad + '',
			FitWidthOnLoad : config.FitWidthOnLoad + '',
			FullScreenAsMaxWindow : config.FullScreenAsMaxWindow + '',
			ProgressiveLoading : config.ProgressiveLoading + '',
			MinZoomSize : config.MinZoomSize,
			MaxZoomSize : config.MaxZoomSize,
			SearchMatchAll : config.SearchMatchAll + '',
			SearchServiceUrl : config.SearchServiceUrl,
			InitViewMode : config.InitViewMode,
			BitmapBasedRendering : config.BitmapBasedRendering + '',
			StartAtPage : config.StartAtPage,
			PrintPaperAsBitmap : config.PrintPaperAsBitmap + '',
			AutoAdjustPrintSize : config.AutoAdjustPrintSize + '',
			ViewModeToolsVisible : config.ViewModeToolsVisible + '',
			ZoomToolsVisible : config.ZoomToolsVisible + '',
			NavToolsVisible : config.NavToolsVisible + '',
			CursorToolsVisible : config.CursorToolsVisible + '',
			SearchToolsVisible : config.SearchToolsVisible + '',
			EncodeURI : config.EncodeURI + '',
			localeChain : config.localeChain,
			key : config.key
		});
	},

	getSwfId : function() {
		return this.swfId || (this.swfId = "extswf" + this.getAutoId());
	},

	beforeDestroy : function() {
		var me = this,
			swf = me.swf;
		if (swf) {
			Ext.destroy(swf);
			delete me.swf;
		}
		me.callParent();
	}

});