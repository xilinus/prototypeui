/*
Namespace: CSS
  
  Utility functions for CSS/StyleSheet files access
  
  Authors:
    - Sébastien Gruhier, <http://www.xilinus.com>
    - Samuel Lebeau, <http://gotfresh.info>
*/

var CSS = (function() {
  // Code based on:
  //   - IE5.5+ PNG Alpha Fix v1.0RC4 (c) 2004-2005 Angus Turnbull http://www.twinhelix.com
  //   - Whatever:hover - V2.02.060206 - hover, active & focus (c) 2005 - Peter Nederlof * Peterned - http://www.xs4all.nl/~peterned/
  function fixPNG() {
   parseStylesheet.apply(this, $A(arguments).concat(fixRule));
  };

  function parseStylesheet() {
    var patterns = $A(arguments);
    var method = patterns.pop();

    // To avoid flicking background  
    // if (Prototype.Browser.IE)
    //   document.execCommand("BackgroundImageCache", false, true);
    // Parse all document stylesheets
    var styleSheets = $A(document.styleSheets);
    if (patterns.length > 0) {
      styleSheets = styleSheets.select(function(css) {
        return patterns.any(function(pattern) {
          return css.href && css.href.match(pattern)
          });
      });
    }  
    styleSheets.each(function(styleSheet) {fixStylesheet.call(this, styleSheet, method)});
  };

  // Fixes a stylesheet
  function fixStylesheet(stylesheet, method) {    
    // Parse import files
    if (stylesheet.imports)
      $A(stylesheet.imports).each(fixStylesheet);

    var href = stylesheet.href || document.location.href;
    var docPath = href.substr(0, href.lastIndexOf('/'));
	  // Parse all CSS Rules
    $A(stylesheet.rules || stylesheet.cssRules).each(function(rule) { method.call(this, rule, docPath) });
  };

  var filterPattern = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="#{src}",sizingMethod="#{method}")';

  // Fixes a rule if it has a PNG background
  function fixRule(rule, docPath) {
    var bgImg = rule.style.backgroundImage;
    // Rule with PNG background image
    if (bgImg && bgImg != 'none' && bgImg.match(/^url[("']+(.*\.png)[)"']+$/i)) {
      var src = RegExp.$1;
      var bgRepeat = rule.style.backgroundRepeat;
      // Relative path
      if (src[0] != '/')
        src = docPath + "/" + src;
      // Apply filter
      rule.style.filter = filterPattern.interpolate({
        src:    src,
        method: bgRepeat == "no-repeat" ? "crop" : "scale" });
      rule.style.backgroundImage = "none";
    }
  };

  var preloadedImages = new Hash();

  function preloadRule(rule, docPath) {
    var bgImg = rule.style.backgroundImage;
    if (bgImg && bgImg != 'none'  && bgImg != 'initial' ) {
      if (!preloadedImages.get(bgImg)) {
        bgImg.match(/^url[("']+(.*)[)"']+$/i);
        var src = RegExp.$1;
        // Relative path
        if (!(src[0] == '/' || src.match(/^file:/) || src.match(/^https?:/)))
          src = docPath + "/" + src; 
        preloadedImages.set(bgImg, true);
        var image = new Image();
        image.src = src;
      }
    }
  }

  return {
    /*
       Method: fixPNG
         Fix transparency of PNG background of document stylesheets.
         (only on IE version<7, otherwise does nothing)

         Warning: All png background will not work as IE filter use for handling transparency in PNG
         is not compatible with all background. It does not support top/left position (so no CSS sprite)

         I recommend to create a special CSS file with png that needs to be fixed and call CSS.fixPNG on this CSS

         Examples:
          > CSS.fixPNG() // To fix all css
          >
          > CSS.fixPNG("mac_shadow.css") // to fix all css files with mac_shadow.css so mainly only on file
          >
          > CSS.fixPNG("shadow", "vista"); // To fix all css files with shadow or vista in their names

       Parameters
         patterns: (optional) list of pattern to filter css files
    */
    fixPNG: (Prototype.Browser.IE && Prototype.Browser.IEVersion < 7) ? fixPNG : Prototype.emptyFunction,

    // By Tobie Langel (http://tobielangel.com)
    //   inspired by http://yuiblog.com/blog/2007/06/07/style/
    addRule: function(css) {
      var style = new Element('style', { type: 'text/css', media: 'screen' });
      $head.insert(style);
      if (style.styleSheet) style.styleSheet.cssText = css;
      else style.appendText(css);
      return style;
    },

    preloadImages: function() {  
      // Does not work with FF3!!
      if (navigator.userAgent.match(/Firefox\/3/))
        return;
        
      parseStylesheet.apply(this, $A(arguments).concat(preloadRule));
    }
  };
})();
