/*
  Class: UI.Ajax.Carousel

  Gives the AJAX power to carousels. An AJAX carousel :
    * Use AJAX to add new elements on the fly

  Example:
    > new UI.Ajax.Carousel("horizontal_carousel",
    >   {url: "get-more-elements", elementSize: 250});
*/
UI.Ajax.Carousel = Class.create(UI.Carousel, {
  // Group: Options
  //
  //   Notice:
  //     It also include of all carousel's options
  options: {
	// Property: elementSize
	//   Required, it define the size of all elements
    elementSize : -1,

	// Property: url
	//   Required, it define the URL used by AJAX carousel to request new elements details
    url         : null
  },

  /*
    Group: Attributes

      Notice:
        It also include of all carousel's attributes

      Property: elementSize
        Size of each elements, it's an integer

      Property: endIndex
        Index of the last loaded element

      Property: hasMore
        Flag to define if there's still more elements to load

      Property: requestRunning
        Define whether a request is processing or not

      Property: updateHandler
        Callback to update carousel, usually used after request success

      Property: url
        URL used to request additional elements
  */

  /*
    Group: Events
      List of events fired by an AJAX carousel, it also include of all carousel's custom events

      Property: request:started
        Fired when the request has just started

      Property: request:ended
        Fired when the request has succeed
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
  initialize: function($super, element, options) {      
    if (!options.url)
      throw("url option is required for UI.Ajax.Carousel");
    if (!options.elementSize)
      throw("elementSize option is required for UI.Ajax.Carousel");

    $super(element, options);                                     

    this.endIndex = 0;
    this.hasMore  = true;

    // Cache handlers
    this.updateHandler = this.update.bind(this);
    this.updateAndScrollHandler = function(nbElements, transport, json) {
	    this.update(transport, json);
	    this.scroll(nbElements);
	  }.bind(this);

    // Run first ajax request to fill the carousel
    this.runRequest.bind(this).defer({parameters: {from: 0, to: Math.ceil(this.nbVisible) - 1}, onSuccess: this.updateHandler});
  },

  // Group: Actions

  /*
    Method: runRequest
      Request the new elements details

    Parameters:
      options - (Hash) list of optional parameters

    Returns:
      this
  */
  runRequest: function(options) {
    this.requestRunning = true;
    new Ajax.Request(this.options.url, Object.extend({method: "GET"}, options));
    this.fire("request:started");
    return this;
  },

  /*
    Method: scroll
      Scrolls carousel from maximum deltaPixel

    Parameters:
      deltaPixel - a float

    Returns:
      this
  */
  scroll: function($super, deltaPixel) {
    if (this.animating || this.requestRunning)
      return this;

    var nbElements = (-deltaPixel) / this.elementSize;
    // Check if there is not enough
    if (this.hasMore && nbElements > 0 && this.currentIndex() + this.nbVisible + nbElements - 1 > this.endIndex) {
      var from = this.endIndex + 1;
      var to   = Math.ceil(from + this.nbVisible - 1);   
      this.runRequest({parameters: {from: from, to: to}, onSuccess: this.updateAndScrollHandler.curry(deltaPixel).bind(this)});
      return this;
    }
    else
      $super(deltaPixel);
  },

  /*
    Method: update
      Update the carousel

    Parameters:
      transport - XMLHttpRequest object
      json      - JSON object

    Returns:
      this
  */
  update: function(transport, json) {
    this.requestRunning = false;
    this.fire("request:ended");
    if (!json)
      json = transport.responseJSON;
    this.hasMore = json.more;

    this.endIndex = Math.max(this.endIndex, json.to);
    this.elements = this.container.insert({bottom: json.html}).childElements();
    return this.updateButtons();
  },

  // Group: Size and Position

  /*
    Method: computeElementSize
      Return elements size in pixel
        
    Returns:
      an integer value
  */
  computeElementSize: function() {
    return this.options.elementSize;
  },

  /*
    Method: updateSize  
      Should be called if carousel size has been changed (usually called with a liquid layout)

    Returns:
      this
  */
  updateSize: function($super) {
    var nbVisible = this.nbVisible;
    $super();
    // If we have enough space for at least a new element
    if (Math.floor(this.nbVisible) - Math.floor(nbVisible) >= 1 && this.hasMore) {
      if (this.currentIndex() + Math.floor(this.nbVisible) >= this.endIndex) {
        var nbNew = Math.floor(this.currentIndex() + Math.floor(this.nbVisible) - this.endIndex);
        this.runRequest({parameters: {from: this.endIndex + 1, to: this.endIndex + nbNew}, onSuccess: this.updateHandler});
      }
    }
    return this;
  },
  
  updateNextButton: function($super) { 
    if (!this.nextButton) 
      return;
    var lastPosition = this.currentLastPosition();
    var size = this.currentSize();
    var nextClassName = "next_button" + this.options.disabledButtonSuffix;

    if (this.nextButton.hasClassName(nextClassName) && lastPosition != size) {
      this.nextButton.removeClassName(nextClassName);
      this.fire('nextButton:enabled');
    }    
    if (!this.nextButton.hasClassName(nextClassName) && lastPosition == size && !this.hasMore) {
	    this.nextButton.addClassName(nextClassName);
      this.fire('nextButton:disabled');
    }
  }
});