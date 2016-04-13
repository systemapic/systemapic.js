Wu.RasterStyler = Wu.Class.extend({

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
		this._maxMark = Wu.DomUtil.create('div', 'raster-range-max-mark', this._rangeMarks, '0');
		this._minMark = Wu.DomUtil.create('div', 'raster-range-min-mark', this._rangeMarks, '256'); // todo: shouldn't be hardcoded
		this._sliderContainer = Wu.DomUtil.create('div', 'raster-range-slider', this._wrapper);

		// create slider
		this.slider = noUiSlider.create(this._sliderContainer, {
			start: [this.stops[0].val, this.stops[1].val],
			connect : true,
			range: {
				'min': 0,
				'max': 256 // todo: hardcoded
			}
		});

		this._rangeWrapper = Wu.DomUtil.create('div', 'raster-color-range-wrapper', this._wrapper);
		this._colorRange = Wu.DomUtil.create('div', 'raster-color-range', this._rangeWrapper);

		this._colorSelectorLeft = Wu.DomUtil.create('div', 'raster-color-selector left', this._colorRange);
		this._leftNumber = Wu.DomUtil.create('div', 'raster-color-number', this._colorSelectorLeft)

		this._colorSelectorRight = Wu.DomUtil.create('div', 'raster-color-selector right', this._colorRange);
		this._rightNumber = Wu.DomUtil.create('div', 'raster-color-number', this._colorSelectorRight)

		console.log('checking stops', this.stops[0].opacity)
		if ( !this.stops[0].opacity && _.isNaN(this.stops[0].opacity)) {
			console.log('isnannana 0');
			this.stops[0].opacity = 1; // todo: this fails if opacity is set to 0
		}
		if ( !this.stops[1].opacity && _.isNaN(this.stops[1].opacity)) {
			console.log('isnannana 1');
			this.stops[1].opacity = 1;
		}

		this.leftBall = new Wu.button({
			appendTo  : this._colorSelectorLeft,
			type      : 'colorball',
			id        : 'cube-color-left',
			fn 	  	  : this.changeItLeft.bind(this),
			right     : false,
			value     : this.stops[0].col,
			className : 'raster-color',
			on        : true
		});

		this.leftMiniInput = new Wu.button({
			id          : 'cube-input-left',
			type        : 'miniInput',
			appendTo    : this._colorSelectorLeft,
			fn 	    	: this.changeItLeft.bind(this),
			right 	    : true,
			isOn        : true,
			value       : this.stops[0].opacity,
			className   : 'raster-color-input',
			placeholder : 1,
			fn 	    	: this._updateOpacity.bind(this)
		});

		this.rightBall = new Wu.button({
			appendTo  : this._colorSelectorRight,
			type      : 'colorball',
			id        : 'cube-color-right',
			fn 	  	  : this.changeItRight.bind(this),
			right     : false,
			value     : this.stops[1].col,
			className : 'raster-color',
			on        : true
		});

		this.rightMiniInput = new Wu.button({
			id          : 'cube-input-right',
			type        : 'miniInput',
			appendTo    : this._colorSelectorRight,
			fn 	    	: this.changeItLeft.bind(this),
			right 	    : true,
			isOn        : true,
			value       : this.stops[1].opacity,
			className   : 'raster-color-input',
			placeholder : 1,
			fn 	    	: this._updateOpacity.bind(this)
		});

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

	changeItLeft : function (hex, key, wrapper) {
		this.stops[0].col = hex;
		this.setSliderColor();
	},

	changeItRight : function (hex, key, wrapper) {
		this.stops[1].col = hex;
		this.setSliderColor();
	},

	addHooks : function () {

		this.slider.on('slide', function( values, handle ) {

			var min = Math.round(parseInt(values[0]));
			var max = Math.round(parseInt(values[1]));

			this.stops[0].val = min;
			this.stops[1].val = max;

			app.Tools.Styler.markChanged();

			this.setSliderColor();

		}.bind(this));		
		
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
		this._colorRange.setAttribute('style', style);

		// set opacity to input divs
		this._leftNumber.innerHTML = this.stops[0].val;	
		this._rightNumber.innerHTML = this.stops[1].val;
	},

	setCarto : function (carto) {
		console.log('%c setCarto ', 'background: hotpink; color: white;');
		console.log('carto', carto);
		this.options.carto = carto;
	},	

});

