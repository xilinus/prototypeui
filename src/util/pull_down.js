UI.PullDown = Class.create(UI.Options, {
  options: {
    className:   '',
    shadow:      false,
    position:    'over',
    cloneWidth:   false,
    beforeShow:   null,
    afterShow:    null,
    beforeUpdate: null,
    afterUpdate:  null,
    afterCreate:  null
  },

  initialize: function(container, options){
    this.setOptions(options);
		this.container = $(container);
        
    this.element = new Element('div', {
      className: 'UI-widget-dropdown ' + this.options.className,
      style: 'z-index:999999;position:absolute;'
    }).hide();
        
    if (this.options.shadow) 
      this.shadow = new UI.Shadow(this.element, {theme: this.options.shadow}).hide();
    else 
      this.iframe = Prototype.Browser.IE ? new UI.IframeShim() : null;
      
    this.outsideClickHandler = this.outsideClick.bind(this);
    this.placeHandler        = this.place.bind(this);
    this.hideHandler         = this.hide.bind(this);
  },

  destroy: function(){
 		if (this.active) 
      this.element.remove();
    this.element = null;
    this.stopObserving();
  },
    
  /*
    Method: insert
      Inserts a new Element to the PullDown
     
    Parameters:
      elem  - an DOM element
     
    Returns:
      this
   */
   insert: function(elem){
     return this.element.insert(elem);
   },
    
   /*
    Method: place
      Place the PullDown
     
    Parameters:
      none
     
    Returns:
     this
  */
  place: function(){
    this.element.clonePosition(this.container, {
      setHeight: false, 
      setWidth:  this.options.cloneWidth,
      offsetTop: this.options.position == 'below' ? this.container.offsetHeight : 0 
    });   
    
    var w = this.element.getWidth();
    var h = this.element.getHeight();
    var t = parseInt(this.element.style.top);
    var l = parseInt(this.element.style.left);
		
    if (this.shadow) 
      this.shadow.setBounds({top: t, left: l, width: w, height: h});
    if (this.iframe) 
      this.iframe.setPosition(t, l).setSize(w, h);
    return this;
  },
    
  /*
    Method: show
    Show the PullDown
     
    Parameters:
      event  - (optional) Event fired the show
     
    Returns:
     this
  */
  show: function(event){
    if (this.active) 
        return this;
        
    this.active = true;
        
    if (this.options.beforeShow) 
        this.options.beforeShow(this);
        
    this.element.hide();
        
    if (this.iframe) 
			this.iframe.show();

    document.body.insert(this.element);
        
    if (this.shadow) 
      this.shadow.show();
    this.element.show();
        
    if (this.options.afterShow) 
      this.options.afterShow(this);
        
    document.observe('mousedown',  this.outsideClickHandler);
		Event.observe(window,'scroll', this.placeHandler);
		Event.observe(window,'resize', this.hideHandler);
		
		return this;
  },
    
  outsideClick: function(event) {
    if (event.findElement('.UI-widget-dropdown'))
			return;
    //this.hide();
  },
    
  /*
    Method: hide
      Hide the PullDown
     
    Returns:
      this
  */
  hide: function(){
		if (this.active) {
      this.active = false;
      if (this.shadow) 
        this.shadow.hide();
        
  		if(this.iframe) 
  			this.iframe.hide();

      this.element.remove();
        
    }		
    this.stopObserving();
		return this;
  },
  
  stopObserving: function() {
		Event.stopObserving(window,'resize', this.hideHandler);
		Event.stopObserving(window,'scroll', this.placeHandler);
    document.stopObserving('click', this.outsideClickHandler);    
  }
});
