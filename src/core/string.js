/*
Interface: String

*/

Object.extend(String.prototype, {
  camelcase: function() {
    var string = this.dasherize().camelize();
    return string.charAt(0).toUpperCase() + string.slice(1);
  },
  
  /*
    Method: makeElement 
      toElement is unfortunately already taken :/
      
      Transforms html string into an extended element or null (when failed)
      
      > '<li><a href="#">some text</a></li>'.makeElement(); // => LI href#
      > '<img src="foo" id="bar" /><img src="bar" id="bar" />'.makeElement(); // => IMG#foo (first one)
      
    Returns:
      Extended element
      
  */
  makeElement: function() {
    var wrapper = new Element('div'); wrapper.innerHTML = this;
    return wrapper.down();
  }
});