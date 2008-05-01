if (!Object.isUndefined(window.Effect)) {
  UI.Window.Effects = UI.Window.Effects || {};
  UI.Window.Effects.Morph = Class.create(Effect.Base, {   
    initialize: function(window, bounds) {
      this.window = window;
      var options = Object.extend({
        fromBounds: this.window.getBounds(),
        toBounds:   bounds,
        from:       0,
        to:         1
      }, arguments[2] || { });
      this.start(options);
    },
    
    update: function(position) {
      var t = this.options.fromBounds.top + (this.options.toBounds.top   - this.options.fromBounds.top) * position;
      var l = this.options.fromBounds.left + (this.options.toBounds.left - this.options.fromBounds.left) * position;

      var ow = this.options.fromBounds.width + (this.options.toBounds.width - this.options.fromBounds.width) * position;
      var oh = this.options.fromBounds.height + (this.options.toBounds.height - this.options.fromBounds.height) * position;

      this.window.setBounds({top: t,  left: l, width: ow, height: oh})
    }
  });
} 


