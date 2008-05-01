Object.extend(Array.prototype, {
  /**
   * Array#isEmpty() -> Boolean
   * Convenient method to check wether or not array is empty
   * returns: true if array is empty, false otherwise
   **/
  isEmpty: function() {
    return !this.length;
  },
  
  /**
   * Array#at(index) -> Object
   * Returns the element at the given index or undefined if index is out of range.
   * A negative index counts from the end.
   **/
  at: function(index) { 
    return this[index < 0 ? this.length + index : index]; 
  },
  
  /**
   * Array#removeAt(index) -> Object | undefined
   * Deletes item at the given index, which may be negative
   * returns: deleted item or undefined if index is out of range
   **/
  removeAt: function(index) {
    if (-index > this.length) return;
    return this.splice(index, 1)[0];
  },
  
  /**
   * Array#removeIf(iterator[, context]) -> Array
   * Deletes items for which iterator returns a truthy value, bound to optional context
   * returns: array of items deleted
   **/
  removeIf: function(iterator, context) {
    for (var i = this.length - 1, objects = [ ]; i >= 0; i--)
      if (iterator.call(context, this[i], i))
        objects.push(this.removeAt(i));
    return objects.reverse();
  },
  
  /**
   * Array#remove(object) -> Number
   * Deletes items that are identical to given object
   * returns: number of items deleted
   **/
  remove: function(object) {
    return this.removeIf(function(member) { return member === object }).length;
  },
  
  /**
   * Array#insert(index, object[, ...])
   * Inserts the given objects before the element with the given index (which may be negative)
   * returns: this
   **/
  insert: function(index) {
    if (index > this.length)
      this.length = index;
    else if (index < 0)
      index = this.length + index + 1;
      
    this.splice.apply(this, [ index, 0 ].concat($A(arguments).slice(1)));
    return this;
  }
});

// backward compatibility
Array.prototype.empty = Array.prototype.isEmpty;
