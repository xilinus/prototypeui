require 'rake'
require 'rake/packagetask'
require 'rbconfig'

PUI_NAME    = 'prototype-ui'
PUI_VERSION = 'trunk'

PUI_DEPENDENCIES = {  
  :core          => nil,
  :window        => [ :"util/iframe_shim.js", :"util/drag.js", :shadow ],
  :carousel      => nil, 
  :dock          => nil, 
  :shadow        => :util,
  :util          => nil,
  :context_menu  => [ :shadow, :"util/iframe_shim.js"],
  :auto_complete => [ :shadow, :"util/iframe_shim.js"],
  :calendar      => :"util/date.js"
}

PUI_COMPONENTS = PUI_DEPENDENCIES.keys

PUI_ROOT      = File.expand_path(File.dirname(__FILE__))
PUI_SRC_DIR   = File.join(PUI_ROOT, 'src')
PUI_DIST_DIR  = File.join(PUI_ROOT, 'dist')
PUI_DIST_FILE = File.join(PUI_DIST_DIR, "#{PUI_NAME}.js")
PUI_DIST_FILE_PACKED = 
                File.join(PUI_DIST_DIR, "#{PUI_NAME}.packed.js")

PUI_PKG_DIR   = File.join(PUI_ROOT, 'pkg')
PUI_LIB_DIR   = File.join(PUI_ROOT, 'lib')
PUI_DOC_DIR   = File.join(PUI_ROOT, 'doc')

$:.unshift File.join(PUI_ROOT, 'lib')
$:.unshift File.join(PUI_ROOT, 'lib', 'coderay', 'lib')

def windows?
  Config::CONFIG['host'].include?('mswin')
end

NATURAL_DOCS  = File.join(PUI_LIB_DIR, 'naturaldocs', "NaturalDocs")
NATURAL_DOCS << '.bat' if windows?

task :default => [ :dist, :"dist:compress", :doc ]

desc "Generates dist/prototype-ui.js with either all components or COMPONENTS"
task :dist do
  require 'distrib'
  FileUtils.mkdir_p PUI_DIST_DIR
  components = ENV['COMPONENTS'] ? ENV['COMPONENTS'].split(',').collect { |c| c.strip } : PUI_COMPONENTS
  
  Distrib.new(*components).write
end

namespace :dist do
  desc "Generate dist/[component].js with each component and its dependencies"
  task :each_component do
    require 'distrib'
    
    PUI_COMPONENTS.each do |component|
      Distrib.new(component).write(File.join(PUI_DIST_DIR, "#{component}.js"))
    end
  end
  
  desc "Preferred name for dist:each_component"
  task :each => :each_component
  
  desc "Compress all JS in dist directory with PackR"
  task :compress => [:dist, :each] do
    require 'packr/packr'
    FileUtils.rm_f Dir["#{PUI_DIST_DIR}/*.packed.js"]
    
    Dir["#{PUI_DIST_DIR}/*.js"].each do |file|                                              
      packed_file = file.gsub(".js", ".packed.js")
      open(packed_file, 'w') do |packed|
        packed << Packr.new.pack(File.read(file), :base62 => true, :shrink_vars => true)
      end                                      
    end
  end  
end

Rake::PackageTask.new(PUI_NAME, PUI_VERSION) do |package|
  package.need_tar_gz = true
  package.package_dir = PUI_PKG_DIR
  package.package_files.include(
    '[A-Z]*',
    'dist/*',
    'doc/**',
    'lib/**',
    'src/**',
    'test/**',
    'themes/**'
  )
end

task :test => [ "dist:each_component", :test_units ]

require 'test/lib/jstest'

desc "Runs all the JavaScript unit tests and collects the results"
JavaScriptTestTask.new(:test_units) do |t|
  testcases        = ENV['TESTCASES']
  tests_to_run     = ENV['TESTS']    && ENV['TESTS'].split(',')
  browsers_to_test = ENV['BROWSERS'] && ENV['BROWSERS'].split(',')
  
  t.mount("/lib")
  t.mount("/dist")
  t.mount("/src")
  t.mount("/test")
  
  Dir["test/unit/*_test.html"].sort.each do |test_file|
    tests = testcases ? { :url => "/#{test_file}", :testcases => testcases } : "/#{test_file}"
    test_filename = test_file[/.*\/(.+?)\.html/, 1]
    t.run(tests) unless tests_to_run && !tests_to_run.include?(test_filename)
  end
  
  %w( safari firefox ie konqueror opera ).each do |browser|
    t.browser(browser.to_sym) unless browsers_to_test && !browsers_to_test.include?(browser)
  end
end
     

desc "Create HTML documentation using NaturalDocs"
task :doc do
  require 'rubygems'
  require 'hpricot'
  require 'coderay'
  require 'cgi'
  
  def add_syntax_highlight(doc_files_dir)    
    Dir.glob(File.join(doc_files_dir, '**', '*.html')).each do |fn|
      doc = Hpricot(File.read(fn))
      
      doc.search('.CCode').each do |node|
        source = CGI.unescapeHTML(node.innerHTML.gsub('<br />', "\n"))
        node.innerHTML = CodeRay.scan(source, :javascript).html
      end
      
      File.open(fn, 'w') { |f| f << doc }
    end
  end
  
  doc_dir = File.expand_path(ENV['PUI_DOC_DIR'] || PUI_DOC_DIR)
  mkdir_p(doc_dir)
  
  chdir(doc_dir) do 
    `#{doc_dir}/config/set_version.sh` if File.exists?("#{doc_dir}/config/set_version.sh")
    
    src = File.directory?("#{doc_dir}/src") ? "#{doc_dir}/src" : PUI_SRC_DIR
    `#{NATURAL_DOCS} -r -i #{src} -o HTML . -p #{doc_dir}/config -cs 'UTF-8' -s 'Default ../styles/prototype-ui ../styles/syntax'`      
    ## Update revision in doc
    add_syntax_highlight(doc_dir)
  end           
end         
 