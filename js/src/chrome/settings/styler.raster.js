Wu.RasterStyler = Wu.Class.extend({

	type       : 'cube',
	rangeMin   : 0,
	rangeMax   : 255,
	pixelWidth : 369,

	initialize : function (options) {

		this.options = options;

		var defaultStops = [
			{ 	val : 80,  
				col : {
					r : 0,
					g : 0,
					b : 255,
					a : 1
				}
			},
			{ 	val : 180,
				col : {
					r : 255,
					g : 0,
					b : 0,
					a : 1
				}
			},
		]

		// get stops
		this.stops = _.isObject(options.carto) ? options.carto : defaultStops;

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

		this._stopListContainer = Wu.DomUtil.create('div', 'raster-stop-list-container', this._wrapper);


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


		// EACH COLOR
		// EACH COLOR
		// EACH COLOR

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
				value     : Wu.Tools.rgbaStyleStr(this.stops[i].col),
				className : 'raster-color',
				on        : true,
				showAlpha : true,
				format    : 'rgba'

			});

		}.bind(this));

		// Set poision of color selectors, ranges, etc
		this.setSliderPosition();


		this._renderStopList();

	},

	_renderStopList : function () {

		// return;

		this._stopListContainer.innerHTML = '';
		var tabIndex = 1;

		// CREATE DESCRIPTION LINE

		// LINE
		var line = Wu.DomUtil.create('div', 'stop-list-each', this._stopListContainer);

		// NUMBER
		var noWrap  = Wu.DomUtil.create('div', 'stop-list-no stop-list-item', line);
		var noTitle = Wu.DomUtil.create('div', 'stop-list-no-title', noWrap, '#');

		// VALUE
		var valWrap  = Wu.DomUtil.create('div',   'stop-list-val stop-list-item', line);
		var valInput = Wu.DomUtil.create('div', 'stop-list-title', valWrap, 'Value');

		// COLORS
		var colWrap = Wu.DomUtil.create('div', 'stop-list-color-wrapper stop-list-item', line);
		
		var rInput  = Wu.DomUtil.create('div', 'stop-color', colWrap, 'Red');						
		var gInput  = Wu.DomUtil.create('div', 'stop-color', colWrap, 'Green');
		var bInput  = Wu.DomUtil.create('div', 'stop-color', colWrap, 'Blue');

		// ALPHA
		var alphaWrap = Wu.DomUtil.create('div', 'stop-list-alpha-wrapper stop-list-item', line);			
		var aInput  = Wu.DomUtil.create('div', 'stop-color', alphaWrap, 'Opacity');

		// COLOR
		var colorWrap = Wu.DomUtil.create('div', 'stop-list-color-ball-wrapper', line);
		var color = Wu.DomUtil.create('div', 'stop-list-color-ball', colorWrap);
		    // color.setAttribute('style', 'background:' + Wu.Tools.rgbaStyleStr(stop.col));



		// Allow user to remove color if it's more than three...
		if ( this.stops.length >= 3 ) var allowKilling = true;

		// POPULATE
		this.stops.forEach(function (stop, i) {
		
			var v = stop.val ? stop.val : '0';
			var r = stop.col.r ? stop.col.r : '0';
			var g = stop.col.g ? stop.col.g : '0';
			var b = stop.col.b ? stop.col.b : '0';
			var a = stop.col.a ? stop.col.a : '0';

			// LINE
			var line = Wu.DomUtil.create('div', 'stop-list-each', this._stopListContainer);

			// NUMBER
			var noWrap  = Wu.DomUtil.create('div', 'stop-list-no stop-list-item', line);
			var noTitle = Wu.DomUtil.create('div', 'stop-list-no-title', noWrap, '<b>' + (i+1) + '</b>');

			// VALUE
			var valWrap  = Wu.DomUtil.create('div',   'stop-list-val stop-list-item', line);
			var valInput = Wu.DomUtil.create('input', 'stop-list-title', valWrap, v);
			valInput.value = v;
			valInput.setAttribute('no', i);
			valInput.setAttribute('type', 'v');
			valInput.setAttribute('tabindex', tabIndex++);

			// COLORS
			var colWrap = Wu.DomUtil.create('div', 'stop-list-color-wrapper stop-list-item', line);
			
			var rInput  = Wu.DomUtil.create('input', 'stop-color', colWrap, r);
			rInput.value = r;
			rInput.setAttribute('no', i);
			rInput.setAttribute('type', 'r');
			rInput.setAttribute('tabindex', tabIndex++);
						
			var gInput  = Wu.DomUtil.create('input', 'stop-color', colWrap, g);
			gInput.value = g;
			gInput.setAttribute('no', i);
			gInput.setAttribute('type', 'g');
			gInput.setAttribute('tabindex', tabIndex++);

			var bInput  = Wu.DomUtil.create('input', 'stop-color', colWrap, b);
			bInput.value = b;
			bInput.setAttribute('no', i);
			bInput.setAttribute('type', 'b');
			bInput.setAttribute('tabindex', tabIndex++);
			
			// ALPHA
			var alphaWrap = Wu.DomUtil.create('div', 'stop-list-alpha-wrapper stop-list-item', line);			
			var aInput  = Wu.DomUtil.create('input', 'stop-color', alphaWrap, a);
			aInput.value = a;
			aInput.setAttribute('no', i);
			aInput.setAttribute('type', 'a');
			aInput.setAttribute('tabindex', tabIndex++);


			// COLOR
			var colorWrap = Wu.DomUtil.create('div', 'stop-list-color-ball-wrapper', line);
			var color = Wu.DomUtil.create('div', 'stop-list-color-ball', colorWrap);
			    color.setAttribute('style', 'background:' + Wu.Tools.rgbaStyleStr(stop.col));
			

			// Validate (force numerice)
			valInput.onkeypress = Wu.Tools.forceNumeric;
			rInput.onkeypress = Wu.Tools.forceNumeric;
			gInput.onkeypress = Wu.Tools.forceNumeric;
			bInput.onkeypress = Wu.Tools.forceNumeric;
			aInput.onkeypress = Wu.Tools.forceNumeric;

			// Update
			Wu.DomEvent.on(valInput, 'blur', this.rasterInputChange, this);
			Wu.DomEvent.on(rInput, 'blur', this.rasterInputChange, this);
			Wu.DomEvent.on(gInput, 'blur', this.rasterInputChange, this);
			Wu.DomEvent.on(bInput, 'blur', this.rasterInputChange, this);
			Wu.DomEvent.on(aInput, 'blur', this.rasterInputChange, this);


			if ( allowKilling ) {
				
				var icon = '<i class="fa fa-minus-circle" no="' + i + '"></i>';
				var killButton = Wu.DomUtil.create('div', 'stop-list-kill-color target-remove', line, icon);
				    killButton.setAttribute('no', i);
				
				Wu.DomEvent.on(killButton, 'click', this.killStop, this);

			}

		}.bind(this));

	},

	killStop : function (e) {

		var no = e.target.getAttribute('no');
		this.removeStop(no);

	},

	rasterInputChange : function (e) {

		var no = e.target.getAttribute('no');
		var type = e.target.getAttribute('type');
		var val  = e.target.value;

		// Make sure value is not more or less than maximum allowed
		if ( type == 'v' ) {
			if ( val < this.rangeMin ) val = this.rangeMin;
			if ( val > this.rangeMax ) val = this.rangeMax;

			// Update Object
			this.stops[no].val = val;
		}

		// Force RGB values to be between 255 and 0
		if ( type == 'r' || type == 'g' || type == 'b' ) {
			if ( val < 0 )   val = 0;
			if ( val > 255 ) val = 255;

			// Update Object
			this.stops[no].col[type] = val;

		}

		// Force ALPHA to be between 0 and 1
		if ( type == 'a' ) {
			if ( val < 0 ) val = 0;
			if ( val > 1 ) val = 1;

			// Update Object
			this.stops[no].col[type] = val;			
		}		

		// Rewrite input with new value
		e.target.value = val;


		this._renderSlider();
			


	},

	_updateColor : function (col, key, wrapper) {

		this.stops[key].col = col;
		this.setSliderColor();
	},

	addHooks : function () {

	},



	rangeClick : function (e) {

		var target = e.target;

		var handleClick = false;
		target.classList.forEach(function (c) { if ( c == 'noUi-handle' ) handleClick = true; });

		handleClick ? this.removeStopClick(e) : this.addStop(e);

	},

	removeStopClick : function (e) {

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

		this.removeStop(stop);


	},

	removeStop : function (no) {

		// Do not allow less than two stops
		if ( this.stops.length <= 2 ) return;

		// REMOVE FROM DOM
		this.stops[no].DOM.wrapper.remove();
		this.stops[no].DOM.wrapper = null;
		
		this.stops[no].DOM.container.remove();
		this.stops[no].DOM.container = null;	
		
		this.stops[no].DOM.range.remove();
		this.stops[no].DOM.range = null;
		
		this.stops[no].DOM.colorBall.color.remove();
		this.stops[no].DOM.colorBall.color = null;
		
		this.stops[no].DOM.colorBall = null;

		this.stops[no].DOM = null;

		// Remove from Array
		this.stops.splice(no, 1);

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
		var rgba1 = stop1.col;

		// Second stop values
		var val2 = stop2.val;
		var rgba2 = stop2.col;


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

		// Mix colors
		var newRGB = Wu.Tools.mixColors(rgba1, rgba2, percent);

		// Data for new stop
		var newStop = {
			val : newVal,
			col : newRGB
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
			var style = Wu.Tools.transformTranslate(pixelsFromLeft, 0);			
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


		this._renderStopList();
		
	},


	getGradient : function (c1, c2) {

		var _c1 = Wu.Tools.rgbaStyleStr(c1);
		var _c2 = Wu.Tools.rgbaStyleStr(c2);
		var gradient = Wu.Tools.createGradient(_c1, _c2);
		return gradient;
	},

	setCarto : function (carto) {
		console.log('%c setCarto ', 'background: hotpink; color: white;');
		console.log('carto', carto);
		this.options.carto = carto;
	},	




});

