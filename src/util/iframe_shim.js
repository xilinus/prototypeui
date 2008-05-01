/*
  Class: UI.IframeShim
    Handles IE6 bug when <select> elements overlap other elements with higher z-index
  
  Example:
    > // creates iframe and positions it under "contextMenu" element
    > this.iefix = new UI.IframeShim().positionUnder('contextMenu');
    > ...
    > document.observe('click', function(e) {
    >   if (e.isLeftClick()) {
    >     this.contextMenu.hide();
    >     
    >     // hides iframe when left click is fired on a document
    >     this.iefix.hide();
    >   }
    > }.bind(this))
    > ...
*/

// TODO:
//  
// Maybe it makes sense to bind iframe to an element 
// so that it automatically calls positionUnder method 
// when the element it's binded to is moved or resized
// Not sure how this might affect overall perfomance...

UI.IframeShim = Class.create(UI.Options, {
  
  options: {
    parent: document.body
  },

  /*
    Method: initialize
    Constructor
      
      Creates iframe shim and appends it to the body.
      Note that this method does not perform proper positioning and resizing of an iframe.
      To do that use positionUnder method
      
    Returns:
      this
  */
  initialize: function(options) {
    this.setOptions(options);
    this.element = new Element('iframe', {
      style: 'position:absolute;filter:progid:DXImageTransform.Microsoft.Alpha(opacity=1);',
      src: 'javascript:false;',
      frameborder: 0
    });
    $(this.options.parent || document.body).insert(this.element);
  },
  
  /*
    Method: hide
      Hides iframe shim leaving its position and dimensions intact
      
    Returns:
      this
  */
  hide: function() {
    this.element.hide();
    return this;
  },
  
  /*
    Method: show
      Show iframe shim leaving its position and dimensions intact
      
    Returns:
      this
  */
  show: function() {
    this.element.show();
    return this;
  },
  
  /*
    Method: positionUnder
      Positions iframe shim under the specified element 
      Sets proper dimensions, offset, zIndex and shows it
      Note that the element should have explicitly specified zIndex
      
    Returns:
      this
  */
  positionUnder: function(element) {
    var element = $(element),
        offset = element.cumulativeOffset(),
        dimensions = element.getDimensions(),
        style = { 
          left: offset[0] + 'px', 
          top: offset[1] + 'px',
          width: dimensions.width + 'px',
          height: dimensions.height + 'px',
          zIndex: element.getStyle('zIndex') - 1
        };
    this.element.setStyle(style).show();
    
    return this;
  },
  
  /*
    Method: setBounds
      Sets element's width, height, top and left css properties using 'px' as units
    
    Returns:
      this
  */
  setBounds: function(bounds) {
    for (prop in bounds) {
      bounds[prop] = parseInt(bounds[prop]) + 'px';
    }
    this.element.setStyle(bounds);
    return this;
  },
  
  /*
    Method: setSize
      Sets element's width, height
    
    Returns:
      this
  */
  setSize: function(width, height) {   
    this.element.style.width  = parseInt(width) + "px";
    this.element.style.height = parseInt(height) + "px"; 
    return this;
  },
  
  /*
    Method: setPosition
      Sets element's top and left 
    
    Returns:
      this
  */
  setPosition: function(top, left) {
    this.element.style.top  = parseInt(top) + "px";
    this.element.style.left = parseInt(left) + "px";
    return this;
  },
  
  /*
    Method: destroy
      Completely removes the iframe shim from the document
      
    Returns:
      this
  */
  destroy: function() {
    if (this.element)
      this.element.remove();
    
    return this;
  }
});