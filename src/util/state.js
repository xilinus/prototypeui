/* 
  UI.State
    This helper allows to use back/forward browser buttons to switch between states and
    to bookmark an application in a given state. It uses fragment part of URL to store state name.
    A state is just a simple string, basic examples are "previewing", "editing" for a composition 
    application.

    Use UI.State.change('previewing') to switch to the 'previewing' state.
    Use document.observe('state:changed', callback) to detect state changes.
    Inside the callback, event.memo.value gives the state name.

    On page load, state:changed is fired if the fragment part of the URL is not blank.
    If users gets back to the initial state, state:changed is fired with empty string as value.
    
    This is a simplified (and still buggy) version of YUI Browser History Manager.
    (http://yuiblog.com/blog/2007/02/21/browser-history-manager/)
    
    Seems to work in Safari 2/3, IE6, Firefox 1.5/2
    Opera <9.5 isn't supported for now
    Try UI.State.isSupported() before any attempt...
    
    Warning: You should need to wait for document to be loaded before using this helper.
    Using document.whenReady is a good way to ensure this.
    Classic anchors with hash (<a href="#top"> for instance) triggers state:changed on all
    browsers but IE, therefore using those anchors is NOT the good way to switch between states.
    
    Example:
      A simple REST catalog that works without Javascript.

      <div id="products_menu">
        <a href="/products/14-mug">Mug</a>
        <a href="/products/15-chair">Chair</a>
      </div>
      
      <div id="content">
        <!-- selected product -->
      </div>
      
      
      Server side: at route "/products[/id]"
        if javascript is wanted?
          render javascript instructions to replace $('content') with
          current product (if id is present) or index
        else
          render product (if id is present) or index in html within catalog layout
        end
      
      Javascript side:
        document.observe('state:changed', function(event) {
          var fragment = event.memo.value;
          // Back to initial (index) state
          if (fragment.empty()) new Ajax.Request('/products');
          // If fragment matches a product, request this product
          if (fragment.match(/\d+-\w+/)) new Ajax.Request('/products/'+fragment);
        });
      
        document.observe('mousedown', function(event) {
          var link = event.findElement('#products_menu a');
          if (link) {
            // prevent browser from following link
            event.stop();
            UI.State.change(link.readAttribute('href').sub('/products/', ''));
          }
        });
      

*/
UI.State = (function(browser) {
  var watch, change, changed, fragment;
  
  function getFragment() {
    return top.location.hash.substr(1);
  }
  
  function fragmentChanged(newFragment) {
    document.fire('state:changed', { value: newFragment, previousValue: fragment });
    fragment = newFragment;
  }
  
  document.whenReady(function() {
    var initialFragment = getFragment();
    if (initialFragment) fragmentChanged(initialFragment);
    
    if (browser.IE) {
      var iframe = new Element('iframe', { style: 'display: none' });
      $body.appendChild(iframe);

      var contentWindow = iframe.contentWindow;

      function writeFragmentToIFrame(fragment) {
        var doc = contentWindow.document;
        doc.open();
        doc.write(fragment || '');
        doc.close();
      }

      function readFragmentFromIFrame() {
        return contentWindow.document.body.innerText;
      }    

      writeFragmentToIFrame(fragment);
      
      watch = function() {
        var newFragment = readFragmentFromIFrame();
        if (newFragment != fragment) {
          top.location.hash = newFragment || '';
          fragmentChanged(newFragment);
        }
      };
      
      change = function(newFragment) {
        if (newFragment != fragment) writeFragmentToIFrame(newFragment);
      };

    } else {    
      // watching history.length is only useful for WebKit
      var counter = history.length, fragments = [ ];
      
      watch = function() {
        var newFragment = getFragment(), newCounter = history.length;
        if (newFragment != fragment) fragmentChanged(newFragment);
        else if (newCounter != counter) {
          fragmentChanged(fragments[newCounter - 1]);
          fragment = newFragment;
        }
        counter = newCounter;
      };
            
      change = function(newFragment) {
        top.location.hash = newFragment;
        if (browser.WebKit) fragments[history.length] = newFragment;
      };
    }
    
    setInterval(function() {
      if (changed) watch()
    }, 50);
  });
  
  return {
    change: function(value) {
      change(value);
      changed = true;
    },
    
    isSupported: function() {
      return !browser.Opera || navigator.appVersion.match("9.5");
    }
  }
})(Prototype.Browser);
