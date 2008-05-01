/*
Class: UI.WindowManager
  Window Manager.
  A default instance of this class is created in UI.defaultWM.

  Example:
    > new UI.WindowManger({ 
    >   container: 'desktop',
    >   theme: 'mac_os_x'
    > });
*/

UI.WindowManager = Class.create(UI.Options, {
  options: {
    container:   null, // will default to document.body
    zIndex:      0,
    theme:       "alphacube",
    shadowTheme: "mac_shadow",
    showOverlay: Element.show,
    hideOverlay: Element.hide,
    positionningStrategy: function(win, area) {
      UI.WindowManager.DumbPositionningStrategy(win, area);
    }
  },

  initialize: function(options) {
    this.setOptions(options);
    
    this.container = $(this.options.container || document.body);
    
    if (this.container === $(document.body)) {
      this.viewport = document.viewport;
      this.scrollContainer = window;
    } else {
      this.viewport = this.scrollContainer = this.container;
    }
        
    this.container.observe('drag:started', this.onStartDrag.bind(this))
                  .observe('drag:updated', this.onDrag.bind(this))
                  .observe('drag:ended',   this.onEndDrag.bind(this));
    
    this.stack = new UI.WindowManager.Stack();
    this.modalSessions = 0;
    
    this.createOverlays();
    this.resizeEvent = this.resize.bind(this);
    
    Event.observe(window, "resize", this.resizeEvent);
  },
  
  destroy: function() {
    this.windows().invoke('destroy');
    this.stack.destroy();
    Event.stopObserving(window, "resize", this.resizeEvent);
  },
  
  /*
    Method: setTheme
      Changes window manager's theme, all windows that don't have a own theme
      will have this new theme.

    Parameters:
      theme - theme name

    Example:
      > UI.defaultWM.setTheme('bluelighting');
  */
  setTheme: function(theme) {
    this.stack.windows.select(function(w) {
      return !w.options.theme;
    }).invoke('setTheme', theme, true);
    this.options.theme = theme;
    return this;
  },

  register: function(win) {
    if (this.getWindow(win.id)) return;

    this.handlePosition(win);
    this.stack.add(win); 
    this.restartZIndexes();
  },

  unregister: function(win) {
    this.stack.remove(win);
    
    if (win == this.focusedWindow)
      this.focusedWindow = null;
  },
  
  /*
    Method: getWindow
      Find the window containing a given element.
    
    Example:
      > $$('.ui-window a.close').invoke('observe', 'click', function() { 
      >   UI.defaultWM.getWindow(this).close();
      > });
    
    Parameters:
      element - element or element identifier
      
    Returns:
      containing window or null
  */
  getWindow: function(element) {
    element = $(element);
    
    if (!element) return;
    
    if (!element.hasClassName('ui-window'))
      element = element.up('.ui-window');
      
    var id = element.id;
    return this.stack.windows.find(function(win) { return win.id == id });
  },

  /*
    Method: windows
      Returns an array of all windows handled by this window manager.
      First one is the back window, last one is the front window.
    
    Example:
      > UI.defaultWM.windows().invoke('destroy');
  */
  windows: function() {
    return this.stack.windows.clone();
  },
  
  /*
    Method: getFocusedWindow
      Returns the focused window
  */
  getFocusedWindow: function() {
    return this.focusedWindow;
  },

  // INTERNAL

  // Modal mode
  startModalSession: function(win) {
    if (!this.modalSessions) {      
      this.removeOverflow();   
      this.modalOverlay.className = win.getTheme() + "_overlay";
      this.container.appendChild(this.modalOverlay);
      
      if (!this.modalOverlay.opacity)
        this.modalOverlay.opacity = this.modalOverlay.getOpacity();  
      this.modalOverlay.setStyle("height: " + this.viewport.getHeight() + "px");
      
      this.options.showOverlay(this.modalOverlay, {from: 0, to: this.modalOverlay.opacity});
      if (this.iframe) {
        this.iframe.setBounds({top: 0, left: 0, width: this.viewport.getWidth(), height: this.viewport.getHeight()});
        this.iframe.show();
      }
    }
    this.modalOverlay.setStyle({ zIndex: win.zIndex - 1 });
    this.modalSessions++;
  },

  endModalSession: function(win) {
    this.modalSessions--;
    if (this.modalSessions) {
      this.modalOverlay.setStyle({ zIndex: this.stack.getPreviousWindow(win).zIndex - 1 });
    } else {
      this.resetOverflow();
      this.options.hideOverlay(this.modalOverlay, { from: this.modalOverlay.opacity, to: 0 });
      if (this.iframe) 
        this.iframe.hide();
    }
  },
  
  moveHandleSelector:   '.ui-window.draggable .move_handle',
  resizeHandleSelector: '.ui-window.resizable .resize_handle',
  
  onStartDrag: function(event) {
    var handle = event.element(),
        isMoveHandle   = handle.match(this.moveHandleSelector),
        isResizeHandle = handle.match(this.resizeHandleSelector);

    // ensure dragged element is a window handle !
    if (isResizeHandle || isMoveHandle) {
      event.stop();
      
      // find the corresponding window
      var win = this.getWindow(event.findElement('.ui-window'));
      
      // render drag overlay
      this.container.insert(this.dragOverlay.setStyle({ zIndex: this.getLastZIndex() }));
      
      win.startDrag(handle);
      this.draggedWindow = win;
    }
  },
  
  onDrag: function(event) {
    if (this.draggedWindow) {
      event.stop();
      this.draggedWindow.drag(event.memo.dx, event.memo.dy);
    }
  },
  
  onEndDrag: function(event) {
    if (this.draggedWindow) {
      event.stop();   
      this.dragOverlay.remove();
      this.draggedWindow.endDrag();
      this.draggedWindow = null;
    }
  },
  
  maximize: function(win) {
    this.removeOverflow();
    this.maximizedWindow = win;
    return true;
  },     
  
  restore: function(win) {   
    if (this.maximizedWindow) {
      this.resetOverflow();
      this.maximizedWindow = false;
    }
    return true;
  },     
  
  removeOverflow: function() {
    var container = this.container;
    // Remove overflow, save overflow and scrolloffset values to restore them when restore window    
    container.savedOverflow = container.style.overflow || "auto";      
    container.savedOffset = this.viewport.getScrollOffset(); 
    container.style.overflow = "hidden"; 

    this.viewport.setScrollOffset({ top:0, left:0 });

    if (this.container == document.body && Prototype.Browser.IE)
      this.cssRule = CSS.addRule("html { overflow: hidden }");     
  },
  
  resetOverflow: function() {
    var container = this.container; 
    // Restore overflow ans scrolloffset  
    if (container.savedOverflow) {
      if (this.container == document.body && Prototype.Browser.IE)
        this.cssRule.remove();

      container.style.overflow = container.savedOverflow;  
      this.viewport.setScrollOffset(container.savedOffset);        
      
      container.savedOffset = container.savedOverflow = null;  
    }
  },

  hide: function(win) {
    var previous = this.stack.getPreviousWindow(win);
    if (previous) previous.focus();
  },
  
  restartZIndexes: function(){
    // Reset zIndex
    var zIndex = this.getZIndex() + 1; // keep a zIndex free for overlay divs
    this.stack.windows.each(function(w) {
      w.setZIndex(zIndex);
      zIndex = w.lastZIndex + 1;
    });
  }, 
  
  getLastZIndex: function() {    
    return this.stack.getFrontWindow().lastZIndex + 1;
  },

  overlayStyle: "position: absolute; top: 0; left: 0; display: none; width: 100%;",

  createOverlays: function() {
    this.modalOverlay = new Element("div", { style: this.overlayStyle });
    this.dragOverlay  = new Element("div", { style: this.overlayStyle+"height: 100%" });
    this.iframe       = Prototype.Browser.IE ? new UI.IframeShim() : null;
  },
  
  focus: function(win) {
    // Blur the previous focused window
    if (this.focusedWindow)
      this.focusedWindow.blur();  
    this.focusedWindow = win;    
  },
  
  blur: function(win) {
    if (win == this.focusedWindow)
      this.focusedWindow = null;
  },
      
  setAltitude: function(win, altitude) {
    var stack = this.stack;
    
    if (altitude === "front") {
      if (stack.getFrontWindow() === win) return;
      stack.bringToFront(win);
    } else if (altitude === "back") {
      if (stack.getBackWindow() === win) return;
      stack.sendToBack(win);
    } else {
      if (stack.getPosition(win) == altitude) return;
      stack.setPosition(win, altitude);
    }
    
    this.restartZIndexes();
    return true;
  },
  
  getAltitude: function(win) {
    return this.stack.getPosition(win);
  },
  
  resize: function(event) {
    var area = this.viewport.getDimensions();
    
    if (this.maximizedWindow)
      this.maximizedWindow.setSize(area.width, area.height);
      
    if (this.modalOverlay.visible())
      this.modalOverlay.setStyle("height:" + area.height + "px");
  },
  
  handlePosition: function(win) {
    // window has its own position, nothing needs to be done
    if (Object.isNumber(win.options.top) && Object.isNumber(win.options.left))
      return;
    
    var strategy = this.options.positionningStrategy,
        area     = this.viewport.getDimensions();
    
    Object.isFunction(strategy) ? strategy(win, area) : strategy.position(win, area);
  }
});

UI.WindowManager.DumbPositionningStrategy = function(win, area) {
  size = win.getSize();
  
  var top  = area.height - size.height,
      left = area.width  - size.width;
  
  top  = top  < 0 ? 0 : Math.random() * top;
  left = left < 0 ? 0 : Math.random() * left;
  
  win.setPosition(top, left);
};

UI.WindowManager.optionsAccessor('zIndex', 'theme', 'shadowTheme');

UI.WindowManager.Stack = Class.create(Enumerable, {  
  initialize: function() {
    this.windows = [ ];
  },
  
  each: function(iterator) {
    this.windows.each(iterator);
  },
  
  add: function(win, position) {
    this.windows.splice(position || this.windows.length, 0, win);
  },
  
  remove: function(win) {
    this.windows = this.windows.without(win);
  },
  
  sendToBack: function(win) {
    this.remove(win);
    this.windows.unshift(win);
  },
  
  bringToFront: function(win) {
    this.remove(win);
    this.windows.push(win);
  },
  
  getPosition: function(win) {
    return this.windows.indexOf(win);
  },
  
  setPosition: function(win, position) {
    this.remove(win);
    this.windows.splice(position, 0, win);
  },
  
  getFrontWindow: function() {
    return this.windows.last();
  },
  
  getBackWindow: function() {
    return this.windows.first();
  },
  
  getPreviousWindow: function(win) {
    return (win == this.windows.first()) ? null : this.windows[this.windows.indexOf(win) - 1];
  }
});

document.whenReady(function() {
  UI.defaultWM = new UI.WindowManager();
});

