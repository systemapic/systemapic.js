Wu.Legend = Wu.Class.extend({

	type : 'legend',

	initialize : function (options) {

		this.options = options;

		this.initLegends();

	},



	// LEGEND CREATOR LEGEND CREATOR LEGEND CREATOR LEGEND CREATOR LEGEND CREATOR LEGEND CREATOR
	// LEGEND CREATOR LEGEND CREATOR LEGEND CREATOR LEGEND CREATOR LEGEND CREATOR LEGEND CREATOR
	// LEGEND CREATOR LEGEND CREATOR LEGEND CREATOR LEGEND CREATOR LEGEND CREATOR LEGEND CREATOR
	// LEGEND CREATOR LEGEND CREATOR LEGEND CREATOR LEGEND CREATOR LEGEND CREATOR LEGEND CREATOR
	// LEGEND CREATOR LEGEND CREATOR LEGEND CREATOR LEGEND CREATOR LEGEND CREATOR LEGEND CREATOR
	// LEGEND CREATOR LEGEND CREATOR LEGEND CREATOR LEGEND CREATOR LEGEND CREATOR LEGEND CREATOR
	// LEGEND CREATOR LEGEND CREATOR LEGEND CREATOR LEGEND CREATOR LEGEND CREATOR LEGEND CREATOR
	// LEGEND CREATOR LEGEND CREATOR LEGEND CREATOR LEGEND CREATOR LEGEND CREATOR LEGEND CREATOR
	// LEGEND CREATOR LEGEND CREATOR LEGEND CREATOR LEGEND CREATOR LEGEND CREATOR LEGEND CREATOR


	updateLegend : function () {

		console.log('%c updateLegend ', 'background: hotpink; color: white; font-size: 16px;');


		var styleJSON = this.options.carto;

		// Creates legend object as JSON
		this.buildLegendObject(styleJSON);

		// Rolls out the HTML
		this.createLegendStyler();

		// Saves the changes (object)
		this.saveLegend();


		var layerID = this.options.layer.options.uuid;
		Wu.Mixin.Events.fire('updateLegend', { detail : { layerUuid : layerID }}); 



	},


	saveLegend : function () {

		// console.log('saveLegend');
		// console.log('this.legendObj.enable', this.legendObj.enable);

		this.options.layer.setLegends( this.legendObj );

	},




	// BUILD LEGEND OBJECT FROM CARTO JSON
	// BUILD LEGEND OBJECT FROM CARTO JSON
	// BUILD LEGEND OBJECT FROM CARTO JSON

	buildLegendObject : function  (styleJSON) {


		// console.log('%c buildLegendObject ', 'background: pink; color: white;');
		// console.log('this.oldLegendObj', this.oldLegendObj);

		var point 	= styleJSON.point,
		    line 	= styleJSON.line,
		    polygon 	= styleJSON.polygon,
		    layer       = this.options.layer; 


		// Here we either get legend from store, or we pick up the legend from last update.
		// We store this as "old legend object", and itarete through the styling json to look
		// for styling updates.

		// If legend object exists, save it as "old legend object"
		if ( this.legendObj ) {

			this.oldLegendObj = this.legendObj;
			var _layerMeta = this.oldLegendObj.layerMeta ? true : false;
			var _opacitySlider = this.oldLegendObj.opacitySlider ? true : false;
			var _enable = this.oldLegendObj.enable ? true : false;

		// If legend does not exist, get it from store and save it as "old legend object"
		} else {

			var legend = this.options.layer.getLegends();
			if ( legend ) this.oldLegendObj = legend;

		}

		// Create blank legend object that we populate with data from style json		
		this.legendObj = {

			enable : _enable,
			layerMeta : _layerMeta,
			opacitySlider : _opacitySlider,

			layerName : layer.getTitle(),
			
			point 	: {
				all 	: {},
				target 	: []
			},

			polygon : {
				all 	: {},
				target 	: []
			},

			line 	: {
				all 	: {},
				target 	: []
			},

			html : '',
			gradient : ''
		};

		// Build legend objects
		this.legendPoint(point);
		this.legendPolygon(polygon);
		this.legendLine(line);

	},

	// BUILD LEGEND OBJECT: POINT
	// BUILD LEGEND OBJECT: POINT
	// BUILD LEGEND OBJECT: POINT

	legendPoint : function (point) {
	
		if (!point || !point.enabled ) return;		

		var legend = {};

		// COLOR
		// COLOR
		// COLOR

		// polygon color range
		if ( point.color.column ) {

			var column   = point.color.column;
			var value    = point.color.value; 
			var minRange = point.color.range[0];
			var maxRange = point.color.range[1];

			// Save legend data
			legend.color = {};
			legend.color.column   = column; 
			legend.color.value    = value;
			legend.color.minRange = minRange;
			legend.color.maxRange = maxRange;


		// static polygon color
		} else {				

			var value = point.color.staticVal ? point.color.staticVal : 'red';

			// Save legend data
			legend.color = {};
			legend.color.column = false;
			legend.color.value  = value;

		}
		

		// OPACITY
		// OPACITY
		// OPACITY

		// polygon opacity range
		if ( point.opacity.column ) {

			var column   = point.opacity.column;
			var minRange = point.opacity.range[0];
			var maxRange = point.opacity.range[1];

			// Save legend data
			legend.opacity = {};
			legend.opacity.column   = column; 
			legend.opacity.minRange = minRange;
			legend.opacity.maxRange = maxRange;


		// static polygon opacity
		} else {

			if ( !point.opacity.staticVal && point.opacity.staticVal != 0 ) {
				var value = 1;
			} else {
				var value = point.opacity.staticVal;
			}				

			// Save legend data
			legend.opacity = {};
			legend.opacity.column = false;
			legend.opacity.value  = value;

		}


		// POINT SIZE
		// POINT SIZE
		// POINT SIZE

		// polygon pointsize range
		if ( point.pointsize.column ) {

			var column   = point.pointsize.column;
			var minRange = point.pointsize.range[0];
			var maxRange = point.pointsize.range[1];

			// Save legend data
			legend.pointsize = {};
			legend.pointsize.column   = column; 
			legend.pointsize.minRange = minRange;
			legend.pointsize.maxRange = maxRange;


		// static polygon pointsize
		} else {

			if ( !point.pointsize.staticVal && point.pointsize.staticVal != 0 ) {
				var value = 1.2;
			} else {
				var value = point.pointsize.staticVal;
			}				

			// Save legend data
			legend.pointsize = {};
			legend.pointsize.column = false;
			legend.pointsize.value  = value;

		}


		if ( this.oldLegendObj && this.oldLegendObj.point.all ) {
			if ( this.oldLegendObj.point.all.name ) {
				legend.name = this.oldLegendObj.point.all.name;
			}

			if ( typeof this.oldLegendObj.point.all.isOn !== 'undefined' ) {
				legend.isOn = this.oldLegendObj.point.all.isOn;
			}
		}

		// Push legend object into array
		this.legendObj.point.all = legend;



		// FILTERS
		// FILTERS
		// FILTERS

		// polygon filters
		if ( point.targets && point.targets.length >= 1 ) {

			point.targets.forEach(function (target, i) {

				var column   = target.column;
				var color    = target.color;					
				var opacity  = target.opacity;
				var value    = target.value;
				var width    = target.width;
				var operator = target.operator;

				// Save legend data
				var legend = {
					column   : column,
					color    : color,
					opacity  : opacity,
					value    : value,
					width    : width,
					operator : operator
				}

				if ( this.oldLegendObj && this.oldLegendObj.point.target[i] ) {
					if ( this.oldLegendObj.point.target[i].name ) {
						legend.name = this.oldLegendObj.point.target[i].name;
					}

					if ( typeof this.oldLegendObj.point.target[i].isOn !== 'undefined' ) {
						legend.isOn = this.oldLegendObj.point.target[i].isOn;
					}
				}

				this.legendObj.point.target.push(legend);

			}.bind(this))

		
		}	

	},	


	// BUILD LEGEND OBJECT: POLYGON
	// BUILD LEGEND OBJECT: POLYGON
	// BUILD LEGEND OBJECT: POLYGON

	legendPolygon : function (polygon) {


		// polygon enabled
		if ( !polygon || !polygon.enabled ) return;		

	
		// Create blank legend
		var legend = {};

		// COLOR
		// COLOR
		// COLOR

		// polygon color range
		if ( polygon.color.column ) {

			var column   = polygon.color.column;
			var value    = polygon.color.value; 
			var minRange = polygon.color.range[0];
			var maxRange = polygon.color.range[1];

			// Save legend data
			legend.color = {};
			legend.color.column   = column; 
			legend.color.value    = value;
			legend.color.minRange = minRange;
			legend.color.maxRange = maxRange;


		// static polygon color
		} else {

			
			var value = polygon.color.staticVal ? polygon.color.staticVal : "red";
			

			// Save legend data
			legend.color = {};
			legend.color.column = false;
			legend.color.value  = value;

		}
		

		// OPACITY
		// OPACITY
		// OPACITY

		// polygon opacity range
		if ( polygon.opacity.column ) {

			var column   = polygon.opacity.column;
			var value    = polygon.opacity.value; 
			var minRange = polygon.opacity.range[0];
			var maxRange = polygon.opacity.range[1];

			// Save legend data
			legend.opacity = {};
			legend.opacity.column   = column; 
			legend.opacity.value    = value;
			legend.opacity.minRange = minRange;
			legend.opacity.maxRange = maxRange;


		// static polygon opacity
		} else {

			if ( !polygon.opacity.staticVal && polygon.opacity.staticVal != 0 ) {
				var value = 1;
			} else {
				var value = polygon.opacity.staticVal;
			}

			// Save legend data
			legend.opacity = {};
			legend.opacity.column = false;
			legend.opacity.value  = value;

		}

		
		if ( this.oldLegendObj && this.oldLegendObj.polygon.all ) {
			if ( this.oldLegendObj.polygon.all.name ) {
				legend.name = this.oldLegendObj.polygon.all.name;
			}

			if ( typeof this.oldLegendObj.polygon.all.isOn !== 'undefined' ) {
				legend.isOn = this.oldLegendObj.polygon.all.isOn;
			}
		}



		// Push legend object into array
		this.legendObj.polygon.all = legend;



		// FILTERS	
		// FILTERS
		// FILTERS

		// polygon filters
		if ( polygon.targets && polygon.targets.length >= 1 ) {

			polygon.targets.forEach(function (target, i) {
				
				var column   = target.column;
				var color    = target.color;					
				var opacity  = target.opacity;
				var value    = target.value;
				var operator = target.operator;

				// Save legend data
				var legend = {
					column   : column,
					color    : color,
					opacity  : opacity,
					value    : value,
					operator : operator
				}


				if ( this.oldLegendObj && this.oldLegendObj.polygon.target[i] ) {
					if ( this.oldLegendObj.polygon.target[i].name ) {
						legend.name = this.oldLegendObj.polygon.target[i].name;
					}

					if ( typeof this.oldLegendObj.polygon.target[i].isOn !== 'undefined' ) {					
						legend.isOn = this.oldLegendObj.polygon.target[i].isOn;
					}
				}



				this.legendObj.polygon.target.push(legend);

			}.bind(this))	

		
		}			

	},

	// BUILD LEGEND OBJECTL: LINE
	// BUILD LEGEND OBJECTL: LINE
	// BUILD LEGEND OBJECTL: LINE
	
	legendLine : function (line) {


		// line enabled
		if (!line || !line.enabled ) return;
		
		// Create blank legend
		var legend = {};			

		// COLOR
		// COLOR
		// COLOR

		// line color range
		if ( line.color.column ) {

			var column 	= line.color.column;
			var value 	= line.color.value;
			var minRange	= line.color.range[0];
			var maxRange	= line.color.range[1];

			// Save legend data
			legend.color = {};
			legend.color.column   = column; 
			legend.color.value    = value;
			legend.color.minRange = minRange;
			legend.color.maxRange = maxRange;


		// static line color
		} else {
			
			var value = line.color.staticVal ? line.color.staticVal : 'red';

			// Save legend data
			legend.color = {};
			legend.color.column = false;
			legend.color.value  = value;


		}


		// OPACITY
		// OPACITY
		// OPACITY

		// line opacity range
		if ( line.opacity.column ) {

			var column = line.opacity.column;
			var minRange = line.opacity.range[0];
			var maxRange = line.opacity.range[1];

			// Save legend data
			legend.opacity = {};
			legend.opacity.column   = column; 
			legend.opacity.minRange = minRange;
			legend.opacity.maxRange = maxRange;

		// line static opacity
		} else {

			if ( !line.opacity.staticVal && line.opacity.staticVal != 0 ) {
				var value = 1;
			} else {
				var value = line.opacity.staticVal;
			}				

			// Save legend data
			legend.opacity = {};
			legend.opacity.column   = false;
			legend.opacity.value    = value;
		
		}


		// WIDTH
		// WIDTH
		// WIDTH

		// line width range
		if ( line.width.column ) {

			var column = line.width.column;
			var minRange = line.width.range[0];
			var maxRange = line.width.range[1];

			// Save legend data
			legend.width = {};
			legend.width.column   = column;
			legend.width.minRange = minRange;
			legend.width.maxRange = maxRange;

		// static line width
		} else {


			if ( !line.width.staticVal && line.width.staticVal != 0 ) {
				var value = 5;
			} else {
				var value = line.width.staticVal;
			}


			// Save legend data
			legend.width = {};
			legend.width.column   = false;
			legend.width.value    = value;

		}



		if ( this.oldLegendObj && this.oldLegendObj.line.all ) {
			if ( this.oldLegendObj.line.all ) {
				legend.name = this.oldLegendObj.line.all.name;
			}
			if ( typeof this.oldLegendObj.line.all.isOn !== 'undefined' ) {
				legend.isOn = this.oldLegendObj.line.all.isOn;
			}
		}

		this.legendObj.line.all = legend;


				

		// FILTERS
		// FILTERS
		// FILTERS

		// line filters
		if ( line.targets && line.targets.length >= 1 ) {

			line.targets.forEach(function (target, i) {

				var column   = target.column;
				var color    = target.color;					
				var opacity  = target.opacity;
				var value    = target.value;
				var width    = target.width;
				var operator = target.operator;

				// Save legend data
				var legend = {
					column   : column,
					color    : color,
					opacity  : opacity,
					value    : value,
					width    : width,
					operator : operator
				}


				if ( this.oldLegendObj && this.oldLegendObj.line.target[i] ) {
					if ( this.oldLegendObj.line.target[i].name ) {
						legend.name = this.oldLegendObj.line.target[i].name;
					}
					if ( typeof this.oldLegendObj.line.target[i].isOn !== 'undefined' ) {
						legend.isOn = this.oldLegendObj.line.target[i].isOn;
					}
				}

				this.legendObj.line.target.push(legend);
									

			}.bind(this))

		} 

	},

	// **************************************************************************


	// BUILD LEGEND HTML
	// BUILD LEGEND HTML
	// BUILD LEGEND HTML

	// Init – runs only once
	initLegends : function () {

		// Legend section
		this._legensOuter = Wu.DomUtil.create('div', 'chrome-field-wrapper field-legend displayNone', this.options.container);
		this._legendSection = Wu.DomUtil.create('div', 'chrome-content-section-wrapper toggles-wrapper', this._legensOuter);

		// Container for legend title and switch (this is always there).
		this._legendTopLineWrapper = Wu.DomUtil.create('div', 'chrome-legend-top-section', this._legendSection);

		// Where the legends are + the switches for opacity slider and legend meta
		this._legendContent = Wu.DomUtil.create('div', 'legend-content', this._legendSection);

		// 
		var styleJSON = this.options.carto;

		// Creates legend object as JSON
		this.buildLegendObject(styleJSON);

		this.createLegendStyler();


	},

	// Clear content when updating
	clearLegendContent : function () {
	
		this._legendTopLineWrapper.innerHTML = '';
		this._legendContent.innerHTML = '';

	},

	// Create the basic switches, and run the options to create legend for
	// lines, polygons and points.
	createLegendStyler : function () {


		// console.log('%c this.legendObj.enable ', 'background: red; color: white;');
		// console.log(this.legendObj);

		this.clearLegendContent();


		// The top section 
		// The top section 
		// The top section 

		// The top section hold the "Legend" title + on/off switch
		// This part should always be there

		// If legend on/off option does not exist, see if we have it stored
		if ( typeof this.legendObj.enable == 'undefined' ) {
			if ( this.oldLegendObj ) {
				this.legendObj.enable = this.oldLegendObj.enable;
			} else {
				this.legendObj.enable = true;
			}
		}

		var _isOn = this.legendObj.enable;

		// wrapper
		var line = new Wu.fieldLine({
			id           : 'legend-section',
			appendTo     : this._legendTopLineWrapper,
			title        : '<b>Legend</b>',
			input        : false,
		});		

		// Switch
		this.enableLegendButton = new Wu.button({
			id 	     : 'legen-section-switch',
			type 	     : 'switch',
			isOn 	     : _isOn,
			right 	     : true,
			appendTo     : line.container,
			fn 	     : this._switchEnableLegend.bind(this),
			// context      : this
		});


		// If switch is off, do not roll out the rest of the options.
		if ( !_isOn ) return;


		// Legend meta
		// Legend meta

		var legendMetaOptionsWrapper = Wu.DomUtil.create('div', 'legend-meta-options-wrapper', this._legendContent);


		// Layer meta option switch
		// Layer meta option switch
		// Layer meta option switch

		// wrapper
		var layerMetaOption = new Wu.fieldLine({
			id           : 'layer-meta-option',
			appendTo     : legendMetaOptionsWrapper,
			title        : '<b>Layer meta</b>',
			input        : false,
		});		


		// If layer meta option does not exist, see if we have it stored
		if ( typeof this.legendObj.layerMeta == 'undefined' ) {
			if ( this.oldLegendObj ) {
				this.legendObj.layerMeta = this.oldLegendObj.layerMeta;
			} else {
				this.legendObj.layerMeta = true;
			}
		}
		var _isOn = this.legendObj.layerMeta;


		// Layer meta switch
		var button = new Wu.button({
			id 	     : 'layerMeta',
			type 	     : 'switch',
			isOn 	     : _isOn,
			right 	     : true,
			appendTo     : layerMetaOption.container,
			fn 	     : this._switch.bind(this), // onSwitch
		});



		// Opacity slider switch
		// Opacity slider switch
		// Opacity slider switch

		// wrapper
		var opacitySliderOption = new Wu.fieldLine({
			id           : 'opacity-slider-option',
			appendTo     : legendMetaOptionsWrapper,
			title        : '<b>Opacity slider</b>',
			input        : false,
		});		

		// If opacity slider option does not exist, see if we have it stored
		if ( typeof this.legendObj.opacitySlider == 'undefined' ) {
			// this.legendObj.opacitySlider = this.oldLegendObj.opacitySlider;

			if ( this.oldLegendObj ) {
				this.legendObj.opacitySlider = this.oldLegendObj.opacitySlider;
			} else {
				this.legendObj.opacitySlider = true;
			}			
		}
		var _isOn = this.legendObj.opacitySlider;
	

		// Opacity slider switch
		var button = new Wu.button({
			id 	     : 'opacitySlider',
			type 	     : 'switch',
			isOn 	     : _isOn,
			right 	     : true,
			appendTo     : opacitySliderOption.container,
			fn 	     : this._switch.bind(this),
		});


		var layerName = this.legendObj.layerName,
		    polygons  = this.legendObj.polygon,
		    lines     = this.legendObj.line,
		    points    = this.legendObj.point;

		// Build points
		this.pointsHTML(points);

		// Build polygons and lines
		// these are connected, beacuse if you have styling for both,
		// they will need to be part of the same legend.
		this.polygonAndLinesHTML(polygons, lines);

	},

	// HTML FOR EACH LEGEND
	// Here we create the objects that goes inside of the legend styler,
	// AND we store simplified HTML string to put in the legend box on map.
	eachLegendHtml : function (name, style, object) {		

		// Create container for each legend
		var container = Wu.DomUtil.create('div', 'legend-each-container', this._legendContent);

		// Color space to the left (can be line, dot or polygon)
		var color = Wu.DomUtil.create('div', 'legend-each-color', container);
		    color.setAttribute('style', style);

		// Legend name
		var _name = object.name ? object.name : '';

		// NAME INPUT
		// NAME INPUT
		// NAME INPUT

		var input = new Wu.button({
			id 	     : 'test',
			type 	     : 'input',
			right 	     : false,
			isOn         : true,
			appendTo     : container,
			value        : _name,
			placeholder  : name,
			tabindex     : 1,
			fn 	     : this._saveLegendName,
			className    : 'legend-each-name target-input',
			allowText    : true,
			sourceObject : object,
			context      : this
		});


		// Set on to true by default
		if ( typeof object.isOn == 'undefined' ) {
    			object.isOn = true;
		}

		// Put on/off state to wrapper
		object.isOn ? Wu.DomUtil.removeClass(container, 'is-off') : Wu.DomUtil.addClass(container, 'is-off');

		// Switch to toggle this specific legend on or off
		var button = new Wu.button({
			id 	     : name,
			type 	     : 'switch',
			isOn 	     : object.isOn,
			right 	     : true,
			appendTo     : container,
			fn 	     : this._switchLegend,
			className    : 'legend-switch',
			sourceObject : object,
			context      : this
		});


		// Store HTML of legend for easy access in legend box on map
		if ( object.isOn ) {			

			if ( _name && _name.length>0 ) {
				var nn = _name;
			} else {
				var nn = name;
			}

			var htmlStr  = '<div class="legend-each-container">';
			    htmlStr += '<div class="legend-each-name">' + nn + '</div>';			    
			    htmlStr += '<div class="legend-each-color" style="' + style + '"></div>';
			    htmlStr += '</div>';
			
			    this.legendObj.html += htmlStr;

		}


	},




	// GRADIENT HTML
	// GRADIENT HTML
	// GRADIENT HTML

	gradientLegend : function (options) {

		// Set color stops
		var colorStops = options.colorStops;

		// Set styling
		var gradientStyle = 'background: -webkit-linear-gradient(left, ' + colorStops.join() + ');';
		gradientStyle    += 'background: -o-linear-gradient(right, '     + colorStops.join() + ');';
		gradientStyle    += 'background: -moz-linear-gradient(right, '   + colorStops.join() + ');';
		gradientStyle    += 'background: linear-gradient(to right, '     + colorStops.join() + ');';
 
		var container = Wu.DomUtil.create('div', 'legend-each-container', this._legendContent);
		    container.style.paddingLeft = 0;

		var gradientWrapper = Wu.DomUtil.create('div', 'info-legend-container', container);
		var gradientInfoWrapper = Wu.DomUtil.create('div', 'info-legend-frame', gradientWrapper);
		var gradientInfoMinVal = Wu.DomUtil.create('div', 'info-legend-val info-legend-min-val', gradientInfoWrapper, options.minVal);
		var gradientInfoLegend = Wu.DomUtil.create('div', 'info-legend-globesar', gradientInfoWrapper);
		if ( this.options.globesar ) {
			gradientInfoLegend.innerHTML = 'Velocity in mm pr. year';
		} else {
			gradientInfoLegend.innerHTML = options.bline;
		}
		
		var gradientInfoMaxVal = Wu.DomUtil.create('div', 'info-legend-val info-legend-max-val', gradientInfoWrapper, options.maxVal);
		var gradientLegend = Wu.DomUtil.create('div', 'info-legend-gradient-container', gradientInfoWrapper)
		    gradientLegend.setAttribute('style', gradientStyle);

		// Set on to true by default
		if ( typeof options.object.isOn == 'undefined' ) {
    			options.object.isOn = true;
		}

		// Put on/off state to wrapper
		options.object.isOn ? Wu.DomUtil.removeClass(container, 'is-off') : Wu.DomUtil.addClass(container, 'is-off');

		// Switch to toggle this specific legend on or off
		var button = new Wu.button({
			id 	     : 'random',
			type 	     : 'switch',
			isOn 	     : options.object.isOn,
			right 	     : true,
			appendTo     : container,
			fn 	     : this._switchGradient,
			className    : 'legend-switch',
			sourceObject : options.object,
			context      : this
		});


		// Globesar specific stuff
		this.gradientBottom(options);



		// HTML PART
		// HTML PART
		// HTML PART

		if ( options.object.isOn ) {

			// Container
			var _legendHTML = '<div class="info-legend-container">';

			// Legend Frame
			_legendHTML += '<div class="info-legend-frame">';
			_legendHTML += '<div class="info-legend-val info-legend-min-val">' + options.minVal + '</div>';

			if ( this.options.globesar ) { 
				_legendHTML += '<div class="info-legend-globesar">' + 'Velocity in mm pr. year' + '</div>';
			} else {
				_legendHTML += '<div class="info-legend-globesar">' + options.bline + '</div>';
			}

			_legendHTML += '<div class="info-legend-val info-legend-max-val">' + options.maxVal + '</div>';

			// Gradient
			_legendHTML += '<div class="info-legend-gradient-container" style="' + gradientStyle + '"></div>';
			_legendHTML += '</div>';
			_legendHTML += '</div>';

			this.legendObj.gradient += _legendHTML;

			// Bottom part (for globesar)
			if ( options.object._isOn ) {
				this.globesarSpecificHTML(options);
			}

		} else {

			this.legendObj.gradient = false;			
		}


	},


	gradientBottom : function (options) {

		if ( !this.options.globesar ) return;


		var container = Wu.DomUtil.create('div', 'legend-each-container', this._legendContent);
		    container.style.paddingLeft = 0;		

		var cont     = Wu.DomUtil.create('div', 'info-legend-gradient-bottomline', container);
		var leg      = Wu.DomUtil.create('div', 'globesar-specific-legend-container', cont);
		    leg.id   = 'globesar-specific-legend-container';
		var top      = Wu.DomUtil.create('div', 'globesar-specific-legend-top', leg, 'Deformasjon i sikteretning til satellitten')
		var lineCont = Wu.DomUtil.create('div', 'globesar-specific-legend-line-container', leg);
		var line     = Wu.DomUtil.create('div', 'globesar-specific-legend-line', lineCont);
		var arrowL   = Wu.DomUtil.create('div', 'globesar-specific-legend-arrow-left', lineCont);
		var arrowR   = Wu.DomUtil.create('div', 'globesar-specific-legend-arrow-right', lineCont);
		var midLine  = Wu.DomUtil.create('div', 'globesar-specific-legend-middle-line', lineCont);

		var textL    = Wu.DomUtil.create('div', 'globesar-specific-legend-toward', leg, 'Mot satellitten');
		var textR    = Wu.DomUtil.create('div', 'globesar-specific-legend-from', leg, 'Fra satellitten');


		// // Set on to true by default
		// if ( typeof options.object._isOn == 'undefined' ) {
  		// options.object._isOn = true;
		// }

		// // Put on/off state to wrapper
		// options.object._isOn ? Wu.DomUtil.removeClass(container, 'is-off') : Wu.DomUtil.addClass(container, 'is-off');

		// // Switch to toggle this specific legend on or off
		// var button = new Wu.button({
		// 	id 	     : 'random-button',
		// 	type 	     : 'switch',
		// 	isOn 	     : options.object._isOn,
		// 	right 	     : true,
		// 	appendTo     : container,
		// 	fn 	     : this._switchGradientBottom,
		// 	className    : 'legend-switch',
		// 	sourceObject : options.object,
		// 	context      : this

		// });

	},

	globesarSpecificHTML : function (options) {

		if ( !this.options.globesar ) return;
	
		var globesarSpecificByLine  ='<div class="info-legend-gradient-bottomline">';
		    globesarSpecificByLine += '<div id="globesar-specific-legend-container" class="globesar-specific-legend-container">';
		    globesarSpecificByLine += '<div class="globesar-specific-legend-top">Deformasjon i sikteretning til satellitten</div>';
		    globesarSpecificByLine += '<div class="globesar-specific-legend-line-container">';

		    globesarSpecificByLine += '<div class="globesar-specific-legend-line"></div>';
		    globesarSpecificByLine += '<div class="globesar-specific-legend-arrow-left"></div>';
		    globesarSpecificByLine += '<div class="globesar-specific-legend-arrow-right"></div>';
		    globesarSpecificByLine += '<div class="globesar-specific-legend-middle-line"></div>';
    		    globesarSpecificByLine += '</div>';

		    globesarSpecificByLine += '<div class="globesar-specific-legend-toward">Mot satellitten</div>';
		    globesarSpecificByLine += '<div class="globesar-specific-legend-from">Fra satellitten</div>';
    		    
		    globesarSpecificByLine += '</div>';
		    globesarSpecificByLine += '</div>';

		this.legendObj.gradient += globesarSpecificByLine;

	},



	// SWITCHES SWITCHES SWITCHES SWITCHES SWITCHES SWITCHES SWITCHES SWITCHES SWITCHES 
	// SWITCHES SWITCHES SWITCHES SWITCHES SWITCHES SWITCHES SWITCHES SWITCHES SWITCHES 
	// SWITCHES SWITCHES SWITCHES SWITCHES SWITCHES SWITCHES SWITCHES SWITCHES SWITCHES 

	_saveLegendName : function (e) {

		var name = e.target.value;
		this.sourceObject.name = name;

		// Fire change
		this.context.updateLegend();		

	},


	_switch : function (e) {

		if ( e.target.id == 'switch_layerMeta' ) {
			if ( this.legendObj.layerMeta ) {
				this.legendObj.layerMeta = false;
			} else {
				this.legendObj.layerMeta = true;
			}
		}

		if ( e.target.id == 'switch_opacitySlider' ) {
			if ( this.legendObj.opacitySlider ) {
				this.legendObj.opacitySlider = false;
			} else {
				this.legendObj.opacitySlider = true;
			}
		}

		// Fire change
		this.updateLegend();		

	},

	_switchEnableLegend : function  (e) {

		// console.log('%c _switchEnableLegend ', 'background: blue; color: white; font-size: 17px;');
		
		// console.log('this.legendObj.enable', this.legendObj.enable);
		

		if ( this.legendObj.enable ) {
			// Wu.DomUtil.addClass(this._legendContent, 'displayNone');
			this.legendObj.enable = false;
		} else {
			// Wu.DomUtil.removeClass(this._legendContent, 'displayNone');
			this.legendObj.enable = true;
		}


		// console.log('this.legendObj.enable', this.legendObj.enable);

		// this.saveLegend();
		// this.updateLegend();
		// this.updateLegend();
		// this.context.updateLegend();
		this.updateLegend();
	},

	// _switchEnableLegend : function  () {
		
	// 	if ( this.legendObj.enable ) {
	// 		Wu.DomUtil.addClass(this._legendContent, 'displayNone');
	// 		this.legendObj.enable = false;
	// 	} else {
	// 		Wu.DomUtil.removeClass(this._legendContent, 'displayNone');
	// 		this.legendObj.enable = true;
	// 	}

	// 	// this.saveLegend();
	// 	// this.updateLegend();
	// 	// this.updateLegend();
	// 	this.context.updateLegend();
	// },

	_switchLegend : function () {		

		if ( this.sourceObject.isOn ) {
			Wu.DomUtil.addClass(this.appendTo, 'is-off');
			this.sourceObject.isOn = false;	

		} else {
			Wu.DomUtil.removeClass(this.appendTo, 'is-off');
			this.sourceObject.isOn = true;
		}

		// Fire change
		this.context.updateLegend();

	},

	_switchGradient : function () {		

		if ( this.sourceObject.isOn ) {
			Wu.DomUtil.addClass(this.appendTo, 'is-off');
			this.sourceObject.isOn = false;
		} else {
			Wu.DomUtil.removeClass(this.appendTo, 'is-off');
			this.sourceObject.isOn = true;
		}

		// Fire change
		// this.updateLegend();
		this.context.updateLegend();	



	},	

	// _switchGradientBottom : function () {

	// 	this.sourceObject._isOn = false;

	// 	if ( this.sourceObject._isOn ) {
	// 		Wu.DomUtil.addClass(this.appendTo, 'is-off');
	// 		this.sourceObject._isOn = false;	
	// 	} else {
	// 		Wu.DomUtil.removeClass(this.appendTo, 'is-off');
	// 		this.sourceObject._isOn = true;			
	// 	}

	// 	this.sourceObject._isOn = false;	
		
	// },

	// POINTS HTML
	// POINTS HTML
	// POINTS HTML

	pointsHTML : function (points) {
	
		// TARGETED POINTS
		// TARGETED POINTS
		// TARGETED POINTS

		points.target.forEach(function (point, i) {

			// Color & opacity
			var color   = point.color,
			    opacity = point.opacity,
			    RGB     = this.color2RGB(color),
			    rgba    = 'rgba(' + RGB.r + ',' + RGB.g + ',' + RGB.b + ',' + opacity + ');',
			    style   = 'background:' + rgba + '; ';
		
			// Name
			var name = '';
			var operator = point.operator + ' ';
			if ( operator != '= ' ) name += operator;
			name += point.value;

			// Size
			var size = point.width;
			if ( size > 20 ) size = 20;
			if ( size < 10  ) size = 10;
			style += 'width: ' + size + 'px; height: ' + size + 'px; border-radius: ' + size + 'px;';

			// Set dot position
			var _top = (20/2) - (size/2);
			var _left = (28/2) - (size/2);
			style += 'top: ' + _top + 'px; ' + 'left: ' + _left + 'px; ';


			var layerName = this.legendObj.layerName;
			this.eachLegendHtml(layerName, style, point);


		}.bind(this));


		// *******************************************************************************************************************
		// *******************************************************************************************************************
		// *******************************************************************************************************************

		// ALL POINTS
		// ALL POINTS
		// ALL POINTS

		// Can contain range

		// Static colors
		// Static colors
		// Static colors

		var pointStyle = '';
		var hasAllStyle = false;

		
		if ( points.all.color && !points.all.color.column ) {

			var color   = points.all.color.value;
			var opacity = points.all.opacity.value;			
			var RGB = this.color2RGB(color);
			var rgba = 'rgba(' + RGB.r + ',' + RGB.g + ',' + RGB.b + ',' + opacity + ');';
			pointStyle += 'background:' + rgba + ';';

			// Size
			var size    = points.all.pointsize.value;
			if ( size > 20 ) size = 20;
			if ( size < 10  ) size = 10;

			pointStyle += 'width: ' + size + 'px; height: ' + size + 'px; border-radius: ' + size + 'px;';

			// Set dot position
			var _top = (20/2) - (size/2);
			var _left = (28/2) - (size/2);			
			pointStyle += 'top: ' + _top + 'px; ' + 'left: ' + _left + 'px; ';			

			if ( opacity != 0 ) hasAllStyle = true;
		}


		if ( hasAllStyle ) {

			var layerName = this.legendObj.layerName;
			this.eachLegendHtml(layerName, pointStyle, points.all);

		}



		// Color range
		// Color range
		// Color range

		if ( points.all.color && points.all.color.column ) {

			var colorStops = points.all.color.value;
			var minVal     = points.all.color.minRange;
			var maxVal     = points.all.color.maxRange;
			var column     = points.all.color.column;

			// create legend
			var gradientOptions = {
				colorStops : colorStops,
				minVal     : minVal,
				maxVal     : maxVal,
				bline      : column,
				object     : points.all
			}

			this.gradientLegend(gradientOptions);
		}		
	},


	// POLYGONS AND LINES HTML
	// POLYGONS AND LINES HTML
	// POLYGONS AND LINES HTML

	polygonAndLinesHTML : function  (polygons, lines) {
	

		// MATCHING TARGETS
		// MATCHING TARGETS
		// MATCHING TARGETS

		// (aka. we have a line and a polygon with the same target)

		var linePolygonTargetMatches = {}

		lines.target.forEach(function (l, i) {
			polygons.target.forEach(function (p, a) {

				// If it is a match
				if ( p.value == l.value ) {


					// Line style
					var lineColor   = l.color;
					var lineOpacity = l.opacity;
					var lineWidth   = l.width;
					var lineRGB     = this.color2RGB(lineColor);
					var lineRgba    = 'rgba(' + lineRGB.r + ',' + lineRGB.g + ',' + lineRGB.b + ',' + lineOpacity + ');';
					var lineStyle   = 'border: ' + (lineWidth/2) + 'px solid ' + lineRgba;

					if ( !p.color ) {
						lineStyle += 'height: 0px; top: 7px;';
					}


					// Polygon style
					var polygonColor   = p.color;
					var polygonOpacity = p.opacity;
					var polygonRGB     = this.color2RGB(polygonColor);
					var polygonRgba    = 'rgba(' + polygonRGB.r + ',' + polygonRGB.g + ',' + polygonRGB.b + ',' + polygonOpacity + ');';
					var polygonStyle   = 'background:' + polygonRgba;

					var style = lineStyle + polygonStyle;

					// Store matches
					linePolygonTargetMatches[l.value] = style;
				}

			}.bind(this))
		}.bind(this))



		// LINES LINES LINES LINES LINES LINES LINES 
		// LINES LINES LINES LINES LINES LINES LINES 
		// LINES LINES LINES LINES LINES LINES LINES 

		// TARGETED LINES
		// TARGETED LINES
		// TARGETED LINES

		lines.target.forEach(function (line, i) {

			// Stop if this target also exists in polygons
			if ( linePolygonTargetMatches[line.value] ) return;
			
			// Style
			var color   = line.color;
			var opacity = line.opacity;
			var width   = line.width;
			var RGB     = this.color2RGB(color);
			var rgba    = 'rgba(' + RGB.r + ',' + RGB.g + ',' + RGB.b + ',' + opacity + ');';
			// var style   = 'border: ' + width + 'px solid ' + rgba;
			var style   = 'border: ' + 2 + 'px solid ' + rgba;

			style += 'height: 0px; top: 7px;';

			// Name
			var name = '';
			var operator = line.operator + ' ';
			if ( operator != '= ' ) name += operator;
			name += line.value;
			this.eachLegendHtml(name, style, line);


		}.bind(this));



		// POLYGONS POLYGONS POLYGONS POLYGONS POLYGONS 
		// POLYGONS POLYGONS POLYGONS POLYGONS POLYGONS 
		// POLYGONS POLYGONS POLYGONS POLYGONS POLYGONS 

		// TARGETED POLYGONS
		// TARGETED POLYGONS
		// TARGETED POLYGONS

		polygons.target.forEach(function (polygon, i) {

			// Stop if this target also exists in polygons
			if ( linePolygonTargetMatches[polygon.value] ) {
				var style = linePolygonTargetMatches[polygon.value];
			} else {
				var color   = polygon.color;
				var opacity = polygon.opacity;
				var RGB     = this.color2RGB(color);
				var rgba    = 'rgba(' + RGB.r + ',' + RGB.g + ',' + RGB.b + ',' + opacity + ');';
				var style   = 'background:' + rgba;
			}

			// Name
			var name = polygon.column + ': ';
			var operator = polygon.operator + ' ';
			if ( operator != '= ' ) name += operator;
			name += polygon.value;

			this.eachLegendHtml(name, style, polygon);

		}.bind(this));


		// *******************************************************************************************************************
		// *******************************************************************************************************************
		// *******************************************************************************************************************

		// ALL POLYGONS & LINES - ALL POLYGONS & LINES - ALL POLYGONS & LINES
		// ALL POLYGONS & LINES - ALL POLYGONS & LINES - ALL POLYGONS & LINES
		// ALL POLYGONS & LINES - ALL POLYGONS & LINES - ALL POLYGONS & LINES


		// Static colors
		// Static colors
		// Static colors

		var allStyle = '';
		var hasAllStyle = false;

		// Polygon
		if ( polygons.all.color && !polygons.all.color.column ) {
			var color   = polygons.all.color.value;
			var opacity = polygons.all.opacity.value;			
			var RGB = this.color2RGB(color);
			var rgba = 'rgba(' + RGB.r + ',' + RGB.g + ',' + RGB.b + ',' + opacity + ');';
			allStyle += 'background:' + rgba;

			if ( opacity != 0 ) hasAllStyle = true;
		}

		// Line
		if ( lines.all.color && !lines.all.color.column ) {
			var color   = lines.all.color.value;
			var opacity = lines.all.opacity.value;
			var width   = lines.all.width.value;
			var RGB = this.color2RGB(color);
			var rgba = 'rgba(' + RGB.r + ',' + RGB.g + ',' + RGB.b + ',' + opacity + ');';

			if ( !polygons.all.color ) {
				allStyle += 'height: 0px; top: 7px;';
				width = width/2;
			}

			allStyle += 'border: ' + 2 + 'px solid ' + rgba;

			if ( opacity != 0 ) hasAllStyle = true;
		}


		if ( hasAllStyle ) {

			var layerName = this.legendObj.layerName;
			this.eachLegendHtml(layerName, allStyle, polygons.all); // TODO
		}



		// Color range
		// Color range
		// Color range

		if ( polygons.all.color && polygons.all.color.column ) {

			var colorStops = polygons.all.color.value;
			var minVal     = polygons.all.color.minRange;
			var maxVal     = polygons.all.color.maxRange;
			var column     = polygons.all.color.column;

			// create legend
			var gradientOptions = {
				colorStops : colorStops,
				minVal     : minVal,
				maxVal     : maxVal,
				bline      : column,
				object     : polygons.all
			}

			this.gradientLegend(gradientOptions);
		}
	},


	// color tools – color tools – color tools – color tools – color tools
	// color tools – color tools – color tools – color tools – color tools
	// color tools – color tools – color tools – color tools – color tools
	// color tools – color tools – color tools – color tools – color tools
	// color tools – color tools – color tools – color tools – color tools
	// color tools – color tools – color tools – color tools – color tools

	// Coverts any color (RGB, RGBA, Names (lavender), #333, #ff33ff) to [r,g,b]
	color2RGB : function (color) {
		
		// The color is a hex decimal
		if ( color[0] == '#' ) return this.hex2RGB(color);

		// The color is RGBA
		if ( color.substring(0,3).toLowerCase() == 'rgba' ) {
			var end = color[color.length-1] == ';' ? color.length-2 : color.length-1;
			var cc = c.substring(5,end);
			var expl = cc.split(",");
			var rgb = {
				r : expl[0],
				g : expl[1],
				b : expl[2]
			}
			return rgb;
		}

		// The color is RGB
		if ( color.substring(0,2).toLowerCase() == 'rgb' ) {		
			var end = color[color.length-1] == ';' ? color.length-2 : color.length-1;
			var cc = c.substring(4,end);
			var expl = cc.split(",");
			var rgb = {
				r : expl[0],
				g : expl[1],
				b : expl[2]
			}
			return rgb;
		}

		// ... or else the color has a name
		var convertedColor = this.colorNameToHex(color);
		return this.hex2RGB(convertedColor);

	},

	// Creates RGB from hex
	hex2RGB : function (hex) {

		hex = this.checkHex(hex);

		var r = parseInt(hex.substring(1,3), 16);
		var g = parseInt(hex.substring(3,5), 16);
		var b = parseInt(hex.substring(5,7), 16);

		var rgb = {
			r : r,
			g : g,
			b : b
		}

		return rgb;

	},	

	// Turns 3 digit hex values to 6 digits
	checkHex : function (hex) {
		
		// If it's a 6 digit hex (plus #), run it.
		if ( hex.length == 7 ) {
			return hex;
		}

		// If it's a 3 digit hex, convert
		if ( hex.length == 4 ) {
			var r = parseInt(hex.substring(1,3), 16);
			var g = parseInt(hex.substring(3,5), 16);
			var b = parseInt(hex.substring(5,7), 16);
			return '#' + r + r + g + g + b + b;
		}

	},
	
	// Turns color names (lavender) to hex
	colorNameToHex : function (color) {

    		var colors = {	"aliceblue" : "#f0f8ff",
    				"antiquewhite":"#faebd7",
    				"aqua":"#00ffff",
    				"aquamarine":"#7fffd4",
    				"azure":"#f0ffff",
    				"beige":"#f5f5dc",
    				"bisque":"#ffe4c4",
    				"black":"#000000",
    				"blanchedalmond":"#ffebcd",
    				"blue":"#0000ff",
    				"blueviolet":"#8a2be2",
    				"brown":"#a52a2a",
    				"burlywood":"#deb887",
    				"cadetblue":"#5f9ea0",
    				"chartreuse":"#7fff00",
    				"chocolate":"#d2691e",
    				"coral":"#ff7f50",
    				"cornflowerblue":"#6495ed",
    				"cornsilk":"#fff8dc",
    				"crimson":"#dc143c",
    				"cyan":"#00ffff",
				"darkblue":"#00008b",
				"darkcyan":"#008b8b",
				"darkgoldenrod":"#b8860b",
				"darkgray":"#a9a9a9",
				"darkgreen":"#006400",
				"darkkhaki":"#bdb76b",
				"darkmagenta":"#8b008b",
				"darkolivegreen":"#556b2f",
				"darkorange":"#ff8c00",
				"darkorchid":"#9932cc",
				"darkred":"#8b0000",
				"darksalmon":"#e9967a",
				"darkseagreen":"#8fbc8f",
				"darkslateblue":"#483d8b",
				"darkslategray":"#2f4f4f",
				"darkturquoise":"#00ced1",
				"darkviolet":"#9400d3",
				"deeppink":"#ff1493",
				"deepskyblue":"#00bfff",
				"dimgray":"#696969",
				"dodgerblue":"#1e90ff",
			    	"firebrick":"#b22222",
			    	"floralwhite":"#fffaf0",
			    	"forestgreen":"#228b22",
			    	"fuchsia":"#ff00ff",
    				"gainsboro":"#dcdcdc",
    				"ghostwhite":"#f8f8ff",
    				"gold":"#ffd700",
    				"goldenrod":"#daa520",
    				"gray":"#808080",
    				"green":"#008000",
    				"greenyellow":"#adff2f",
    				"honeydew":"#f0fff0",
    				"hotpink":"#ff69b4",
				"indianred ":"#cd5c5c",
				"indigo":"#4b0082",
				"ivory":"#fffff0",
				"khaki":"#f0e68c",
				"lavender":"#e6e6fa",
				"lavenderblush":"#fff0f5",
				"lawngreen":"#7cfc00",
				"lemonchiffon":"#fffacd",
				"lightblue":"#add8e6",
				"lightcoral":"#f08080",
				"lightcyan":"#e0ffff",
				"lightgoldenrodyellow":"#fafad2",
				"lightgrey":"#d3d3d3",
				"lightgreen":"#90ee90",
				"lightpink":"#ffb6c1",
				"lightsalmon":"#ffa07a",
				"lightseagreen":"#20b2aa",
				"lightskyblue":"#87cefa",
				"lightslategray":"#778899",
				"lightsteelblue":"#b0c4de",
				"lightyellow":"#ffffe0",
				"lime":"#00ff00",
				"limegreen":"#32cd32",
				"linen":"#faf0e6",
				"magenta":"#ff00ff",
				"maroon":"#800000",
				"mediumaquamarine":"#66cdaa",
				"mediumblue":"#0000cd",
				"mediumorchid":"#ba55d3",
				"mediumpurple":"#9370d8",
				"mediumseagreen":"#3cb371",
				"mediumslateblue":"#7b68ee",
				"mediumspringgreen":"#00fa9a",
				"mediumturquoise":"#48d1cc",
				"mediumvioletred":"#c71585",
				"midnightblue":"#191970",
				"mintcream":"#f5fffa",
				"mistyrose":"#ffe4e1",
				"moccasin":"#ffe4b5",
				"navajowhite":"#ffdead",
				"navy":"#000080",
				"oldlace":"#fdf5e6",
				"olive":"#808000",
				"olivedrab":"#6b8e23",
				"orange":"#ffa500",
				"orangered":"#ff4500",
				"orchid":"#da70d6",
				"palegoldenrod":"#eee8aa",
				"palegreen":"#98fb98",
				"paleturquoise":"#afeeee",
				"palevioletred":"#d87093",
				"papayawhip":"#ffefd5",
				"peachpuff":"#ffdab9",
				"peru":"#cd853f",
				"pink":"#ffc0cb",
				"plum":"#dda0dd",
				"powderblue":"#b0e0e6",
				"purple":"#800080",
				"red":"#ff0000",
				"rosybrown":"#bc8f8f",
				"royalblue":"#4169e1",
				"saddlebrown":"#8b4513",
				"salmon":"#fa8072",
				"sandybrown":"#f4a460",
				"seagreen":"#2e8b57",
				"seashell":"#fff5ee",
				"sienna":"#a0522d",
				"silver":"#c0c0c0",
				"skyblue":"#87ceeb",
				"slateblue":"#6a5acd",
				"slategray":"#708090",
				"snow":"#fffafa",
				"springgreen":"#00ff7f",
				"steelblue":"#4682b4",
				"tan":"#d2b48c",
				"teal":"#008080",
				"thistle":"#d8bfd8",
				"tomato":"#ff6347",
				"turquoise":"#40e0d0",
				"violet":"#ee82ee",
				"wheat":"#f5deb3",
				"white":"#ffffff",
				"whitesmoke":"#f5f5f5",
				"yellow":"#ffff00",
				"yellowgreen":"#9acd32"
				};

		var c = color.toLowerCase();

		// Return hex color
		if ( colors[c] ) return colors[c];
		
		// Return black if there are no matches
		// (could return false, but will have to catch that error later)
		return '#000000';				
	},



});