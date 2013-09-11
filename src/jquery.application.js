/* application.js v1.6.1 engauge.com 2013
 * jQuery port 
 */
(function(w, $)
{
    //strict mode
    //http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
    "use strict";
    
    //private vars
    var version = [1,6,1],

    //dict of module objects { key : "module name", value : ""module" }
        _mods     = {},
        
    //dict of module to be loaded on each page { key = "home/index", value = "module name" }
        _pmods    = {},
        
    //mutable array of module.requires to be loaded dynamically for the current page
        _squeue   = [],
    
    //mutable array of modules to be initialized for the current page
        _squeueComplete = [],
        
    //flag to track when all required scripts are loaded   
        _isLoading = false,
    
    //base for generated mod names    
        _guid = Math.floor(Math.random() * 9999),
    
    //dict for handling app notifications, based on Observer pattern
        _observers = {};
        
    //create app object, only if it's not already created
    w.app = w.app || {};

    //all js settings for this application
    w.app.config = {
        version : version.join("."),
        currentPage : null,
        vendorPath  : '/assets/js/vendor/'
    },
    
    /**
     * Loads all the specifed modules for this page
     * @param {String} page
     * @param {Array or String} modules
     */
    w.app.startup = function(page, modules)
    {
        //allow for quick calls:
        // app.startup("global", function() { ... } );
        if( typeof(modules) === "function")
        {
            var name = "mod" + _guid++;
            app.module(name, { init : modules } );
            //set modules variable to the generated name
            modules = [name];
        }
        
        //clean, you can pass an array or string for modules
        if(typeof(modules) === "string") modules = [modules];

        //clean name
        page = page.toLowerCase().replace(/(^\/+|\/+$)/g,"");
        
        //add key for page if it doesn't exist
        _pmods[page] = _pmods[page] || [];
        
        //add modules to the page
        merge(_pmods[page], modules);
        
    };
    
    /**
     * Get/Sets a module
     * @param {String} name
     * @param {Object} obj
     */
    w.app.module = function(name, obj)
    {
        //get
        if( empty(obj) )
            return _mods[name];

        //set
        _mods[name] = obj;
        return obj;
    };
    
    /**
     * Subscribes a module to an app notification, similar to events but global
     * @param {String} name
     * @param {obj} module
     */
    w.app.subscribe = function(name, module)
    {
        //module must have 'handleNotifications' method to be considered an observer
        module.handleNotifications = module.handleNotifications || function(note, data) { };
        
        //add to list of observers for this notification name
        _observers[name] = _observers[name] || [];
        _observers[name].push(module);
    };
    
    /**
     * Unsubscribe a module from an app notification
     * @param {String} name
     * @param {obj} module
     */
    w.app.unsubscribe = function(name, module)
    {
        if( !empty( _observers[name] ) )
            _observers[name].splice($.inArray(module, _observers[name]), 1);
    };
    
    /**
     * Notifies app observers
     * @param {String} name
     * @param {*} data (optional)
     */
    w.app.notify = function(name, data)
    {
        var ob = _observers[name] || [];
        while( ob.length )
            ob.shift().handleNotifications(name, data);
    };


    /********************************
     * Private
     *******************************/
     
    /**
     * Called on Document load to start all modules for this page.
     */
    function initialize()
    {
        //get url and determine what js needs to be run
        app.config.currentPage  = getCurrentPath();

        //add all includes for this page
        var mods = getModulesForPage();
        
        //load all modules for this page
        while(mods.length)
            loadModule( mods.shift() );
    }
    
    /**
     * Loads a module and calls it's init method.
     * @param {String} name
     */
    function loadModule(name)
    {
        var mod = app.module(name);
        
        if( !empty(mod) )
        {
            //console.log("app.loadModule: " + name);
            
            //add requires to internal queue
            merge(_squeue, mod.requires);
            _squeueComplete.push(mod);

            //start loading
            loadNextScript();
        }
        else
        {
            console.log("module not found: " + name);
        }
    }

    function loadNextScript()
    {
        if(_isLoading) return; //ignore
        
        if(_squeue.length)
        {
            //loop until all includes are loaded for page
            _isLoading = true;
            
            //add vendor path and .js ext if needed
            var url = updateScriptUrl( _squeue.shift() );
            
            $.getScript(url, function()
            {
                _isLoading = false;
                loadNextScript();
            });
        }
        else
        {
            //call all init methods for each of the loaded moduals after all requires are loaded
            while( _squeueComplete.length )
            {
                var mod = _squeueComplete.shift();
                if( typeof(mod.init) === 'function' )
                    mod.init();
            }
        }
    }

    function getModulesForPage()
    {
        //add all global mods
        var mods    = merge([], _pmods.global),
            seg     = app.config.currentPage.split('/'),
            path    = "";
        
        //don't load global if "*" in key
        if( !empty(_pmods["*" + seg[0]]) )
        {
            seg[0] = "*" + seg[0];
            mods = [];
        }
        
        //add all controller and view level mods
        for(var i = 0, len = seg.length; i < len; i++)
        {
            path += seg[i];
            merge(mods, _pmods[path]);
            path += "/";
        }
        
        return mods;
    }

    function getCurrentPath()
    {
        //manual override
        if(app.config.currentPage !== null)
            return app.config.currentPage;

        //trim leading and trailing '/'
        var path = w.location.pathname.toLowerCase();
        
        //remove anything after path ( ?... || #... )
        path = path.replace(/[\?#].*$/,'');
        
        //trim leading and trailing '/'
        path = path.replace(/(^\/+|\/+$)/g,"");

        //if no path is provided, use default
        if(path.length === 0)
            path = 'home/index';

        //index is sometimes left off
        if(/\//.test(path) !== true)
            path += "/index";

        return path;
    }

    function updateScriptUrl(url)
    {
        if( /^(http|\/\/)/.test(url) !== true )
        {
            url = app.config.vendorPath + url;

            if( /\.js$/.test(url) !== true )
                url += ".js";
        }
        return url;
    }

    function empty(obj)
    {
        return (typeof(obj) === "undefined" || obj === null);
    }
    
    function merge(a1, a2)
    {
        a1.push.apply(a1, a2 || []);
        return a1;
    }
    
    //add init function to jquery DOM event
    $(document).on('ready', initialize);

}(window, jQuery));

