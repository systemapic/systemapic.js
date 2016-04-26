Wu.RasterStyler = Wu.Class.extend({

	type       : 'cube',
	pixelWidth : 369,

	initialize : function (options) {

		this.options = options;

		// Default styling
		var defaultStops = [{val : 80, col : { r : 0, g : 0, b : 255, a : 1 } }, { val : 180, col : { r : 255, g : 0, b : 0, a : 1 } }];

		// Get stops
		this.stops = _.isObject(options.carto) ? options.carto : defaultStops;

		// Create dom
		this._initContainer();
		
		// Add events
		this.addHooks();

	},

	_initContainer : function () {


		// Create divs
		this._wrapper = Wu.DomUtil.create('div', 'chrome-content-section-wrapper raster-styler', this.options.container);
		this._rangeMarks = Wu.DomUtil.create('div', 'raster-range-marks', this._wrapper);
		this._maxMark = Wu.DomUtil.create('div', 'raster-range-max-mark', this._rangeMarks, this.options.rangeMin.toString());
		this._minMark = Wu.DomUtil.create('div', 'raster-range-min-mark', this._rangeMarks, this.options.rangeMax.toString()); // todo: shouldn't be hardcoded
		this._sliderContainer = Wu.DomUtil.create('div', 'raster-range-slider', this._wrapper);		
		this._rangeWrapper = Wu.DomUtil.create('div', 'raster-color-range-wrapper', this._wrapper);

		// For list
		this._stopListContainer = Wu.DomUtil.create('div', 'raster-stop-list-container', this._wrapper);	
		this._stopListButtonContainer = Wu.DomUtil.create('div', 'raster-stops-button-container', this._wrapper);
		this._stopListButton = Wu.DomUtil.create('div', 'raster-stops-view-as-list-button', this._stopListButtonContainer, 'View as list');
		
		// Render slider
		this._renderSlider();

		// Description
		this._descriptions = Wu.DomUtil.create('div', 'raster-styler-description', this.options.container);
		this._descriptions.innerHTML = 'Double click on colored line to create a new handle.<br>Double click on handle to remove it.'


	},

	addHooks : function () {
		Wu.DomEvent.on(this._stopListButton, 'click', this.toggleStoplist, this);
	},	




	// ███████╗██╗     ██╗██████╗ ███████╗██████╗ 
	// ██╔════╝██║     ██║██╔══██╗██╔════╝██╔══██╗
	// ███████╗██║     ██║██║  ██║█████╗  ██████╔╝
	// ╚════██║██║     ██║██║  ██║██╔══╝  ██╔══██╗
	// ███████║███████╗██║██████╔╝███████╗██║  ██║
	// ╚══════╝╚══════╝╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝

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
				'min': this.options.rangeMin,
				'max': this.options.rangeMax
			}
		});

		// Slide listner
		this.slider.on('slide', function( values, handle ) {

			var val    = Math.round(parseInt(values[handle]));
			var before = values[handle-1];
			var after  = values[handle+1];

			// There is a handle before this
			if ( before ) {
				// Difference between current handle and the one before
				var diffBefore = val - Math.round(parseInt(before));
				// If they overlap, add 1 to current handle
				if ( diffBefore == 0 ) val ++;
			}

			// There is a handle after this
			if ( after ) {
				// Difference between current handle and the one after
				var diffAfter = val - Math.round(parseInt(after));
				// If they overlap, remove 1 to current handle
				if ( diffAfter == 0 ) val --;
			}

			// Update current stop with adjusted values
			this.stops[handle].val = val;
			

			// Set slider position
			this._setSliderPosition();
			this._renderStopList();


		}.bind(this));

		// Hover listner
		this.slider.on('hover', function( value ) { this.hoverValue = value; }.bind(this));

		// Click event
		Wu.DomEvent.on(this.slider.target, 'dblclick', this.rangeClick, this);


		// EACH STOP
		// EACH STOP
		// EACH STOP

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
		this._setSliderPosition();

		// this._renderStopList();
		app.Tools.Styler.markChanged();


	},


	// ┌─┐┬  ┬┌┬┐┌─┐┬─┐  ┌─┐┌─┐┌┬┐┬┌─┐┌┐┌┌─┐
	// └─┐│  │ ││├┤ ├┬┘  ├─┤│   │ ││ ││││└─┐
	// └─┘┴─┘┴─┴┘└─┘┴└─  ┴ ┴└─┘ ┴ ┴└─┘┘└┘└─┘	

	// Update color
	_updateColor : function (col, key, wrapper) {
		this.stops[key].col = col;
		this._setSliderColor();
	},

	// Update color, and redraw slider
	// (Gets used when color from list is changed by spectrum)
	_forceUpdateColor : function (col, key, wrapper) {
		this.stops[key].col = col;
		this._renderSlider();
	},


	// ONLY sets color elements position from left!
	// No width, nor color updates happens here...
	_setSliderPosition : function () {

		var span = this.options.rangeMax - this.options.rangeMin;	

		this.stops.forEach(function (stop, i) {

			var pixelsFromLeft = Math.round((stop.val / span) * this.pixelWidth);			
			var style = Wu.Tools.transformTranslate(pixelsFromLeft, 0);			
			stop.DOM.wrapper.setAttribute('style', style);

		}.bind(this));

		this._setSliderColor();

	},

	// Sets slider color + width + updates number above line
	_setSliderColor : function () {

		var span = this.options.rangeMax - this.options.rangeMin;

		this.stops.forEach(function (stop, i) {

			if ( this.stops[i+1] ) {

				// Stops
				var thisStop = stop;
				var nextStop = this.stops[i+1];

				// Calculate				
				var thisPercentFromLeft = Math.round(thisStop.val/span * 100);
				var nextPercentFromLeft = Math.round(nextStop.val/span * 100);

				// Values
				// var left  = thisPercentFromLeft;
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

		// this._renderStopList();
		
	},

	// Remove stop (by index)
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
		this._renderStopList();

	},

	// Add stop (by value and index)
	addStop : function (val, index) {

		// Get the two stops where we want to go between
		var stop1 = this.stops[index];
		var stop2 = this.stops[index+1];
		
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
		var newValRange = val - val1;

		// Range between existing stops
		var valRange = val2 - val1;

		// How many percent of range between existing two 
		// stops are we located at ... [*][.*..][*] = 25%
		var percent = newValRange/valRange;

		// Mix colors
		var newRGB = Wu.Tools.mixColors(rgba1, rgba2, percent);

		// Data for new stop
		var newStop = {
			val : val,
			col : newRGB
		}

		// Inject new stop
		this.stops.splice(index+1, 0, newStop);

		// Render da sheeet
		this._renderSlider();
		this._renderStopList();

	},

	addStopBefore : function (val) {

		var nextStop = this.stops[0];
		var newStop = {
			val : val,
			col : nextStop.col
		}

		this.stops.splice(0,0,newStop);

		this._renderSlider();
		this._renderStopList();

	},

	addStopAfter : function (val) {

		var prevStop = this.stops[this.stops.length-1];
		var newStop = {
			val : val,
			col : prevStop.col
		}

		this.stops.push(newStop);

		this._renderSlider();
		this._renderStopList();


	},


	// ┌─┐┬  ┬┌─┐┬┌─  ┌─┐┬  ┬┌─┐┌┐┌┌┬┐┌─┐
	// │  │  ││  ├┴┐  ├┤ └┐┌┘├┤ │││ │ └─┐
	// └─┘┴─┘┴└─┘┴ ┴  └─┘ └┘ └─┘┘└┘ ┴ └─┘	

	rangeClick : function (e) {

		var target = e.target;
		var handleClick = false;

		// Check if we've clicked on a handle...
		target.classList.forEach(function (c) { if ( c == 'noUi-handle' ) handleClick = true; });

		// If we've clicked on a handle, remove stop
		// If we've clicked on the color strip, add stop
		handleClick ? this.rangeClickRemoveStop(e) : this.rangeClickAddStop(e);
	},

	rangeClickRemoveStop : function (e) {

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

	rangeClickAddStop : function (e) {

		var val = Math.round(this.hoverValue);
		var index = -1;
		var tooClose = false;
		var buffer = 15;

		// Add stop before
		if ( val < ( this.stops[0].val - buffer) ) {
			this.addStopBefore(val);
			return;
		}

		// Add stop after
		if ( val > ( this.stops[this.stops.length-1].val + buffer ) ) {
			this.addStopAfter(val);
			return;
		}

		// Find out between which stops to place this stop...
		this.stops.forEach(function (stop, i) {
			// New value is LARGER than stop
			if ( val > stop.val ) index = i;
			var diff = Math.abs(stop.val - val);
			if ( diff < buffer ) tooClose = true;
		}.bind(this));

		// Need a buffer, so that we don't create a new handle when pulling a handle :P
		if ( tooClose ) { console.error('Too close!'); return; }

		this.addStop(val, index);

	},










	// ██╗     ██╗███████╗████████╗
	// ██║     ██║██╔════╝╚══██╔══╝
	// ██║     ██║███████╗   ██║   
	// ██║     ██║╚════██║   ██║   
	// ███████╗██║███████║   ██║   
	// ╚══════╝╚═╝╚══════╝   ╚═╝   

	toggleStoplist : function () {
		this.viewStoplist ? this.disableStopList() : this.enableStopList();
	},

	disableStopList : function () {
		this._stopListContainer.innerHTML = '';
		this._stopListButton.innerHTML = 'View as list';
		this.viewStoplist = false;
	}, 

	enableStopList : function () {
		this._stopListButton.innerHTML = 'Hide list';
		this.viewStoplist = true;
		this._renderStopList();
	},	

	_renderStopList : function () {

		if ( !this.viewStoplist ) return;
		
		this._stopListContainer.innerHTML = '';
		var tabIndex = 100;

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





		// Only allow users to remove colors if there are more than two
		if ( this.stops.length >= 3 ) var allowKilling = true;

		// POPULATE
		this.stops.forEach(function (stop, i) {
		
			var _h = stop.list = {};

			var v = stop.val ? stop.val : '0';
			var r = stop.col.r ? stop.col.r : '0';
			var g = stop.col.g ? stop.col.g : '0';
			var b = stop.col.b ? stop.col.b : '0';
			var a = stop.col.a ? stop.col.a : '0';

			// LINE
			_h.line = Wu.DomUtil.create('div', 'stop-list-each', this._stopListContainer);

			// ADD NEW STOP
			if ( this.stops[i+1] ) {
				var diff = parseInt(this.stops[i+1].val) - v;
				// Only allow to inject new stop if difference between stop before
				// and after is greater than two.
				if ( diff >= 2 ) {
					var icon = '<i class="fa fa-plus-circle" no="' + i + '"></i>';
					_h.addButton = Wu.DomUtil.create('div', 'stop-list-add-color target-add', _h.line, icon);				
					Wu.DomEvent.on(_h.addButton, 'click', this.addButtonClick, this);					
				}
			}

			// NUMBER
			_h.noWrap  = Wu.DomUtil.create('div', 'stop-list-no stop-list-item', _h.line);
			_h.noTitle = Wu.DomUtil.create('div', 'stop-list-no-title', _h.noWrap, '<b>' + (i+1) + '</b>');

			// VALUE
			_h.valWrap  = Wu.DomUtil.create('div',   'stop-list-val stop-list-item', _h.line);
			_h.valInput = Wu.DomUtil.create('input', 'stop-list-title', _h.valWrap, v);
			_h.valInput.value = v;
			_h.valInput.setAttribute('no', i);
			_h.valInput.setAttribute('type', 'v');
			_h.valInput.setAttribute('tabindex', tabIndex++);

			// COLORS
			_h.colWrap = Wu.DomUtil.create('div', 'stop-list-color-wrapper stop-list-item', _h.line);
			
			// RED
			_h.rInput  = Wu.DomUtil.create('input', 'stop-color', _h.colWrap, r);
			_h.rInput.value = r;
			_h.rInput.setAttribute('no', i);
			_h.rInput.setAttribute('type', 'r');
			_h.rInput.setAttribute('tabindex', tabIndex++);
				
			// GREEN		
			_h.gInput  = Wu.DomUtil.create('input', 'stop-color', _h.colWrap, g);
			_h.gInput.value = g;
			_h.gInput.setAttribute('no', i);
			_h.gInput.setAttribute('type', 'g');
			_h.gInput.setAttribute('tabindex', tabIndex++);

			// BLUE
			_h.bInput  = Wu.DomUtil.create('input', 'stop-color', _h.colWrap, b);
			_h.bInput.value = b;
			_h.bInput.setAttribute('no', i);
			_h.bInput.setAttribute('type', 'b');
			_h.bInput.setAttribute('tabindex', tabIndex++);
			
			// ALPHA
			_h.alphaWrap = Wu.DomUtil.create('div', 'stop-list-alpha-wrapper stop-list-item', _h.line);			
			_h.aInput  = Wu.DomUtil.create('input', 'stop-color', _h.alphaWrap, a);
			_h.aInput.value = a;
			_h.aInput.setAttribute('no', i);
			_h.aInput.setAttribute('type', 'a');
			_h.aInput.setAttribute('tabindex', tabIndex++);

			// COLOR
			_h.colorWrap = Wu.DomUtil.create('div', 'stop-list-color-ball-wrapper', _h.line);

			// Color selector
			_h.color = new Wu.button({
				appendTo  : _h.colorWrap,
				type      : 'colorball',
				id        : i,
				fn 	  : this._forceUpdateColor.bind(this),
				right     : false,
				value     : Wu.Tools.rgbaStyleStr(stop.col),
				className : 'stop-list-color-ball',
				on        : true,
				showAlpha : true,
				format    : 'rgba'
			});


			// Catch arrow movements			
			Wu.DomEvent.on(_h.valInput, 'keydown', this.routKey, this);
			Wu.DomEvent.on(_h.rInput,   'keydown', this.routKey, this);
			Wu.DomEvent.on(_h.gInput,   'keydown', this.routKey, this);
			Wu.DomEvent.on(_h.bInput,   'keydown', this.routKey, this);
			Wu.DomEvent.on(_h.aInput,   'keydown', this.routKey, this);

			// Force numeric value
			_h.valInput.onkeypress = Wu.Tools.forceNumeric;
			_h.rInput.onkeypress   = Wu.Tools.forceNumeric;
			_h.gInput.onkeypress   = Wu.Tools.forceNumeric;
			_h.bInput.onkeypress   = Wu.Tools.forceNumeric;
			_h.aInput.onkeypress   = Wu.Tools.forceNumeric;

			// Update
			Wu.DomEvent.on(_h.valInput, 'blur', this.rasterInputChange, this);
			Wu.DomEvent.on(_h.rInput, 'blur', this.rasterInputChange, this);
			Wu.DomEvent.on(_h.gInput, 'blur', this.rasterInputChange, this);
			Wu.DomEvent.on(_h.bInput, 'blur', this.rasterInputChange, this);
			Wu.DomEvent.on(_h.aInput, 'blur', this.rasterInputChange, this);


			if ( allowKilling ) {
				
				var icon = '<i class="fa fa-minus-circle" no="' + i + '"></i>';
				_h.killButton = Wu.DomUtil.create('div', 'stop-list-kill-color target-remove', _h.line, icon);
				Wu.DomEvent.on(_h.killButton, 'click', this.killStopClick, this);

			}

		}.bind(this));

	},

	routKey : function (e) {

		var key = e.keyCode;

		// UP
		if ( key == 38 ) this.tab(e, 'up');

		// DOWN
		if ( key == 40 ) this.tab(e, 'down');

		// LEFT
		if ( key == 37 ) {
			var input = e.target;
			var cPos = Wu.Tools.getCursorPos(input);
			if ( cPos <= 0 ) this.tab(e, 'left');
		}		

		// RIGHT
		if ( key == 39 ) {	
			var input = e.target;
			var length = input.value.length;
			var cPos = Wu.Tools.getCursorPos(input);
			if ( cPos >= length ) this.tab(e, 'right')
		}

		// Blur on enter
		if ( key == 13 ) e.target.blur();		
		

	},

	// "Circular" tabbing in list
	tab : function (e, direction) {

		var no = parseInt(e.target.getAttribute('no'));
		var type = e.target.getAttribute('type');
		
		// TABBING UP OR DOWN
		// TABBING UP OR DOWN
		// TABBING UP OR DOWN

		if ( direction == 'up' || direction == 'down' ) {

			if ( direction == 'up' )    var _num = this.stops[no-1] ? no-1 : this.stops.length-1;
			if ( direction == 'down' )  var _num = this.stops[no+1] ? no+1 : 0;

			if ( type == 'v' ) this.stops[_num].list.valInput.focus();
			if ( type == 'r' ) this.stops[_num].list.rInput.focus();
			if ( type == 'g' ) this.stops[_num].list.gInput.focus();
			if ( type == 'b' ) this.stops[_num].list.bInput.focus();
			if ( type == 'a' ) this.stops[_num].list.aInput.focus();

			return;

		}

		// TABBING LEFT OR RIGHT
		// TABBING LEFT OR RIGHT
		// TABBING LEFT OR RIGHT

		if ( direction == 'left' || direction == 'right' ) {

			// Create an array of input fields
			var inputs = [
				{ type : 'v', input :  this.stops[no].list.valInput },
				{ type : 'r', input :  this.stops[no].list.rInput },
				{ type : 'g', input :  this.stops[no].list.gInput },
				{ type : 'b', input :  this.stops[no].list.bInput },
				{ type : 'a', input :  this.stops[no].list.aInput },
			]

			// Tab left or right
			inputs.forEach(function (input, i) {	
				if ( input.type == type ) {
					if ( direction == 'right' ) var _no = i == inputs.length-1 ? 0 : i+1;					
					if ( direction == 'left' )  var _no = i == 0 ? inputs.length-1 : i-1;
					inputs[_no].input.focus();
					return;					
				}
			}.bind(this));

			return;
		}

	},





	// Remove Stop
	killStopClick : function (e) {
		var no = e.target.getAttribute('no');
		this.removeStop(no);
	},

	// Add stop
	addButtonClick : function (e) {

		// Get current stop index
		var index  = parseInt(e.target.getAttribute('no'));
		
		// Get stops before and after
		var before = this.stops[index];
		var after  = this.stops[index+1];

		// If there are no stop either before or after, stop
		if ( !before || !after ) return;

		// Get values before and after
		var val1 = parseInt(before.val);
		var val2 = parseInt(after.val);

		// Figure out the difference (range)
		var diff = val2 - val1;

		// Figure out new position (50%)
		var val = Math.round(diff/2) + val1;

		// Add new stop
		this.addStop(val, index);

	},

	// Input change
	rasterInputChange : function (e) {

		var no = parseInt(e.target.getAttribute('no'));
		var type = e.target.getAttribute('type');
		var val  = parseFloat(e.target.value);

		// Make sure value is not more or less than maximum allowed
		if ( type == 'v' ) {

			if ( val < this.options.rangeMin ) val = this.options.rangeMin;
			if ( val > this.options.rangeMax ) val = this.options.rangeMax;

			// If val is less than stop before, force it to previous stop + 1
			if ( this.stops[no-1] && this.stops[no-1].val >= val ) {
				val = this.stops[no-1].val + 1;
			}

			// If val is more than stop after, force it to previous stop - 1
			if ( this.stops[no+1] && this.stops[no+1].val <= val ) {
				val = this.stops[no+1].val - 1;
			}

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


		// ****************************

		
		// If updating value

		if ( type == 'v' ) {

			// Set value
			this.stops[no].val = val;

			// Render slider
			this._renderSlider();

			// Stop
			return;			

		}



		// UPDATING COLOR

		// RGBA object
		var RGBA = this.stops[no].col;

		// Set value
		RGBA[type] = val;

		// get RGBA color
		var bgColor = Wu.Tools.rgbaStyleStr(RGBA)

		// Set spectrum
		var stop  = this.stops[no];
		var list  = this.stops[no].list;
		var color = list.color.color;

		color.style.background = bgColor;
		$(color).spectrum("set", bgColor);

		// Render slider
		this._renderSlider();
			
	},	



	// ████████╗ ██████╗  ██████╗ ██╗     ███████╗
	// ╚══██╔══╝██╔═══██╗██╔═══██╗██║     ██╔════╝
	//    ██║   ██║   ██║██║   ██║██║     ███████╗
	//    ██║   ██║   ██║██║   ██║██║     ╚════██║
	//    ██║   ╚██████╔╝╚██████╔╝███████╗███████║
	//    ╚═╝    ╚═════╝  ╚═════╝ ╚══════╝╚══════╝


	getGradient : function (c1, c2) {

		var inBetween = Wu.Tools.mixColors(c1, c2, 0.5);

		var _c1 = Wu.Tools.rgbaStyleStr(c1);
		var _c2 = Wu.Tools.rgbaStyleStr(inBetween);
		var _c3 = Wu.Tools.rgbaStyleStr(c2);

		var gradient = Wu.Tools.createGradient([_c1,_c2,_c3]);
		return gradient;
	},

	stops2cartocss : function (stops) {

		if ( !stops ) return;

		var minVal = this.options.rangeMin;
		var maxVal = this.options.rangeMax;	

		var firstStop = parseInt(stops[0].val);
		var lastStop = parseInt(stops[stops.length-1].val);

		// todo: add blur to stops
		var blur = true;
		var blurType = 'gaussian';

		// Default CSS
		var styleCSS = '#layer { ';
		styleCSS += 'raster-opacity: 1; ';
		styleCSS += 'raster-colorizer-default-mode: linear; ';
		styleCSS += 'raster-colorizer-default-color: transparent; ';
		styleCSS += 'raster-comp-op: color-dodge; ';
		if (blur) styleCSS += 'raster-scaling: ' + blurType + '; ';
		styleCSS += 'raster-colorizer-stops: ';

		// If the first stop is not equal to minVal,
		// create a stop for minVal
		if ( firstStop != minVal ) {
			styleCSS += ' stop(' + minVal + ', rgba(0,0,0,0))';
			styleCSS += ' stop(' + (firstStop-1) + ', rgba(0,0,0,0))';
		}

		// Create all the stops
		stops.forEach(function (stop, i) {
			var val = stop.val;
			var _RGBA = stop.col;
			var rgba = 'rgba(' + _RGBA.r + ',' + _RGBA.g + ',' + _RGBA.b + ',' + _RGBA.a + ')';
			styleCSS += ' stop(' + val + ', ' + rgba + ')';
		}.bind(this));		

		// If the last stop is not equal to maxVal,
		// create a stop for 
		if ( lastStop != maxVal ) {
			styleCSS += ' stop(' + (lastStop+1) + ', rgba(0,0,0,0))';
			styleCSS += ' stop(' + maxVal + ', rgba(0,0,0,0), exact)';
		}
		styleCSS += ';}';

		return styleCSS;
	},

});

