/*
  Class: UI.ContextMenu
    Creates a context menu when instantiated.
    Shows menu when right button (ctrl + left in Opera) is clicked on a certain element.
    Hides menu when left button is cliked.
    Allows to attach certain behavior to certain menu elements (links).
  
  Example:
    > var contextLinks = [{
    >   name: 'Save',
    >   className: 'back',
    >   callback: Document.save
    > }, {
    >   name: 'Save as...',
    >   submenu: [{
    >     name: 'Excel (.xls)',
    >     className: 'xls',
    >     callback: Document.saveAsXls
    >   }, {
    >     name: 'Word (.doc)',
    >     className: 'doc',
    >     callback: Document.saveAsDoc
    >   }, {
    >     name: 'Acrobat Reader',
    >     className: 'pdf',
    >     callback: Document.saveAsPdf
    >   }]
    > }];
    > 
    > ...
    > 
    > new UI.ContextMenu({
    >   selector: '#context_area', // element to attach right click event to
    >   showEffect: true, // indicates whether Effect.Appear is used when menu is shown
    >   menuItems: contextLinks // array of links to be used when building menu
    > });
*/

UI.ContextMenu = Class.create(UI.Options, {
  // Group: Options
  options: {
    // Property: className
    //   class to be applied to menu element, default is 'ui-context_menu'
    className: 'ui-context_menu',
    
    // Property: beforeShow
    //   beforeShow: function to be called before menu element is shown,
    //   default is empty function.
    beforeShow: Prototype.emptyFunction,
    
    // Property: beforeHide
    //   function to be called before menu element is hidden,
    //   default is empty function.
    beforeHide: Prototype.emptyFunction,
    
    // Property: beforeSelect
    //   function to be called before menu item is clicked,
    //   default is empty function.
    beforeSelect: Prototype.emptyFunction,
    
    // Property: zIndex
    //  z-index to be applied to a menu element, default is 900
    zIndex: 900,
    
    pageOffset: 25,
    
    // Property: showEffect
    // showEffect: true will force menu to "fade in" when shown,
    // default is false
    showEffect: false,
    
    // Property: hideEffect
    // showEffect: true will force menu to "fade out" when hidden,
    // default is false
    hideEffect: false,
    
    // Property: shadow
    // name of a shadow theme or false, default is 'mac_shadow'
    shadow: "mac_shadow"
  },
  
  // Group: Constructor
  
  /*
    Method: initialize
      Constructor function, should not be called directly
    
    Parameters:
      options - (Hash) list of optional parameters
    
    Returns:
      this
  */
  initialize: function(options) {
    this.setOptions(options);
    
    if (Object.isUndefined(Effect)) {
      this.options.showEffect = this.options.hideEffect = false;
    }
    
    this.iframe = Prototype.Browser.IE ? new UI.IframeShim() : null;
    this.create();
    
    this.shadow = this.options.shadow 
      ? UI.ContextMenu.shadow || new UI.Shadow(this.element, {theme: this.options.shadow}).focus().hide() 
      : null;
    
    if (this.shadow)
      UI.ContextMenu.shadow = this.shadow;
    
    this.initObservers();
  },
  
  // Group: Methods
  
  create: function() {
    this.element = new Element('div', {
      className: this.options.className,
      style: 'display: none'
    });
    this.element.insert(this.createList(this.options.menuItems));
    $(document.body).insert(this.element.observe('contextmenu', Event.stop));
  },
  
  createList: function(items) {
    var list = new Element('ul');
    
    items.each(function(item){
      list.insert(
        new Element('li', {className: item.separator ? 'separator' : ''}).insert(
          !item.separator
            ? Object.extend(new Element('a', {
                href: '#',
                title: item.name,
                className: (item.className || '') 
                  + (item.disabled ? ' disabled' : '') 
                  + (item.submenu ? ' submenu' : '')
              }), { _callback: item.callback })
              .observe('click', item.callback ? this.onSelect.bind(this) : Event.stop)
              .observe('contextmenu', Event.stop)
              .update(item.name)
              .insert(
                item.submenu
                  ? this.createList(item.submenu).wrap({
                      className: this.options.className, style: 'display:none'
                    })
                  : ''
              )
            : ''
        )
      )
    }.bind(this));
    
    return list;
  },
  
  initObservers: function() {
    var contextEvent = Prototype.Browser.Opera ? 'click' : 'contextmenu';
    
    document.observe('click', function(e) {
      if (this.element.visible() && !e.isRightClick()) {
        this.options.beforeHide();
        if (this.iframe)
          this.iframe.hide();
        this.hide();
      }
    }.bind(this));
    
    $$(this.options.selector).invoke('observe', contextEvent, function(e) {
      if (Prototype.Browser.Opera && !e.ctrlKey) return;
      this.show(e);
    }.bind(this));
    
    this.element.select('a.submenu')
      .invoke('observe', 'mouseover', function(e) {
        if (this.hasClassName('disabled')) return;
        this.down('.menu').setStyle({
          top: 0,
          left: this.getWidth() + 'px'
        }).show();
      })
      .invoke('observe', 'mouseout', function(e) {
        this.down('.menu').hide();
      });
      
    if (this.shadow)
      this.shadow.shadow.observe('contextmenu', Event.stop);
  },

  /*
    Method: show

    Parameters:
      e - Event object (optional)

    Returns:
      this
  */
  show: function(e) {
    if (e) e.stop();
    
    this.options.beforeShow();
    this.fire('showing');
    
    if (UI.ContextMenu.shownMenu) {
      UI.ContextMenu.shownMenu.hide();
    }
    UI.ContextMenu.shownMenu = this;
    
    this.position(e);
    
    if (this.options.showEffect) {
      Effect.Appear(this.element, {
        duration: 0.25,
        afterFinish: function() { this.fire('shown') }.bind(this)
      })
    }
    else {
      this.element.show();
      this.fire('shown');
    }
    
    this.event = e;
    return this;
  },
  
  /*
    Method: position
      Takes event object and positions menu element to match event's pointer coordinates
      Optionally positions shadow and iframe elements

    Returns:
      this
  */
  position: function(e) {
    var x = Event.pointer(e).x,
        y = Event.pointer(e).y,
        vpDim = document.viewport.getDimensions(),
        vpOff = document.viewport.getScrollOffset(),
        elDim = this.element.getDimensions(),
        elOff = {
          left: ((x + elDim.width + this.options.pageOffset) > vpDim.width
            ? (vpDim.width - elDim.width - this.options.pageOffset) : x),
          top: ((y - vpOff.top + elDim.height) > vpDim.height && (y - vpOff.top) > elDim.height
            ? (y - elDim.height) : y)
          },
        elBounds = Object.clone(Object.extend(elOff, elDim));
   
    for (prop in elOff) {
      elOff[prop] += 'px';
    }
    this.element.setStyle(elOff).setStyle({zIndex: this.options.zIndex});

    if (this.iframe) {
      this.iframe.setBounds(elBounds).show();
    }

    if (this.shadow) {
      this.shadow.setBounds(elBounds).show();
    }

    return this;
  },
  
  /*
    Method: hide

    Returns:
      this
  */
  hide: function() {
    
    this.options.beforeHide();
    
    if (this.iframe)
      this.iframe.hide();
    
    if (this.shadow)
      this.shadow.hide();
    
    if (this.options.hideEffect) {
      Effect.Fade(this.element, {
        duration: 0.25,
        afterFinish: function() { this.fire('hidden') }.bind(this)
      })
    }
    else {
      this.element.hide();
      this.fire('hidden')
    }
    
    return this;
  },
  /*
    Method: onSelect
    
    Parameters: 
      e - current Event object (left click on a menu item)
  */
  onSelect: function(e) {
    if (e.target._callback && !e.target.hasClassName('disabled')) {
      this.options.beforeSelect();
      this.fire('selected');
      this.hide();
      e.target._callback(e, this.event);
    }
  },
  
  fire: function(eventName) {
    this.element.fire('contextmenu:' + eventName);
  }
});