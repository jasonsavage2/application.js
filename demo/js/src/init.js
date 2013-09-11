
(function(app)
{
    //admin - * ignores global scripts
    app.startup('*admin', [
        'adminPages'
    ]);

	//global
	app.startup('global', [
        'facebookConnect'
	]);

    //home
    //home/index
    app.startup('home/index', [
        'homeSlideshow'
    ]);

	//register
    //register/index
	app.startup('register/index', [
        'registrationForm',
        'modalErrorDialog'
    ]);

}(app));
