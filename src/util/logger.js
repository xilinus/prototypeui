/*
Class: UI.Logger
*/

/*
  Group: Logging Facilities
    Prototype UI provides a facility to log message with levels.
    Levels are in order "debug", "info", "warn" and "error".
    
    As soon as the DOM is loaded, a default logger is present in UI.logger.
    
    This logger is :
    * an <ElementLogger> if $('log') is present
    * a <ConsoleLogger> if window.console is defined
    * a <MemLogger> otherwise
    
    See <AbstractLogger> to learn how to use it.
    
    Example:
    
    > UI.logger.warn('something bad happenned !');
*/

// Class: AbstractLogger

UI.Abstract.Logger = Class.create({
  /*
    Property: level
      The log level, default value is debug  <br/>
  */
  level: 'debug'
});

(function() {
  /*
    Method: debug
      Logs with "debug" level

    Method: info
      Logs with "info" level

    Method: warn
      Logs with "warn" level

    Method: error
      Logs with "error" level
  */
  var levels = $w(" debug info warn error ");
  
  levels.each(function(level, index) {
    UI.Abstract.Logger.addMethod(level, function(message) {
      // filter lower level messages
      if (index >= levels.indexOf(this.level))
        this._log({ level: level, message: message, date: new Date() });
    });
  });
})();

/*
  Class: NullLogger
    Does nothing
*/
UI.NullLogger = Class.create(UI.Abstract.Logger, {
  _log: Prototype.emptyFunction
});

/*
  Class: MemLogger
    Logs in memory
    
    Property: logs
      An array of logs, objects with "date", "level", and "message" properties
*/
UI.MemLogger = Class.create(UI.Abstract.Logger, {
  initialize: function() {
    this.logs = [ ];
  },
  
  _log: function(log) {
    this.logs.push(log);
  }
});

/*
  Class: ConsoleLogger
    Logs using window.console
*/
UI.ConsoleLogger = Class.create(UI.Abstract.Logger, {
  _log: function(log) {
    console[log.level](log.message);
  }
});

/*
  Class: ElementLogger
    Logs in a DOM element
*/
UI.ElementLogger = Class.create(UI.Abstract.Logger, {
  /* 
    Method: initialize
      Constructor, takes a DOM element to log into as argument
  */
  initialize: function(element) {
    this.element = $(element);
  },
  
  /*
    Property: format
      A format string, will be interpolated with "date", "level" and "message"
      
      Example:
        > "<p>(#{date}) #{level}: #{message}</p>"
  */
  format: '<p>(<span class="date">#{date}</span>) ' + 
              '<span class="level">#{level}</span> : ' +
              '<span class="message">#{message}</span></p>',
  
  _log: function(log) {
    var entry = this.format.interpolate({
      level:   log.level.toUpperCase(),
      message: log.message.escapeHTML(),
      date:    log.date.toLocaleTimeString()
    });
    this.element.insert({ top: entry });
  }
});

document.whenReady(function() {
  if ($('log'))             UI.logger = new UI.ElementLogger('log');
  else if (window.console)  UI.logger = new UI.ConsoleLogger();
  else                      UI.logger = new UI.MemLogger();
});