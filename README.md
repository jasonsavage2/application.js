# [application.js v1.6.1](https://github.com/jasonsavage2/application.js)

A small base script to be used with the Google Closure Compiler for building and compressing modular web applications.

## Setup

* First you will need download the [Google Closure compiler(not the library)](https://developers.google.com/closure/compiler/) 
* You'll have to update the compile_js.rb scripts with the location of the compiler.jar file you downloaded
* You should now be able to compile the application.min.js file.


## Overview

application.js is a very small base script that will serve as the connector for all your application modules. 

A module, in this case, is a small script that runs some kind of behaviour on your web page, for example homeSlideshow.js. 
These scripts will go in a folder named "js/src" and will be compiled into "application.min.js" for production. Along with modules 
you may have third party framework/vendor scripts (or libs), for example jquery.js, cycle.js, swfobject.js, lawnchair.js, etc. 
These scripts will go into a folder named "js/vendor" and are not compressed since they are loaded as needed by your modules. 
It is a good idea to use the compressed version of these scripts to speed up load times.

The compile_js.rb files are used to compress all your modules into one small file (application.min.js) that is loaded on every page of your website. 
Even though it's loaded on every page, since it has the same name and is compressed, 
it ends up being cached by the browser and is much faster than loading a list of *.js files on each page. 


## Folder Structure

```sh
/Website
    /assets
        /js
            /vendor
                - jquery.min.js
                - swfobject.min.js
                - alertify.min.js
                - jquery.selected.min.js
                - cycle.min.js
				
            /src
                - application.js
                - facebookConnect.js
                - homeSlideshow.js
                - init.js
                - modalErrorDialog.js
                - registrationForm.js
				
            - application.min.js
			
        compile_js.rb
```		

	
	
## You're First Module

```js

// - /assets/js/src/homeSlideshow.js :

//scope closer function
(function(app)
{
    // register module with the application
    var module = app.module("homeSlideshow", {
        
        //list all required scripts for this module (optional)
		//NOTE: app.config.vendorPath is used to resolve required vendor paths (default: "/assets/js/vendor")
		//NOTE: ".js" will be auto-appended to any script that is missing an extension
        required : [
            "jquery",
            "alertify"
        ],
        
        //constructor for module (optional)
		// this method is called after all required scripts for the page have loaded, not just this module.
        init : function()
        {
            //scope: this = [this module]
            ...
        }
        
        //public function
		// other modules can access this method by:
		// app.module("homeSlideshow").play();
        play : function()
        {
            ...
        }
        
    });
    
    //private function
    function updateDisplay()
    {
        //scope: this = window 
        //(use updateDisplay.apply(this) to pass module scope to function)
        ...
    }

})(app);

```



## How do I run these things?

"init.js" is the recommended script name to list all the module startup commands for each page.

```js

// - /assets/js/src/init.js :

//scope closer function
(function(app)
{
	//NOTE: application.js will run all startup modules at document onload

	//global is a reserved path meaning "start this module on all pages of my site"
    app.startup("global", [
		"facebookConnect"
	]);
	
	//the slideshow is only on the homepage (www.example.com/home or www.example.com)
	app.startup("/home", [
		"homeSlideshow"
		...
	]);
	
	//we have a registration form but we only need the validation on the form page, 
	//not success/thankyou or error pages. (www.example.com/register/index not 
	//www.example.com/register/thanks)
	app.startup("/register/index", [
		"registrationForm",
		"modalErrorDialog"
		...
	]);
	
	//the admin area doesn't need the global javascript so we can use "*" to block global script
	app.startup("*admin", [
		"adminPagesScript"
	]);
	
})(app);

```


## Advanced

application.js also includes support for sending notifications to modules. 
Think of notifications as events but global, which is a little more loosely connected approach then
getting a module directly.

```js


//create a module
app.module("simpleModual", {
	
	init : function()
	{
		//Instead of 
		app.module("simpleModual").create("Hello, World") )
		
		//try:
	
		//subscribe to a notification
		app.subscribe("createAlert", this);
	}
	
	//to be considered a observer of a notification you have to implement:
	handleNotification : function(name, data)
	{
		//since we are only subscribed to one notification we don't really need an if statement.
		//This is only needed if we are subscribed to multiple notification.
		if( name === "createAlert" )
		{
			//create message and send back
			var alert = this.create("Hello, World");
			app.notify("createAlertComplete", alert);
		}
	}
	
});


```


## jQuery port

If your site is already using jQuery globally, then you can use jquery.application.js which is made even smaller by using some built in jquery methods.






