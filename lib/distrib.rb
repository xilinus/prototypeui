require 'protodoc'
require 'dependencies_resolver'

class Distrib
  TemplateName = 'distrib.js.erb'
  Resolver = DependenciesResolver.new(PUI_DEPENDENCIES)
  
  def initialize(*components)
    components = PUI_COMPONENTS if components.empty?
    @components = components.collect { |c| c.to_sym }
  end
  
  def write(filename = PUI_DIST_FILE)
    open(filename, 'w') do |f|
      dependencies = Resolver.resolve(*@components)
      dependencies.delete(:core)
      dependencies.unshift(:core)
      dependencies.each do |component|
        f << preprocess(component) << "\n"
      end
    end
  end
  
  def preprocess(component)
    component_path = File.join(PUI_SRC_DIR, component.to_s)
    
    if File.directory?(component_path)
      Dir.chdir(component_path) do
        if File.exist?(TemplateName)
          Protodoc::Preprocessor.new(TemplateName).to_s
        else
          File.read("#{component}.js")
        end
      end
    elsif File.exist?(component_path)
      File.read(component_path)     
    else
      ""
    end
  end
end