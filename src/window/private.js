// Private functions for window.js
UI.Window.addMethods({
  style: "position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;",
  
  action: function(name) {
    var action = this.options[name];
    if (action)
      Object.isString(action) ? this[action]() : action.call(this, this);
  },
  
  create: function() {
    function createDiv(className, options) {
      return new Element('div', Object.extend({ className: className }, options)); 
    };
    
    // Main div
    this.element = createDiv("ui-window " + this.getTheme(), {
      id: this.options.id,
      style: "top:-10000px; left:-10000px"
    });
    
    // Create HTML window code
    this.header  = createDiv('n move_handle').enableDrag();
    this.content = createDiv('content').appendText(' ');
    this.footer  = createDiv('s move_handle').enableDrag();
    
    var header   = createDiv('nw').insert(createDiv('ne').insert(this.header));
    var content  = createDiv('w').insert(createDiv('e', {style: "position:relative"}).insert(this.content));
    var footer   = createDiv('sw').insert(createDiv('se' + (this.options.resizable ?  " se_resize_handle" : "")).insert(this.footer));

    this.element.insert(header).insert(content).insert(footer).identify('ui-window');
    this.header.observe('mousedown', this.activate.bind(this));

    this.setDraggable(this.options.draggable);
    this.setResizable(this.options.resizable);
    
    this.overlay = new Element('div', { style: this.style + "display: none" })
        .observe('mousedown', this.activate.bind(this));
    
    if (this.options.activeOnClick) 
      this.content.insert({ before: this.overlay });
  },
  
  createWiredElement: function() {
    this.wiredElement = this.wiredElement || new Element("div", {
      className: this.getTheme() + "_wired",
      style:    "display: none; position: absolute; top: 0; left: 0"
    });
  },
  
  createResizeHandles: function() {
    $w(" n  w  e  s  nw  ne  sw  se ").each(function(id) {
      this.insert(new Element("div", { 
        className:   id + "_sizer resize_handle",
        drag_prefix: id }).enableDrag());
    }, this.element);
    this.createResizeHandles = Prototype.emptyFunction;
  },

  // First rendering, pre-compute window border size
  render: function() {
    this.addElements();   
    
    this.computeBorderSize();   
    this.updateButtonsOrder();
    this.element.hide().remove();      

    // this.options contains top, left, width and height keys
    return this.setBounds(this.options);
  },

  // Adds window elements to the DOM
  addElements: function() {
    this.windowManager.container.appendChild(this.element);
  },

  // Set z-index to all window elements
  setZIndex: function(zIndex) {
    if (this.zIndex != zIndex) { 
      this.zIndex = zIndex;    
      [ this.element ].concat(this.element.childElements()).each(function(element) {
        element.style.zIndex = zIndex++;
      });
      this.lastZIndex = zIndex;
    }
    return this;
  },

  effect: function(name, element, options) {
    var effect = this.options[name] || Prototype.emptyFunction;
    effect(element || this.element, options || {});
  },
  
  // re-compute window border size
  computeBorderSize: function() {
    if (this.element) {   
      if (Prototype.Browser.IEVersion >= 7)                              
        this.content.style.width = "100%";
      var dim = this.element.getDimensions(), pos = this.content.positionedOffset();
      this.borderSize = {  top:    pos[1],
                           bottom: dim.height - pos[1] - this.content.getHeight(),
                           left:   pos[0],
                           right:  dim.width - pos[0] - this.content.getWidth() };
      this.borderSize.width  = this.borderSize.left + this.borderSize.right;
      this.borderSize.height = this.borderSize.top  + this.borderSize.bottom; 
      if (Prototype.Browser.IEVersion >= 7)                              
        this.content.style.width = "auto";
    }
  },

  computeSize: function(width, height, innerSize) {
    var innerWidth, innerHeight, outerWidth, outerHeight;
	  if (innerSize) {
	    outerWidth  =  width  + this.borderSize.width;
	    outerHeight =  height + this.borderSize.height;
    } else {
	    outerWidth  =  width;
	    outerHeight =  height;
    }  
    // Check grid value  
    if (!this.animating) {      
      outerWidth = outerWidth.snap(this.options.gridX);
      outerHeight = outerHeight.snap(this.options.gridY);

      // Check min size
      if (!this.folded) {
        if (outerWidth < this.options.minWidth)
          outerWidth = this.options.minWidth;

        if (outerHeight < this.options.minHeight)
          outerHeight = this.options.minHeight;
      }

      // Check max size
      if (this.options.maxWidth && outerWidth > this.options.maxWidth)
        outerWidth = this.options.maxWidth;

      if (this.options.maxHeight && outerHeight > this.options.maxHeight)
        outerHeight = this.options.maxHeight;
    }                               
    
    if (this.centerOptions && this.centerOptions.auto)
      this.recenter();
    
    innerWidth  = outerWidth - this.borderSize.width;
    innerHeight = outerHeight - this.borderSize.height;
    return {
      innerWidth: innerWidth, innerHeight: innerHeight, 
      outerWidth: outerWidth, outerHeight: outerHeight
    };
  },
  
  computePosition: function(top, left) { 
    if (this.centerOptions && this.centerOptions.auto)
      return this.computeRecenter(this.getSize());                                                                                                            ;
    
    return { 
      top:  this.animating ? top  : top.snap(this.options.gridY), 
      left: this.animating ? left : left.snap(this.options.gridX) 
    };
  },

  computeRecenter: function(size) {  
    var viewport   = this.windowManager.viewport,
        area       = viewport.getDimensions(),
        offset     = viewport.getScrollOffset(),
        center     = {
          top:  Object.isUndefined(this.centerOptions.top)  ? (area.height - size.height) / 2 : this.centerOptions.top,
          left: Object.isUndefined(this.centerOptions.left) ? (area.width  - size.width)  / 2 : this.centerOptions.left
        };

    return {
      top:  parseInt(center.top + offset.top),
      left: parseInt(center.left + offset.left)
    }; 
  },
  
  recenter: function(event) {
    var pos = this.computeRecenter(this.getSize());                                                                                                            
    this.setPosition(pos.top, pos.left);
  }
});
