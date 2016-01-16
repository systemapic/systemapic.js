Wu.Guide = Wu.Evented.extend({

	// _inputs : [],

	_initialize : function () {


		// create content
		this._initContent();
	
		// events
		this.addEvents();

	},

	_initContent : function () {

		console.log('%cGUIDE', 'background: red; color: white; font-size: 24px;');

		// create fullscreen
		this._container = Wu.DomUtil.create('div', 'guide-fullscreen', app._appPane);

		// Hide these
		// TODO: Remove from DOM on public user.
		Wu.DomUtil.addClass(app.Chrome.Top._CPUwrapper, 'displayNone');
		Wu.DomUtil.addClass(app.Chrome.Top._menuButton, 'displayNone');
		Wu.DomUtil.addClass(app.Chrome.Top._buttons.account.div, 'displayNone');
		Wu.DomUtil.addClass(app.Chrome.Top._buttons.data.div, 'displayNone');
		Wu.DomUtil.addClass(app.Chrome.Top._buttons.settings.div, 'displayNone');
		Wu.DomUtil.addClass(app.Chrome.Top._buttons.settingsSelector.div, 'displayNone');
		Wu.DomUtil.addClass(app.Chrome.Top._buttons.share.div, 'displayNone');

		// Move project title to the left...
		Wu.DomUtil.addClass(app.Chrome.Top._buttonWrapper, 'zero-left');



		// Opening screen

		// Dummy text
		this._openingText = 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat.';

		// Containers
		this._centralContentOuter = Wu.DomUtil.create('div', 'guide-central-content-outer', this._container);
		this._centralContentInner = Wu.DomUtil.create('div', 'guide-central-content-inner', this._centralContentOuter);

		// Top section (text)
		this._centralContentTop = Wu.DomUtil.create('div', 'guide-central-content-text', this._centralContentInner, this._openingText);
		this._centralContentButtons = Wu.DomUtil.create('div', 'guide-central-content-buttons', this._centralContentInner)
		
		// Buttons
		this._centralContentNo = Wu.DomUtil.create('div', 'guide-central-no tour-button', this._centralContentButtons, 'Go to map');
		this._centralContentTour = Wu.DomUtil.create('div', 'guide-central-tour tour-button', this._centralContentButtons, 'Take a Tour');



	},







	addEvents : function () {

		Wu.DomEvent.on(this._centralContentNo, 'click', function(){this._cancelTour()}.bind(this));
		Wu.DomEvent.on(this._centralContentTour, 'click', function(){this._initTour()}.bind(this));
	},

	removeEvents : function () {
	},



	_initTour : function () {		
		this._step1();
	},

	_cancelTour : function () {
		this._container.remove();
		if ( this.tourStep ) this._killSteps();
	},



	// Layer menu
	_step1 : function  () {

		this.tourStep = 1;

		// Remove container with welcome message
		this._centralContentOuter.remove();

		// Get layers
		this._layers 	  = app.MapPane._controls.layermenu._container.parentNode;
		this._layerButton = app.Chrome.Top._container;

		// Put layers on top...
		Wu.DomUtil.addClass(this._layers, 'super-z');
		Wu.DomUtil.addClass(this._layerButton, 'super-z');


		// Layer tour box

		var layerTourText = 'These are your layers. Click to activate or deactivate.<br><br>The magnifying glass takes you right to the layer.';

		this._layerTourBox = Wu.DomUtil.create('div', 'layer-tour-box super-z', this._layers);

		this._layerTourText = Wu.DomUtil.create('div', 'layer-tour-text', this._layerTourBox, layerTourText);		

		this._layerTourButtonWrapper = Wu.DomUtil.create('div', 'layer-tour-button-wrapper', this._layerTourBox);
		this._layerTourOKbutton = Wu.DomUtil.create('div', 'layers-OK tour-button', this._layerTourButtonWrapper, 'Got it');

	},	



	_killSteps : function () {
	
		if ( this.tourStep = 1 ) {
			Wu.DomUtil.removeClass(this._layers, 'super-z');
			Wu.DomUtil.removeClass(this._layerButton, 'super-z');			
		}


		this.tourStep = false;


	},


	close : function () {
		// this.destroy();
	},

	destroy : function () {

		// // remove events
		// this.removeEvents();

		// // remove container
		// this._container.innerHTML = '';
		// Wu.DomUtil.remove(this._container);

	},


})