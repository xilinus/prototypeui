Element.addMethods({
  center: function( container, element ) {
    element = $(element);
    container = $(container);
    var cBorders = container.borderDimensions(), eBorders = element.borderDimensions();
    var height = container.getHeight()-(cBorders.top + cBorders.bottom);
    var width = container.getWidth()-(cBorders.left + cBorders.right);
    
    var setX = ((width-element.getWidth()-(eBorders.left + eBorders.right))/2);
    var setY = ((height-element.getHeight()-(eBorders.top + eBorders.bottom))/2);

    setX = (setX < 0) ? 0 : setX;
    setY = (setY < 0) ? 0 : setY;
    container.relativize();
    
    return element.setStyle({ top: setY + 'px', left: setX + 'px' });
  },
  
  borderDimensions: function( element ) {
    return $w('top bottom left right').inject({}, function(dims, key) {
      dims[key] = parseFloat(element.getStyle('border-' + key + '-width') || 0);
      return dims;
    });
  }
});

/*
  Class: UI.Calendar
  
  Author: Minho Kim
*/
UI.Calendar = Class.create(UI.Options, {
  options: {
    theme: 'mac_os_x',
    format: '%m/%d/%Y',
    startWeekday: 0,
    startDate: new Date()
  },

  initialize: function(element, options) {    
    this.setOptions(options);

    this.element = $(element); 
    this.element.identify();
    
    this.container = new Element('div').addClassName('ui_calendar_container');
    this.container.setStyle({ position: 'relative' });
    this.element.addClassName(this.options.theme).insert({ top: this.container });
                  
    this.initDate(this.options.startDate);
    this.buildTable();
    this.buildSelector();
    this.update(this.date);
  },
  
  // Group: Event handling

  /*
    Method: fire
      Fires a calendar custom event automatically namespaced in "calendar:" (see Prototype custom events).
      The memo object contains a "calendar" property referring to the calendar.

    Parameters:
      eventName - an event name
      memo      - a memo object

    Returns:
      fired event
  */
  fire: function(eventName, memo) {
    memo = memo || { };
    memo.calendar = this;    
    return this.element.fire('calendar:' + eventName, memo);
  },

  /*
    Method: observe
      Observe a calendar event with a handler function automatically bound to the calendar

    Parameters:
      eventName - an event name
      handler   - a handler function

    Returns:
      this
  */  
  observe: function(eventName, handler) { 
    this.element.observe('calendar:' + eventName, handler.bind(this));
    return this;
  },

  /*
    Method: stopObserving
      Unregisters a calendar event, it must take the same parameters as this.observe (see Prototype stopObserving).

    Parameters:
      eventName - an event name
      handler   - a handler function

    Returns:
      this
  */
  stopObserving: function(eventName, handler) {
	  this.element.stopObserving('calendar:' + eventName, handler);
	  return this;
  },

  generateId: function(name) {
    return this.element.id + name;
  },
  
  initDate: function(date) {
    this.date = this.convertDate(date);
  },

  convertDate: function(date) {
    if (!date) return null;
    return Object.isString(date) ? Date.parseString(date, this.options.format) : date;
  },

  update: function(newDate) {
    this.updateDaysRow();
    this.date = newDate;
    var today = new Date();
    this.headerSpan.innerHTML = UI.Calendar.Options.MONTHS[this.date.getMonth()] + ' ' + this.date.getFullYear();

    var days = $R(this.startDay(this.date), this.lastDay(this.date));
    if (days.size() < 42) {
      days = $R(this.startDay(this.date), this.lastDay(this.date).addDays(42 - days.size()));
    }
    days = $A(days);

    var day, cell, classNames, monthDate, index, l;
    for (index = 0, l = days.length; index < l; ++index) {
      day = days[index];
      cell = this.cells[index];
      classNames = [];
      cell.date = day;

      monthDate = day.getDate();
      
      if (day.getMonth() != this.date.getMonth()) {
        classNames.push('non_current');
        cell.innerHTML = monthDate;
      } else {
        cell.innerHTML = '<a href="#">' + monthDate + '</a>';
        if (this.selectedDay && this.selectedDay.equalsDate(day)) classNames.push('selected');
      }
      if (today.equalsDate(day)) classNames.push('today');      
      if (cell.hasClassName('weekend')) classNames.push('weekend');
      if (cell.hasClassName('first')) classNames.push('first');
      if (cell.hasClassName('last')) classNames.push('last');

      cell.className = classNames.join(' ');
    }
  },
  
  updateDaysRow: function() {
    var dayNames = this.dayNames();
    this.daysRow.update('');
    $R(0, 6).each(function(n){
      this.daysRow.insert({ 
        bottom: new Element('th', {'class': 'dayname'}).update(dayNames[n].truncate(2,''))
      });
    }.bind(this));
  },

  onCellClick: function(event) {  
    event.stop();
    var element = event.element();
    if (element.tagName == 'A') element = element.up('td');
    if (element.hasClassName('non_current')) return;
    var day = element.date;
    this.selectedDay = day;
    
    $w('selected selected_next selected_prev').each(function(e){ this.table.select('.'+e).invoke('removeClassName', e); }.bind(this));
    
    element.addClassName('selected');
    var next = element.next(), prev = element.previous();
    if (next) next.addClassName('selected_next');
    if (prev) prev.addClassName('selected_prev');

    this.fire('click', { 
      date: day, 
      formattedDate: day.strftime(this.options.format) 
    });
  },

  onMonthClick: function(event) {
    event.stop();
    this.selector.setStyle({ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      'float': 'left', 
      zIndex: 3 
    });
    this._showSelector();
  },

  _showMask: function() {
    // Stupid hack because IE browsers do not support css width/height: 100% sometimes
    if (Prototype.Browser.IE) {
      var borderDimensions = this.container.borderDimensions();
      if (!this.containerWidth) {
        this.containerWidth = this.container.getWidth()-(borderDimensions.left + borderDimensions.right);
      }      
      if (!this.containerHeight) {
        this.containerHeight = this.container.getHeight()-(borderDimensions.top + borderDimensions.bottom);
      }
      this.mask.setStyle({
        width  : this.containerWidth + 'px',
        height : this.containerHeight + 'px'
      });
    }
    this.mask.show();
  },
  
  _hideSelector: function() {
    this.mask.hide();
    this.selector.hide();
  },
  
  _showSelector: function() {
    this.container.center(this.selector);
    this._showMask();
    this.selector.show();
  },

  buildTable: function() {
    this.table = new Element('table').addClassName('ui_calendar');
    this.table.setStyle({ position: 'relative' });
    
    this.buildHeader(this.date);

    var tbody = new Element('tbody');

    $R(1, 42).inGroupsOf(7).each(function(week, index) {
      var row = new Element('tr');
      week.each(function(day, i){
        var cell = new Element('td');
        if (i == 0 || i == 6) cell.addClassName('weekend');
        if (i == 0) cell.addClassName('first');
        if (i == 6) cell.addClassName('last');
        row.insert({ bottom: cell});
      });
      tbody.insert({ bottom: row });
    }.bind(this));

    this.cells = tbody.select('td');
    this.cells.invoke('observe', 'click', this.onCellClick.bind(this));
    this.table.insert({ bottom: tbody });
    this.container.insert({ top: this.table });
  },

  buildSelector: function() {
    this.selector = new Element('div').addClassName('selector').hide();
    
    this.mask = new Element('div').hide().addClassName('ui_calendar_mask').setOpacity(0.3);
    
    this.container.insert({ bottom: this.selector })
                  .insert({ bottom: this.mask });
    
    this.selector.insert({ 
      top: new Element('label', {
        'for': this.generateId('_select')
      }).update(UI.Calendar.Options.LABEL_MONTH)
    });
    
    var select = new Element('select');
    for (var i = 0; i < 12; i++) {
      select.insert({ bottom: new Element('option', { value: i }).update(UI.Calendar.Options.MONTHS[i]) });
    }
    
    this.selector.insert({ 
      bottom: select 
    }).insert({ 
      bottom: new Element('label', {
        'for' :  this.generateId('_input')
      }).update(UI.Calendar.Options.LABEL_YEAR)
    });

    var input = new Element('input', { 
      type: 'text', 
      size: 4, maxLength: 4, 
      value: this.date.getFullYear() 
    });
    
    this.selector.insert({ bottom: input });
    
    var createButton = function(name, onClick) {
      return new Element('span').addClassName('ui_calendar_button')
                                .insert({ top: new Element('button', {type: 'button'}).update(name)
                                                                                      .observe('click', onClick.bind(this)) });
    };
    
    var btnCn = createButton('Cancel', function(e) { 
      this._hideSelector(); 
    }.bind(this));
    
    var btnOk = createButton('OK', function(e) {
      this._hideSelector();
      this.update(new Date(input.value, select.value, 1));
    }.bind(this));
    
    this.selector.insert({ 
      bottom: new Element('div', { 
        textAlign: 'center', 
        width: '100%'
      }).addClassName('ui_calendar_button_div')
        .insert({ bottom: btnCn })
        .insert({ bottom: btnOk })
    });
  },

  buildHeader: function(date) {
    var header = new Element('thead');
    this.daysRow = new Element('tr', { 
      id: this.generateId('_days_row') 
    });

    var initMonthLink = function(link, direction, self) {
      link
        .observe('click', function(e) {
          e.stop();
          self[direction+'Month'].call(self);
        })
        .observe('mousedown', function(e) {
          var p = new PeriodicalExecuter(function(pe){ 
            self[direction+'Month'].call(self); 
          }, .25);
          document.observe('mouseup', function(e){ p.stop(); });
        });
    };

    $w('prev next').each(function(d){
      this[d + 'Link'] = new Element('a').addClassName(d);
      initMonthLink(this[d + 'Link'], d, this);
    }.bind(this));

    this.headerSpan = new Element('a', {
      href: '#'
    }).update(UI.Calendar.Options.MONTHS[date.getMonth()] + ' ' + date.getFullYear()).observe('click', this.onMonthClick.bind(this));

    var headerDiv = new Element('div').addClassName('header')
                                      .insert({ bottom: this.prevLink })
                                      .insert({ bottom: this.headerSpan })
                                      .insert({ bottom: this.nextLink });
      
    this.updateDaysRow();

    header.insert({ bottom: new Element('tr').insert({ top: new Element('th', {colspan: 7}).update(headerDiv).addClassName('monthname') }) })
          .insert({ bottom: this.daysRow });

    this.table.insert({ top: header });
  },

  nextMonth: function() {
    this.date.setMonth(this.date.getMonth() + 1);
    this.update(this.date);
  },

  prevMonth: function() {
    this.date.setMonth(this.date.getMonth() - 1);
    this.update(this.date);
  },

  startDay: function(date) {
    var startDate = date.firstOfMonth();
  	startDate.setDate(-(startDate.getDay() % 7));
  	startDate.setDate(startDate.getDate() + 1 + parseInt(this.options.startWeekday));
    return startDate;
  },

  lastDay: function(date) {
    var endDate = date.endOfMonth();
  	endDate.setDate(endDate.getDate() + 6 - (endDate.getDay() % 7));
    return endDate;
  },
  
  dayNames: function() {
    var days = UI.Calendar.Options.WEEKDAYS.slice(this.options.startWeekday);
    for (var i = 0; i < this.options.startWeekday; i++) days.push(UI.Calendar.Options.WEEKDAYS[i]);
    return days;
  },
  
  setStartWeekday: function(start) {
    this.options.startWeekday = start;
    this.update(this.date);
  }
});

UI.Calendar.Options = {
	MONTHS_SHORT: $w('Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'),
	MONTHS: $w('January February March April May June July August September October November December'),
	WEEKDAYS_1CHAR: $w('S M T W T F S'),
	WEEKDAYS_SHORT: $w('Su Mo Tu We Th Fr Sa'),
	WEEKDAYS_MEDIUM: $w('Sun Mon Tue Wed Thu Fri Sat'),
	WEEKDAYS: $w('Sunday Monday Tuesday Wednesday Thursday Friday Saturday'),
	
	FORMAT_DATE: '%m/%d/%Y',
	FORMAT_TIME: '%H:%M:%S',
	FORMAT_DATETIME: '%x %X',
	
	LABEL_MONTH: "Month",
	LABEL_YEAR: "Year"
};