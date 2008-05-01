UI.Benchmark = {
  benchmark: function(lambda, iterations) {
    var date = new Date();
    (iterations || 1).times(lambda);
    return (new Date() - date) / 1000;
  }
};

