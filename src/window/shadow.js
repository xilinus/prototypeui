UI.Window.addMethods({
  methodsAdded: function(base) {
    (function(methods) {
      $w(methods).each(function(m) { base.aliasMethodChain(m, 'shadow') });
    })(' create addElements setZIndex setPosition setSize setBounds ');
  },
  
  showShadow: function() {
    if (this.shadow) { 
      this.shadow.hide();
      this.effect('show', this.shadow.shadow);
    }  
    if (this.iframe)  
      this.iframe.show();
  },
  
  hideShadow: function() {   
    if (this.shadow)
      this.effect('hide', this.shadow.shadow);
    if (this.iframe)  
      this.iframe.hide();
  },
  
  removeShadow: function() {
    if (this.shadow)
      this.shadow.remove();
  },     

  focusShadow: function() {
    if (this.shadow)
      this.shadow.focus();
  },

  blurShadow: function() {
    if (this.shadow)
      this.shadow.blur();
  },

  // Private Functions
  createWithShadow: function() {  
    this.createWithoutShadow();
    
    this.observe('showing', this.showShadow)
        .observe('hiding',  this.hideShadow)
        .observe('hidden',  this.removeShadow)
        .observe('focused', this.focusShadow)
        .observe('blurred', this.blurShadow);

    if (this.options.shadow)  
      this.shadow = new UI.Shadow(this.element, {theme: this.getShadowTheme(), withIFrameShim: false});
    this.iframe = Prototype.Browser.IE ? new UI.IframeShim({parent: this.windowManager.container}) : null;
  },

  addElementsWithShadow: function() {
    this.addElementsWithoutShadow();
    if (this.shadow) {
      this.shadow.setBounds(this.options).render();
    }
  },  

  setZIndexWithShadow: function(zIndex) {          
    if (this.zIndex != zIndex) {  
      if (this.shadow)
        this.shadow.setZIndex(zIndex - 1);
      this.setZIndexWithoutShadow(zIndex);  
      this.zIndex = zIndex;
    }
    return this;
  },

  setPositionWithShadow: function(top, left) {  
    this.setPositionWithoutShadow(top, left);
    if (this.shadow) {
      var pos = this.getPosition();
      this.shadow.setPosition(pos.top, pos.left);  
    }
    if (this.iframe) {
      var pos = this.getPosition();
      this.iframe.setPosition(pos.top, pos.left);  
    }
    return this;
  },

  setSizeWithShadow: function(width, height, innerSize) {
    this.setSizeWithoutShadow(width, height, innerSize);
    if (this.shadow) { 
      var size = this.getSize();
      this.shadow.setSize(size.width, size.height);
    }
    if (this.iframe) {
      var size = this.getSize();
      this.iframe.setSize(size.width, size.height);  
    }
    return this;
  },

  setBoundsWithShadow: function(bounds, innerSize) {
    this.setBoundsWithoutShadow(bounds, innerSize);  
    if (this.shadow)
      this.shadow.setBounds(this.getBounds());
    if (this.iframe)
      this.iframe.setBounds(this.getBounds());
  }
});