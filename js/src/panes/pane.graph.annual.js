
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

// init main object (could be others)
Wu.Graph = Wu.Graph || {};

// Annual Graph (cyclical)
Wu.Graph.Annual = Wu.Evented.extend({

    options : {
        fetchLineGraph : false, // debug, until refactored fetching line graph to cube
    },

    // annual graph contains average of annual data

    _initialize : function () {

        // listen to events
        this.listen();

        // create DOM
        this._initContainer();

        // init graph
        this._initGraph();

        // set initial date (todo: set to last in series)
        this._setDate(2016, 10);

    },

    listen : function () {
        Wu.Mixin.Events.on('sliderUpdate', this._onSliderUpdate, this);
        Wu.Mixin.Events.on('sliderMoveForward', this._onSliderMoveForward, this);
        Wu.Mixin.Events.on('sliderMoveBackward', this._onSliderMoveBackward, this);
        Wu.Mixin.Events.on('loadingGraph', this._onLoadingGraph, this);
        Wu.Mixin.Events.on('loadedGraph', this._onLoadedGraph, this);
        Wu.Mixin.Events.on('maskSelected', this._onMaskSelected, this);
        Wu.Mixin.Events.on('maskUnselected', this._onMaskUnselected, this);
        Wu.Mixin.Events.on('animatorMovePreviousYear', this._onAnimatorMovePreviousYear, this);
        Wu.Mixin.Events.on('animatorMoveNextYear', this._onAnimatorMoveNextYear, this);
    },

    _initContainer : function () {
        this._container         = Wu.DomUtil.create('div', 'big-graph-outer-container',     this.options.appendTo);
        this._infoContainer     = Wu.DomUtil.create('div', 'big-graph-info-container',      this._container);
        this._nameTitle         = Wu.DomUtil.create('div', 'big-graph-title',               this._infoContainer, 'title');
        this._dateTitle         = Wu.DomUtil.create('div', 'big-graph-current-day',         this._infoContainer, 'day');
        this._graphContainer    = Wu.DomUtil.create('div', 'big-graph-inner-container',     this._container);
        this._loadingBar        = Wu.DomUtil.create('div', 'graph-loading-bar', this._container);
        this._legendContainer   = Wu.DomUtil.create('div', 'graph-legend', this._container);
    },

    _initGraph : function () {

        // store crossfilters, dimensions, etc
        this.ndx = {};

        // prepare this._data if not already done
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

        // console.log('minDate, maxDate', minDate, maxDate);

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
        var composite = this._composite = dc.compositeChart(this._graphContainer)

        // Run graph
        composite
        .width(500).height(220)
        .dimension(average_dimension)
        .x(d3.time.scale().domain([minDate,maxDate]))
        .y(d3.scale.linear().domain([0, 100]))
        .clipPadding(10)    
        .elasticY(false)
        .elasticX(false)
        .brushOn(false)
        .yAxisLabel('SCF (%)')
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
                // .colors('#999999')
                // .colors('rgb(76, 76, 76)')
                .colors('white')
                .renderDataPoints(false)
                .xyTipsOn(false),

            // THIS YEAR value – LINE
            dc.lineChart(composite)
                .group(line_group)
                .colors('#ff6666')
                .renderDataPoints(false)
                .xyTipsOn(false),

            // // THIS YEAR value – LAST DATE (DOT)
            // dc.scatterPlot(composite)
            //     .group(point_group)
            //     .symbolSize(8)
            //     .excludedOpacity(0)
            //     // .colors('#ff0000')
            //     .colors('#ff6666')
            //     .symbol('triangle-up')
            //     .keyAccessor(function(d) {
            //         var data = this._cache.line[this._current.year];
            //         if ( data && d.key == data[data.length-1].date ) return +d.key;
            //         return false;
            //     }.bind(this))
            //     .valueAccessor(function(d) {
            //         var data = this._cache.line[this._current.year];
            //         if ( data && d.key == data[data.length-1].date ) return +d.value;
            //         return false;
            //     }.bind(this))
        ]);
    

        composite
        .xAxis()
        .tickFormat(d3.time. format('%b'))

        // render
        dc.renderAll(); 

        // update titles
        this._updateTitles();

        // update legend
        this._updateLegend();

        // mark inited
        this._graphInited = true;

        // debug: set default date
        // this._setDate(2015, 103);

    },

    _updateLegend : function () {

        var year_container = Wu.DomUtil.create('div', 'graph-legend-module', this._legendContainer);
        var average_container = Wu.DomUtil.create('div', 'graph-legend-module', this._legendContainer);
        var minmax_container = Wu.DomUtil.create('div', 'graph-legend-module', this._legendContainer);

        var minmax_color = Wu.DomUtil.create('div', 'graph-legend-color', minmax_container);
        var average_color = Wu.DomUtil.create('div', 'graph-legend-color', average_container);
        var year_color = Wu.DomUtil.create('div', 'graph-legend-color', year_container);

        var minmax_text = Wu.DomUtil.create('div', 'graph-legend-text', minmax_container);
        var average_text = Wu.DomUtil.create('div', 'graph-legend-text', average_container);
        var year_text = Wu.DomUtil.create('div', 'graph-legend-text', year_container);

        minmax_text.innerHTML = 'Max/min: 2000-2015';
        average_text.innerHTML = 'Average: 2000-2015';
        year_text.innerHTML = 'Current year';

        minmax_color.style.background = '#DCDCD7';
        average_color.style.background = 'white';
        year_color.style.background = '#F3504A';

    },

    _setCube : function (e) {
        this._cube = e.detail.cube;
    },

    getCube : function () {
        return this.options.cube;
    },

    _current : {
        // defaults
        year : 2015,
        day : 1
    },

    _cache : {
        line : {}
    },

    _setDate : function (year, day) {
        
        // set dates
        this._current.year = year || this._current.year || 2016;
        this._current.day = day || this._current.day || 1;

        // set graph dates
        var minDate = moment().year(this._current.year).dayOfYear(1);
        var maxDate = moment().year(this._current.year + 1).dayOfYear(-1); // last day of year

        // set date range to graph
        this._composite.x(d3.time.scale().domain([minDate,maxDate]));

        // todo: make sure average-graph is set to current year

        // this._prepareAnnualAverageData(year);
        // this.ndx.average_crossfilter = crossfilter(this._annualAverageData); 
        // this._initGraph();

        // set slider
        app.Animator.setSlider(day);

        // set cube cursor
        var timestamp = moment().year(year).dayOfYear(day);
        this.getCube().setCursor(timestamp);

        // update line graph
        this._updateLineGraph();

        // update titles
        this._updateTitles();
    },

    _onSliderUpdate : function (e) {

        // set current day
        this._current.day = e.detail.value;

        // update line graph
        this._updateLineGraph({
            evented : true
        });

        // update titles
        this._updateTitles();
    },

    _onSliderMoveBackward : function (e) {

        // set year
        this._current.year = this._current.year - 1;

        // update line graph
        this._updateLineGraph();

        // update titles
        this._updateTitles();
    },

    _onSliderMoveForward : function (e) {

        // set year
        this._current.year = this._current.year + 1;

        // update line graph
        this._updateLineGraph();

        // update titles
        this._updateTitles();
    },

    _onAnimatorMovePreviousYear : function (e) {

        var day = e.detail.day;

        // set year
        this._current.year = this._current.year - 1;

        // set day
        this._current.day = day;

        // update line graph
        this._updateLineGraph();

        // update titles
        this._updateTitles();
    },

    _onAnimatorMoveNextYear : function (e) {

        var day = e.detail.day;

        // set year
        this._current.year = this._current.year + 1;

        // set day
        this._current.day = day;

        // update line graph
        this._updateLineGraph();

        // update titles
        this._updateTitles();
    },

    _onMaskSelected : function (e) {
        this._maskSelected = true;
        this._updateTitles();
    },

    _onMaskUnselected : function () {

        // get default graph
        this._fetchLineGraph(this._setLineGraph.bind(this));

        // mark
        this._maskSelected = false;

        // update titles
        this._updateTitles();
    },

    _getTitle : function () {
        var title = this.options.cube.getTitle();
        if (this._maskSelected) {
            title += ' - Vassdrag Z 33';
        }
        return title;
    },

    _updateTitles : function (options) {

        // get titles
        var nameTitle = this._getTitle();
        var date = moment().year(this._current.year).dayOfYear(this._current.day);
        var dateTitle = date.format('MMMM Do YYYY');
        var cache = this._cache.line[this._current.year];
        var scf = _.find(cache, function (c) {
            return c.date.isSame(date, 'day');
        });
        var scfTitle = scf ? (Math.round(scf.SCF * 10) / 10) + '%' : '';

        // check limit
        if (this._current.day >= this._limit) {
            dateTitle += ' (end of dataset)';
        }

        // set titles
        this._nameTitle.innerHTML = nameTitle;
        this._dateTitle.innerHTML = dateTitle + ' &nbsp;&nbsp;&nbsp;   <span style="font-weight:900">SCF: ' + scfTitle + '</span>';
    },

    _updateLineGraph : function (options) {

        // fetch line graph from server if not done already
        if (!this._cache.line[this._current.year]) {
            

            if (this.options.fetchLineGraph) {

                // fetch dataset from server
                this._fetchLineGraph(function () {

                    // set line graph
                    this._setLineGraph();

                }.bind(this))

            }

        } else {

            // set line graph
            this._setLineGraph(options);
        }

    },

    _setLimit : function (limit) {

        // set locally
        this._limit = limit;

        // set limits for slider
        app.Animator.setSliderLimit({
            limit : limit
        });

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

    _setLineGraph : function (options) {

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

        // calculate limit of dataset
        var limit = _.size(this._cache.line[this._current.year]) + 1;

        // set limit
        this._setLimit(limit);

        // update titles
        this._updateTitles();
       
        // check if end of dataset
        this._checkEnds();
    },

    _checkEnds : function () {

        // get cached line graph data
        var cache = this._cache.line[this._current.year];

        // filter out period
        var today = moment().year(this._current.year).dayOfYear(this._current.day + 1);
        var period = _.find(cache, function (d) {
            return d.date.isSame(today, 'day');
        });

        // shade buttons if end of dataset
        if (period) {

            // unshade slider buttons
            this._unshadeButtons();

        } else {

            // shade slider buttons
            this._shadeButtons();
        }

        // update titles
        this._updateTitles();

    },

    _shadeButtons : function () {
        Wu.Mixin.Events.fire('shadeButtons');
    },

    _unshadeButtons : function () {
        Wu.Mixin.Events.fire('unshadeButtons');
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
        var year = year || 2016;

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


            // // get this day's max
            // var max = _.max(today, function (d) {
            //     return d.SCF;
            // }).SCF;

            // // get this day's min
            // var min = _.min(today, function (d) {
            //     return d.SCF;
            // }).SCF;

            // // get this day's avg
            // var sum = 0;
            // _.times(today.length, function (i) {
            //     sum += today[i].SCF;
            // });
            // var avg = sum/today.length;

            // // get this day's min
            // var min = _.min(today, function (d) {
            //     return d.SCF;
            // }).SCF;

            // // get this day's avg
            // var sum = 0;
            // _.times(today.length, function (i) {
            //     sum += today[i].SCF;
            // });
            // var avg = sum/today.length;

            // get this day's max
            var max = today[0].SCFmax; // read from prepared values in json
            var min = today[0].SCFmin;
            var avg = today[0].SCFmean;

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

    _onLoadedGraph : function () {
        this.hideLoading();
    },

    _onLoadingGraph : function () {
        this.showLoading();
    },

    showLoading : function () {
        return;
    },

    hideLoading : function () {
        return;
    },


});