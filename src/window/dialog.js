/*
Class: UI.Dialog
  Main class to handle dialog. Dialog are Windows with buttons like Ok/Cancel for having nicer alert/confirm javascript dialog.
  
  Buttons are fully configurable and designed by CSS
  
  Alert and confirm are already designed

  To open a alert dialog just do:
  > new UI.Dialog({buttons: UI.Dialog.okButton}).center().setHeader("Open a new sesssion").setContent("your content").show(true);         
  >         
  
  To open a cofirm dialog just do:
  > new UI.Dialog({buttons: UI.Dialog.okCancelButton}).center().setHeader("Open a new sesssion").setContent("your content").show(true);         
  >
  > // Or without options as it's by default
  > new UI.Dialog().center().setHeader("Open a new sesssion").setContent("your content").show(true);         
  
*/
                               
UI.Dialog = Class.create(UI.Window, {
  options: {
    buttons:       null, // default = ok/cancel button
    beforeSelect:  Prototype.trueFunction,
    close:         false,
    resizable:     false,
    activeOnClick: false
  },

  // Group: Attributes

  /*
    Property: buttons
      Array of buttons attributes. A button is defined with an hash with
      - title
      - className
      - callback (optional) called when a user click on a button (not disabled)
      
      Example for alert Dialog
      > [{title: 'Ok',     className: 'ok',     callback: function(win) { win.destroy(); }}]
      >
      >

    Property: beforeSelect
      function calls when a user click on a button (not disabled). If beforeSelect returns false, button callbacks is not executed
  */


  // Group: Instance Methods
  
  /*
    Method: disableButton
      Disables a button (add disabled css class name)
      The button will not be clickable anymore

    Parameters:
      index - Button index (start from 0)

    Returns:
      this
  */
  disableDialogButton: function(index) {
    var button = this.getDialogButton(index);
    if (button) 
      button.addClassName("disabled"); 
    return this;
  },
  
  /*
    Method: enableButton
      Enables a button (remove disabled css class name)
      The button is now clickable

    Parameters:
      index - Button index (start from 0)

    Returns:
      this
  */
  enableDialogButton: function(index) {
    var button = this.getDialogButton(index);
    if (button) 
      button.removeClassName("disabled");
    return this;
  },

  /*
    Method: getButton                                  
      Gets button element

    Parameters:
      index - Button index (start from 0)

    Returns:
      button element or null if bad index
  */
  getDialogButton: function(index) {                                    
    var buttons = this.buttonContainer.childElements(); 
    if (index >= 0 && index < buttons.length)
      return buttons[index];
    else
      return null;
  },   

  // Override create to add dialog buttons
  create: function($super) {
    $super();    
    
    // Create buttons
    this.buttonContainer = this.createButtons();   
    // Add a new content for dialog content
    this.dialogContent   = new Element('div', {className:'ui-dialog-content'});
    
    this.content.update(this.dialogContent);  
    this.content.insert(this.buttonContainer); 
  },

  addElements: function($super) {
    $super();
    // Pre compute buttons height 
    this.buttonsHeight = this.buttonContainer.getHeight() || this.buttonsHeight; 
    this.setDialogSize();
  },
  
  setContent: function(content, withoutButton) { 
    this.dialogContent.update(content);                  
    
    // Remove button if need be
    if (withoutButton && this.buttonContainer.parentNode)
      this.buttonContainer.remove();
    else 
      this.content.insert(this.buttonContainer);
    
    // Update dialog size
    this.setDialogSize();      
    return this;
  },

  onSelect: function(e) { 
    var element = e.element();       
    if (element.callback && !element.hasClassName('disabled')) {
      if (this.options.beforeSelect(element))
        element.callback(this);
    }
  },
  
  createButtons: function(dialogButtons) {          
    var buttonContainer = new Element('div', { className: 'ui-dialog-buttons'});
    (this.options.buttons || UI.Dialog.okCancelButtons).each(function(item){    
      var button;
      if (item.separator)
        button = new Element('span', {className: 'separator'});
      else 
        button = new Element('button', {title: item.title,
                                        className: (item.className || '') + (item.disabled ? ' disabled' : '')})
                   .observe('click', this.onSelect.bind(this))
                   .update(item.title);

       buttonContainer.insert(button);
       button.callback = item.callback; 
    }.bind(this));        
    return buttonContainer;
  },
  
  setDialogSize: function () {  
    // Do not compute dialog size if window is not completly ready                                    
    if (!this.borderSize)
      return;
      
    this.buttonsHeight = this.buttonContainer.getHeight() || this.buttonsHeight;
    var style = this.dialogContent.style, size  = this.getSize(true);    
    style.width = size.width + "px", style.height = size.height - this.buttonsHeight + "px";  
  },

  setSize: function($super, width, height, innerSize) {
  	$super(width, height, innerSize);
    this.setDialogSize();
    return this;
  }
}); 


UI.Dialog =  Object.extend(UI.Dialog, {
  okButton        : [{title: 'Ok',     className: 'ok',     callback: function(win) { win.destroy(); }}],
  okCancelButtons : [{title: 'Ok',     className: 'ok',     callback: function(win) { win.destroy(); }},
                     {title: 'Cancel', className: 'cancel', callback: function(win) { win.destroy(); }}]
});


