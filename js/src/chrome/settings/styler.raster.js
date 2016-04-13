Wu.RasterStyler = Wu.Class.extend({

	type : 'cube',
	rangeMin : 0,
	rangeMax : 256,

	initialize : function (options) {

		this.options = options;

		// 
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
		this._maxMark = Wu.DomUtil.create('div', 'raster-range-max-mark', this._rangeMarks, '0');
		this._minMark = Wu.DomUtil.create('div', 'raster-range-min-mark', this._rangeMarks, '256'); // todo: shouldn't be hardcoded
		this._sliderContainer = Wu.DomUtil.create('div', 'raster-range-slider', this._wrapper);


		// If slider exists, destroy it
		if ( this.slider ) this.slider.destroy();

		var sliderStops = [];
		this.stops.forEach(function (stop) { sliderStops.push(stop.val) });

		// Create slider
		this.slider = noUiSlider.create(this._sliderContainer, {
			start: sliderStops,
			animate: false,
			range: {
				'min': this.rangeMin,
				'max': this.rangeMax
			}
		});


		// console.log('this.slider', this.slider);

		this._rangeWrapper = Wu.DomUtil.create('div', 'raster-color-range-wrapper', this._wrapper);
		// this._colorRange = Wu.DomUtil.create('div', 'raster-color-range', this._rangeWrapper);


		this.stops.forEach(function (stop, i) { 

			stop.DOM = {}
			stop.DOM.container = Wu.DomUtil.create('div', 'raster-color-selector', this._rangeWrapper);
			// stop.DOM.number    = Wu.DomUtil.create('div', 'raster-color-number', stop.DOM.container)

			stop.DOM.colorBall = new Wu.button({
				appendTo  : stop.DOM.container,
				type      : 'colorball',
				id        : 'cube-color-' + i,
				fn 	  : this._updateColor.bind(this),
				right     : false,
				value     : this.stops[i].col,
				className : 'raster-color',
				on        : true
			});

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



		// this._colorSelectorLeft = Wu.DomUtil.create('div', 'raster-color-selector left', this._colorRange);
		// this._leftNumber = Wu.DomUtil.create('div', 'raster-color-number', this._colorSelectorLeft)

		// this._colorSelectorRight = Wu.DomUtil.create('div', 'raster-color-selector right', this._colorRange);
		// this._rightNumber = Wu.DomUtil.create('div', 'raster-color-number', this._colorSelectorRight)
		
		// if ( !this.stops[0].opacity && _.isNaN(this.stops[0].opacity)) {
		// 	this.stops[0].opacity = 1; // todo: this fails if opacity is set to 0
		// }
		// if ( !this.stops[1].opacity && _.isNaN(this.stops[1].opacity)) {
		// 	this.stops[1].opacity = 1;
		// }

		// this.leftBall = new Wu.button({
		// 	appendTo  : this._colorSelectorLeft,
		// 	type      : 'colorball',
		// 	id        : 'cube-color-left',
		// 	fn 	  : this.changeItLeft.bind(this),
		// 	right     : false,
		// 	value     : this.stops[0].col,
		// 	className : 'raster-color',
		// 	on        : true
		// });

		// this.leftMiniInput = new Wu.button({
		// 	id          : 'cube-input-left',
		// 	type        : 'miniInput',
		// 	appendTo    : this._colorSelectorLeft,
		// 	fn 	    : this.changeItLeft.bind(this),
		// 	right 	    : true,
		// 	isOn        : true,
		// 	value       : this.stops[0].opacity,
		// 	className   : 'raster-color-input',
		// 	placeholder : 1,
		// 	fn 	    	: this._updateOpacity.bind(this)
		// });

		// this.rightBall = new Wu.button({
		// 	appendTo  : this._colorSelectorRight,
		// 	type      : 'colorball',
		// 	id        : 'cube-color-right',
		// 	fn 	  : this.changeItRight.bind(this),
		// 	right     : false,
		// 	value     : this.stops[1].col,
		// 	className : 'raster-color',
		// 	on        : true
		// });

		// this.rightMiniInput = new Wu.button({
		// 	id          : 'cube-input-right',
		// 	type        : 'miniInput',
		// 	appendTo    : this._colorSelectorRight,
		// 	fn 	    : this.changeItLeft.bind(this),
		// 	right 	    : true,
		// 	isOn        : true,
		// 	value       : this.stops[1].opacity,
		// 	className   : 'raster-color-input',
		// 	placeholder : 1,
		// 	fn 	    : this._updateOpacity.bind(this)
		// });

	},

	_updateOpacity : function (e) {
		var box = e.target;

		if (box == this.leftMiniInput.input) {
			this.stops[0].opacity = parseFloat(box.value)
		}
		
		if (box == this.rightMiniInput.input) {
			this.stops[1].opacity = parseFloat(box.value);
		}

		// update
		this.setSliderColor();
	},

	_updateColor : function (e) {

	},

	// changeItLeft : function (hex, key, wrapper) {
	// 	this.stops[0].col = hex;
	// 	this.setSliderColor();
	// },

	// changeItRight : function (hex, key, wrapper) {
	// 	this.stops[1].col = hex;
	// 	this.setSliderColor();
	// },

	addHooks : function () {

		this.slider.on('slide', function( values, handle ) {


			// console.log('values', values);

			values.forEach(function (v, i) {
				this.stops[i].val = parseInt(v);
			}.bind(this))

			// console.log('');
			// console.log('');


			// var min = Math.round(parseInt(values[0]));
			// var max = Math.round(parseInt(values[1]));

			// this.stops[0].val = min;
			// this.stops[1].val = max;

			app.Tools.Styler.markChanged();
			this._setSliderColor();

		}.bind(this));		
		
	},


	_setSliderColor : function () {

		this.stops.forEach(function (stop) {
			var v = stop.val;
			var span = this.rangeMax - this.rangeMin;
			var percentFromLeft = Math.round(v/span * 100);

			// console.log('precent from left =>', percentFromLeft);
			stop.DOM.container.style.left = percentFromLeft + '%';


		}.bind(this))


	},

	setSliderColor : function () {
		
		var percent = 100/256; // todo: this is hardcoded, not necessarily 0-255;
		var left = percent * this.stops[0].val;
		var width = (percent * this.stops[1].val) - (percent * this.stops[0].val);

		// calc style
		var style = 'background: -webkit-linear-gradient(left, ' + this.stops[0].col + ' , ' + this.stops[1].col + ');';
		style += 'background: -o-linear-gradient(right, ' + this.stops[0].col + ' , ' + this.stops[1].col + ');';
		style += 'background: -moz-linear-gradient(right, ' + this.stops[0].col + ' , ' + this.stops[1].col + ');';
		style += 'background: linear-gradient(to right, ' + this.stops[0].col + ' , ' + this.stops[1].col + ');';
		style += 'left: ' + left + '%;';
		style += 'width: ' + width + '%;';

	    	// set style to colorrange
		// this._colorRange.setAttribute('style', style);

		// set opacity to input divs
		// this._leftNumber.innerHTML = this.stops[0].val;	
		// this._rightNumber.innerHTML = this.stops[1].val;
	},

	setCarto : function (carto) {
		console.log('%c setCarto ', 'background: hotpink; color: white;');
		console.log('carto', carto);
		this.options.carto = carto;
	},	

});

