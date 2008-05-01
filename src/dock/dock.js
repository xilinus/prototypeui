/*
  Class: UI.Dock
    EXPERIMENTAL.
    
    Creates a dock with a fisheye effect from an element.

    Assumptions:
      - Element is a UL, items are LI elements.
      - Images are IMG markups inside LI items
      - LI can contain label elements, which match a given selector (see <labelsSelector> option)
    
    Example:
      > new UI.Dock('dock', { hideLabels: true });

    Original source code from Safalra (Stephen Morley)
      http://www.safalra.com/web-design/javascript/mac-style-dock/.
    This is a Prototype "port"


*/
UI.Dock = Class.create(UI.Options, {
  
  // Group: Options
  options: {
    // Property: maxItemSize
    //   maximum size in pixel of images when magnified, default is 96.
    maxItemSize: 96,
    
    // Property: range
    //   number of items the magnify effect affects, default is 2.
    range: 2,
    
    // Property: hideLabels
    //   a boolean, if set to true labels are only visible when mouse is over, default is false.
    hideLabels: false,
    
    // Property: labelsSelector
    //   CSS3 selector to select labels element, default is ".label".
    labelsSelector: '.label'
  },
    
  initialize: function(element, options) {
    this.element = $(element);
    this.setOptions(options);
    
    this.scale = 0;
    this.create();
  },
  
  create: function() {
    this.createSchedulers();
    this.parseItems();
    this.observeElement();
    
    if (this.options.hideLabels)
      this.items.pluck('label').invoke('hide');
    
    this.options.itemSize = this.options.itemSize || this.items.first().size;    
    var offset = this.options.maxItemSize - this.options.itemSize;
    
    this.items.pluck('element').invoke('setStyle', { 
      top: "-"+offset+"px",
      position: "relative" }, this);
    
    this.element.style.height = this.options.itemSize + "px";
    this.redrawItems();
  },
  
  parseItems: function() { 
    var selector = this.options.labelsSelector;
    
    this.items = this.element.select('LI').collect(function(LI, i) {
      LI._dockPosition = i;
      return {
        element: LI,
        image:   LI.down('img'),
        size:    parseInt(LI.down('img').readAttribute('width')),
        label:   LI.down(selector)
      }
    });
  },
  
  findEventItem: function(event) {
    var element = event.findElement('LI');
    return element && this.items[element._dockPosition];
  },
  
  createSchedulers: function() {
    this.magnifyScheduler = new PeriodicalExecuter(this.magnifyStep.bind(this), 0.01);
    this.magnifyScheduler.stop();
    this.closeScheduler = new PeriodicalExecuter(this.closeStep.bind(this), 0.01);
    this.closeScheduler.stop();
  },
 
  onMouseOver: function(event){
    var item = this.findEventItem(event);
    if (!item) return;
    
    if (this.options.hideLabels)
      this.shownLabel = item.label.show();
  },
 
  onMouseMove: function(event) {
    this.magnify();
    
    var item = this.findEventItem(event);
    if (!item) return;
    
    var index  = this.items.indexOf(item),
        across = (event.layerX || event.offsetX) / this.items[index].size;  
    
    if (!across) return;
    
    this.items.each(function(item, i) {
      item.size = this.itemSize + (((i < index - this.range) || (i > index + this.range)) ? 0 : 
        ((this.maxItemSize - this.itemSize) * (Math.cos(i - index - across + 0.5) + 1) / 2).ceil());
    }, this.options);

    this.redrawItems();
  },
  
  onMouseOut: function(event){
    if (this.closeTimeout || this.closeScheduler.timer)
      return;
      
    this.closeTimeout = this.close.bind(this).delay(0.05);
    
    if (this.options.hideLabels)
      this.shownLabel.hide();
  },
  
  magnify: function() {
    if (this.closeTimeout) {
      window.clearTimeout(this.closeTimeout);
      this.closeTimeout = false;
    }
    
    this.closeScheduler.stop();
    
    if (this.scale != 1 && !this.magnifyScheduler.timer)
      this.magnifyScheduler.registerCallback();
  },
  
  close: function() {
    this.closeTimeout = false;
    this.magnifyScheduler.stop();
    this.closeScheduler.registerCallback();
  },
  
  magnifyStep: function(scheduler){
    if (this.scale < 1) this.scale += 0.125;
    else {
      this.scale = 1;
      scheduler.stop();
    }
    this.redrawItems();
  },
 
  closeStep: function(scheduler){
    if (this.scale > 0) this.scale -= 0.125;
    else {
      this.scale = 0;
      scheduler.stop();
    }
    this.redrawItems();
  },
  
  observeElement: function() {
    this.element.observe('mouseover', this.onMouseOver.bind(this))
                .observe('mousemove', this.onMouseMove.bind(this))
                .observe('mouseout',  this.onMouseOut.bind(this));
  },
  
  redrawItems: function(){
    var itemSize  = this.options.itemSize, 
        maxSize   = this.options.maxItemSize,
        totalSize = 0;
    
    this.items.each(function(item) {
      var size = itemSize + this.scale * (item.size - itemSize),
          image = item.image;
      image.setAttribute('width', size);
      image.setAttribute('height', size);
      image.style.marginTop = maxSize - size + 'px';
      if (item.label)
        item.label.style.width = size + 'px';
      totalSize += size;
    }, this);
    
    this.element.style.width = totalSize + 'px';
  }
});