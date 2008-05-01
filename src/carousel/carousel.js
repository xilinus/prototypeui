/*
  Class: UI.Carousel

  Main class to handle a carousel of elements in a page. A carousel :
    * could be vertical or horizontal
    * works with liquid layout
    * is designed by CSS

  Assumptions:
    * Elements should be from the same size

  Example:
    > ...
    > <div id="horizontal_carousel">
    >   <div class="previous_button"></div>  
    >   <div class="container">
    >     <ul>
    >       <li> What ever you like</li>
    >     </ul>
    >   </div>
    >   <div class="next_button"></div>
    > </div>
    > <script>
    > new UI.Carousel("horizontal_carousel");
    > </script>
    > ...
*/
UI.Carousel = Class.create(UI.Options, {
  // Group: Options
  options: {
	// Property: direction
	//   Can be horizontal or vertical, horizontal by default
    direction               : "horizontal",

    // Property: previousButton
    //   Selector of previous button inside carousel element, ".previous_button" by default,
    //   set it to false to ignore previous button 
    previousButton          : ".previous_button",

    // Property: nextButton
    //   Selector of next button inside carousel element, ".next_button" by default,
    //   set it to false to ignore next button 
    nextButton              : ".next_button",

    // Property: container
    //   Selector of carousel container inside carousel element, ".container" by default,
    container               : ".container",

    // Property: scrollInc
    //   Define the maximum number of elements that gonna scroll each time, auto by default
    scrollInc               : "auto",

    // Property: disabledButtonSuffix
    //   Define the suffix classanme used when a button get disabled, to '_disabled' by default
    //   Previous button classname will be previous_button_disabled
    disabledButtonSuffix : '_disabled',

    // Property: overButtonSuffix
    //   Define the suffix classanme used when a button has a rollover status, '_over' by default
    //   Previous button classname will be previous_button_over
    overButtonSuffix : '_over'
  },

  /*
    Group: Attributes

      Property: element
        DOM element containing the carousel

      Property: id
        DOM id of the carousel's element

      Property: container
        DOM element containing the carousel's elements

      Property: elements
        Array containing the carousel's elements as DOM elements

      Property: previousButton
        DOM id of the previous button

      Property: nextButton
        DOM id of the next button

      Property: posAttribute
        Define if the positions are from left or top
        
      Property: dimAttribute
        Define if the dimensions are horizontal or vertical

      Property: elementSize
        Size of each element, it's an integer

      Property: nbVisible
        Number of visible elements, it's a float

      Property: animating
        Define whether the carousel is in animation or not
  */

  /*
    Group: Events
      List of events fired by a carousel

      Notice: Carousel custom events are automatically namespaced in "carousel:" (see Prototype custom events).

      Examples:
        This example will observe all carousels
        > document.observe('carousel:scroll:ended', function(event) {
        >   alert("Carousel with id " + event.memo.carousel.id + " has just been scrolled");
        > });

        This example will observe only this carousel
        > new UI.Carousel('horizontal_carousel').observe('scroll:ended', function(event) {
        >   alert("Carousel with id " + event.memo.carousel.id + " has just been scrolled");
        > });

      Property: previousButton:enabled
        Fired when the previous button has just been enabled

      Property: previousButton:disabled
        Fired when the previous button has just been disabled

      Property: nextButton:enabled
        Fired when the next button has just been enabled

      Property: nextButton:disabled
        Fired when the next button has just been disabled

      Property: scroll:started
        Fired when a scroll has just started

      Property: scroll:ended
        Fired when a scroll has been done,
        memo.shift = number of elements scrolled, it's a float

      Property: sizeUpdated
        Fired when the carousel size has just been updated.
        Tips: memo.carousel.currentSize() = the new carousel size
  */

  // Group: Constructor

  /*
    Method: initialize
      Constructor function, should not be called directly

    Parameters:
      element - DOM element
      options - (Hash) list of optional parameters

    Returns:
      this
  */
  initialize: function(element, options) {   
    this.setOptions(options);
    this.element = $(element);
    this.id = this.element.id;                                                    
    this.container   = this.element.down(this.options.container).firstDescendant();
    this.elements    = this.container.childElements();
    this.previousButton = this.options.previousButton == false ? null : this.element.down(this.options.previousButton);
    this.nextButton = this.options.nextButton == false ? null : this.element.down(this.options.nextButton);
    
    this.posAttribute = (this.options.direction == "horizontal" ? "left" : "top");
    this.dimAttribute = (this.options.direction == "horizontal" ? "width" : "height");
    
    this.elementSize = this.computeElementSize();
    this.nbVisible = Math.ceil(this.currentSize() / this.elementSize);

    var scrollInc = this.options.scrollInc;
    if (scrollInc == "auto")
      scrollInc = Math.floor(this.nbVisible);                       
    [ this.previousButton, this.nextButton ].each(function(button) {
      if (!button) return;                                                                                                 
      var className = (button == this.nextButton ? "next_button" : "previous_button") + this.options.overButtonSuffix;
      button.clickHandler = this.scroll.bind(this, (button == this.nextButton ? -1 : 1) * scrollInc * this.elementSize);
      button.observe("click", button.clickHandler)
            .observe("mouseover", function() {button.addClassName(className)}.bind(this))
            .observe("mouseout",  function() {button.removeClassName(className)}.bind(this));
    }, this);
    this.updateButtons();   
  },

  // Group: Destructor

  /*
    Method: destroy
      Cleans up DOM and memory
  */
  destroy: function($super) {
    [ this.previousButton, this.nextButton ].each(function(button) {
      if (!button) return;
        button.stopObserving("click", button.clickHandler);
    }, this);
	  this.element.remove();
	  this.fire('destroyed');
  },

  // Group: Event handling

  /*
    Method: fire
      Fires a carousel custom event automatically namespaced in "carousel:" (see Prototype custom events).
      The memo object contains a "carousel" property referring to the carousel.

    Example:
      > document.observe('carousel:scroll:ended', function(event) {
      >   alert("Carousel with id " + event.memo.carousel.id + " has just been scrolled");
      > });

    Parameters:
      eventName - an event name
      memo      - a memo object

    Returns:
      fired event
  */
  fire: function(eventName, memo) {
    memo = memo || { };
    memo.carousel = this;
    return this.element.fire('carousel:' + eventName, memo);
  },

  /*
    Method: observe
      Observe a carousel event with a handler function automatically bound to the carousel

    Parameters:
      eventName - an event name
      handler   - a handler function

    Returns:
      this
  */  
  observe: function(eventName, handler) {
    this.element.observe('carousel:' + eventName, handler.bind(this));
    return this;
  },

  /*
    Method: stopObserving
      Unregisters a carousel event, it must take the same parameters as this.observe (see Prototype stopObserving).

    Parameters:
      eventName - an event name
      handler   - a handler function

    Returns:
      this
  */
  stopObserving: function(eventName, handler) {
	  this.element.stopObserving('carousel:' + eventName, handler);
	  return this;
  },

  // Group: Actions

  /*
    Method: checkScroll
      Check scroll position to avoid unused space at right or bottom

    Parameters:
      position       - position to check
      updatePosition - should the container position be updated ? true/false

    Returns:
      position
  */
  checkScroll: function(position, updatePosition) { 
    if (position > 0)  
      position = 0; 
    else {
      var limit = this.elements.last().positionedOffset()[this.posAttribute] + this.elementSize;
      var carouselSize = this.currentSize();

      if (position + limit < carouselSize)
        position += carouselSize - (position + limit);
      position = Math.min(position, 0);
    }
    if (updatePosition)
      this.container.style[this.posAttribute] = position + "px";

    return position;
  },

  /*
    Method: scroll
      Scrolls carousel from maximum deltaPixel

    Parameters:
      deltaPixel - a float

    Returns:
      this
  */
  scroll: function(deltaPixel) {        
    if (this.animating)
      return this;

    // Compute new position
    var position =  this.currentPosition() + deltaPixel;
    
    // Check bounds
    position = this.checkScroll(position, false);
    
    // Compute shift to apply
    deltaPixel = position - this.currentPosition();
    if (deltaPixel != 0) {
      this.animating = true;
      this.fire("scroll:started");

      var that = this;
      // Move effects
      this.container.morph("opacity:0.5", {duration: 0.2, afterFinish: function() {
        that.container.morph(that.posAttribute + ": " + position + "px", {
          duration: 0.4,  
          delay: 0.2,
          afterFinish: function() {
            that.container.morph("opacity:1", {
              duration: 0.2, 
              afterFinish: function() { 
                that.animating = false;
                that.updateButtons()
                  .fire("scroll:ended", { shift: deltaPixel / that.currentSize() });
              }
            });
          }
        });
      }});
    }
    return this;
  },

  /*
    Method: scrollTo
      Scrolls carousel, so that element with specified index is the left-most.
      This method is convenient when using carousel in a tabbed navigation.
      Clicking on first tab should scroll first container into view, clicking on a fifth - fifth one, etc.
      Indexing starts with 0.
   
    Parameters:
      Index of an element which will be a left-most visible in the carousel
        
    Returns:
      this
  */
  scrollTo: function(index) {
    if (this.animating || index < 0 || index > this.elements.length || index == this.currentIndex() || isNaN(parseInt(index)))
      return this;
    return this.scroll((this.currentIndex() - index) * this.elementSize);
  },

  /*
    Method: updateButtons
      Update buttons status to enabled or disabled
      Them status is defined by classNames and fired as carousel's custom events

    Returns:
      this
  */
  updateButtons: function() {  
	  this.updatePreviousButton();
    this.updateNextButton();
    return this;
  },   
  
  updatePreviousButton: function() {
    if (!this.previousButton) 
      return;
    var position = this.currentPosition();   
    var previousClassName = "previous_button" + this.options.disabledButtonSuffix;
    
    if (this.previousButton.hasClassName(previousClassName) && position != 0) {
      this.previousButton.removeClassName(previousClassName);
      this.fire('previousButton:enabled');
    }
    if (!this.previousButton.hasClassName(previousClassName) && position == 0) {
	    this.previousButton.addClassName(previousClassName);
      this.fire('previousButton:disabled');
    }    
  },
  
  updateNextButton: function() {
    if (!this.nextButton) 
      return;
    var lastPosition = this.currentLastPosition();
    var size = this.currentSize();
    var nextClassName = "next_button" + this.options.disabledButtonSuffix;

    if (this.nextButton.hasClassName(nextClassName) && lastPosition != size) {
      this.nextButton.removeClassName(nextClassName);
      this.fire('nextButton:enabled');
    }
    if (!this.nextButton.hasClassName(nextClassName) && lastPosition == size) {
	    this.nextButton.addClassName(nextClassName);
      this.fire('nextButton:disabled');
    }
  },
  
  // Group: Size and Position

  /*
    Method: computeElementSize
      Return elements size in pixel, height or width depends on carousel orientation.

    Returns:
      an integer value
  */
  computeElementSize: function() {  
    return this.elements.first().getDimensions()[this.dimAttribute];
  },

  /*
    Method: currentIndex
      Returns current visible index of a carousel.
      For example, a horizontal carousel with image #3 on left will return 3 and with half of image #3 will return 3.5
      Don't forget that the first image have an index 0

    Returns:
      a float value
  */
  currentIndex: function() {
    return - this.currentPosition() / this.elementSize;
  },

  /*
    Method: currentLastPosition
      Returns the current position from the end of the last element. This value is in pixel.

    Returns:
      an integer value, if no images a present it will return 0
  */
  currentLastPosition: function() {
    if (this.container.childElements().empty())
      return 0;
    return this.currentPosition() + 
           this.elements.last().positionedOffset()[this.posAttribute] + 
           this.elementSize;
  },

  /*
    Method: currentPosition
      Returns the current position in pixel.
      Tips: To get the position in elements use currentIndex()

    Returns:
      an integer value
  */
  currentPosition: function() {
    return this.container.getNumStyle(this.posAttribute);
  },

  /*
    Method: currentSize
      Returns the current size of the carousel in pixel

    Returns:
      Carousel's size in pixel
  */
  currentSize: function() {
    return this.container.parentNode.getDimensions()[this.dimAttribute];
  },

  /*
    Method: updateSize  
      Should be called if carousel size has been changed (usually called with a liquid layout)

    Returns:
      this
  */
  updateSize: function() {
    this.nbVisible = this.currentSize() / this.elementSize;
    var scrollInc = this.options.scrollInc;
    if (scrollInc == "auto")
      scrollInc = Math.floor(this.nbVisible);

    [ this.previousButton, this.nextButton ].each(function(button) {
      if (!button) return;
      button.stopObserving("click", button.clickHandler);
      button.clickHandler = this.scroll.bind(this, (button == this.nextButton ? -1 : 1) * scrollInc * this.elementSize);
      button.observe("click", button.clickHandler);
    }, this);

    this.checkScroll(this.currentPosition(), true);    
    this.updateButtons().fire('sizeUpdated');
    return this;
  }
});