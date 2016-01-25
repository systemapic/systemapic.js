Wu.Guide = Wu.Evented.extend({

	_initialize : function () {

		this._cleanUI();

	},

	_cleanUI : function (argument) {

		// Hide these
		// TODO: Remove from DOM on public user.
		if (app.Chrome.Top._CPUwrapper ) 			Wu.DomUtil.addClass(app.Chrome.Top._CPUwrapper, 'displayNone');
		if (app.Chrome.Top._menuButton ) 			Wu.DomUtil.addClass(app.Chrome.Top._menuButton, 'displayNone');
		if (app.Chrome.Top._buttons.account.div ) 		Wu.DomUtil.addClass(app.Chrome.Top._buttons.account.div, 'displayNone');
		if (app.Chrome.Top._buttons.data.div ) 			Wu.DomUtil.addClass(app.Chrome.Top._buttons.data.div, 'displayNone');
		if (app.Chrome.Top._buttons.settings.div ) 		Wu.DomUtil.addClass(app.Chrome.Top._buttons.settings.div, 'displayNone');
		if (app.Chrome.Top._buttons.settingsSelector.div ) 	Wu.DomUtil.addClass(app.Chrome.Top._buttons.settingsSelector.div, 'displayNone');
		if (app.Chrome.Top._buttons.share.div ) 		Wu.DomUtil.addClass(app.Chrome.Top._buttons.share.div, 'displayNone');		

		// Move project title to the left...
		Wu.DomUtil.addClass(app.Chrome.Top._buttonWrapper, 'zero-left');

	},

	start : function () {

		// Init texts
		this.initTexts();
		
		// create content
		this._initContent();
	
		// events
		this.addEvents();

		// Preload images
		this.loadImages();

	},

	initTexts : function () {
	
		// Welcome text
		var welcomeTextHeader = '<h3><b>Velkommen til Globesar!</b></h3>';
		var welcomeTextBody = 'Vi har prøvd å demonstrere satellitt InSAR deformasjonsmålinger så selvforklarende som mulig, og vår webtjeneste har en del funksjonalitet slik at du få mer ut av målingene.<br><br><b>Ønsker du en kort demo?</b>';

		this._welcomeText = welcomeTextHeader + welcomeTextBody;
		
		// Guide texts
		this._layerText = 'Klikk på datasettet for å velge hvilket område du ønsker å studere.<br>Aktive datasett er markert med et grønt punkt.<br>Klikk på forstørrelsesglasset for å raskt komme til dataen på kartet';
		this._infoText = 'Denne boksen viser kjennetegn for valgt måleserie (datasett)<br>Fargeskalaen viser størrelse på målt bevegelse i tidsperioden.<br>Bevegelse fra satellitten vises som rødt (nedsynking), mens bevegelse mot satellitten vises i blått.';
		this._graphText = 'Punktene illustrerer hvor vi har måleverdier og fargene illustrerer hastighet.<br>Klikk på et punkt for å studere utviklingen i tid.<br>Klikk "Regression" for å se trenden.';
		this._multiText = 'Tegneverktøyet muliggjør at du kan studere gjennomsnittsverdiene for flere punkt.<br>Husk at du lukker polygonen ved å klikke der du startet å tegne.';

		this._contactText = '(+47) 40601994 – <a href="mailto:info@globesar.com">info@globesar.com</a> – <a href="http://www.globesar.com">www.globesar.com</a>';
		this._diclaimerText = 'Ved å benytte seg av denne webtjenesten akepterer du&nbsp;';
		this._diclaimerButtonText = 'disse vilkårene';

		// Buttons text
		this._nextButtonText = 'Ok. Neste steg!';
		this._directButtonText = 'Ta meg direkte til webtjenesten!';
		this._finalButtonText = 'Ok. Ta meg til webtjenesten!';
		this._tourText = 'Ok, vi tar en demo. ';

		// Terms
		this._termsText = 'Ved å bruke denne tjenesten aksepterer du at...';
		this._termsOkayText = 'OK! Jeg aksepterer vilkårene.';



	},


	_initContent : function () {

		// Translucent black backdrop
		this._bg = Wu.DomUtil.create('div', 'guide-fullscreen-block', app._appPane);

		// The container
		this._outerContainer = Wu.DomUtil.create('div', 'guide-outer-container', app._appPane);
		this._container = Wu.DomUtil.create('div', 'guide-container', this._outerContainer);

		// Welcome container
		this._welcomeOuterContainer = Wu.DomUtil.create('div', 'tour-welcome-outer-container', this._container);

		// Welcome text area
		this._welcomeTextArea = Wu.DomUtil.create('div', 'tour-text-area welcome-text', this._welcomeOuterContainer, this._welcomeText);
		
		// Welcome buttons
		this._welcomeButtonsContainer = Wu.DomUtil.create('div', 'tour-welcome-buttons-container', this._welcomeOuterContainer);
		this._welcomeButtonTour = Wu.DomUtil.create('div', 'tour-button', this._welcomeButtonsContainer, this._tourText);		
		this._welcomeButtonStart = Wu.DomUtil.create('div', 'tour-button', this._welcomeButtonsContainer, this._directButtonText)		

		// Welcome disclaimer
		this._disclaimerContainer = Wu.DomUtil.create('div', 'tour-welcome-disclaimer', this._welcomeOuterContainer);
		this._disclaimerTextArea = Wu.DomUtil.create('span', 'tour-welcome-disclaimerText', this._disclaimerContainer, this._diclaimerText);
		this._termsButton = Wu.DomUtil.create('a', 'tour-welcome-disclaimer-terms', this._disclaimerContainer, this._diclaimerButtonText);
		this._termsButton.href = '#';		

		// Welcome contact information
		this._contactContainer = Wu.DomUtil.create('div', 'tour-welcome-contact', this._welcomeOuterContainer);
		this._contactTextArea = Wu.DomUtil.create('div', 'tour-welcome-contact-text', this._contactContainer, this._contactText)

		// Centralize this._container
		this._centralize(this._container, 370);

		setTimeout(function (argument) {
			this._bg.style.opacity = 1;
			this._container.style.opacity = 1;	
		}.bind(this))

	},

	// Initialize tour
	_initTerms : function () {

		// Hide welcome text
		this._welcomeOuterContainer.style.opacity = 0;

		// Centralize this._container
		this._centralize(this._container, 550);

		// Build elements
		this._termsContainer = Wu.DomUtil.create('div', 'tour-terms-container', this._container);
		this._termsTextArea = Wu.DomUtil.create('div', 'tour-terms-text-area', this._termsContainer, this._termsText);

		this._termsButtonContainer = Wu.DomUtil.create('div', 'tour-terms-button-container', this._termsContainer);
		this._termsButtonOK = Wu.DomUtil.create('div', 'terms-ok tour-button', this._termsButtonContainer, this._termsOkayText);

		// Event listnener
		Wu.DomEvent.on(this._termsButtonOK, 'click', this._closeTerms, this);


		// Time with CSS transitions
		setTimeout(function() {
			Wu.DomUtil.addClass(this._welcomeOuterContainer, 'displayNone');
			this._startTerms();
		}.bind(this), 250);	
	
	},	

	_startTerms : function () {

		setTimeout(function () {
			this._termsContainer.style.opacity = 1;	
		}.bind(this), 50)		
		
	},

	_closeTerms : function () {

		this._termsContainer.style.opacity = 0;
		this._centralize(this._container, 370);

		setTimeout(function() {
			
			this._welcomeOuterContainer.style.opacity = 1;
			Wu.DomUtil.removeClass(this._welcomeOuterContainer, 'displayNone');

			this._termsContainer.remove();
			this._termsContainer = null;


		}.bind(this), 250);		

		// this._termsContainer.remove();
		// this._termsContainer = null;

	},

	// Initialize tour
	_initTour : function () {

		// Hide welcome text
		this._welcomeOuterContainer.style.opacity = 0;

		// Centralize this._container
		this._centralize(this._container, 550);

		// Time with CSS transitions
		setTimeout(function() {
			// Flush container
			this._container.innerHTML = '';
			// Start the tour
			this.startTour();
		}.bind(this), 250);		
	
	},


	// Start the tour
	startTour : function () {

		// Slide container
		this._tourContainer = Wu.DomUtil.create('div', 'tour-container', this._container);

		// Need to have a little delay for opacity animation to work
		setTimeout(function () {
			this._tourContainer.style.opacity = 1;	
		}.bind(this), 50)
		
		// GIF images
		this._guideImagesContainer = Wu.DomUtil.create('div', 'guide-images-container', this._tourContainer);
		this._guideImages = Wu.DomUtil.create('div', 'guide-images', this._guideImagesContainer);
		this._guideImagesBackground = Wu.DomUtil.create('div', 'guide-background', this._guideImages);
		this._guideImagesBackground.appendChild(this.img_blank);
		this._guideImagesForeground = Wu.DomUtil.create('div', 'guide-foreground', this._guideImages);

		// Dots
		this._dotsContainer = Wu.DomUtil.create('div', 'tour-guide-dots-container', this._tourContainer);
		this._dot1 = Wu.DomUtil.create('div', 'tour-dot', this._dotsContainer);
		this._dot2 = Wu.DomUtil.create('div', 'tour-dot', this._dotsContainer);
		this._dot3 = Wu.DomUtil.create('div', 'tour-dot', this._dotsContainer);
		this._dot4 = Wu.DomUtil.create('div', 'tour-dot', this._dotsContainer);

		// Text area
		this._textArea = Wu.DomUtil.create('div', 'tour-text-area', this._tourContainer);

		// Buttons
		this._buttonsContainer = Wu.DomUtil.create('div', 'tour-buttons-container', this._tourContainer);
		this._nextButton = Wu.DomUtil.create('div', 'tour-button', this._buttonsContainer);

		// Know which GIF we're showing
		this.counter = 1;
		
		// Set default text
		this._textArea.innerHTML = this._layerText;

		// Set button text
		this._nextButton.innerHTML = this._nextButtonText;

		// Activate first dot
		this._dot1.className = 'tour-dot active-dot';	

		// Start the "layer" GIF after one second
		setTimeout(function () {
			this._guideImagesForeground.appendChild(
				this.img_layers
				); 
		}.bind(this), 2000);

		// Register click event on button
		Wu.DomEvent.on(this._nextButton, 'click', this.next, this);
		
	},

	// Next slide button
	next : function () {

		// If we're at the last slide => go to map
		if ( !this.counter ) {
			this.abort();
			return;		
		}

		// Going from "Layers" to "Description/legends"
		if ( this.counter == 1 ) { 			
			this.img_layers.remove(); 
			this.img_layers = null;
			this._guideImagesForeground.appendChild(this.img_info);

			this._dot1.className = 'tour-dot';
			this._dot2.className = 'tour-dot active-dot';
			 
			this._textArea.style.opacity = 0;
			setTimeout(function() {
				this._textArea.innerHTML = this._infoText;
				this._textArea.style.opacity = 1;
			}.bind(this), 500);
		}

		// Going from "Description/legends" to "Graph"
		if ( this.counter == 2 ) { 
			this.img_info.remove();
			this.img_info = null;
			this._guideImagesForeground.appendChild(this.img_graph); 

			this._dot2.className = 'tour-dot';
			this._dot3.className = 'tour-dot active-dot';

			
			this._textArea.style.opacity = 0;
			setTimeout(function() {
				this._textArea.innerHTML = this._graphText; 
				this._textArea.style.opacity = 1;
				this._textArea.style.top = 25 + 'px';
			}.bind(this), 500);
		}

		// Going from "Graph" to "Multi Graph"
		if ( this.counter == 3 ) {
			this.img_graph.remove();
			this.img_graph = null;
			this._guideImagesForeground.appendChild(this.img_multi); 
			this._nextButton.innerHTML = this._finalButtonText;

			this._dot3.className = 'tour-dot';
			this._dot4.className = 'tour-dot active-dot';

			this._textArea.style.opacity = 0;
			setTimeout(function() {
				this._textArea.innerHTML = this._multiText; 
				this._textArea.style.opacity = 1;
			}.bind(this), 500);

			// Stop counter
			this.counter = false;
			return;
			
		} 

		// Add to counter
		this.counter ++;
		
	
	},

	// Set height and top position of container in relation to window height.
	_centralize : function (div, _height) {
		var windowHeight = window.innerHeight;
		var diff = Math.floor((windowHeight - _height)/2);

		if ( diff < 10 ) diff = 10;

		div.style.top = diff + 'px';
		div.style.height = _height + 'px';
	},


	// Preloading images
	// We are loading them with a random string at the end to make sure they are loaded fresh,
	// otherwise GIF animations might not start from the beginning.
	loadImages : function () {

		var path = '/images/guide/';

		this.img_blank = new Image();
		this.img_blank.src = path + 'blank.gif';

		this.img_layers = new Image();
		this.img_layers.src = path + 'layers.gif'+"?a="+Math.random();

		this.img_info = new Image();
		this.img_info.src = path + 'info.gif'+"?a="+Math.random();

		this.img_graph = new Image();
		this.img_graph.src = path + 'graph.gif'+"?a="+Math.random();

		this.img_multi = new Image();
		this.img_multi.src = path + 'multigraph.gif'+"?a="+Math.random();
	},



	addEvents : function () {
		Wu.DomEvent.on(this._welcomeButtonStart, 'click', this.abort, this);
		Wu.DomEvent.on(this._welcomeButtonTour, 'click', this._initTour, this);
		Wu.DomEvent.on(this._termsButton, 'click', this._initTerms, this);
	},

	removeEvents : function () {
	},

	abort : function (e) {

		e && Wu.DomEvent.stop(e);

		this._container.remove();
		this._container = null;

		this._bg.remove();
		this._bg = null;
		
	},

	close : function () {
		this.abort();
	},


})