if( app.isMobile ) {
	
	var device = app.isMobile.mobile ? 'mobile' : 'tablet';

	var styletag = document.getElementById('custom-style');
	styletag.outerHTML = '<link rel="stylesheet" href="/css/' + device + '.css">';

	var width = app.isMobile.width;
	var _app = document.getElementById('app');
	    _app.style.width = width + 'px';

}
