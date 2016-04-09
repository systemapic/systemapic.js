Wu.RasterStyler = Wu.Class.extend({

	type : 'cube',

	initialize : function (options) {

		this.options = options;

		// todo: carto is saved wrong, should be object, not cartocss. perpahs on server.
		this.stops = _.isObject(options.carto) ? options.carto : [{ val : 80,  col : '#FF0000', opacity : 1 },{ val : 180, col : '#00FF00', opacity : 1 }];

		this._initContainer();
		this.updateStyle();

		this.addHooks();

	},

	_initContainer : function () {

		this._wrapper = Wu.DomUtil.create('div', 'chrome-content-section-wrapper raster-styler', this.options.container);


		this._rangeMarks = Wu.DomUtil.create('div', 'raster-range-marks', this._wrapper);
		this._maxMark = Wu.DomUtil.create('div', 'raster-range-max-mark', this._rangeMarks, '0');
		this._minMark = Wu.DomUtil.create('div', 'raster-range-min-mark', this._rangeMarks, '256');


		this._sliderContainer = Wu.DomUtil.create('div', 'raster-range-slider', this._wrapper);

		this.slider = noUiSlider.create(this._sliderContainer, {
			start: [this.stops[0].val, this.stops[1].val],
			connect : true,
			range: {
				'min': 0,
				'max': 256
			}
		});

		this._rangeWrapper = Wu.DomUtil.create('div', 'raster-color-range-wrapper', this._wrapper);
		this._colorRange = Wu.DomUtil.create('div', 'raster-color-range', this._rangeWrapper);

		this._colorSelectorLeft = Wu.DomUtil.create('div', 'raster-color-selector left', this._colorRange);
		this._leftNumber = Wu.DomUtil.create('div', 'raster-color-number', this._colorSelectorLeft)

		this._colorSelectorRight = Wu.DomUtil.create('div', 'raster-color-selector right', this._colorRange);
		this._rightNumber = Wu.DomUtil.create('div', 'raster-color-number', this._colorSelectorRight)


		if ( !this.stops[0].opacity ) this.stops[0].opacity = 1;
		if ( !this.stops[1].opacity ) this.stops[1].opacity = 1;

		this.leftBall = new Wu.button({
			appendTo  : this._colorSelectorLeft,
			type      : 'colorball',
			id        : 'cube-color-left',
			fn 	  : this.changeItLeft.bind(this),
			right     : false,
			value     : this.stops[0].col,
			className : 'raster-color',
			on        : true
		});

		this.leftMiniInput = new Wu.button({
			id          : 'cube-input-left',
			type        : 'miniInput',
			appendTo    : this._colorSelectorLeft,
			fn 	    : this.changeItLeft.bind(this),
			right 	    : true,
			isOn        : true,
			value       : this.stops[0].opacity,
			className   : 'raster-color-input',
			placeholder : 1,
			fn 	    : this._updateOpacity.bind(this)
		});




		this.rightBall = new Wu.button({
			appendTo  : this._colorSelectorRight,
			type      : 'colorball',
			id        : 'cube-color-right',
			fn 	  : this.changeItRight.bind(this),
			right     : false,
			value     : this.stops[1].col,
			className : 'raster-color',
			on        : true
		});

		this.rightMiniInput = new Wu.button({
			id          : 'cube-input-right',
			type        : 'miniInput',
			appendTo    : this._colorSelectorRight,
			fn 	    : this.changeItLeft.bind(this),
			right 	    : true,
			isOn        : true,
			value       : this.stops[1].opacity,
			className   : 'raster-color-input',
			placeholder : 1,
			fn 	    : this._updateOpacity.bind(this)
		});

	},

	_updateOpacity : function (e) {

		if ( e.target == this.leftMiniInput.input ) {
			this.stops[0].opacity = parseFloat(e.target.value)
		}
		
		if ( e.target == this.rightMiniInput.input ) {
			this.stops[1].opacity = parseFloat(e.target.value);
		}

		this.updateStyle();

	},

	changeItLeft : function (hex, key, wrapper) {
		this.stops[0].col = hex;
		this.updateStyle();
	},

	changeItRight : function (hex, key, wrapper) {
		this.stops[1].col = hex;
		this.updateStyle();
	},



	addHooks : function () {

		this.slider.on('slide', function( values, handle ) {

			var min = Math.round(parseInt(values[0]));
			var max = Math.round(parseInt(values[1]));

			this.stops[0].val = min;
			this.stops[1].val = max;

			app.Tools.Styler.markChanged();

			this.updateStyle();

		}.bind(this));		

		
	},

	updateStyle : function () {
		
		var percent = 100/256;
		var left = percent * this.stops[0].val;
		var width = (percent * this.stops[1].val) - (percent * this.stops[0].val);

		var style = 'background: -webkit-linear-gradient(left, ' + this.stops[0].col + ' , ' + this.stops[1].col + ');' +
			    'background: -o-linear-gradient(right, ' + this.stops[0].col + ' , ' + this.stops[1].col + ');' +
			    'background: -moz-linear-gradient(right, ' + this.stops[0].col + ' , ' + this.stops[1].col + ');' +
			    'background: linear-gradient(to right, ' + this.stops[0].col + ' , ' + this.stops[1].col + ');';

		    style += 'left: ' + left + '%;';
		    style += 'width: ' + width + '%;';

		this._colorRange.setAttribute('style', style);

		this._leftNumber.innerHTML = this.stops[0].val;	
		this._rightNumber.innerHTML = this.stops[1].val;


	},

	setCarto : function (carto) {
		console.log('%c setCarto ', 'background: hotpink; color: white;');
		console.log('carto', carto);
		this.options.carto = carto;
	},	

})






