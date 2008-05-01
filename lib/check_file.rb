file = File.expand_path(ARGV.first)

report = File.open(File.basename(file) +  ".html", "w")     
report.puts "<html><head><style>
  body { background-color: #fff; color: #333; }

  body, p, ol, ul, td {
    font-family: verdana, arial, helvetica, sans-serif;
    font-size:   13px;
    line-height: 18px;
  }

  pre {
    background-color: #eee;
    padding: 10px;
    font-size: 11px;
  }

  a { color: #000; }
  a:visited { color: #666; }
  a:hover { color: #fff; background-color:#000; }    
  .line { float:left; width:50px; text-align:right; margin-right: 10px}
</style></head><body>"                       

lines = File.open(file).readlines
lines.each do |l| 
  ## Remove inline comment
  l.gsub!(/\/\/.*$/, "")
  l.strip!
end

comment_block = false                                                                                                                                                             
index = 0    
while (index < lines.length) do
    line = lines[index]
    index += 1
    
    ## Comment block
    if comment_block
       comment_block = false if line =~ /\*\/$/
      next
    end   
    
    if line =~ /^\/\*/
      comment_block = true
      next
    end
    
    ## Correct line
    next if line =~ /;$/    
    
    ## block
    next if line =~ /\{$/ || line =~ /\}\,/
    
    ## Empty line
    next if line.empty? || line =~ /^\}$/
    
    ## some if, while ....
    next if line =~ /^if.*\)$/    
    next if line =~ /^else$/    
    next if line =~ /^while.*\)$/    
      
    ## line with , + ?at the end
    next if line =~ /,$/
    next if line =~ /\+$/
    next if line =~ /\?$/
    next if line =~ /\:$/      
    next if line =~ /\($/      
    
    ## Check line ends with ) and if next line begins by . or ? or : or + or )
    next if (line =~ /\)$/ && lines[index] =~ /^\./)
    next if (lines[index] =~ /^\?/)
    next if (lines[index] =~ /^\:/)
    next if (lines[index] =~ /^\+/)
    next if (lines[index] =~ /^\)/)
    
    ## Check if next lines begins width }
    next if lines[index] =~ /^\}/ 
    
    
    report.puts "<span class='line'>#{index}</span><a href='txmt://open?url=file://#{file}&line=#{index}'> #{line}</a><br/>"
end      
report.puts "</body></html>" 
report.close
system("open  #{File.basename(file) +  ".html"}")
