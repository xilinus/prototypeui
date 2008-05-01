function runScenario(actions) {
  var delay = 0;
  $('info').update("Running...");                       
  $A(actions).each(function(action, index) {    
    delay += action[1];           
    var next = index +1 < actions.length ? actions[index + 1] : null;
    $('info').update(action[0] + " (delay =  " + action[1] + "s)")
    setTimeout(function() {
      eval(action[0] + "()");
      if (next)
        $('info').update(next[0] + " (delay =  " + next[1] + "s)")
    }, delay*1000);   
  });
} 


function scenarioSuccess() {  
  $('info').update("Success").addClassName("success");  
}

function scenarioFailure() {
  $('info').update("Failed").addClassName("failure");    
}