Wu.RasterStyler = Wu.Class.extend({

	initialize : function (options) {

		this.options = options;

		this.stops = [{ val : 80,  col : '#FF0000' },
			      { val : 180, col : '#00FF00' }];


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
		// this._leftColorBall = Wu.DomUtil.create('div', 'raster-color', this._colorSelectorLeft)
		this._leftNumber = Wu.DomUtil.create('div', 'raster-color-number', this._colorSelectorLeft)

		this._colorSelectorRight = Wu.DomUtil.create('div', 'raster-color-selector right', this._colorRange);
		// this._rightColorBall = Wu.DomUtil.create('div', 'raster-color', this._colorSelectorRight)
		this._rightNumber = Wu.DomUtil.create('div', 'raster-color-number', this._colorSelectorRight)



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


	}

})






