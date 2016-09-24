

// --------------------------------------------
// THIS IS A CUSTOM PLUGIN CREATED FOR GLOBESAR 
// --------------------------------------------
//
// - it communicates with new API endpoints which must be present on the server-side
// - all interaction with layer (adding masks, filter) should happen through this plugin
//
//
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

// events
// ------
//  - since object survives changing projects, the events must be silenced.


// created by cube layer
// Annual Graph (cyclical)
Wu.Graph.SnowCoverFraction = Wu.Graph.extend({

    options : {
        fetchLineGraph : false, // debug, until refactored fetching line graph to cube
    },

    _initialize : function () {

        // set project
        this._project = app.activeProject;

        // create DOM
        this._initContainer();

        // plug animator
        this._plugAnimator();

    },

    setData : function (data, done) {

        // set timeframe
        this.setDefaultTimeFrame();

        // set data
        this._data = data;

        // prepare data
        this._prepareData();

        // create graph
        this._createGraph();

        // return
        done && done();

    },

    onMaskSelected : function (options) {
        this.setMask(options.mask);
    },

    onMaskUnselected : function (options) {

    },

    setMask : function (mask) {

        // set mask
        this._mask = mask;

        // set data
        this.setData(mask.data);

        // update line graph
        this._updateLineGraph();

        // set initial date
        this._setLastDate();
    },

    _plugAnimator : function () {

        // set animator
        this._animator = this.options.animator;

        // connect graph
        this._animator.plugGraph(this); // todo: create event for this

        // listen for animator events
        this._animator.on('update', this.onUpdateTimeframe.bind(this));
    },

    _listen : function () {

        // Wu.Mixin.Events.on('sliderUpdate',              this._onSliderUpdate,               this);
        // Wu.Mixin.Events.on('sliderMoveForward',         this._onSliderMoveForward,          this); // yearly
        // Wu.Mixin.Events.on('sliderMoveBackward',        this._onSliderMoveBackward,         this);
        // Wu.Mixin.Events.on('loadingGraph',              this._onLoadingGraph,               this);
        // Wu.Mixin.Events.on('loadedGraph',               this._onLoadedGraph,                this);
        // Wu.Mixin.Events[onoff]('maskSelected',              this._onMaskSelected,               this);
        // Wu.Mixin.Events[onoff]('maskUnselected',            this._onMaskUnselected,             this);
        // Wu.Mixin.Events[onoff]('animatorMovePreviousYear',  this._onAnimatorMovePreviousYear,   this);
        // Wu.Mixin.Events[onoff]('animatorMoveNextYear',      this._onAnimatorMoveNextYear,       this);

        // animator events
        // this._animator.on('update', this.onUpdateTimeframe.bind(this));
        // this._animator.on('sliderMoveForward', this._onSliderUpdate.bind(this));
        // this._animator.on('sliderMoveBackward', this._onSliderUpdate.bind(this));


        // layer events 
        // (todo: rename options.cube to this._layer for more generic )
        this.options.cube.on('maskSelected', this.onMaskSelected.bind(this));
        this.options.cube.on('maskUnselected', this.onMaskUnselected.bind(this));
    },

    _initContainer : function () {
        if (this._container) return;

        this._container         = Wu.DomUtil.create('div', 'big-graph-outer-container',     this.options.appendTo);
        this._infoContainer     = Wu.DomUtil.create('div', 'big-graph-info-container',      this._container);
        this._nameTitle         = Wu.DomUtil.create('div', 'big-graph-title',               this._infoContainer, 'title');
        this._maskTitle         = Wu.DomUtil.create('div', 'big-graph-mask-title',          this._infoContainer, 'title');
        this._maskDescription   = Wu.DomUtil.create('div', 'big-graph-mask-description',    this._infoContainer, 'title');
        this._dateTitle         = Wu.DomUtil.create('div', 'big-graph-current-day',         this._infoContainer, 'day');
        this._graphContainer    = Wu.DomUtil.create('div', 'big-graph-inner-container',     this._container);
        this._loadingBar        = Wu.DomUtil.create('div', 'graph-loading-bar',             this._container);
        this._legendContainer   = Wu.DomUtil.create('div', 'graph-legend',                  this._container);

        // add editor items
        if (this.isEditor()) this._addEditorPane();

    },

    _addEditorPane : function () {

        // container
        this._editorPane = Wu.DomUtil.create('div', 'big-graph-editor-pane');

        // insert above outer container
        this.options.appendTo.insertBefore(this._editorPane, this.options.appendTo.firstChild);

        // title
        this._editorPaneTitle = Wu.DomUtil.create('div', 'big-graph-editor-pane-title', this._editorPane, 'Layer options');

        // mask filter
        this._filterPane = Wu.DomUtil.create('div', 'big-graph-editor-filter-pane', this._editorPane);

        // mask filter
        var checkbox = this._createFilterCheckbox({
            appendTo : this._filterPane
        });

    },

     _createFilterCheckbox : function (options) {

        // create checkbox
        var checkbox = Wu.DomUtil.create('div', 'checkbox');
        var input = Wu.DomUtil.create('input', '', checkbox);
        input.setAttribute('type', 'checkbox');
        input.id = 'checkbox-' + Wu.Util.getRandomChars(5);
        
        // create label
        var label = Wu.DomUtil.create('label', '', checkbox);
        label.setAttribute('for', input.id);
        label.innerHTML = 'Only show data within mask.';

        // mark checked if active
        if (this.getCube().getFilterMask()) {
            input.setAttribute('checked', '');
        }

        // check event
        Wu.DomEvent.on(checkbox, 'mouseup', function (e) {

            // toggle
            this.getCube().setFilterMask(!this.getCube().getFilterMask());

            // update cache
            this.getCube()._updateCache();

        }.bind(this));

        // add to DOM
        options.appendTo.appendChild(checkbox);

        return checkbox;
    },

    isEditor : function () {
        return app.activeProject.isEditor();
    },

    _createGraph : function () {

        if (!this._annualAverageData) return;

        // store crossfilters, dimensions, etc
        this.ndx = {};

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

        // current year, red line data
        var this_year_data = _.filter(this.options.data, function (d) {
            // return d.Year == 2015;
            return d.Year == this._current.year;
        }.bind(this));

        // // debug: fix date formats
        var line_data = this._debugFixData(this_year_data);

        // line_data array:
        // ----------------
        // [{
        //     SCF : 77.6827,
        //     date : Thu Jan 01 2015 18:17:07 GMT+0100 (CET),
        // }] // x 365

        // create red line (this year's data) crossfilter
        this.ndx.line_crossfilter = crossfilter([]);

        // create line dimension
        var line_dimension = this.ndx.line_crossfilter.dimension(function(d) { 
            return d.date; 
        });

        // create line group
        var line_group = line_dimension.group().reduceSum(function(d) { return d.scf; });

        // create point group (for last red triangle)
        var point_group = line_dimension.group().reduceSum(function(d) { return d.scf });

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
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .brushOn(false)
        .yAxisLabel('SCF (%)')
        .transitionDuration(0)          
        .compose([

            // MAX value
            dc.lineChart(composite)
            .group(average_max_group)
            .colors('#DDDDDD')
            .renderArea(true)
            .renderHorizontalGridLines(true)
            .renderVerticalGridLines(true)   
            .renderDataPoints(false)
            .xyTipsOn(false),

            // MIN value
            dc.lineChart(composite)
            .group(average_min_group)
            .colors('#3C4759')
            .renderArea(true)       
            .renderDataPoints(false)
            .renderHorizontalGridLines(true)
            .renderVerticalGridLines(true)
            .xyTipsOn(false),

            // AVERAGE value
            dc.lineChart(composite)
            .group(average_avg_group)
            .colors('white')
            .renderHorizontalGridLines(true)
            .renderVerticalGridLines(true)
            .renderDataPoints(false)
            .xyTipsOn(false),

            // THIS YEAR value – LINE
            dc.lineChart(composite)
            .group(line_group)
            .colors('#ff6666')
            .renderHorizontalGridLines(true)
            .renderVerticalGridLines(true)
            .dotRadius(1)
            .renderDataPoints(false)
            .xyTipsOn(false),

        ]);
    
        composite
        .xAxis()
        .tickFormat(d3.time. format('%b'));
        
        // hack gridlines on top
        composite
        .on('renderlet', function (table) {
            var h = document.getElementsByClassName('grid-line horizontal')[0];
            var v = document.getElementsByClassName('grid-line vertical')[0];
            h.parentNode.appendChild(h);
            v.parentNode.appendChild(v);
        });

        // render
        dc.renderAll(); 

        // update titles
        this._updateTitles();

        // update legend
        this._updateLegend();

        // mark inited
        this._graphInited = true;

    },

    _updateLegend : function () {
        if (this._legends) return;

        this._legends = {};

        // create divs
        var year_container = Wu.DomUtil.create('div', 'graph-legend-module', this._legendContainer);
        var average_container = Wu.DomUtil.create('div', 'graph-legend-module', this._legendContainer);
        var minmax_container = Wu.DomUtil.create('div', 'graph-legend-module', this._legendContainer);
        var minmax_color = Wu.DomUtil.create('div', 'graph-legend-color', minmax_container);
        var average_color = Wu.DomUtil.create('div', 'graph-legend-color', average_container);
        var year_color = Wu.DomUtil.create('div', 'graph-legend-color', year_container);
        this._legends.minmax_text = Wu.DomUtil.create('div', 'graph-legend-text', minmax_container);
        this._legends.average_text = Wu.DomUtil.create('div', 'graph-legend-text', average_container);
        this._legends.year_text = Wu.DomUtil.create('div', 'graph-legend-text', year_container);

        // set values
        this._legends.minmax_text.innerHTML = 'Max/min: 2000-2015';
        this._legends.average_text.innerHTML = 'Average: 2000-2015';
        this._legends.year_text.innerHTML = 'Current year';

        // set colors
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

    _cache : {
        masks : {}
    },

    _setLastDate : function () {
        if (this._dateSet) return;
        this._dateSet = true;

        // get cube
        var cube = this.getCube();

        // get datasets
        var datasets = cube.getDatasets();

        // get last dataset
        var last = _.last(datasets);

        // get year/day
        var date = moment(last.timestamp);
        var year = date.year();
        var day = date.dayOfYear();

        // set date in graph
        this._setDate(year, day);
    },

    setDefaultTimeFrame : function () {
        // return if already set
        if (this._current && this._current.year && this._current.day) return; 
       
        // get time
        var cube = this.getCube();
        var datasets = cube.getDatasets();
        var last = _.last(datasets);
        var date = moment(last.timestamp);
        var year = date.year();
        var day = date.dayOfYear();

        // set current time
        this._current = {
            year : year,
            day : day
        }
    },

    _setDate : function (year, day) {

        // set dates
        this._current.year = year || this._current.year;
        this._current.day = day || this._current.day;

        // set graph dates
        var minDate = moment().year(this._current.year).dayOfYear(1);
        var maxDate = moment().year(this._current.year + 1).dayOfYear(-1); // last day of year

        // set date range to graph
        this._composite.x(d3.time.scale().domain([minDate,maxDate]));

        // set slider
        this._animator.setSlider(day);

        // set cube cursor
        this.getCube().setCursor(moment().year(year).dayOfYear(day));

        // set slider
        this._animator.setSlider(day);

        // update titles
        this._updateTitles();
    },

    onUpdateTimeframe : function (options) {
        var value = options.value;

        // set day
        this._current.day = value;

        // update line graph
        this._updateLineGraph({
            evented : true
        });

        // update titles
        this._updateTitles();
    },

    setTime : function (time) {

        // ensure proper time
        if (!time || !_.isObject(time)) return console.error('wrong time');

        // set current time
        this._current.day = time.day || this._current.day;
        this._current.year = time.year || this._current.year;

        // update line graph
        this._updateLineGraph({
            evented : true
        });

        // update titles
        this._updateTitles();

    },

    onUpdateTimeframe : function (options) {
        this.setTime({
            day : options.day, // value from animator
            year : options.year
        });
    },

    // for yearly movement, currently not in use
    _onSliderMoveBackward : function (e) {

        // set year
        this._current.year = this._current.year - 1;

        // update line graph
        this._updateLineGraph();

        // update titles
        this._updateTitles();
    },

    // for yearly movement, currently not in use
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

    _getTitle : function () {
        return this.options.cube.getTitle();
    },

    _getDateTitle : function () {
        // get titles
        var date = moment().year(this._current.year).dayOfYear(this._current.day);
        var dateTitle = date.format('MMMM Do YYYY');
        var cache = this.cache();
        var scf = _.find(cache, function (c) {
            return c.date.isSame(date, 'day');
        });
        var scfTitle = scf ? (Math.round(scf.scf * 10) / 10) + '%' : '';
        return dateTitle + ' &nbsp;&nbsp;&nbsp;   <span style="font-weight:900">SCF: ' + scfTitle + '</span>';
    },

    _getMaskTitle : function () {
        if (!this._mask) return;
        var d = this._mask.title;
        if (_.isString(d)) return d.camelize();
        return '';

    },

    _getMaskDescription : function () {
        if (!this._mask) return;
        var d = this._mask.description;
        if (_.isString(d)) return d.camelize();
        return '';
    },

    _updateTitles : function (options) {

        // set titles
        this._nameTitle.innerHTML = this._getTitle();
        this._maskTitle.innerHTML = this._getMaskTitle();
        this._maskDescription.innerHTML = this._getMaskDescription();
        this._dateTitle.innerHTML = this._getDateTitle();
    },

    _updateLineGraph : function (options) {

        // if data is available, set graph
        if (this.cache()) return this._setLineGraph();

        // return if already fetching data
        if (this._fetching) return console.error('already fetching data...');

        // mark fetching (to avoid parallel fetching)
        this._fetching = true;

        // data not available yet, need to fetch
        var cube = this.options.cube;

        var query_options = {
            query_type : 'scf-geojson',
            mask_id : this._mask ? this._mask.id : false, //'mask-gkceetoa', // debug
            year : this._current.year,   
            day : this._current.day,
            options : {
                currentYearOnly : true,
                // force_query : true,
                filter_query : false
            },
        }

        // query data from cube
        cube.query(query_options, function (err, query_results) {
            if (err) return console.error(err, query_results);

            // mark done fetching
            this._fetching = false;

            // parse
            var fractions = Wu.parse(query_results);

            // parse dates
            var cache = this._parseDates(fractions);

            if (!cache || !_.isArray(cache) || !_.size(cache)) return;

            // set cache
            this.cache(cache);

            // set line graph
            this._setLineGraph();

        }.bind(this));

    },

    // get/set cache
    cache : function (cache, year) {
        var year = year || this._current.year;
        if (cache) {
            this._cache.masks[this._mask.id] = this._cache.masks[this._mask.id] || {};
            this._cache.masks[this._mask.id][year] = cache;
        } else {     
            if (!this._cache || !this._cache.masks || !this._cache.masks[this._mask.id] || !this._cache.masks[this._mask.id][year]) return false;   
            return this._cache.masks[this._mask.id][year];
        }
    },

    _setLimit : function (limit) {

        // set locally
        this._limit = limit;

        // set limits for slider
        this._animator.setSliderLimit({
            limit : limit
        });

    },

    addLineData : function (options) {

        // parse dates
        var data = this._parseDates(options.data);

        // validate
        if (!_.isArray(data)) return console.error('Malformed data', data);

        // get year
        var year = moment(data[0].date).year();

        // set data to cache
        this.cache(data, year);

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
        if (!this._graphInited) return;

        // Clear old data
        this.ndx.line_crossfilter.remove();

        // get cached line graph data
        var cache = this.cache();

        // filter out period
        var today = moment().year(this._current.year).dayOfYear(this._current.day);
        var period = _.filter(cache, function (d) {
            return d.date.isBefore(today);
        });

        // add data, triggers automatically
        this.ndx.line_crossfilter.add(period);

        // redraw
        dc.redrawAll();

        // calculate limit of dataset
        var limit = _.size(this.cache()) + 1;

        // set limit
        this._setLimit(limit);

        // update titles
        this._updateTitles();
       
        // check if end of dataset
        this._checkEnds();
    },

    _checkEnds : function () {

        // get cached line graph data
        var cache = this.cache();

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
        Wu.Mixin.Events.fire('shadeButtons'); // refactor
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
                // SCF : d.SCF,
                // SCF : d.scf,
                scf : d.scf,
                date : new Date(moment().year(d.year).dayOfYear(d.doy).toString())
            });
        });
        return fixed;
    },

    _prepareData : function (year) {

        // set year
        var year = year || this._current.year;

        // get data
        var data = this._data;

        // clear
        this._annualAverageData = [];

        // for each day
        _.times(365, function (n) {

            var doy = n+1;

            // get this day's values
            var today = _.filter(data, function (d) {
                return d.doy == doy;
            });

            // { 
            //     age : "0.99",
            //     ccf : "99.19",
            //     doy : "1",
            //     scf : "82.61",
            //     year : "2001"
            // }

            // get this day's max
            var max = _.max(today, function (d) {
                return d.scf;
            }).scf;

            // get this day's min
            var min = _.min(today, function (d) {
                return d.scf;
            }).scf;

            // get this day's avg
            var sum = 0;
            _.times(today.length, function (i) {
                sum += parseFloat(today[i].scf);
            });
            var avg = sum/today.length;
         
            // add to array
            this._annualAverageData.push({
                no   : doy,
                max  : max,
                date : moment().year(year).dayOfYear(data[doy].doy), // year doesn't matter, as it's avg for all years
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