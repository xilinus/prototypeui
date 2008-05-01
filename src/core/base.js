(function(p) {
  var b = p.Browser, n = navigator;

  if (b.WebKit) {
    b.WebKitVersion = parseFloat(n.userAgent.match(/AppleWebKit\/([\d\.\+]*)/)[1]);  
    b.Safari2 = (b.WebKitVersion < 420);
  }

  if (b.IE) {
    b.IEVersion = parseFloat(n.appVersion.split(';')[1].strip().split(' ')[1]);   
    b.IE6 = b.IEVersion == 6;
    b.IE7 = b.IEVersion == 7;
  }

  p.falseFunction = function() { return false };
  p.trueFunction  = function() { return true  };
})(Prototype);

/*
Namespace: UI

  Introduction:
    Prototype-UI is a library of user interface components based on the Prototype framework.
    Its aim is to easilly improve user experience in web applications.

    It also provides utilities to help developers.

  Guideline:
    - Prototype conventions are followed
    - Everything should be unobstrusive
    - All components are themable with CSS stylesheets, various themes are provided

  Warning:
    Prototype-UI is still under deep development, this release is targeted to developers only.
    All interfaces are subjects to changes, suggestions are welcome.

    DO NOT use it in production for now.

  Authors:
    - Sébastien Gruhier, <http://www.xilinus.com>
    - Samuel Lebeau, <http://gotfresh.info>
*/

var UI = {
  Abstract: { },
  Ajax: { }
};
