
# compiles all js from the assets/js/src folder into application.min.js

puts 'Closure compiling all javascript source files...';


## ----------- config ------------- ##

closure		= 'C:\\closure-compiler\\compiler.jar'

js_dir		= './js/'
vendor_dir	= './js/vendor'
src_dir		= './js/src'

## -------------------------------- ##


puts 'minifying all vendor src code';

# compile all vendor src code
Dir.glob(File.join(vendor_dir, "*.js")).each do |f|
  
  unless f.include? '.min.js'
    
    name = File.basename f
    new_name = name.gsub(/.js/, '.min.js');
  
    cmd = "java -jar #{closure} --js #{vendor_dir}/#{name} --js_output_file #{vendor_dir}/#{new_name}";
    IO.popen(cmd);
    
  end
  
end;

puts 'compiling all src javascript into application.min.js';

#re-order if application.js and/or init.js are present
files_arr = Dir.glob(File.join(src_dir, "*.js"));

files_arr.sort! do |file_a, file_b|
  
  name_a = File.basename(file_a)
  name_b = File.basename(file_b)

  if name_a == "application.js" || name_b == "init.js" then
    -1
  elsif name_a == "init.js" || name_b == "application.js" then
    +1
  else
    0
  end
end

# compile all application src code
cmd = "java -jar #{closure} --js " + files_arr.join(" ") + " --js_output_file #{js_dir}application.min.js";
IO.popen(cmd);

  
#success message and show script tag
puts 'success!';
