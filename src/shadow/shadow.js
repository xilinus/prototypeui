/*
Class: UI.Shadow
  Add shadow around a DOM element. The element MUST BE in ABSOLUTE position.

  Shadow can be skinned by CSS (see mac_shadow.css or drop_shadow.css).
  CSS must be included to see shadow.

  A shadow can have two states: focused and blur.
  Shadow shifts are set in CSS file as margin and padding of shadow_container to add visual information.

  Example:
    > new UI.Shadow("element_id");   
*/
UI.Shadow = Class.create(UI.Options, {
  options: {
    theme: "mac_shadow",  
    focus: false,
    zIndex: 100,
    withIFrameShim: true
  },
  
  /*
    Method: initialize
      Constructor, adds shadow elements to the DOM if element is in the DOM.
      Element MUST BE in ABSOLUTE position.

    Parameters:
      element - DOM element 
      options - Hashmap of options 
        - theme (default: mac_shadow)
        - focus (default: true)
        - zIndex (default: 100)
      
    Returns:
      this
  */
  initialize: function(element, options) { 
    this.setOptions(options);
   
    this.element = $(element);  
    this.create();    
    this.iframe = Prototype.Browser.IE && this.options.withIFrameShim ? new UI.IframeShim() : null;
    
    if (Object.isElement(this.element.parentNode))
      this.render();  
  },
  
  /*
    Method: destroy
      Destructor, removes elements from the DOM      
  */
  destroy: function() {
    if (this.shadow.parentNode)
      this.remove();
  },
  
  // Group: Size and Position
  /*
    Method: setPosition
      Sets top/left shadow position in pixels
      
    Parameters:
      top -  top position in pixel
      left - left position in pixel
      
    Returns:
      this
  */
  setPosition: function(top, left) {   
    if (this.shadowSize) {
      var shadowStyle = this.shadow.style;
      top =  parseInt(top)  - this.shadowSize.top  + this.shadowShift.top;
      left = parseInt(left) - this.shadowSize.left + this.shadowShift.left;
      shadowStyle.top  = top + 'px';
      shadowStyle.left = left + 'px';    
      if (this.iframe) 
        this.iframe.setPosition(top, left);
    }
    return this;
  },
  
  /*
    Method: setSize
      Sets width/height shadow in pixels
      
    Parameters:
      width  - width in pixel
      height - height in pixel
      
    Returns:
      this
  */
  setSize: function(width, height) {
    if (this.shadowSize) {
      try {
        var w = Math.max(0, parseInt(width) + this.shadowSize.width - this.shadowShift.width) + "px";        
        this.shadow.style.width = w;   
        var h = Math.max(0, parseInt(height) - this.shadowShift.height) + "px";
    
        // this.shadowContents[1].style.height = h;
        this.shadowContents[1].childElements().each(function(e) {e.style.height = h});
        this.shadowContents.each(function(item){ item.style.width = w});       
        if (this.iframe) 
          this.iframe.setSize(width + this.shadowSize.width - this.shadowShift.width, height + this.shadowSize.height - this.shadowShift.height);
      }
      catch(e) {
        // IE could throw an exception if called to early
      }
    }
    return this;
  },   
  
  /*
    Method: setBounds
      Sets shadow bounds in pixels
    
    Parameters:  
      bounds - an Hash {top:, left:, width:, height:} 
      
    Returns:
      this
  */
  setBounds: function(bounds) {   
    return this.setPosition(bounds.top, bounds.left).setSize(bounds.width, bounds.height);
  }, 
  
  /*
    Method: setZIndex
      Sets shadow z-index
    
    Parameters: 
      zIndex - zIndex value
      
    Returns:
      this
  */
  setZIndex: function(zIndex) {
    this.shadow.style.zIndex = zIndex;
    return this;
  },
   
   // Group: Render 
  /*
    Method: show
      Displays shadow
          
    Returns:
      this
  */
  show: function() {   
    this.render();
    this.shadow.show(); 
    if (this.iframe) 
      this.iframe.show();
    return this;
  },
  
  /*
    Method: hide
      Hides shadow
          
    Returns:
      this
  */
  hide: function() {
    this.shadow.hide();
    if (this.iframe) 
      this.iframe.hide();
    return this;
  },   
  
  /*
    Method: remove
      Removes shadow from the DOM
          
    Returns:
      this
  */
  remove: function() {
    this.shadow.remove();
    return this;
  },    
  
  // Group: Status
  /*
    Method: focus
      Focus shadow. 
      
      Change shadow shift. Shift values are set in CSS file as margin and padding of shadow_container 
      to add visual information of shadow status.
          
    Returns:
      this
  */
  focus: function() {
    this.options.focus = true;
    this.updateShadow();
    return this;
  },
  
  /*
    Method: blur
      Blurs shadow. 
      
      Change shadow shift. Shift values are set in CSS file as margin and padding of shadow_container 
      to add visual information of shadow status.
          
    Returns:
      this
  */
  blur: function() {
    this.options.focus = false;
    this.updateShadow();
    return this;
  },
  
  // Private Functions
  // Adds shadow elements to DOM, computes shadow size and displays it
  render: function() {   
    if (this.element.parentNode && !Object.isElement(this.shadow.parentNode)) {
      this.element.parentNode.appendChild(this.shadow);   
      this.computeSize();    
      this.setBounds(Object.extend(this.element.getDimensions(), this.getElementPosition()));
      this.shadow.show();
    }           
    return this;
  },  
  
  // Creates HTML elements without inserting them into the DOM
  create: function() { 
    var zIndex = this.element.getStyle('zIndex');
    if (!zIndex)
      this.element.setStyle({zIndex: this.options.zIndex});
    zIndex = (zIndex || this.options.zIndex) - 1;
    
    this.shadowContents = new Array(3);
    this.shadowContents[0] = new Element("div")
      .insert(new Element("div", {className: "shadow_center_wrapper"}).insert(new Element("div", {className: "n_shadow"})))
      .insert(new Element("div", {className: "shadow_right ne_shadow"}))
      .insert(new Element("div", {className: "shadow_left nw_shadow"}));

    this.shadowContents[1] = new Element("div")
      .insert(new Element("div", {className: "shadow_center_wrapper c_shadow"}))
      .insert(new Element("div", {className: "shadow_right e_shadow"}))
      .insert(new Element("div", {className: "shadow_left w_shadow"}));
    this.centerElements = this.shadowContents[1].childElements();
      
    this.shadowContents[2] = new Element("div")
      .insert(new Element("div", {className: "shadow_center_wrapper"}).insert(new Element("div", {className: "s_shadow"})))
      .insert(new Element("div", {className: "shadow_right se_shadow"}))
      .insert(new Element("div", {className: "shadow_left sw_shadow"}));

    this.shadow = new Element("div", {className: "shadow_container " + this.options.theme, 
                                      style: "position:absolute; top:-10000px; left:-10000px; display:none; z-index:" + zIndex })
      .insert(this.shadowContents[0])
      .insert(this.shadowContents[1])
      .insert(this.shadowContents[2]);   
  },

  // Compute shadow size
  computeSize: function() {  
    if (this.focusedShadowShift) 
      return;
    this.shadow.show();      

    // Trick to get shadow shift designed in CSS as padding 
    var content = this.shadowContents[1].select("div.c_shadow").first();  
    this.unfocusedShadowShift = {};
    this.focusedShadowShift = {};
    
    $w("top left bottom right").each(function(pos) {this.unfocusedShadowShift[pos] = content.getNumStyle("padding-" + pos) || 0}.bind(this));
    this.unfocusedShadowShift.width  = this.unfocusedShadowShift.left + this.unfocusedShadowShift.right;
    this.unfocusedShadowShift.height = this.unfocusedShadowShift.top + this.unfocusedShadowShift.bottom;
    
    $w("top left bottom right").each(function(pos) {this.focusedShadowShift[pos] = content.getNumStyle("margin-" + pos) || 0}.bind(this));
    this.focusedShadowShift.width  = this.focusedShadowShift.left + this.focusedShadowShift.right;
    this.focusedShadowShift.height = this.focusedShadowShift.top + this.focusedShadowShift.bottom;      
    
    this.shadowShift = this.options.focus ? this.focusedShadowShift : this.unfocusedShadowShift;

    // Get shadow size
    this.shadowSize  = {top:    this.shadowContents[0].childElements()[1].getNumStyle("height"),
                        left:   this.shadowContents[0].childElements()[1].getNumStyle("width"),
                        bottom: this.shadowContents[2].childElements()[1].getNumStyle("height"),
                        right:  this.shadowContents[0].childElements()[2].getNumStyle("width")};    
                        
    this.shadowSize.width  = this.shadowSize.left + this.shadowSize.right;
    this.shadowSize.height = this.shadowSize.top + this.shadowSize.bottom;    

    // Remove padding
    content.setStyle("padding:0; margin:0");
    this.shadow.hide();
  },
  
  // Update shadow size (called when it changes from focused to blur and vice-versa)
  updateShadow: function() {  
    this.shadowShift = this.options.focus ? this.focusedShadowShift : this.unfocusedShadowShift;  
    var shadowStyle = this.shadow.style, pos  = this.getElementPosition(), size = this.element.getDimensions();
    
    shadowStyle.top  =  pos.top    - this.shadowSize.top   + this.shadowShift.top   + 'px';
    shadowStyle.left  = pos.left   - this.shadowSize.left  + this.shadowShift.left  + 'px';
    shadowStyle.width = size.width + this.shadowSize.width - this.shadowShift.width + "px"; 
    var h = size.height - this.shadowShift.height + "px";
    this.centerElements.each(function(e) {e.style.height = h});
    
    var w = size.width + this.shadowSize.width - this.shadowShift.width+ "px";        
    this.shadowContents.each(function(item) { item.style.width = w });
  },
  
  // Get element position in integer values
  getElementPosition: function() {
    return {top: this.element.getNumStyle("top"), left: this.element.getNumStyle("left")}
  } 
});

// Set theme and focus as read/write accessor
document.whenReady(function() { CSS.fixPNG("shadow") });
