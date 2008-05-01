var _debugMode_ = false;           

function toggleDebugCss() {   
  _debugMode_ = ! _debugMode_;
  UI.defaultWM.windows().each(function(w) {
    w.element[_debugMode_ ? "addClassName" : "removeClassName"]("debug")
  });
}

function insertDebugControl() {
  var control = new Element("div", {style: "position: absolute; top:3px; right: 5px"});
  control.insert(new Element("a", {href: "#", onclick: "toggleDebugCss(); return false;"}).update("Toggle Debug Mode"));
  document.body.appendChild(control);
}