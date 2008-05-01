class DependenciesResolver
  class CircularDependencyError < RuntimeError; end
  
  def initialize(dependencies)
    @dependencies = dependencies.to_hash
    @stack = [ ]
  end
  
  attr_reader :dependencies
  
  def resolve(*objects)
    deps = [ ]
    
    objects.each do |object|
      ensure_no_circular_dependency!(object)
      
      if dependencies.has_key?(object)
        @stack.push(object)
        deps.concat(resolve(*Array(dependencies[object])))
        @stack.pop
      end
      
      deps.push(object)
    end
    
    deps.compact!
    deps.uniq!
    deps
  end
  
private
  
  def ensure_no_circular_dependency!(object)
    if @stack.member?(object)
      message = "Circular dependency on #{object.inspect}, dependencies stack : #{@stack.inspect}"
      @stack.clear
      raise CircularDependencyError, message
    end
  end
end
