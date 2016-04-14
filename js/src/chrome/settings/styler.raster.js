Wu.RasterStyler = Wu.Class.extend({

	type : 'cube',
	rangeMin : 0,
	rangeMax : 255,

	initialize : function (options) {

		this.options = options;

		// get stops
		this.stops = _.isObject(options.carto) ? options.carto : [{ val : 80,  col : '#FF0000', opacity : 1 },{ val : 180, col : '#00FF00', opacity : 1 }];

		// create dom
		this._initContainer();
		
		// set slider color
		this.setSliderColor();

		// add events
		this.addHooks();

	},

	_initContainer : function () {

		// create divs
		this._wrapper = Wu.DomUtil.create('div', 'chrome-content-section-wrapper raster-styler', this.options.container);
		this._rangeMarks = Wu.DomUtil.create('div', 'raster-range-marks', this._wrapper);
		this._maxMark = Wu.DomUtil.create('div', 'raster-range-max-mark', this._rangeMarks, this.rangeMin.toString());
		this._minMark = Wu.DomUtil.create('div', 'raster-range-min-mark', this._rangeMarks, this.rangeMax.toString()); // todo: shouldn't be hardcoded
		this._sliderContainer = Wu.DomUtil.create('div', 'raster-range-slider', this._wrapper);

		this._rangeWrapper = Wu.DomUtil.create('div', 'raster-color-range-wrapper', this._wrapper);

		this._renderSlider();

	},


	_renderSlider : function () {

		// If slider exists, destroy it
		if ( this.slider ) this.slider.destroy();
		
		// SLIDER
		// SLIDER
		// SLIDER				

		var sliderStops = [];
		this.stops.forEach(function (stop) { sliderStops.push(stop.val) });

		// Create slider
		this.slider = noUiSlider.create(this._sliderContainer, {
			start: sliderStops,
			animate: false,
			behaviour: 'hover',
			range: {
				'min': this.rangeMin,
				'max': this.rangeMax
			}
		});

		// Slide listner
		this.slider.on('slide', function( values, handle ) {

			values.forEach(function (v, i) {
				this.stops[i].val = parseInt(v);
			}.bind(this))
			app.Tools.Styler.markChanged();
			this.setSliderPosition();

		}.bind(this));

		// Hover listner
		this.slider.on('hover', function( value ) { this.hoverValue = value; }.bind(this));

		// Click event
		Wu.DomEvent.on(this.slider.target, 'dblclick', this.rangeClick, this);


		// Color selectors, etc

		this.stops.forEach(function (stop, i) { 

			// If DOM for this stop already exists, remove it
			if ( stop.DOM ) {

				var wrapperElement = Wu.Tools.isElement(stop.DOM.wrapper);
				if ( wrapperElement ) stop.DOM.wrapper.remove();
				stop.DOM.wrapper = null;

				var containerElement = Wu.Tools.isElement(stop.DOM.container);
				if ( containerElement ) stop.DOM.container.remove();
				stop.DOM.container = null;	

				var rangeElement = Wu.Tools.isElement(stop.DOM.range);
				if ( rangeElement ) stop.DOM.range.remove();
				stop.DOM.range = null;

				if ( stop.DOM.colorBall && stop.DOM.colorBall.color ) {
					var colorElement = Wu.Tools.isElement(stop.DOM.colorBall.color);
					if ( colorElement ) {
						stop.DOM.colorBall.color.remove();
						stop.DOM.colorBall.color = null;
					}
				} 
				stop.DOM.colorBall = null;

				stop.DOM = null;

			}


			stop.DOM = {}

			// Outer wrapper
			stop.DOM.wrapper   = Wu.DomUtil.create('div', 'raster-color-selector-wrapper', this._rangeWrapper);
			
			// Content container
			stop.DOM.container = Wu.DomUtil.create('div', 'raster-color-selector', stop.DOM.wrapper);

			// Range container
			stop.DOM.range     = Wu.DomUtil.create('div', 'raster-color-range', stop.DOM.wrapper);

			// Number
			stop.DOM.number    = Wu.DomUtil.create('div', 'raster-color-number', stop.DOM.container, stop.val);

			// Color selector
			stop.DOM.colorBall = new Wu.button({
				appendTo  : stop.DOM.container,
				type      : 'colorball',
				id        : i,
				fn 	  : this._updateColor.bind(this),
				right     : false,
				value     : this.stops[i].col,
				className : 'raster-color',
				on        : true
			});


			// console.log('stop.DOM.colorBall',stop.DOM.colorBall);

			// stop.DOM.miniInput = new Wu.button({
			// 	appendTo    : stop.DOM.container,
			// 	type        : 'miniInput',
			// 	id          : 'cube-input-' + i,
			// 	right 	    : true,
			// 	isOn        : true,
			// 	value       : this.stops[i].opacity,
			// 	className   : 'raster-color-input',
			// 	placeholder : 1,
			// 	fn 	    : this._updateOpacity.bind(this)
			// });


		}.bind(this));

		// Store width of slider
		this.pixelWidth = this._rangeMarks.offsetWidth;

		// Set poision of color selectors, ranges, etc
		this.setSliderPosition();




	},

	_updateColor : function (hex, key, wrapper) {
		this.stops[key].col = hex;
		this.setSliderColor();
	},

	addHooks : function () {

	},



	rangeClick : function (e) {

		var target = e.target;

		var handleClick = false;
		target.classList.forEach(function (c) { if ( c == 'noUi-handle' ) handleClick = true; });

		handleClick ? this.removeStop(e) : this.addStop(e);

	},

	removeStop : function (e) {

		// This is a bit hacky, but what we're doing is to fetch
		// the latest "hoverValue", which is the position of the mouse.
		// Then we add a buffer, and figure out which stop we're closest to.
		var stop = false;

		var buffer = 12;
		this.stops.forEach(function (_stop, i) {
			if ( _stop.val > (this.hoverValue-buffer) &&  _stop.val < (this.hoverValue+buffer) ) {
				stop = i;
			}
		}.bind(this));

		if ( stop === false ) return;


		// REMOVE FROM DOM
		this.stops[stop].DOM.wrapper.remove();
		this.stops[stop].DOM.wrapper = null;
		
		this.stops[stop].DOM.container.remove();
		this.stops[stop].DOM.container = null;	
		
		this.stops[stop].DOM.range.remove();
		this.stops[stop].DOM.range = null;
		
		this.stops[stop].DOM.colorBall.color.remove();
		this.stops[stop].DOM.colorBall.color = null;
		
		this.stops[stop].DOM.colorBall = null;

		this.stops[stop].DOM = null;

		// Remove from Array
		this.stops.splice(stop, 1);

		// Redraw slider
		this._renderSlider();

	},

	addStop : function (e) {


		var newVal = Math.round(this.hoverValue);
		var newIndex = -1;
		var tooClose = false;
		var buffer = 15;

		// Find out between which stops to place this stop...
		this.stops.forEach(function (stop, i) {
			// New value is LARGER than stop
			if ( newVal > stop.val ) newIndex = i;
			var diff = Math.abs(stop.val - newVal);
			if ( diff < buffer ) tooClose = true;
		}.bind(this));

		// Need a buffer, so that we don't create a new handle when pulling a handle :P
		if ( tooClose ) { console.error('Too close!'); return; }

		// Get the two stops where we want to go between
		var stop1 = this.stops[newIndex];
		var stop2 = this.stops[newIndex+1];
		
		// If we're clicking before the first stop, or after the last
		if ( !stop1 ) return;
		if ( !stop2 ) return;

		// First stop values
		var val1 = stop1.val;
		var col1 = stop1.col;

		// Second stop values
		var val2 = stop2.val;
		var col2 = stop2.col;


		// CALCULATIONS
		// CALCULATIONS
		// CALCULATIONS


		// Range of new stop, minus previous stop
		var newValRange = newVal - val1;

		// Range between existing stops
		var valRange = val2 - val1;

		// How many percent of range between existing two 
		// stops are we located at ... [*][.*..][*] = 25%
		var percent = newValRange/valRange;

		// Get color value for new stop (RGB)
		var RGB1 = Wu.Tools.hex2RGB(col1);
		var RGB2 = Wu.Tools.hex2RGB(col2);

		// Mix colors
		var newRGB = Wu.Tools.mixColors(RGB1, RGB2, percent);

		// Hex value for new stop
		var newHEX = Wu.Tools.rgb2HEX(newRGB);		

		// Data for new stop
		var newStop = {
			val : newVal,
			col : newHEX,
			opacity : 1
		}

		// Inject new stop
		this.stops.splice(newIndex+1, 0, newStop);

		// Render da sheeet
		this._renderSlider();

	},


	setSliderPosition : function () {

		var span = this.rangeMax - this.rangeMin;	

		this.stops.forEach(function (stop, i) {

			var pixelsFromLeft = Math.round((stop.val / span) * this.pixelWidth);			
			var style = 'transform: translate(' + pixelsFromLeft + 'px, 0px)'; // TODO: Write more cross browser friendly
			stop.DOM.wrapper.setAttribute('style', style);

		}.bind(this));

		this.setSliderColor();

	},

	setSliderColor : function () {

		var span = this.rangeMax - this.rangeMin;

		this.stops.forEach(function (stop, i) {

			if ( this.stops[i+1] ) {

				// Stops
				var thisStop = stop;
				var nextStop = this.stops[i+1];

				// Calculate				
				var thisPercentFromLeft = Math.round(thisStop.val/span * 100);
				var nextPercentFromLeft = Math.round(nextStop.val/span * 100);

				// Values
				var left  = thisPercentFromLeft;
				var perecentWidth = (nextPercentFromLeft-thisPercentFromLeft)/100;
				var width = Math.round(perecentWidth * this.pixelWidth);

				// Get start and end color
				var startColor = thisStop.col;
				var endColor = nextStop.col;

				// Get gradient style
				var gradientStyle = this.getGradient(startColor, endColor);

				// Set gradient style
				stop.DOM.range.setAttribute('style', gradientStyle);
				
			} else {
				var width = 0;
			}

			// Set width
			stop.DOM.range.style.width = width + 'px';

			// Write value
			stop.DOM.number.innerHTML = stop.val;

		}.bind(this));
		
	},


	getGradient : function (c1, c2) {

		var style = 'background: -webkit-linear-gradient(left, ' + c1 + ' , ' + c2 + ');';
		style += 'background: -o-linear-gradient(right, ' + c1 + ' , ' + c2 + ');';
		style += 'background: -moz-linear-gradient(right, ' + c1 + ' , ' + c2 + ');';
		style += 'background: linear-gradient(to right, ' + c1 + ' , ' + c2 + ');';

		return style;
	},

	setCarto : function (carto) {
		console.log('%c setCarto ', 'background: hotpink; color: white;');
		console.log('carto', carto);
		this.options.carto = carto;
	},	





	// _updateOpacity : function (e) {
	// 	var box = e.target;

	// 	if (box == this.leftMiniInput.input) {
	// 		this.stops[0].opacity = parseFloat(box.value)
	// 	}
		
	// 	if (box == this.rightMiniInput.input) {
	// 		this.stops[1].opacity = parseFloat(box.value);
	// 	}

	// 	// update
	// 	this.setSliderColor();
	// },





});

