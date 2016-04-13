Wu.Animator = Wu.Evented.extend({


	// ██╗███╗   ██╗██╗████████╗
	// ██║████╗  ██║██║╚══██╔══╝
	// ██║██╔██╗ ██║██║   ██║   
	// ██║██║╚██╗██║██║   ██║   
	// ██║██║ ╚████║██║   ██║   
	// ╚═╝╚═╝  ╚═══╝╚═╝   ╚═╝   

	options : {

		// Animation frames per second
		fps : 4,

		// Max value for steps on slider
		maxLength : 365,

		// Defines what kind of graph we want
		graphType : 'annualCycles'

	},

	// Set Frames Per Second
	setFPS : function (fps) {
		this.options.fps = fps;
		Wu.Mixin.Events.fire('setFPS', {detail : {
			fps : fps
		}});
	},	

	// Basic initializer
	_initialize : function (options) {

		// fetching data is async, so must wait for callback
		this.initData(function (err) {
			if (err) return console.error('Wu.Animator init err:', err);

			// hide by default is option set
			if (this.options.hide) this.hide();

		}.bind(this));
		
	},


	// ┌─┐┌─┐┌┬┐  ┌┬┐┌─┐┌┬┐┌─┐
	// │ ┬├┤  │    ││├─┤ │ ├─┤
	// └─┘└─┘ ┴   ─┴┘┴ ┴ ┴ ┴ ┴	
		
	// Initialize data
	initData : function (done) {

		// get data from server
		app.api.getCustomData({
			name : this.options.data
		}, function (err, d) {
			if (err) return done(err);

			// parse
			var data = Wu.parse(d);

			// render
			this.dataReady(data);

			// continue initialize
			done(err);

		}.bind(this));

	},

	// Callback for when data is ready
	dataReady : function (data) {

		// Set slider steps
		this.dataLength = data.length;
		if ( this.dataLength > this.options.maxLength ) {
			this.dataLength = this.options.maxLength;
		}

		// Initialize slider
		this.initSlider();

		// Set sliding event
		this.slideEvent();

		// Add hooks
		this.addHooks();		

		// Create graph
		this.graph = new Wu.Graph.Year({
			data     : data,
			appendTo : this.sliderOuterContainer,
			type     : this.options.graphType
		});
	},


	// ┬ ┬┬─┐┬┌┬┐┌─┐  ┌─┐┬  ┬┌┬┐┌─┐┬─┐  ┌┬┐┌─┐┌┬┐
	// │││├┬┘│ │ ├┤   └─┐│  │ ││├┤ ├┬┘   │││ ││││
	// └┴┘┴└─┴ ┴ └─┘  └─┘┴─┘┴─┴┘└─┘┴└─  ─┴┘└─┘┴ ┴

	initSlider : function () {

		this.sliderOuterContainer = Wu.DomUtil.create('div', 'big-slider-outer-container', app._appPane);
		var sliderInnerContainer = Wu.DomUtil.create('div', 'big-slider-inner-container', this.sliderOuterContainer);
		var slider = Wu.DomUtil.create('div', 'big-slider', sliderInnerContainer);
		this.sliderButtonsContainer = Wu.DomUtil.create('div', 'big-slider-button-container', sliderInnerContainer);
		this.stepBackward = Wu.DomUtil.create('div', 'big-slider-step-backward', this.sliderButtonsContainer, '<i class="fa fa-fast-backward"></i>');
		this.tapBackward = Wu.DomUtil.create('div', 'big-slider-tap-backward', this.sliderButtonsContainer, '<i class="fa fa-step-backward"></i>');
		this.playButton = Wu.DomUtil.create('div', 'big-slider-play-button', this.sliderButtonsContainer, '<i class="fa fa-play"></i>');		
		this.tapForward = Wu.DomUtil.create('div', 'big-slider-tap-forward', this.sliderButtonsContainer, '<i class="fa fa-step-forward"></i>');
		this.stepForward = Wu.DomUtil.create('div', 'big-slider-step-forward', this.sliderButtonsContainer, '<i class="fa fa-fast-forward"></i>');
		this.tickContainer = Wu.DomUtil.create('div', 'big-slider-tick-container', sliderInnerContainer);

		this.slider = noUiSlider.create(slider, {
			start: [this.currentSliderValue],
			limit: this.dataLength,
			range: {
				'min': 1,
				'max': this.dataLength
			}
		});

	},


	// ███████╗██╗   ██╗███████╗███╗   ██╗████████╗███████╗
	// ██╔════╝██║   ██║██╔════╝████╗  ██║╚══██╔══╝██╔════╝
	// █████╗  ██║   ██║█████╗  ██╔██╗ ██║   ██║   ███████╗
	// ██╔══╝  ╚██╗ ██╔╝██╔══╝  ██║╚██╗██║   ██║   ╚════██║
	// ███████╗ ╚████╔╝ ███████╗██║ ╚████║   ██║   ███████║
	// ╚══════╝  ╚═══╝  ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝

	// Overlaps a tad with "ACTIONS" underneath

	addHooks : function () {

		Wu.DomEvent.on(this.stepBackward, 'click', this.moveBackward, this);
		Wu.DomEvent.on(this.tapBackward,  'click', this.stepOneBackward, this);
		Wu.DomEvent.on(this.stepForward,  'click', this.moveForward, this);
		Wu.DomEvent.on(this.tapForward,   'click', this.stepOneForward, this);
		Wu.DomEvent.on(this.playButton,   'click', this.play, this);

		this.slider.on('slide', _.throttle(function( values, handle ) {
			this.currentSliderValue = Math.round(values);
			this.slideEvent();
		}.bind(this), 100));


		Wu.Mixin.Events.on('setSlider', this.setSlider, this);
		Wu.Mixin.Events.on('updateSliderButtons', this.updateButtons, this);
	},


	// When sliding (dragging or clicking)
	slideEvent : function () {

		if ( !this.currentSliderValue ) this.currentSliderValue = 0;

		// fire sliding event
		Wu.Mixin.Events.fire('animationSlide', { detail : {
				layer : this._currentLayer,
				value : this.currentSliderValue
		}});
	},	


	// Enable layer
	_layerEnabled : function (e) {
		var layer = e.detail.layer;
		this._currentLayer = layer;
		var show = e.detail.showSlider;

		// set title 
		this.setTitle(layer.getTitle());

		// show
		if (show) this.show();
	},


	// Disable layer
	_layerDisabled : function (e) {
		var layer = e.detail.layer;
		if (layer.getUuid() == this._currentLayer.getUuid()) {
				var show = e.detail.showSlider;
				this.hide();
		}
	},

	// Set slider value
	setSlider : function (e) {
		this.currentSliderValue = e.detail.value;
		this.slider.set([this.currentSliderValue]);
	},

	updateButtons : function (e) {

		var disableForward  = e.detail.diableForward;
		var disableBackward = e.detail.diableBackward

		if ( disableForward ) { Wu.DomUtil.addClass(this.stepForward, 'disable-button');
		} else { Wu.DomUtil.removeClass(this.stepForward, 'disable-button'); }

		if ( disableBackward ) { Wu.DomUtil.addClass(this.stepBackward, 'disable-button');
		} else { Wu.DomUtil.removeClass(this.stepBackward, 'disable-button'); }

	},

	// Set title
	setTitle : function (title) {
		if (!this._currentLayer) return;
		Wu.Mixin.Events.fire('setSliderTitle', {detail : {
			title : title
		}});
	},



	//  █████╗  ██████╗████████╗██╗ ██████╗ ███╗   ██╗███████╗
	// ██╔══██╗██╔════╝╚══██╔══╝██║██╔═══██╗████╗  ██║██╔════╝
	// ███████║██║        ██║   ██║██║   ██║██╔██╗ ██║███████╗
	// ██╔══██║██║        ██║   ██║██║   ██║██║╚██╗██║╚════██║
	// ██║  ██║╚██████╗   ██║   ██║╚██████╔╝██║ ╚████║███████║
	// ╚═╝  ╚═╝ ╚═════╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝

	// These are the actions for the play, pause, step forward and backward buttons


	play : function () {		
		this.playing ? this.stopPlaying() : this.startPlaying();
	},


	startPlaying : function () {

		this.playButton.innerHTML = '<i class="fa fa-pause"></i>';

		this.playing = true;

		this.playInterval = setInterval(function() {
			if ( this.currentSliderValue == 365 ) {
				clearInterval(this.playInterval);
				return;
			} else {
				this.slider.set(this.currentSliderValue++);
				this.slideEvent();
			}			
		}.bind(this), (1000/this.options.fps)) 

		// fire animation play
		Wu.Mixin.Events.fire('animationPlay');

	},

	stopPlaying : function () {

		this.playButton.innerHTML = '<i class="fa fa-play"></i>';

		clearInterval(this.playInterval);
		this.playing = false;

		// fire animation stop
		Wu.Mixin.Events.fire('animationStop');
	},

	stepOneForward : function () {		
		this.currentSliderValue++;
		this.slideEvent();
		this.slider.set([this.currentSliderValue]);

	},

	stepOneBackward : function () {
		this.currentSliderValue--;
		this.slideEvent();
		this.slider.set([this.currentSliderValue]);
	},

	moveBackward : function () {
		Wu.Mixin.Events.fire('sliderMoveBackward');
	},

	moveForward : function () {
		Wu.Mixin.Events.fire('sliderMoveForward');
	},	




	//  ██████╗ ████████╗██╗  ██╗███████╗██████╗ 
	// ██╔═══██╗╚══██╔══╝██║  ██║██╔════╝██╔══██╗
	// ██║   ██║   ██║   ███████║█████╗  ██████╔╝
	// ██║   ██║   ██║   ██╔══██║██╔══╝  ██╔══██╗
	// ╚██████╔╝   ██║   ██║  ██║███████╗██║  ██║
	//  ╚═════╝    ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝

	// Update message box, if it exists before
	update : function (message, severity) {
	},

	remove : function (id) {
	},

	hide : function () {
		this.sliderOuterContainer.style.display = 'none';
	},

	show : function () {
		this.sliderOuterContainer.style.display = 'block';
	},	

});





