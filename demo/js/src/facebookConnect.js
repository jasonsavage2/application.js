/*
 * Module : FacebookConnect.js
 *
 * Setups up the basic code to connect to the facebook JS api.
 *
 * Requires Config:
 * - app.config.facebook.appId
 */

(function(app)
{
    var module = app.module("facebookConnect", {
        requires : [
            "jquery-1.9.1.min"
        ],

        init : function()
        {
            this.is_loaded = false;

            //loading facebook all.js after we've added the fb-root div to avoid fb warning
            $('body').prepend('<div id="fb-root"></div>');

            app.getScript("//connect.facebook.net/en_US/all.js");
        },

        scrollTop : function()
        {
            if( this.is_loaded )
                FB.Canvas.scrollTo(0, 0);
        }
    });

    //add listener to window object
    window.fbAsyncInit = function ()
    {
        module.is_loaded = true;

        // init the FB JS SDK
        FB.init({
            appId      : app.config.facebook.appId,
            status     : true, // check the login status upon init?
            cookie     : true, // set sessions cookies to allow your server to access the session?
            xfbml      : false  // parse XFBML tags on this page?
        });

        // Grow the canvas to the correct size
        FB.Canvas.scrollTo(0, 0);
        FB.Canvas.setSize({ height: $('body').height()-100});
        setTimeout("FB.Canvas.setAutoGrow()", 500);

        //dispact event
        $(document).trigger('facebookConnected');

        //fix scroll bars
        if (self !== top)
        {
            $("body").css("overflow", "hidden");
        }
    };

}(app));

