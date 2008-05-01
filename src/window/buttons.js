UI.Window.addMethods({
  methodsAdded: function(base) {
    base.aliasMethodChain('create',  'buttons');
    base.aliasMethodChain('destroy', 'buttons');
  },
  
  createWithButtons: function() {
    this.createWithoutButtons();
    
    if (!this.options.resizable) {
      this.options.minimize = false;
      this.options.maximize = false;
    }
      
    this.buttons = new Element("div", { className: "buttons" })
      .observe('click',     this.onButtonsClick.bind(this))
      .observe('mouseover', this.onButtonsHover.bind(this))
      .observe('mouseout',  this.onButtonsOut.bind(this));
      
    this.element.insert(this.buttons);

    this.defaultButtons.each(function(button) { 
      if (this.options[button] !== false)
        this.addButton(button);
    }, this);
  },
  
  destroyWithButtons: function() {
    this.buttons.stopObserving();
    this.destroyWithoutButtons();
  },
  
  defaultButtons: $w(' minimize maximize close '),
  
  getButtonElement: function(buttonName) {
    return this.buttons.down("." + buttonName);
  },
  
  // Controls close, minimize, maximize, etc.
  // action can be either a string or a function
  // if action is a string, it is the method name that will be called
  // else the function will take the window as first parameter.
  // if not given action will be taken in window's options
  addButton: function(buttonName, action) {
    this.buttons.insert(new Element("a", { className: buttonName, href: "#"}));
    
    if (action)
      this.options[buttonName] = action;
      
    return this;
  },
  
  removeButton: function(buttonName) {
    this.getButtonElement(buttonName).remove();
    return this;
  },
  
  disableButton: function(buttonName) {
    this.getButtonElement(buttonName).addClassName("disabled");
    return this;
  },
  
  enableButton: function(buttonName) {
    this.getButtonElement(buttonName).removeClassName("disabled");
    return this;
  },
    
  onButtonsClick: function(event) {        
    var element = event.findElement('a:not(.disabled)');
    
    if (element) this.action(element.className); 
    event.stop();
  },

  onButtonsHover: function(event) {  
    this.buttons.addClassName("over");
  },

  onButtonsOut: function(event) { 
    this.buttons.removeClassName("over");
  },
  
  updateButtonsOrder: function() {
    var buttons = this.buttons.childElements();
    
    buttons.inject(new Array(buttons.length), function(array, button) {     
      array[parseInt(button.getStyle("padding-top"))] = button.setStyle("padding: 0");
      return array;
    }).each(function(button) { this.buttons.insert(button) }, this);
  }
});