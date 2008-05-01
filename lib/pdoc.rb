DIR = File.dirname(__FILE__)
PDOC_DIR = File.expand_path(File.join(DIR, "pdoc", "lib"))

OUTPUT_DIR    = File.expand_path(File.join(DIR,      "..",    "pdoc"))
TEMPLATES_DIR = File.expand_path(File.join(DIR,      "pdoc_template"))
PARSER_DIR    = File.expand_path(File.join(PDOC_DIR, "pdoc",  "parser"))
VENDOR_DIR    = File.expand_path(File.join(PDOC_DIR, "..",    "vendor"))

[PDOC_DIR, VENDOR_DIR, PARSER_DIR, OUTPUT_DIR, TEMPLATES_DIR].each do |c|
  $:.unshift File.expand_path(c)
end
    
PUI_DOC_VERSION = `svnversion`
require 'erb' 
require File.expand_path(File.join(PDOC_DIR, "pdoc", "generators"))
require File.expand_path(File.join(PDOC_DIR, "pdoc", "parser"))
