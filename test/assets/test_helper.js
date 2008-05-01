var USE_PACKED = !true;

// from script.aculo.us
var TestHelper = {
  jsFiles:  $w('core/base core/array core/class core/dom core/event core/number core/string ' + 
               'core/options util/css util/drag_helper util/logger util/contextmenu' +
               'window/window window/effects window/drag_methods window/buttons window/shadow window/private window/url_window '+
               'window/window_manager ' +    
               'shadow/shadow ' +
               'dock/dock ' + '../test/assets/runner'),
  cssFiles: $w("windows/window windows/alphacube windows/mac_os_x windows/leopard windows/lighting windows/vista shadows/mac_shadow shadows/drop_shadow"),
  
  requireJS: function(libraryName) {
    // inserting via DOM fails in Safari 2.0, so brute force approach
    document.writeln('<script type="text/javascript" src="' + this.path + libraryName+'.js"></script>');
  },

  requireCSS: function(libraryName) {
    // inserting via DOM fails in Safari 2.0, so brute force approach
    document.writeln('<link href="' + this.path + "/themes/" + libraryName + '.css" rel="stylesheet" type="text/css" />');
  },        
  
  load: function() {    
    function convertVersionString(versionString){
      var r = versionString.split('.');
      return parseInt(r[0])*100000 + parseInt(r[1])*1000 + parseInt(r[2]);
    }
 
    var src = $$("script").find(function(s) {
      return (s.src && s.src.match(/test_helper\.js(\?.*)?$/))
    }).src;
    var jsIncludes  = src.match(/\?.*loadjs=([a-z,]*)/),
        cssIncludes = src.match(/\?.*loadcss=([a-z,]*)/),
        debug       = src.match(/\?.*debug$/);

    this.path = src.substr(0, src.indexOf("test/assets/"))     
    if (debug) {
      TestHelper.requireJS("test/lib/firebug/firebug");
      document.observe('dom:loaded', function() { $(document.body).addClassName('debug') });
      DEBUG = true;
    }
    jsIncludes = jsIncludes ? jsIncludes[1] : TestHelper.jsFiles.join(',');    
    jsIncludes.split(',').each(function(file){ TestHelper.requireJS("src/" + file) });

    cssIncludes = cssIncludes ? cssIncludes[1] : TestHelper.cssFiles.join(',');    
    cssIncludes.split(',').each(function(file){ TestHelper.requireCSS(file) });
  }
}
                  
var loremIpsum = "<p style='margin:10px'>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum</p>";
TestHelper.load();