Wu.BigSlider = Wu.Class.extend({

	options : {

		// animation frames per second
		fps : 1
	},

	initialize : function (options) {

		Wu.setOptions(this, options);

		// fetching data is async, so must wait for callback
		this.initData(function (err) {

			this.initSlider();

			this.initGraph();

			this.updateDayOfYear();

			this.addHooks();

		}.bind(this));
		
	},


	initData : function (done) {

		// only get data once
		if (app._animatorData) {
			console.error('already got animator data');
			return done();
		}

		// get data from server
		app.api.getCustomData({
			name : this.options.data
		}, function (err, data) {

			if ( err ) console.error(err);

			// parse
			var allYears = Wu.parse(data);

			// render
			this.renderData(allYears);

			// continue initialize
			done(err);

		}.bind(this));

	},

	renderData : function (allYears) {

		// Array of JSON with all days with every year, one by one
		this.allYears = allYears;

		// Array of JSON with all days, categorized by year
		this.years = this.sanitizeYears(this.allYears);

		// Array of JSON with all days, categorized by year
		this.days = this.sanitizeDays(this.allYears);

		// Get min, max and average values for one year
		this.maxSCF = this.getMaxSCF(this.days);
		this.minSCF = this.getMinSCF(this.days);
		this.avgSCF = this.getAvgSCF(this.days);
		
		// Create blank array
		this.allData = [];

		// Populate array with data
		this.maxSCF.forEach(function (mx,i) {
			var obj = {
				no   : i,
				max  : mx,
				date : this._dateFromNo(i),				
				min  : this.minSCF[i],
				avg  : this.avgSCF[i]
			};
			this.allData.push(obj);
		}.bind(this));	


		this.ticks = [];

		var currentMonth = '';

		this.allYears.forEach(function (y) {
			var year = y.Year;
			var month = this.getMonthName(y.Doy, y.Year);
			var doy = y.Doy;
		  	var blankDate = new Date(year, 0);
	  		var date = new Date(blankDate.setDate(doy));
			var day = date.getDate();
			var monthNo = date.getMonth()+1;			

			if ( currentMonth != month ) {
				currentMonth = month;
				
				this.ticks.push({ 
					month   : month, 
					year    : year,
					doy     : doy,
					monthNo : monthNo
				})
			}

		}.bind(this))


		// Find last day
		
		// Get object
		var lastDay = this.allYears[this.allYears.length-1];

		// Get last year
		var lastYear = lastDay.Year;

		// Get last day of year
		var lastDoy = lastDay.Doy;

		// Get last month name
		var lastMonth = this.getMonthName(lastDoy, lastYear);

		// Set date, so that we can get month number, and day of month number
	  	var blankDate = new Date(lastYear, 0);
  		var setDate = new Date(blankDate.setDate(lastDoy));

  		// Get last month number
		var lastDofMonth = setDate.getDate();

		// Get last day of last month
		var lastMonthNo = setDate.getMonth()+1;

		// Store final day
		this.finalDay = {
			Year    : lastYear,
			Month   : lastMonth,
			Day     : lastDofMonth,
			Doy     : lastDoy,
			MonthNo : lastMonthNo
		}


		this.tickStart = this.ticks.length-13;
		this.tickEnd = this.ticks.length;
		this.currentSliderValue = 365;

	},



	getMonthName : function (doy, year) {
		var monthNames = [ "Januar", "Februar", "Mars", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Desember" ];
	  	var blankDate = new Date(year, 0);
  		var date = new Date(blankDate.setDate(doy));
		var day = date.getDate();
		var monthIndex = date.getMonth();
		return monthNames[monthIndex];
	},

	_dateFromNo : function (no) {
	  	var blankDate = new Date(2014, 0);
  		var date = new Date(blankDate.setDate(no));
		return date;
	},

	hide : function () {
		this.sliderOuterContainer.style.display = 'none';
	},

	show : function () {
		this.sliderOuterContainer.style.display = 'block';
	},

	initSlider : function () {

		this.sliderOuterContainer = Wu.DomUtil.create('div', 'big-slider-outer-container', app._appPane);

		var sliderInnerContainer = Wu.DomUtil.create('div', 'big-slider-inner-container', this.sliderOuterContainer);
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


	},


	initGraph : function () {


		// AVERAGE DATA FOR ALL YEARS
		// AVERAGE DATA FOR ALL YEARS
		// AVERAGE DATA FOR ALL YEARS

		// Prepare DC dimensions
		var ndx     = crossfilter(this.allData);
		var xDim    = ndx.dimension(function(d) { return d.date });
		var yMaxDim = xDim.group().reduceSum(function(d) { return d.max });
		var yMinDim = xDim.group().reduceSum(function(d) { return d.min });
		var yAvgDim = xDim.group().reduceSum(function(d) { return d.avg });

    		var minDate = xDim.bottom(1)[0].date;
		var maxDate = xDim.top(1)[0].date;

		// DATA FOR CURRENT YEAR
		// DATA FOR CURRENT YEAR
		// DATA FOR CURRENT YEAR

		// Data will get populated in updateGraph()
		this.graphData = [];

		// Prepare DC dimensions
		this.ndx = crossfilter(this.graphData);

		// LINE DIMENSION
		// LINE DIMENSION

		// THIS PART CHANGES FOR EVERY MOVE

		var thisXdim = this.ndx.dimension(function(d) { return d.date });
		var yThisDim = thisXdim.group().reduceSum(function(d) { return d.SCF; });

		// SCATTER DIMENSION
		// SCATTER DIMENSION
		var scatterDim = thisXdim.group().reduceSum(function(d) { 
			return d.SCF
		}.bind(this));

		var graphOuterContainer = Wu.DomUtil.create('div', 'big-graph-outer-container', this.sliderOuterContainer);

		var graphInfoContainer = Wu.DomUtil.create('div', 'big-graph-info-container', graphOuterContainer);

		this.dayNameTitle = Wu.DomUtil.create('div', 'big-graph-current-day', graphInfoContainer);

		this.currentSCF = Wu.DomUtil.create('div', 'big-graph-current-scf inline', graphInfoContainer);
		// this.cloud = Wu.DomUtil.create('div', 'big-graph-current-cloud inline', graphInfoContainer);
		// this.age = Wu.DomUtil.create('div', 'big-graph-current-age inline', graphInfoContainer);
		// this.maxSCF = Wu.DomUtil.create('div', 'big-graph-current-maxscf inline', graphInfoContainer);
		// this.minSCF = Wu.DomUtil.create('div', 'big-graph-current-minscf inline', graphInfoContainer);

		var graphInnerContainer = Wu.DomUtil.create('div', 'big-graph-inner-container', graphOuterContainer)

		// Get HTML element, and define it as graph container
		var hitslineChart = dc.compositeChart(graphInnerContainer)


		// Run graph
		hitslineChart
			.width(500).height(220)
			.dimension(xDim)
		
			.x(d3.time.scale().domain([minDate,maxDate]))
		 	.y(d3.scale.linear().domain([0, 100]))

			.clipPadding(10)   	
			.elasticY(false)
			.elasticX(false)
			.brushOn(false)
			.transitionDuration(0)			

			
			// Each of these will be a new graph
			.compose([

				// MAX value
				dc.lineChart(hitslineChart)
					.group(yMaxDim)
					.colors('#DDDDDD')
					.renderArea(true)   	
					.renderDataPoints(false)
					.xyTipsOn(false)			
				,

				// MIN value
				dc.lineChart(hitslineChart)
					.group(yMinDim)
					.colors('#ffffff')
					.renderArea(true)   	
					.renderDataPoints(false)
					.xyTipsOn(false)			
				,

				// AVERAGE value
				dc.lineChart(hitslineChart)
					.group(yAvgDim)
					.colors('#999999')
					.renderDataPoints(false)
					.xyTipsOn(false)			
				,

				// THIS YEAR value – LINE
				dc.lineChart(hitslineChart)
					.group(yThisDim)
					.colors('#ff6666')
					.renderDataPoints(false)
					.xyTipsOn(false)
				,

				// THIS YEAR value – LAST DATE (DOT)
				dc.scatterPlot(hitslineChart)
					.group(scatterDim)
					.symbolSize(8)
					.excludedOpacity(0)
					.colors('#ff0000')
					.symbol('triangle-up')
					.keyAccessor(function(d) {
						if ( this.graphData && d.key == this.graphData[this.graphData.length-1].date ) return +d.key;
						return false;
					}.bind(this))
					.valueAccessor(function(d) {
						if ( this.graphData && d.key == this.graphData[this.graphData.length-1].date ) return +d.value;
						return false;
					}.bind(this))
			
			])


		
			hitslineChart
				.xUnits(d3.time.months)
				.xAxis()
				.tickFormat(d3.time. format('%b'))



		dc.renderAll(); 


	},

	updateGraph : function () {

		// console.error('updateGraph');

		// Current year
		var year = this.currentYear;

		// Day on slider (this can be more than 365, as it can start in the middle of the year).
		var day = this.currentDay;

		// Check how many days it's in the current year
		var daysInYear = this.years[year].length;

		// Skip over to next year at end of year
		if ( day > daysInYear ) {
			day -= daysInYear;
			year ++;
		}

		// Reset graph data
		this.graphData = [];

		// Rebuild graph data
		this.years[year].forEach(function (d, i) {
			var doy = i+1;
			if ( doy < day ) this.graphData.push(d);
		}.bind(this));


		// If we're at the end of the road
		if ( !this.years[year][day-1] ) {
			this.stopPlaying();
			return;
		}

		// Clear old data
		this.ndx.remove();

		// Add new data	
		this.ndx.add(this.graphData);

		// Redraw graph
		dc.redrawAll()

		var scf = Math.round(this.years[year][day-1].SCF * 100) / 100;
		// var cloud = Math.round(this.years[year][day-1].Cloud * 10) / 10;
		// var age = Math.round(this.years[year][day-1].Age * 10) / 10;

		// // Update HTML
		this.dayNameTitle.innerHTML = this.dayName;
		this.currentSCF.innerHTML = 'SCF: ' + scf + '%';
		// this.cloud.innerHTML = 'Cloud: ' + cloud;
		// this.age.innerHTML = 'Age: ' + age;



	},


	addHooks : function () {

		Wu.DomEvent.on(this.stepBackward, 'click', this.moveBackward, this);
		Wu.DomEvent.on(this.stepForward, 'click', this.moveForward, this);
		Wu.DomEvent.on(this.playButton, 'click', this.play, this);
	
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
		}.bind(this), (1000/this.options.fps)) 
	},

	stopPlaying : function () {

		this.playButton.innerHTML = '<i class="fa fa-play"></i>';

		clearInterval(this.playInterval);
		this.playing = false;
	},

	updateDayOfYear : function () {

		// Month names
		var monthNames = [ "Januar", "Februar", "Mars", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Desember" ];


		// What is wrong here?
		// We calculate from the beginning of the year,
		// when we should ALWAYS count from the last day
		// we've got, and work our ways backwards from
		// there...

		var lastDayObj  = this.finalDay,
		    lastYear    = lastDayObj.Year,
		    lastMonth   = lastDayObj.Month,
		    lastDay     = lastDayObj.Day,
		    lastDoy     = lastDayObj.Doy,
		    lastMonthNo = lastDayObj.MonthNo;

		var _firstDay   = lastDoy - 365;


		// Find out where we start
		var tickStartMonthName = this.ticks[this.tickStart].month;
		var tickStartMonthNo   = monthNames.indexOf(tickStartMonthName);
		var tickStartYear      = this.ticks[this.tickStart].year;

		var startDay = 365 + _firstDay;
		


		// Start figuring out what day we are showing
		var year = this.currentYear = tickStartYear;
		var day  = this.currentDay  = this.currentSliderValue + startDay - 1;
	
	  	var blankDate = new Date(year, 0);
  		var date = new Date(blankDate.setDate(day));
		var day = date.getDate();
		var monthIndex = date.getMonth();
		var year = date.getFullYear();
		this.dayName = day + ' ' + monthNames[monthIndex] + ' ' + year;

		this.currentDateContainer.innerHTML = this.dayName;

		this.updateGraph();

	},


	moveBackward : function () {

		if ( this.diableBackward ) return;

		this.tickEnd--;
		this.tickStart--;

	
		var finalDay = this.ticks[this.tickEnd-1];
		var finalYear     = finalDay.year;
		var finalDoy      = finalDay.doy;
		var finalMonth    = this.getMonthName(finalDoy, finalYear);
		var blankDate     = new Date(finalYear, 0);
		var setDate       = new Date(blankDate.setDate(finalDoy));
		var finalDofMonth = setDate.getDate();
		var finalMonthNo  = setDate.getMonth()+1;
		var _finalDay     = {
			Year    : finalYear,
			Month   : finalMonth,
			Day     : finalDofMonth,
			Doy     : finalDoy,
			MonthNo : finalMonthNo
		}
		this.finalDay = _finalDay;



		this.updateTicks();
		this.updateButtons();
		this.updateDayOfYear();



	},


	moveForward : function () {

		if ( this.diableForward ) return;

		this.tickEnd++;
		this.tickStart++;

		this.updateTicks();
		this.updateButtons();

		this.updateDayOfYear();		

	},	


	// xoxoxoxoxoxoxoxoxoxox
	updateTicks : function () {


		var lastDayObj  = this.finalDay,
		    lastYear    = lastDayObj.Year,		    
		    lastDay     = lastDayObj.Day,
		    lastMonthNo = lastDayObj.MonthNo,
		    daysInMonth = new Date(lastYear, lastMonthNo, 0).getDate(),
		    diffDays    = daysInMonth - lastDay;



		// Now we need to figure out how many days it adds up to...
		var allDays = 0;
		for ( var i = this.tickStart; i < this.tickEnd; i++ ) {	// how many months we itterate
			var daysInMonth = new Date(this.ticks[i].year, this.ticks[i].monthNo, 0).getDate();
			allDays += daysInMonth;
		}

		// Get start date
		var firstMonth = this.ticks[this.tickStart];	
		var daysInFirstMonth = new Date(firstMonth.year, firstMonth.monthNo, 0).getDate();
		var _firstDay = new Date(firstMonth.year, firstMonth.monthNo, (daysInFirstMonth-diffDays));

		// Do I even need this?
		var _lastMonth = this.ticks[this.tickEnd-1];
		var _daysInLastMonth = new Date(_lastMonth.year, _lastMonth.monthNo, 0).getDate();
		var _lastDay = new Date(_lastMonth.year, _lastMonth.monthNo, lastDay);


		this.tickContainer.innerHTML = '';
	
		var year = '';


		for ( var i = this.tickStart; i < this.tickEnd; i++ ) {

			var _i = i;

			var month = this.ticks[_i].month.substr(0,3);
			var _tick = Wu.DomUtil.create('div', 'big-slider-tick', this.tickContainer, month);

			if ( year != this.ticks[_i].year ) {
				var newYear = Wu.DomUtil.create('div', 'big-slider-year-tick', _tick, this.ticks[_i].year);
				year = this.ticks[_i].year;	
			}

			// Days in this month...
			var DIM = new Date(year, this.ticks[_i].monthNo, 0).getDate();

			if ( i == this.tickStart ) DIM -= (daysInFirstMonth-diffDays);
			if ( i == this.tickEnd-1 ) DIM -= diffDays;

			var dimprop = (DIM / 365) * 99;
			
			_tick.style.width = dimprop + '%';

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


















	getMaxSCF : function (days) { 

		var eachDay = [];

		for ( var day in days ) {

			var maxD = false;		

			if( Object.prototype.toString.call( days[day] ) === '[object Array]' ) {

				if ( !maxD ) maxD = days[day][1].SCF;
				days[day].forEach(function (d) { 
					if ( d.SCF > maxD ) maxD = d.SCF 
				});
				eachDay[day] = Math.round(maxD);
			}

		}

		return eachDay;

	},

	getMinSCF : function (days) { 

		var eachDay = [];

		for ( var day in days ) {	

			var minD = false;

			if ( Object.prototype.toString.call( days[day] ) === '[object Array]' ) {
				if ( !minD ) minD = days[day][1].SCF;
				days[day].forEach(function (d) { if ( d.SCF < minD ) minD = d.SCF });
				eachDay[day] = Math.round(minD);
			}
		}

		return eachDay;

	},

	getAvgSCF : function (days) {

		var eachDay = [];

		for ( var day in days ) {		
			if ( Object.prototype.toString.call( days[day] ) === '[object Array]' ) {
				var avg = 0;
				days[day].forEach(function(d) { avg += d.SCF; });
				eachDay[day] = Math.round(avg / days[day].length);
			}
		}
		return eachDay;
	},

	sanitizeDays : function (allYears) {

		var days = [];
		allYears.forEach(function (each) {
			if ( !days[each.Doy] ) days[each.Doy] = [];
			days[each.Doy].push(each);
		})
		return days;
	},


	sanitizeYears : function (allYears) {

		var years = [];
		var currentYear = '';

		allYears.forEach(function (each) {
			// New year!
			if (  currentYear != each.Year ) {
				currentYear = each.Year;
				years[currentYear] = [];
			}

			// console.log('each', each);
			var thisYear = {
				SCF : each.SCF,
				// Year : each.Year,
				// Doy : each.Doy,
				date : this._dateFromNo(each.Doy)
				// Cloud : each.Clod,
				// Age : each.Age
			}

			years[currentYear].push(thisYear)
		}.bind(this))

		return years;
	},


});




