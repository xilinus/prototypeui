/*
  Credits:
  - Idea: Facebook + Apple Mail
  - Guillermo Rauch: Original MooTools script
  - InteRiders: Prototype version  <http://interiders.com/>
*/

Object.extend(Event, {
  KEY_SPACE: 32,
  KEY_COMA:  188
});

UI.AutoComplete = Class.create(UI.Options, {
  // Group: Options
  options: {
    className: "pui-autocomplete",         // CSS class name prefix
    max: {selection: 10, selected:false},  // Max values fort autocomplete, 
                                           // selection : max item in pulldown menu
                                           // selected  : max selected items (false = no limit)
    url: false,                            // Url for ajax completion
    delay: 0.2,                            // Delay before running ajax request
    shadow: false,                         // Shadow theme name (false = no shadow)
    highlight: false,                      // Highlight search string in list
    tokens: false,                         // Tokens used to automatically adds a new entry (ex tokens:[KEY_COMA, KEY_SPACE] for coma and spaces)
    unique: true                           // Do not display in suggestion a selected value
  }, 
  
  initialize: function(element, options) {   
    this.setOptions(options);
    if(typeof(this.options.tokens) == 'number') 
      this.options.tokens = $A([this.options.tokens]);
    this.element = $(element);

    this.render();  
    this.updateInputSize();  
    this.nbSelected = 0;      
    this.list = [];

    this.keydownHandler  = this.keydown.bindAsEventListener(this);
    document.observe('keydown', this.keydownHandler);
  },  
  
  destroy:function() {
    this.autocompletion.destroy();
    this.input.stopObserving();
    document.stopObserving('keypress', this.keydownHandler);
    this.container.remove();
    this.element.show();
  },
  
  init: function(tokens) {
    tokens = tokens || this.options.tokens;
    var values = this.input.value.split(tokens.first());
    values.each(function(text) {if (!text.empty()) this.add(text)}.bind(this));
    this.input.clear();
    
    return this;
  },
  
  add: function(text, value, options) {  
    // No more than max
    if (!this.canAddMoreItems())
      return;
      
    // Create a new li
    var li = new Element("li", Object.extend({className: this.getClassName("box")}, options || {}));
    li.observe("click",     this.focus.bindAsEventListener(this, li))
      .observe("mouseover", this.over.bindAsEventListener(this, li))
      .observe("mouseout",  this.out.bindAsEventListener(this, li));
    
    // Close button   
    var close = new Element('a', {'href': '#', 'class': 'closebutton'});
    li.insert(new Element("span").update(text).insert(close));
    if (value)
      li.writeAttribute("pui-autocomplete:value", value);
      
    close.observe("click", this.remove.bind(this, li));
    
    this.input.parentNode.insert({before: li});
    this.nbSelected++;
    this.updateSelectedText().updateHiddenField();
    
    this.updateInputSize();
    if (!this.canAddMoreItems()) 
      this.hideAutocomplete().fire("selection:max_reached");
    else
      this.hideAutocomplete().fire("input:empty");
    
    return this.fire("element:added", {element: li, text: text, value: value});
  },
 
  remove: function(element) { 
    element.stopObserving();
    
    element.remove();
    this.nbSelected--;
    this.updateSelectedText().updateHiddenField();
    
    this.updateInputSize();
    this.input.focus();
    return this.fire("element:removed", {element: element});
  }, 
  
  removeLast: function() {
    var element = this.container.select("li." + this.getClassName("box")).last();
    if (element)
      this.remove(element);
  },
  
  removeSelected: function(event) {           
    if (event.element().readAttribute("type") != "text" && event.keyCode == Event.KEY_BACKSPACE) {
      this.container.select("li." + this.getClassName("box")).each(function(element) {   
        if (this.isSelected(element))
          this.remove(element);
      }.bind(this));   
      if (event)
        event.stop();      
    }
    return this;
  },
  
  focus: function(event, element) { 
    if (event)
      event.stop();

    // Multi selection with shift
    if (event && !event.shiftKey)
      this.deselectAll();

    element = element || this.input;
    if (element == this.input && !this.input.readAttribute("focused")) {
      this.input.writeAttribute("focused", true);
      this.input.focus();    
      this.displayCompletion(); 
    }
    else {
      this.out(event, element);     
      element.addClassName(this.getClassName("selected"));  

      // Blur input field
      if (element != this.input)
        this.blur();
    }   
    return this.fire("element:focus", {element: element});
  },
  
  blur: function(event, element) {
    if (event)
      event.stop();
      
    if (!element) 
      this.input.blur();

    this.hideAutocomplete();
    return this.fire("element:blur", {element: element});
  },                    
  
  over: function(event, element) { 
    if (!this.isSelected(element))
      element.addClassName(this.getClassName("over"));   
    if (event)
      event.stop();
    return this.fire("element:over", {element: element});
  },                    
  
  out: function(event, element) {
    if (!this.isSelected(element))
      element.removeClassName(this.getClassName("over"));
    if (event)
      event.stop();
    return this.fire("element:out", {element: element});
  },                    
  
  isSelected: function(element) {
    return element.hasClassName(this.getClassName("selected"));
  }, 
  
  deselectAll: function() {
   this.container.select("li." + this.getClassName("box")).invoke("removeClassName", this.getClassName("selected"));
   return this;
  },
  
  setAutocompleteList: function(list) {
    this.list = list;    
    return this;
  },    
  
  /*
    Method: fire
      Fires a autocomplete custom event automatically namespaced in "autocomplete:" (see Prototype custom events).
      The memo object contains a "autocomplete" property referring to the autocomplete.


    Parameters:
      eventName - an event name
      memo      - a memo object

    Returns:
      fired event
  */
  fire: function(eventName, memo) {
    memo = memo || { };
    memo.autocomplete = this;
    return this.input.fire('autocomplete:' + eventName, memo);
  },

  /*
    Method: observe
      Observe a autocomplete event with a handler function automatically bound to the autocomplete

    Parameters:
      eventName - an event name
      handler   - a handler function

    Returns:
      this
  */  
  observe: function(eventName, handler) {
    this.input.observe('autocomplete:' + eventName, handler.bind(this));
    return this;
  },

  /*
    Method: stopObserving
      Unregisters a autocomplete event, it must take the same parameters as this.observe (see Prototype stopObserving).

    Parameters:
      eventName - an event name
      handler   - a handler function

    Returns:
      this
  */
  stopObserving: function(eventName, handler) {
	  this.input.stopObserving('autocomplete:' + eventName, handler);
	  return this;
  },
  
  // PRIVATE METHOD
  // Move selection. element = nil (highlight first),  "previous"/"next" or selected element
  moveSelection: function(event, element) {
    var current = null;
    // Seletc first
    if (!this.current) 
      current = this.autocompletionContainer.firstDescendant();
    else if (element == "next") {
      current = this.current[element]() || this.autocompletionContainer.firstDescendant();
    }
    else if (element == "previous") {
      current = this.current[element]() || this.autocompletionContainer.childElements().last();
    }
    else 
      current = element;
    
    if (this.current)
      this.current.removeClassName(this.getClassName("current"));  
      
    this.current = current;
    
    if (this.current)
      this.current.addClassName(this.getClassName("current"));
  },
  
  // Add current selected element from completion to input
  addCurrentSelected: function() {
    if (this.current) { 
      // Get selected text
      var index = this.autocompletionContainer.childElements().indexOf(this.current);
      // Clear input
      this.current = null;
      this.input.value = "";

      this.add(this.selectedList[index].text, this.selectedList[index].value);

      // Refocus input                       
      (function() {this.input.focus()}.bind(this)).defer();
      // Clear completion (force render)
      this.displayCompletion();
    }
  },
  
  // Display message (info or progress)
  showMessage: function(text) {  
    if (text) {
      if (this.hideTimer) {
        clearTimeout(this.hideTimer);
        this.hideTimer = false;
      }
      // udate text
      this.message.update(text); 
      this.message.show();
      // Hidden auto complete suggestion
      this.autocompletionContainer.hide();
      this.showAutocomplete();
    } 
    else
      this.hideAutocomplete();
  },   
  
  // Run ajax request to get completion values
  runRequest: function(search) {
    this.autocompletionContainer.hide(); 
    this.fire("request:started");

    new Ajax.Request(this.options.url, {parameters: {search: search, max: this.options.max.selection, "selected[]": this.selectedValues()}, onComplete: function(transport) {        
      this.setAutocompleteList(transport.responseText.evalJSON());
      this.timer = null;
      this.fire("request:completed");
      this.displayCompletion();
    }.bind(this)});
  },
  
  // Get a "namespaced" class name
  getClassName: function(className) {
    return  this.options.className + "-" + className;
  },  

  // Key down (for up/down and return key)
  keydown: function(event) {
    if (event.element() != this.input)
      return;
      
    this.ignoreKeyup = false;
    // Check max
    if (this.options.max.selected && this.nbSelected == this.options.max.selected) 
      this.ignoreKeyup = true;
    
    // Check tokens
    if (this.options.tokens){
      var tokenFound = this.options.tokens.find(function(token){
        return event.keyCode == token;
      });
      if (tokenFound) {
        var value = this.input.value.strip();
        this.ignoreKeyup = true;
        var value = this.input.value;
        this.input.clear();
        if (!value.empty())
          this.add(value);
      }
    } 
    switch(event.keyCode) {
     case Event.KEY_UP: 
       this.moveSelection(event, 'previous');
       this.ignoreKeyup = true;
       break;
     case Event.KEY_DOWN: 
       this.moveSelection(event, 'next');        
       this.ignoreKeyup = true;
       break;
     case Event.KEY_RETURN:   
       this.addCurrentSelected();
       this.ignoreKeyup = true;
       break;
     case Event.KEY_BACKSPACE:
       if (this.input.getCaretPosition() == 0) 
         this.removeLast();
       break;
    }
    if (this.ignoreKeyup) {
      event.stop();
      return false;
    }
    else
      return true;
  },                             

  // Key to handle completion
  keyup: function(event) { 
    if (this.ignoreKeyup) {
      this.ignoreKeyup = false;
      return true;
    }
    else {
      this.updateHiddenField();
      this.displayCompletion(event);
      return true;
    }
  },   

  // Update input filed size to fit available width space
  updateInputSize: function() {          
    // Get added elements width   
    var top;
    var w = this.container.select("li." + this.getClassName("box")).inject(0, function(sum, element) { 
      // First element  
      if (Object.isUndefined(top))
        top = element.cumulativeOffset().top;
      // New line  
      else if (top != element.cumulativeOffset().top) {
        top = element.cumulativeOffset().top;
        sum = 0;                                       
      }
      return sum + element.getWidth() + element.getMarginDimensions().width + element.getBorderDimensions().width;
    });
    var margin = this.container.getMarginDimensions().width + this.container.getBorderDimensions().width + this.container.getPaddingDimensions().width;   
    var width = this.container.getWidth() - w - margin;
    
    if (width < 50) 
      width =   this.container.getWidth() - margin;
      
    this.input.parentNode.style.width = width + "px";
    this.input.style.width = width + "px";
  },
  
  // Display completion. It could display info or progress message if need be. Info when input field is empty
  // progress when ajax request is running
  displayCompletion: function(event) {
    var value = this.input.value.strip();   
    this.current = null;
    if (!this.canAddMoreItems()) 
      return;
      
    if (!value.empty()) {                
      // Run ajax reqest if need be
      if (event && this.options.url) {
        if (this.timer)
          clearTimeout(this.timer);
        this.timer = this.runRequest.bind(this, value).delay(this.options.delay);     
      } 
      else {
        this.message.hide();
        if (this.options.url)
          this.selectedList = this.list;
        else {
          this.selectedList = this.list.findAll(function(entry) {return entry.text.match(value)}).slice(0, this.options.max.selection);   
          if (this.options.unique) {
            var selected= this.selectedValues();
            if (! selected.empty())
              this.selectedList = this.selectedList.findAll(function(entry) {return !selected.include(entry.value)});
          }
        }
        this.autocompletionContainer.update("");  
        if (this.selectedList.empty()) {
          this.hideAutocomplete().fire('selection:empty');
        }
        else {
          this.selectedList.each(function(entry) {
            var li = new Element("li").update(this.options.highlight ? entry.text.gsub(value, "<em>" + value + "</em>") : entry.text);
            li.observe("mouseover", this.moveSelection.bindAsEventListener(this, li))
              .observe("mousedown", this.addCurrentSelected.bindAsEventListener(this));            
            this.autocompletionContainer.insert(li);
          }.bind(this));  
          this.autocompletionContainer.show(); 
          this.moveSelection("next");
          this.showAutocomplete(); 
        }
      }
    }
    else {   
      this.hideAutocomplete().fire("input:empty");
    }
  },                                       

  showAutocomplete: function(event){
    this.autocompletion.show(event).place(this.container);
    return this;
  },
  
  hideAutocomplete: function(){
    if (!this.hideTimer)
      this.hideTimer = (function() {
        this.autocompletionContainer.hide();
        this.autocompletion.hide();
        this.hideTimer = false;
      }).bind(this).defer();
    return this;
  },
  
  // Create HTML code
  render: function() {     
    // GENERATED HTML CODE:
    // <ul class="pui-autocomplete-holder">
    //   <li class="pui-autocomplete-input">
    //     <input type="text"/>
    //   </li>
    // </ul>
    // <div class="pui-autocomplete-result">
    //   <div class="pui-autocomplete-message"></div>
    //   <ul class="pui-autocomplete-results">
    //   </ul>
    // </div>
    //     
    this.input = this.element.cloneNode(true);
    this.input.writeAttribute("autocomplete", "off");
    this.input.name = "";
      
    this.input.observe("focus",    this.focus.bindAsEventListener(this, this.input))
              .observe("blur",     this.blur.bindAsEventListener(this, this.input))
              .observe("keyup",    this.keyup.bindAsEventListener(this));
    this.container = new Element('ul', {className: this.getClassName("holder")})
                       .insert(new Element("li", {className: this.getClassName("input")}).insert(this.input));
                       
    this.autocompletionContainer = new Element("ul",{className: this.getClassName("results")}).hide();

    this.message  = new Element("div", {className: this.getClassName("message")}).hide(); 
    this.hidden = new Element("input",{type: 'hidden', name: this.element.name});
    this.element.insert({before: this.container}).insert({before: this.hidden});
    this.element.remove();

    this.autocompletion = new UI.PullDown(this.container, {
      className: this.getClassName("result"),
      shadow: this.options.shadow,
      position: 'below',
      cloneWidth: true
    });
    
    this.autocompletion.insert(this.message).insert(this.autocompletionContainer);
  },
  
  canAddMoreItems: function() {
    return !(this.options.max.selected && this.nbSelected == this.options.max.selected);
  },
  
  updateSelectedText: function() {
    var selected = this.container.select("li." + this.getClassName("box"));
    var content = selected.collect(function(element) {return element.down("span").firstChild.textContent});
    var separator = this.getSeparatorChar();
    this.selectedText = content.empty() ? false : content.join(separator); 
    
    return this;
  },
  
  updateHiddenField: function() {
    var separator = this.getSeparatorChar();
    this.hidden.value = this.selectedText ? $A([this.selectedText, this.input.value]).join(separator) : this.input.value;
  },
  
  selectedValues: function() {
    var selected = this.container.select("li." + this.getClassName("box"));
    return  selected.collect(function(element) {return element.readAttribute("pui-autocomplete:value")});
  },
  
  getSeparatorChar: function() {
    var separator = this.options.tokens ? this.options.tokens.first() : " ";
    if (separator == Event.KEY_COMA)
      separator = ',';
    if (separator == Event.KEY_SPACE)
      separator = ' ';
    return separator;
  }
});

Element.addMethods({
  getCaretPosition: function(element) {
    if (element.createTextRange) {
      var r = document.selection.createRange().duplicate();
        r.moveEnd('character', element.value.length);
        if (r.text === '') return element.value.length;
        return element.value.lastIndexOf(r.text);
    } else return element.selectionStart;
  },
  
  getAttributeDimensions: function(element, attribut ) {
    var dim = $w('top bottom left right').inject({}, function(dims, key) {
      dims[key] = element.getNumStyle(attribut + "-" + key + (attribut == "border" ? "-width" : ""));
      return dims;
    });
    dim.width  = dim.left + dim.right;
    dim.height = dim.top + dim.bottom; 
    return dim;
  },
  
  getBorderDimensions:  function(element) {return element.getAttributeDimensions("border")},
  getMarginDimensions:  function(element) {return element.getAttributeDimensions("margin")},
  getPaddingDimensions: function(element) {return element.getAttributeDimensions("padding")}
});
