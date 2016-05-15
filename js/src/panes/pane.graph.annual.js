
// annual graph control
// --------------------
//
//  + should be able to display an average of many years, ie. a background-image
//      - this could be of many years, or just the last year, or anything really, 
//      but it's a background image, which is good to have on a annual graph control
//  + should be able to display "current year" linegraph, on top of the background. good for showing this year's trend
//  + should be able to scroll thru different years, ie. 2014, 2013 etc.. so although the background doesn't change, the 
//      linechart is representing a specific year, and control should be aware of this
//  + should take a dataset for background (avg) to display
//  + should take a dataset for linechart - which is just an array of points in time - and display this for the current year
//  + everything is for the current year, it's an annual graph after all, so that's the reference point
//  + should listen to events for all kinds of actions - ie. be controlled by events, not by fn's
//  + 


Wu.Graph = Wu.Graph || {};
Wu.Graph.Annual = Wu.Evented.extend({

    // annual graph contains average of annual data


    _initialize : function () {

        // listen to events
        this.listen();

        // create DOM
        this._initContainer();

        // init graph
        this._initGraph();

        app._debugGraph = this;
    },

    listen : function () {
        Wu.Mixin.Events.on('sliderUpdate', this._onSliderUpdate, this);
        // Wu.Mixin.Events.on('animatorSetCube', this._setCube, this);
    },

    _initContainer : function () {
        this._container         = Wu.DomUtil.create('div', 'big-graph-outer-container',     this.options.appendTo);
        this._infoContainer     = Wu.DomUtil.create('div', 'big-graph-info-container',      this._container);
        this._nameTitle         = Wu.DomUtil.create('div', 'big-graph-title',               this._infoContainer, 'title');
        this._dateTitle         = Wu.DomUtil.create('div', 'big-graph-current-day',         this._infoContainer, 'day');
        this._scfTitle          = Wu.DomUtil.create('div', 'big-graph-current-scf inline',  this._infoContainer, 'scf');
        this._graphContainer    = Wu.DomUtil.create('div', 'big-graph-inner-container',     this._container)
    },

    _initGraph : function () {

        // store crossfilters, dimensions, etc
        this.ndx = {};

        // prepare this._data
        if (_.isEmpty(this._annualAverageData)) this._prepareAnnualAverageData();



        // AVERAGE ANNUAL DATA
        // -------------------

        // create average (background chart) crossfilter
        this.ndx.average_crossfilter = crossfilter(this._annualAverageData); // this._annualAverageData is avgs for 365 days

        // this._annualAverageData array:
        // -----------------
        // [{
        //     avg : 79.990875,
        //     date : Moment,
        //     max : 89.6246,
        //     min : 64.1556,
        //     no : 1,
        // }] 
        // x 365

        // set dimensions (?)
        var average_dimension = this.ndx.average_crossfilter.dimension(function(d) { 
            return d.date; 
        });

        // create groups (?)
        var average_max_group = average_dimension.group().reduceSum(function(d) { return d.max });
        var average_min_group = average_dimension.group().reduceSum(function(d) { return d.min });
        var average_avg_group = average_dimension.group().reduceSum(function(d) { return d.avg });

        // get max/min date (?)
        var minDate = average_dimension.bottom(1)[0].date;  // this is jan 1 2015.. shouldn't be a YEAR per say, since it messes with the line graph (which needs to be in same year to display)
        var maxDate = average_dimension.top(1)[0].date;     


        // DATA FOR CURRENT YEAR
        // ---------------------

        // red line data
        var this_year_data = _.filter(this.options.data, function (d) {
            return d.Year == 2015;
        });

        // // debug: fix date formats
        var line_data = this._debugFixData(this_year_data);

        // console.log('line_data', line_data);

        // line_data array:
        // ----------------
        // [{
        //     SCF : 77.6827,
        //     date : Thu Jan 01 2015 18:17:07 GMT+0100 (CET),
        // }] // x 365

        // create red line (this year's data) crossfilter
        // this.ndx.line_crossfilter = crossfilter(line_data);
        this.ndx.line_crossfilter = crossfilter([]);

        // create line dimension
        var line_dimension = this.ndx.line_crossfilter.dimension(function(d) { 
            return d.date; 
        });

        // create line group
        var line_group = line_dimension.group().reduceSum(function(d) { return d.SCF; });

        // create point group (for last red triangle)
        var point_group = line_dimension.group().reduceSum(function(d) { return d.SCF });



        // CREATE COMPOSITE CHART
        // ----------------------

        // create composite chart @ container
        var composite = dc.compositeChart(this._graphContainer)

        // Run graph
        composite
        .width(500).height(220)
        .dimension(average_dimension)
        .x(d3.time.scale().domain([minDate,maxDate]))
        // .x(d3.scale.linear().domain([1, 365]))
        .y(d3.scale.linear().domain([0, 100]))
        .clipPadding(10)    
        .elasticY(false)
        .elasticX(false)
        .brushOn(false)
        .transitionDuration(0)          
        .compose([

            // MAX value
            dc.lineChart(composite)
                .group(average_max_group)
                .colors('#DDDDDD')
                .renderArea(true)       
                .renderDataPoints(false)
                .xyTipsOn(false),

            // MIN value
            dc.lineChart(composite)
                .group(average_min_group)
                .colors('#3C4759')
                .renderArea(true)       
                .renderDataPoints(false)
                .xyTipsOn(false),

            // AVERAGE value
            dc.lineChart(composite)
                .group(average_avg_group)
                .colors('#999999')
                .renderDataPoints(false)
                .xyTipsOn(false),

            // THIS YEAR value – LINE
            dc.lineChart(composite)
                .group(line_group)
                .colors('#ff6666')
                .renderDataPoints(false)
                .xyTipsOn(false),

            // THIS YEAR value – LAST DATE (DOT)
            dc.scatterPlot(composite)
                .group(point_group)
                .symbolSize(8)
                .excludedOpacity(0)
                // .colors('#ff0000')
                .colors('#ff6666')
                .symbol('triangle-up')
                .keyAccessor(function(d) {
                    if ( this.graphData && d.key == this.graphData[this.graphData.length-1].date ) return +d.key;
                    return false;
                }.bind(this))
                .valueAccessor(function(d) {
                    if ( this.graphData && d.key == this.graphData[this.graphData.length-1].date ) return +d.value;
                    return false;
                }.bind(this))
        ]);
    

        composite
        // .xUnits(d3.time.months)
        .xAxis()
        .tickFormat(d3.time. format('%b'))

        // render
        dc.renderAll(); 

        // update titles
        this._updateTitles();

        // mark inited
        this._graphInited = true;
    },

    _setCube : function (e) {
        this._cube = e.detail.cube;
    },

    getCube : function () {
        return this.options.cube;
    },

    _current : {
        year : 2015,
        day : 1
    },

    _cache : {
        line : {}
    },

    _onSliderUpdate : function (e) {

        // set current day
        this._current.day = e.detail.value;

        // update line graph
        this._updateLineGraph();

        // update titles
        this._updateTitles();
    },

    _updateTitles : function () {
        
        // get titles
        var nameTitle = this.options.cube.getTitle();
        var date = moment().year(this._current.year).dayOfYear(this._current.day);
        var dateTitle = date.format('MMMM Do YYYY');
        var scf = _.find(this._cache.line[this._current.year], function (c) {
            return c.date.isSame(date, 'day');
        });
        var scfTitle = scf ? parseInt(scf.SCF) : '.';

        // set titles
        this._nameTitle.innerHTML = nameTitle;
        this._dateTitle.innerHTML = dateTitle;
        this._scfTitle.innerHTML = 'SCF: ' + scfTitle + '%';

    },

    _updateLineGraph : function () {

        // fetch line graph from server if not done already
        if (!this._cache.line[this._current.year]) {
            return this._fetchLineGraph(this._setLineGraph.bind(this));
        }

        // set line graph
        this._setLineGraph();

    },

    _fetchLineGraph : function (done) {

        // get graph object
        var graph = app.Animator.graph;

        // set query options
        var queryOptions = {
            query_type : 'scf', // snow cover fraction
            cube_id : this.getCube().getCubeId(),
            year : this._current.year,   
            day : this._current.day,
            options : {
                currentYearOnly : true,
                force_query : false,
                filter_query : false
            },
        };

        // query server for data
        app.api.queryCube(queryOptions, function (err, data) {
            if (err) return console.error(err);

            // parse
            var fractions = Wu.parse(data);

            // parse dates
            var cache = this._parseDates(fractions);

            // set cache
            this._cache.line[this._current.year] = cache;

            // callback
            done && done();

        }.bind(this));

    },

    addLineData : function (options) {

        // parse dates
        var data = this._parseDates(options.data);

        // validate
        if (!_.isArray(data)) return console.error('Malformed data', data);

        // get year
        var year = moment(data[0].date).year();

        // set data to cache
        this._cache.line[year] = data;

        // update line graph
        this._setLineGraph();
    },

    _parseDates : function (cache) {
        if (!_.isArray(cache)) return;
        cache.forEach(function (c) {
            c.date = moment(c.date);
        });
        return cache;
    },

    _setLineGraph : function () {

        // Clear old data
        this.ndx.line_crossfilter.remove();

        // get cached line graph data
        var cache = this._cache.line[this._current.year];

        // filter out period
        var today = moment().year(this._current.year).dayOfYear(this._current.day + 1);
        var period = _.filter(cache, function (d) {
            return d.date.isBefore(today);
        });

        // add data, triggers automatically
        this.ndx.line_crossfilter.add(period);

        // redraw
        dc.redrawAll();
    },

    getCurrentDate : function () {
        return moment().dayOfYear(this._current.day).year(this._current.year);
    },

    _debugFixData : function (data) {
        var fixed = [];
        data.forEach(function (d) {
            fixed.push({
                SCF : d.SCF,
                date : new Date(moment().year(d.Year).dayOfYear(d.Doy).toString())
            });
        });
        return fixed;
    },

    _prepareAnnualAverageData : function (year) {

        // set year
        var year = year || 2015;

        // passed from constructor
        var data = this.options.data;

        // clear
        this._annualAverageData = [];

        // for each day
        _.times(365, function (n) {

            var doy = n+1;

            // get this day's values
            var today = _.filter(data, function (d) {
                return d.Doy == doy;
            });

            // get this day's max
            var max = _.max(today, function (d) {
                return d.SCF;
            }).SCF;

            // get this day's min
            var min = _.min(today, function (d) {
                return d.SCF;
            }).SCF;

            // get this day's avg
            var sum = 0;
            _.times(today.length, function (i) {
                sum += today[i].SCF;
            });
            var avg = sum/today.length;

            // add to array
            this._annualAverageData.push({
                no   : doy,
                max  : max,
                date : moment().year(year).dayOfYear(data[doy].Doy), // year doesn't matter, as it's avg for all years
                min  : min,
                avg  : avg,
            });

        }.bind(this));

    },


});