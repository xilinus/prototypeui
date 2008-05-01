/*
  Interface: Date
  author: Minho Kim
*/
Object.extend(Date.prototype, {
  addDays: function(days) {
    return new Date(this.getFullYear(), this.getMonth(), this.getDate() + days, this.getHours(), this.getMinutes(), this.getSeconds(), this.getMilliseconds());
  },

  succ: function() {
    return this.addDays(1);
  },

  firstOfMonth: function() {
    return new Date(this.getFullYear(), this.getMonth(), 1);
  },

  endOfMonth: function() {
    return new Date(this.getFullYear(), this.getMonth() + 1, 0);
  },

  getDayOfYear: function() {
    return Math.ceil((this - new Date(this.getFullYear(), 0, 1)) / 86400000);
  },

  strftime: function(grammar) {
    var parts = { }, i18n = Date.default_i18n;
    var lambda = function(date, part) {
      switch (part) {
      // date
        case 'a': return i18n.WEEKDAYS_MEDIUM[date.getDay()];
        case 'A': return i18n.WEEKDAYS[date.getDay()];
        case 'b':
        case 'h': return i18n.MONTHS_SHORT[date.getMonth()];
        case 'B': return i18n.MONTHS[date.getMonth()];
        case 'C': return Math.floor(date.getFullYear() / 100);
        case 'd': return date.getDate().toPaddedString(2);
        case 'e': return date.getDate();
        case 'j': return date.getDayOfYear();
        case 'm': return (date.getMonth()+1).toPaddedString(2);
        case 'u': return date.getDay() || 7;
        case 'w': return date.getDay();
        case 'y': return date.getFullYear().toString().substring(2);
        case 'Y': return date.getFullYear();

        // time
        case 'H': return date.getHours().toPaddedString(2);
        case 'I': return (date.getHours() % 12).toPaddedString(2);
        case 'M': return date.getMinutes().toPaddedString(2);
        case 'p': return date.getHours() < 12 ? 'am' : 'pm';
        case 'S': return date.getSeconds().toPaddedString(2);

        // static
        case 'n': return '\n';
        case 't': return '\t';

        // combined
        case 'D': return date.strftime('%m/%d/%y');
        case 'r': return date.strftime('%I:%M:%S %p'); // time in a.m. and p.m. notation
        case 'R': return date.strftime('%H:%M:%S'); // time in 24 hour notation
        case 'T': return date.strftime('%H:%M:%S'); // current time, equal to %H:%M:%S

        // locale
        case 'c': return date.strftime(i18n.FORMAT_DATETIME);
        case 'x': return date.strftime(i18n.FORMAT_DATE);
        case 'X': return date.strftime(i18n.FORMAT_TIME);
      }
    };
    grammar.scan(/\w+/, function(e){
      var part = e.first();
      parts[part] = lambda(this, part);
    }.bind(this));
    return grammar.interpolate(parts, Date.STRFT_GRAMMER);
  },

  equalsDate: function(other) {
    return (this.getMonth() == other.getMonth() && this.getDate() == other.getDate() && this.getFullYear() == other.getFullYear());
  }
});

Object.extend(Date, {
  STRFT_GRAMMER : /(^|.|\r|\n)(\%(\w+))/,

  default_i18n: {
    MONTHS_SHORT: $w('Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'),
    MONTHS: $w('January February March April May June July August September October November December'),
    WEEKDAYS_MEDIUM: $w('Sun Mon Tue Wed Thu Fri Sat'),
    WEEKDAYS: $w('Sunday Monday Tuesday Wednesday Thursday Friday Saturday'),
    FORMAT_DATE: '%m/%d/%Y',
    FORMAT_TIME: '%H:%M:%S',
    FORMAT_DATETIME: '%x %X'
  },

  parseString: function(dateString, format) {
    var date = new Date(), i18n = Date.default_i18n;

    format=format.replace('%D','%m/%d/%y');
    format=format.replace('%T','%H:%M:%S').replace('%r','%I:%M:%S %p').replace('%R','%H:%M:%S');
    format=format.replace('%c',i18n.FORMAT_DATETIME).replace('%x',i18n.FORMAT_DATE).replace('%X',i18n.FORMAT_TIME);

    var tokens = format.match(/%./g);

    // the regex /\W+/ does not work for utf8 chars
    dateString.split(/[^A-Za-z0-9\u00A1-\uFFFF]+/).each(function(e, i) {
      switch (tokens[i]) {
        case '%a':
        case '%A':
        case '%u':
        case '%w': break;

        case '%b':
        case '%h': date.setMonth(i18n.MONTHS_SHORT.indexOf(e)); break;
        case '%B': date.setMonth(i18n.MONTHS.indexOf(e)); break;
        case '%C': break; //century
        case '%d':
        case '%e': date.setDate(parseInt(e,10)); break;
        case '%j': break; // day of year
        case '%m': date.setMonth(parseInt(e,10)-1); break;
        case '%w': date.setDay(parseInt(e,10)); break;
        case '%y':
          var year = parseInt(e,10);
          if (year<50)  year+=2000;
          if (year<100) year+=1900;
          date.setYear(year);
          break;
        case '%Y': date.setFullYear(parseInt(e,10)); break;

        // time
        case '%H': date.setHours(parseInt(e,10)); break;
        case '%I': date.setHours(parseInt(e,10)); break;
        case '%M': date.setMinutes(parseInt(e,10)); break;
        case '%p': if(e=='pm') date.setHours(date.getHours()+12); break;
        case '%S': date.setSeconds(parseInt(e,10)); break;
      }
    });
    return date;
  }
});