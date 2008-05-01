Event.simulateMouse = function(element, eventName) {
  var options = Object.extend({
	pointerX: 0,
	pointerY: 0,
	button:  0,
	ctrlKey:  false,
	altKey:   false,
	shiftKey: false,
	metaKey: false,
	bubbles: true,
	cancelable: true
  }, arguments[2] || { } );

  if (document.createEvent) {
		var oEvent = document.createEvent("MouseEvents");
		oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView, 
	  	options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
	  	options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, $(element));
		$(element).dispatchEvent(oEvent);
  }
  else {
		options.clientX = options.pointerX;
		options.clientY = options.pointerY;
		var oEvent = Object.extend(document.createEventObject(), options);
		$(element).fireEvent('on' + eventName, oEvent);
  }

  if (!Event.mark) {
  	Event.mark = new Element('div', {id: 'cursor_pointer'}).setStyle({
			position: 'absolute',
			width: '5px',
			height: '5px',
			borderTop: '1px solid red',
			borderLeft: '1px solid red'
		})
		$(document.body).insert(Event.mark);
  }
	
	Event.mark.setStyle({
		top: options.pointerY + 'px',
		left: options.pointerX + 'px'
	})

  if (this.step)
		alert('[' + new Date().getTime().toString() + '] ' + eventName + '/' + Test.Unit.inspect(options));
};

// Aliasing Element.simulateMouse(element, eventName) to element._eventName()
(function() {
	$w('click dblclick mousedown mouseup mousemove mouseover mouseout contextmenu').each(function(eventName){
		Element.Methods['_' + eventName] = function(element) {
			element = $(element);
			Event.simulateMouse(element, eventName, arguments[1] || { });
			return element;
		}
	})
	Element.addMethods();
})()

/*
  Method: dragBy
    Experimental (very limited and buggy)
    Simulates dragging of an element by properly calling mousedown, mousemove, mouseup
*/

Element.addMethods({
  dragBy: function(element, distance) {
    var i = 1,
        delta = distance > 0 ? 1 : -1;

    if (distance === 0) return;
    distance = Math.abs(distance);
    
    var interval = window.setInterval(function() {
      if (++i == distance) window.clearInterval(interval);
      element._mousedown()._mousemove()
        ._mousemove({ pointerX: delta, pointerY: delta })._mouseup();
    }, 20);
    return element;
  }
})