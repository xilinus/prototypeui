Element.addMethods({
  getScrollDimensions: function(element) {
    element = $(element);
    return {
      width:  element.scrollWidth,
      height: element.scrollHeight
    }
  },
  
  getScrollOffset: function(element) {
    element = $(element);
    return Element._returnOffset(element.scrollLeft, element.scrollTop);
  },
  
  setScrollOffset: function(element, offset) {
    element = $(element);
    if (arguments.length == 3)
      offset = { left: offset, top: arguments[2] };
    element.scrollLeft = offset.left;
    element.scrollTop  = offset.top;
    return element;
  },

  // returns "clean" numerical style (without "px") or null if style can not be resolved
  // or is not numeric
  getNumStyle: function(element, style) {
    var value = parseFloat($(element).getStyle(style));
    return isNaN(value) ? null : value;
  },
  
  // with courtesy of Tobie Langel 
  //   (http://tobielangel.com/2007/5/22/prototype-quick-tip)
  appendText: function(element, text) {
    element = $(element);
    element.appendChild(document.createTextNode(String.interpret(text)));
    return element;
  }
});

document.whenReady = (function() {
  var queue = [ ];
  
  document.observe('dom:loaded', function() { 
    queue.invoke('call', document);
    queue.clear();
    document.whenReady = function(callback) { callback.bind(document).defer() };
  });
  
  return function(callback) { queue.push(callback) };
})();

Object.extend(document.viewport, { 
  // Alias this method for consistency
  getScrollOffset: document.viewport.getScrollOffsets,
  
  setScrollOffset: function(offset) {
    Element.setScrollOffset(Prototype.Browser.WebKit ? document.body : document.documentElement, offset);
  },
  
  getScrollDimensions: function() {
    return Element.getScrollDimensions(Prototype.Browser.WebKit ? document.body : document.documentElement);
  }
});

document.whenReady(function() {
  window.$head = $(document.getElementsByTagName('head')[0]);
  window.$body = $(document.body);
});
