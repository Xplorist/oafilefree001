/**
 * Will automatically load ext-all-debug.js if ISDEVELOPMENT is true, else will
 * load ext-all.js
 */
var disableCaching = false;
var ISDEVELOPMENT = true;
var contextPath = window.location.pathname.substr(0, window.location.pathname.indexOf('/', 1));
var mainThemeName = window.top.MAIN_THEME_NAME;

// Ext.BLANK_IMAGE_URL = contextPath +
// "/pub/extjs4/resources/themes/images/s.gif";
(function() {
	// true is debug mode,false is release mode
	if(!mainThemeName){
		document.write('<link id="theme_ext_css" rel="stylesheet" type="text/css" href="' + contextPath + '/resources/extjs4.1/resources/css/ext-all.css" >');
	}else{
		document.write('<link id="theme_ext_css" rel="stylesheet" type="text/css" href="' + contextPath + '/resources/extjs4.1/resources/css/ext-all-'+mainThemeName+'.css" >');
	}
	document.write('<link rel="stylesheet" type="text/css" href="' + contextPath + '/resources/css/default.css" >');
	document.write('<script type="text/javascript" charset="UTF-8" src="' + contextPath + '/resources/extjs4.1/ext-all' + (ISDEVELOPMENT ? '-debug' : '') + '.js"></script>');
	document.write('<script type="text/javascript" charset="UTF-8" src="' + contextPath + '/resources/extjs4.1/ux/IFrame.js"></script>');
	document.write('<script type="text/javascript" charset="UTF-8" src="' + contextPath + '/resources/extjs4.1-ux/grid/plugin/GridHotKeySup.js"></script>');
	document.write('<script type="text/javascript" charset="UTF-8" src="' + contextPath + '/resources/extjs4.1-ux/Override.js"></script>');
	document.write('<script type="text/javascript" charset="UTF-8" src="' + contextPath + '/resources/extjs4.1/locale/ext-lang-zh_TW.js"></script>');
	document.write('<script type="text/javascript" charset="UTF-8" src="' + contextPath + '/resources/js/pub/pub.js"></script>');
	document.write("<script type=\"text/javascript\">Ext.Loader.setConfig({ enabled : true, disableCaching : "+disableCaching+", paths : { 'Ext.ux' : '" + contextPath + "/resources/extjs4.1/ux', 'Extux' : '" + contextPath + "/resources/extjs4.1-ux', 'Ext' : '" + contextPath + "/resources/extjs4.1' } });Ext.BLANK_IMAGE_URL = '" + contextPath + "/resources/extjs4.1/resources/s.png';</script>");
})();
