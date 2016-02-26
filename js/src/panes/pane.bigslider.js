Wu.BigSlider = Wu.Class.extend({

	initialize : function () {

		// create container
		this.initContainer();

	},

	ticks : [

			{ month : 'Januar',    year : 2010 },
			{ month : 'Februar',   year : 2010 },
			{ month : 'Mars',      year : 2010 },
			{ month : 'April',     year : 2010 },
			{ month : 'Mai',       year : 2010 },
			{ month : 'Juni',      year : 2010 },
			{ month : 'Juli',      year : 2010 },
			{ month : 'August',    year : 2010 },
			{ month : 'September', year : 2010 },
			{ month : 'Oktober',   year : 2010 },
			{ month : 'November',  year : 2010 },
			{ month : 'Desember',  year : 2010 },	

			{ month : 'Januar',    year : 2011 },
			{ month : 'Februar',   year : 2011 },
			{ month : 'Mars',      year : 2011 },
			{ month : 'April',     year : 2011 },
			{ month : 'Mai',       year : 2011 },
			{ month : 'Juni',      year : 2011 },
			{ month : 'Juli',      year : 2011 },
			{ month : 'August',    year : 2011 },
			{ month : 'September', year : 2011 },
			{ month : 'Oktober',   year : 2011 },
			{ month : 'November',  year : 2011 },
			{ month : 'Desember',  year : 2011 },

			{ month : 'Januar',    year : 2012 },
			{ month : 'Februar',   year : 2012 },
			{ month : 'Mars',      year : 2012 },
			{ month : 'April',     year : 2012 },
			{ month : 'Mai',       year : 2012 },
			{ month : 'Juni',      year : 2012 },
			{ month : 'Juli',      year : 2012 },
			{ month : 'August',    year : 2012 },
			{ month : 'September', year : 2012 },
			{ month : 'Oktober',   year : 2012 },
			{ month : 'November',  year : 2012 },
			{ month : 'Desember',  year : 2012 },

			{ month : 'Januar',    year : 2013 },
			{ month : 'Februar',   year : 2013 },
			{ month : 'Mars',      year : 2013 },
			{ month : 'April',     year : 2013 },
			{ month : 'Mai',       year : 2013 },
			{ month : 'Juni',      year : 2013 },
			{ month : 'Juli',      year : 2013 },
			{ month : 'August',    year : 2013 },
			{ month : 'September', year : 2013 },
			{ month : 'Oktober',   year : 2013 },
			{ month : 'November',  year : 2013 },
			{ month : 'Desember',  year : 2013 },

			{ month : 'Januar',    year : 2014 },
			{ month : 'Februar',   year : 2014 },
			{ month : 'Mars',      year : 2014 },
			{ month : 'April',     year : 2014 },
			{ month : 'Mai',       year : 2014 },
			{ month : 'Juni',      year : 2014 },
			{ month : 'Juli',      year : 2014 },
			{ month : 'August',    year : 2014 },
			{ month : 'September', year : 2014 },
			{ month : 'Oktober',   year : 2014 },
			{ month : 'November',  year : 2014 },
			{ month : 'Desember',  year : 2014 },			

			{ month : 'Januar',    year : 2015 },
			{ month : 'Februar',   year : 2015 },
			{ month : 'Mars',      year : 2015 },
			{ month : 'April',     year : 2015 },
			{ month : 'Mai',       year : 2015 },
			{ month : 'Juni',      year : 2015 },
			{ month : 'Juli',      year : 2015 },
			{ month : 'August',    year : 2015 },
			{ month : 'September', year : 2015 },
			{ month : 'Oktober',   year : 2015 },
			{ month : 'November',  year : 2015 },
			{ month : 'Desember',  year : 2015 },

			{ month : 'Januar',    year : 2016 },
			{ month : 'Februar',   year : 2016 },

	],	

	initContainer : function () {

		this.tickStart = this.ticks.length-13;
		this.tickEnd = this.ticks.length;
		this.currentSliderValue = 200;


		var sliderOuterContainer = Wu.DomUtil.create('div', 'big-slider-outer-container', app._appPane);

		var sliderInnerContainer = Wu.DomUtil.create('div', 'big-slider-inner-container', sliderOuterContainer);
		this.playButton = Wu.DomUtil.create('div', 'big-slider-play-button', sliderInnerContainer, '<i class="fa fa-play"></i>');


		var slider = Wu.DomUtil.create('div', 'big-slider', sliderInnerContainer);

		this.stepForward = Wu.DomUtil.create('div', 'big-slider-step-forward', sliderInnerContainer, '<i class="fa fa-step-forward"></i>');
		this.stepBackward = Wu.DomUtil.create('div', 'big-slider-step-backward', sliderInnerContainer, '<i class="fa fa-step-backward"></i>');

		this.currentDateContainer = Wu.DomUtil.create('div', 'big-slider-current-date', sliderInnerContainer);

		this.tickContainer = Wu.DomUtil.create('div', 'big-slider-tick-container', sliderInnerContainer);


		this.updateTicks();
		this.updateButtons();



		this.slider = noUiSlider.create(slider, {
			start: [this.currentSliderValue],
			range: {
				'min': 0,
				'max': 365
			}
		});



		this.updateDayOfYear();
		this.addHooks();

	},


	addHooks : function () {

		Wu.DomEvent.on(this.stepBackward, 'click', this.moveBackward, this);
		Wu.DomEvent.on(this.stepForward, 'click', this.moveForward, this);
		Wu.DomEvent.on(this.playButton, 'click', this.play, this);
		

		// this.slider.on('change', function( values, handle ) {
		// 	// this.currentSliderValue = Math.round(values);
		// 	// this.updateDayOfYear();
		// 	console.log('change');
		// }.bind(this));

		// this.slider.on('end', function( values, handle ) {
		this.slider.on('change', function( values, handle ) {			
			this.currentSliderValue = Math.round(values);
			this.updateDayOfYear();
		}.bind(this));

	},


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
				this.updateDayOfYear()
			}			
		}.bind(this), 250) 
	},

	stopPlaying : function () {

		this.playButton.innerHTML = '<i class="fa fa-play"></i>';

		clearInterval(this.playInterval);
		this.playing = false;
	},

	updateDayOfYear : function () {

		// Month names
		var monthNames = [ "Januar", "Februar", "Mars", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Desember" ];

		// Find out where we start
		var tickStartDay = 1; // We always start at the first day of the month
		var tickStartMonthName = this.ticks[this.tickStart].month;
		var tickStartMonthNo = monthNames.indexOf(tickStartMonthName);
		var tickStartYear = this.ticks[this.tickStart].year;

		// What day of the year do we start?
		var now = new Date(tickStartYear, tickStartMonthNo, tickStartDay);
		var start = new Date(tickStartYear, 0, 0);
		var diff = now - start;
		var oneDay = 1000 * 60 * 60 * 24;
		var startDay = Math.floor(diff / oneDay);

		// Start figuring out what day we are showing
		var year = tickStartYear;
		var day = this.currentSliderValue + startDay;
		
	  	var blankDate = new Date(year, 0);
  		var date = new Date(blankDate.setDate(day));
		var day = date.getDate();
		var monthIndex = date.getMonth();
		var year = date.getFullYear();
		var dayName = day + ' ' + monthNames[monthIndex] + ' ' + year;


		this.currentDateContainer.innerHTML = dayName;

	},

	moveBackward : function () {

		if ( this.diableBackward ) return;

		this.tickEnd--;
		this.tickStart--;

		this.updateTicks();
		this.updateButtons();

	},


	moveForward : function () {

		if ( this.diableForward ) return;

		this.tickEnd++;
		this.tickStart++;

		this.updateTicks();
		this.updateButtons();

	},	

	updateTicks : function () {

		this.tickContainer.innerHTML = '';
	
		var year = '';

		for ( var i = this.tickStart; i < this.tickEnd; i++ ) {

			var _tick = Wu.DomUtil.create('div', 'big-slider-tick', this.tickContainer, this.ticks[i].month);

			if ( year != this.ticks[i].year ) {
				var newYear = Wu.DomUtil.create('div', 'big-slider-year-tick', _tick, this.ticks[i].year);
				year = this.ticks[i].year;	
			}			
		}
	
	},

	updateButtons : function () {


		if ( this.tickEnd == this.ticks.length ) {
			this.diableForward = true;
			Wu.DomUtil.addClass(this.stepForward, 'disable-button');
		} else {
			this.diableForward = false;
			Wu.DomUtil.removeClass(this.stepForward, 'disable-button');
		}

		if ( this.tickStart == 0 ) {
			this.diableBackward = true;
			Wu.DomUtil.addClass(this.stepBackward, 'disable-button');
		} else {
			this.diableBackward = false;
			Wu.DomUtil.removeClass(this.stepBackward, 'disable-button');
		}
		
		

	},


	// Update message box, if it exists before
	update : function (message, severity) {
	},

	remove : function (id) {
	},
});





