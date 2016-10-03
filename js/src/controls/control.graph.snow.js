

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
        editorOptions : {
            mask : true,
            avg : true
        }
    },

    _initialize : function () {

        // set project
        this._project = app.activeProject;

        // create DOM
        this._initContainer();

        // plug animator
        this._plugAnimator();

    },

    parse : function (data, done) {

        // console.log('PARSE', data);

        var parsed = {
            // mma : [36], // min, max, average of all full years
            mma : this.average(data),
            // years : {
            //     // 2016 : [], // queried data,
            //     // 2015 : [], // data from file
            //     // 2014 : [], // data from file
            //     // 2016 : this.yearly(data, '2016'),
            //     2015 : this.yearly(data, '2015', '2016'),
            //     2014 : this.yearly(data, '2014', '2016'),
            // }
            years : this.yearly(data)
        }

        // add current year (need to fetch from server)
        // 1. refactor cube.query to standalone
        // 2. set 2016 here
        // 3. fetch all line graph data from this parsed

        this.query_yearly('2016', function (err, queried_data) {
            if (err) console.error('query err', err);

            // parsed.years['2016'] = queried_data;

            // return 
            done && done(null, parsed);

        });

        // return parsed;
    },

    query_yearly : function (year, done) {

        var query_options = {
            query_type : 'scf-geojson',
            mask_id : this._mask ? this._mask.id : false, //'mask-gkceetoa', // debug
            year : year,  
            day : this._current.day, // needed? 
            options : {
                currentYearOnly : true,
                filter_query : false,
                // force_query : true,
            },
        }

        // query data from cube
        this.cube().query(query_options, function (err, query_results) {
            if (err) return done(err);

            // parse
            var fractions = Wu.parse(query_results);

            // parse dates
            var parsed_data = this._parseDates(fractions);

            done && done(null, parsed_data);
        
        }.bind(this));

    },

    // yearly : function (data, year, fake_year) {

    //     var yearly = _.filter(data, function (d) {
    //         return d.year == year;
    //     });

    //     var yearly_data = [];

    //     yearly.forEach(function (y) {
    //         var item = {
    //             scf : parseFloat(y.scf),
    //             date : moment().year(fake_year).dayOfYear(y.doy)
    //         }
    //         yearly_data.push(item);
    //     });

    //     return yearly_data;
    // },

    yearly : function (data) {
        var years = _.range(2000, 2016);
        var yearly_data = [];

        _.times(365, function (i) {
            var doy = i+1;

            var item = {
                scf : {}, 
                date : moment().year(2016).dayOfYear(doy) // fake year, correct doy
            }

            years.forEach(function (y) {
                item.scf[y] = this._get_yearly_scf(data, y, doy);
            }.bind(this))            

            yearly_data.push(item);

        }.bind(this));

        return yearly_data;
    },

    _get_yearly_scf : function (data, year, doy) {
        var scf = _.find(data, function (d) {
            return d.year == year && d.doy == doy;
        });
        if (!scf) return -10000; // to make sure it's outside graph.. hacky.. 
        return parseFloat(scf.scf);
    },


    average : function (data) {

        // clear
        var average = [];

        // for each day
        _.times(365, function (n) {

            var doy = n+1;

            // get this day's values
            var today = _.filter(data, function (d) {
                return d.doy == doy;
            });

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
            average.push({
                doy   : doy,
                max  : parseFloat(max),
                date : moment().year(this._current.year).dayOfYear(doy), // year doesn't matter, as it's avg for all years
                // however: need to add a YEAR/DATE when adding to graph, due to graph needing a date to know it should display data
                min  : parseFloat(min),
                avg  : avg,
            });

        }.bind(this));

        // console.log('AVERAGE', average);
        return average;
    },


    setData : function (data, done) {

        // console.error('setData', data);

        // data is all data for mask
        // should define range already here,
        // as well as parse data

        // set timeframe
        // timeframe is for raster layers
        this._setCurrentTime();

        // set data
        // this._cache.data[this._mask.id] = data;
        // this.cache().data(data);

        this.parse(data, function (err, parsed) {

            // console.log('-----> parsed ------>', parsed);

            // this.cache().data(parsed) = parsed;

            this._parsed[this._mask.id] = parsed;

            // create graph (mma)
            this._createGraph(parsed);

            // return
            done && done();

        }.bind(this));

    },

    _parsed : {},

    onMaskSelected : function (options) {
        this.setMask(options.mask);
    },

    onMaskUnselected : function (options) {
    },

    // // get/set mask
    // mask : function (mask) {
    //     if (mask) {
    //         this._mask = mask;
    //     } else {
    //         return this._mask || false;
    //     }
    // },

    // called when clicking mask on map
    // or when defaultMask is set on cube
    // without mask, there's no graph... 
    setMask : function (mask) {

        // return;
        // console.error('setMask', mask);

        // set current mask
        this._mask = mask;

        // set data
        this.setData(mask.data, function (err) {

            // update line graph
            this._updateLineGraph();

            // set initial date
            this._setLastDate();

        }.bind(this));

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

        // layer events 
        // (todo: rename options.cube to this._layer for more generic flow)
        this.options.cube.on('maskSelected', this.onMaskSelected.bind(this));
        this.options.cube.on('maskUnselected', this.onMaskUnselected.bind(this));
    },

    _initContainer : function () {
        if (this._container) return;

        this._container         = Wu.DomUtil.create('div', 'big-graph-outer-container',     this.options.appendTo);
        this._infoContainer     = Wu.DomUtil.create('div', 'big-graph-info-container',      this._container);
        this._pluginContainer   = Wu.DomUtil.create('div', 'big-graph-plugin-container',    this._container);
        this._nameTitle         = Wu.DomUtil.create('div', 'big-graph-title',               this._infoContainer, 'title');
        this._maskTitle         = Wu.DomUtil.create('div', 'big-graph-mask-title',          this._infoContainer, 'title');
        this._maskDescription   = Wu.DomUtil.create('div', 'big-graph-mask-description',    this._infoContainer, 'title');
        this._dateTitle         = Wu.DomUtil.create('div', 'big-graph-current-day',         this._infoContainer, 'day');
        this._graphContainer    = Wu.DomUtil.create('div', 'big-graph-inner-container',     this._container);
        this._loadingBar        = Wu.DomUtil.create('div', 'graph-loading-bar',             this._container);
        this._legendContainer   = Wu.DomUtil.create('div', 'graph-legend',                  this._container);

        // add editor items
        if (this.isEditor()) this._addEditorPane();

        // add yearly graph
        this._createAverageDataPane();

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
        if (this.options.editorOptions.mask) {        
            var checkbox = this._createFilterCheckbox({
                appendTo : this._filterPane
            });
        }

        // // average data switch
        // if (this.options.editorOptions.avg) {        
        //     var checkbox_avgdata = this._createAverageDataCheckbox({
        //         appendTo : this._filterPane
        //     });
        // }
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
        if (this.cube().getFilterMask()) {
            input.setAttribute('checked', '');
        }

        // check event
        Wu.DomEvent.on(checkbox, 'mouseup', function (e) {

            // toggle
            this.cube().setFilterMask(!this.cube().getFilterMask());

            // update cache
            this.cube()._updateCache();

        }.bind(this));

        // add to DOM
        options.appendTo.appendChild(checkbox);

        return checkbox;
    },


    _createAverageDataCheckbox : function (options) {

        // create checkbox
        var checkbox = Wu.DomUtil.create('div', 'checkbox');
        var input = Wu.DomUtil.create('input', '', checkbox);
        input.setAttribute('type', 'checkbox');
        input.id = 'checkbox-' + Wu.Util.getRandomChars(5);
        
        // create label
        var label = Wu.DomUtil.create('label', '', checkbox);
        label.setAttribute('for', input.id);
        label.innerHTML = 'Enabled dropdown for yearly average data';

        // mark checked if active
        if (this.cube().getAverageDataOption()) {
            input.setAttribute('checked', '');
        }

        // check event
        Wu.DomEvent.on(checkbox, 'mouseup', function (e) {

            // toggle
            this.cube().setAverageDataOption(!this.cube().getAverageDataOption());

            // hide if not activated
            if (this.cube().getAverageDataOption()) {
                this._average_pane.container.style.display = 'block';
            } else {
                this._average_pane.container.style.display = 'none';
            }

        }.bind(this));

        // add to DOM
        options.appendTo.appendChild(checkbox);

        return checkbox;
    },
   
    _createAverageDataPane : function () {

        // range
        console.log('range: ', this._cahce);
        var years = _.range(2000, 2017);

        // create pane
        var pane = this._average_pane = {};
        pane.container = Wu.DomUtil.create('div', 'average-data-pane-container', this._pluginContainer);

        // create title
        var title = Wu.DomUtil.create('div', 'average-data-pane-title', pane.container, 'Yearly graphs');

        // create select
        var btn_group = Wu.DomUtil.create('div', 'btn-group', pane.container);
        var btn = Wu.DomUtil.create('button', 'btn btn-default dropdown-toggle', btn_group, 'Select year(s)');
        btn.setAttribute('data-toggle', 'dropdown');
        var span = Wu.DomUtil.create('span', 'caret', btn);
        var ul = Wu.DomUtil.create('ul', 'dropdown-menu bullet pull-left pull-top', btn_group);

        // years
        years.forEach(function (y, i) {
            var li = Wu.DomUtil.create('li', '', ul);
            var input = Wu.DomUtil.create('input', '', li);
            input.id = 'years-dropdown-' + y;
            input.setAttribute('type', 'checkbox');
            input.setAttribute('name', y);
            input.setAttribute('value', y);
            var label = Wu.DomUtil.create('label', '', li, y);
            label.setAttribute('for', input.id);

            // event
            Wu.DomEvent.on(input, 'click', function (e) {
                var checked = e.target.checked;

                // toggle
                this._averageDataToggle(y, checked);

            }.bind(this))

            // set default year (hacky, but what to do)
            if (i == years.length-1) {
                input.click();
            }

        }.bind(this));

        // // hide if not activated
        // if (this.cube().getAverageDataOption()) {
        //     this._average_pane.container.style.display = 'block';
        // } else {
        //     this._average_pane.container.style.display = 'none';
        // }

    },

    _selectedYears : {},

    getSelectedYears : function () {
         var s = [];
        _.forEach(this._selectedYears, function (v, k) {
            if (v) s.push(k);
        });
        return s;
    },

    _averageDataToggle : function (year, checked) {
        console.log('toggle', year, checked);

        // remember
        this._selectedYears[year] = checked;

        // set line graph to selected years
        // this._setSelectedYearsLineGraph();
        this._setLineGraph();

    },

    // _setSelectedYearsLineGraph : function () {
    //     var selectedYears = this.getSelectedYears();
    //     console.log('selectedYears ==>', selectedYears);

    // },

    isEditor : function () {
        return app.activeProject.isEditor();
    },


    // should run only once! 
    // 
    _createGraph : function (data) {
        // if (!this._annualAverageData) return;

        // store crossfilters, dimensions, etc
        this.ndx = {};

        // AVERAGE CROSSFILTER
        // -------------------        
        // this._annualAverageData array = 
        // [{
        //     avg : 79.990875,
        //     date : Moment,
        //     max : 89.6246,
        //     min : 64.1556,
        //     no : 1,
        // }] // x 365

        // create average (background chart) crossfilter
        // this.ndx.average_crossfilter = crossfilter(this._annualAverageData); // this._annualAverageData is avgs for 365 days
        this.ndx.average_crossfilter = crossfilter(data.mma); // this._annualAverageData is avgs for 365 days

        // set dimensions (?)
        var average_dimension = this.ndx.average_crossfilter.dimension(function(d) { return d.date; });

        // create groups (?)
        var average_max_group = average_dimension.group().reduceSum(function(d) { return d.max });
        var average_min_group = average_dimension.group().reduceSum(function(d) { return d.min });
        var average_avg_group = average_dimension.group().reduceSum(function(d) { return d.avg });

        // get max/min date (?)
        var minDate = average_dimension.bottom(1)[0].date;  // this is jan 1 2015.. shouldn't be a YEAR per say, since it messes with the line graph (which needs to be in same year to display)
        var maxDate = average_dimension.top(1)[0].date;     

 


        // YEARLY LINE CROSSFILTER
        // -----------------------
        // line_data array = 
        // [{
        //     SCF : 77.6827,
        //     date : Thu Jan 01 2015 18:17:07 GMT+0100 (CET),
        // }] // x 365

        // create red line (this year's data) crossfilter
        this.ndx.line_crossfilter = crossfilter([]);

        // create line dimension
        var line_dimension = this.ndx.line_crossfilter.dimension(function(d) { return d.date; });

        // create line group
        var line_groups = [];
        var range = _.range(2000, 2017);
        range.forEach(function (r) {
            console.log('dimension...', r);
            line_groups.push(line_dimension.group().reduceSum(function(d) { return d.scf[r]; }));
        });

        // var line_group  = line_dimension.group().reduceSum(function(d) { return d.scf[2014]; });
        // var line_group2 = line_dimension.group().reduceSum(function(d) { return d.scf[2015]; });

        // create point group (for last red triangle)
        // var point_group = line_dimension.group().reduceSum(function(d) { return d.scf });



        // COMPOSITE CHART
        // ---------------

        // create composite chart @ container
        var composite = this._composite = dc.compositeChart(this._graphContainer)

        // define compose charts
        var compose_charts = [

            // max 
            dc.lineChart(composite)
            .group(average_max_group)
            .colors('#DDDDDD')
            .renderArea(true)
            .renderHorizontalGridLines(true)
            .renderVerticalGridLines(true)   
            .renderDataPoints(false)
            .xyTipsOn(false),

            // min 
            dc.lineChart(composite)
            .group(average_min_group)
            .colors('#3C4759')
            .renderArea(true)       
            .renderDataPoints(false)
            .renderHorizontalGridLines(true)
            .renderVerticalGridLines(true)
            .xyTipsOn(false),

            // avg 
            dc.lineChart(composite)
            .group(average_avg_group)
            .colors('white')
            .renderHorizontalGridLines(true)
            .renderVerticalGridLines(true)
            .renderDataPoints(false)
            .xyTipsOn(false),

            // // yearly line
            // dc.lineChart(composite)
            // .group(line_group)
            // .colors('#ff6666')
            // .renderHorizontalGridLines(true)
            // .renderVerticalGridLines(true)
            // .dotRadius(1)
            // .renderDataPoints(false)
            // .xyTipsOn(false),

            // // yearly line
            // dc.lineChart(composite)
            // .group(line_group2)
            // .colors('green')
            // .renderHorizontalGridLines(true)
            // .renderVerticalGridLines(true)
            // .dotRadius(2)
            // .renderDataPoints(false)
            // .xyTipsOn(false),
        ]

        // colors, to always have same for same year
        // var yearly_colors = randomColor({
        //     count : 10,
        //     luminosity : 'light'
        // })

        var yearly_colors = [
            '#F9DC5C',
            '#BE5035',
            '#F4FFFD',
            '#011936',
            '#465362',
            '#93E1D8',
            '#29E7CD',
            '#2D1E2F',
            '#FCF6B1',
            '#F39C6B',
            '#FF3864',
            '#284B63',
            '#56494C',
            '#5C5D8D',
            '#8DE4FF',
            'red',
            'yellow',
        ]

        // add yearly lines
        line_groups.forEach(function (lg, i) {
            compose_charts.push(dc.lineChart(composite)
            .group(lg)
            // .colors(randomColor({
            //     seed : i,
            // }))
            .colors(yearly_colors[i])
            .renderHorizontalGridLines(true)
            .renderVerticalGridLines(true)
            .dotRadius(2)
            .renderDataPoints(false)
            .xyTipsOn(false))
        });

        // create composite graph
        composite
        .width(500).height(220)
        .dimension(average_dimension)
        .x(d3.time.scale().domain([minDate,maxDate]))
        .y(d3.scale.linear().domain([0, 100]))
        .clipPadding(10)    
        .elasticY(false)
        .elasticX(false)
        .on('renderlet', this._gridlines)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .brushOn(false)
        .yAxisLabel('SCF (%)')
        .transitionDuration(0)          
        .compose(compose_charts);
    
        // add axis
        composite
        .xAxis()
        .tickFormat(d3.time. format('%b'));
        
        // render
        dc.renderAll(); 

        // update titles
        this._updateTitles();

        // update legend
        this._updateLegend();

        // mark inited
        this._graphInited = true;

    },

    _onGridMousemove : function (e) {
        console.log('_onGridMousemove', e);
    },

    _gridlines : function (table) {
        // hack gridlines on top
        var h = document.getElementsByClassName('grid-line horizontal')[0];
        var v = document.getElementsByClassName('grid-line vertical')[0];
        h.parentNode.appendChild(h);
        v.parentNode.appendChild(v);
    },

    // run each time linegraph changes at all
    // eg. when clicking on slider
    // this needs to happen, because we only want to show data
    _setLineGraph : function (options) {
        if (!this._graphInited) return;

        console.log('current line crossfilter', this.ndx.line_crossfilter);

        // Clear old data
        this.ndx.line_crossfilter.remove();

        // // create line dimension
        // var line_dimension = this.ndx.line_crossfilter.dimension(function(d) { 
        //     return d.date; 
        // });

        // // create line group
        // var line_group = line_dimension.group().reduceSum(function(d) { return d.scf / 2; });


        // // create line dimension
        // var line_dimension = this.ndx.line_crossfilter.dimension(function(d) { 
        //     return d.date; 
        // });

        // // create line group
        // var line_group = line_dimension.group().reduceSum(function(d) { return d.scf / 2; });

        // need to have ALL line graph data for all years in cache
        // incl. old (from this._data) as well as current year (from query)
        // then, here - all data is removed, and then added for each active year...


        // get cached line graph data
        var cache = this.cache().mask();

        var parsed_cache = this._parsed[this._mask.id];

        // var cache = parsed_cache.years['2016'];

        // var all_scf_years = this.get_all_scf_years();

        var cache = parsed_cache.years;

        var cache = this._filterSelectedYears(cache);

        // console.log('cache: coltrrane', cache);
        console.log('parsed cache: miles', parsed_cache);


        // var selectedYears = this.getSelectedYears();
        // console.log('UPDATING LINE --> selected years :', selectedYears);

        // filter out period
        // var today = moment().year(this._current.year).dayOfYear(this._current.day);
        // var today = moment().dayOfYear(this._current.day); // works without year also!

        // // filter out data
        // var period = _.filter(cache, function (d) { 
        //     return d.date.isBefore(today);
        // });
        // var period2 = _.filter(cache, function (d) {
        //     return d.date.isAfter(today);
        // });


        // var merged = parsed_cache.years['2016'].concat(parsed_cache.years['2015']);

        // add data to line_crossfilter
        // this.ndx.line_crossfilter.add(period);
        // this.ndx.line_crossfilter.add(merged);
        this.ndx.line_crossfilter.add(cache);


        // console.log('added period', period);
        // console.log('added merged', merged);
        // this.ndx.line_crossfilter.add(parsed_cache.years['2015']);

        // redraw
        console.time('redraw');
        dc.redrawAll();
        console.timeEnd('redraw');

        // calculate limit of dataset
        var limit = _.size(this.cache().mask()) + 1;

        // set limit
        this._setLimit(limit);

        // update titles
        this._updateTitles();
       
        // check if end of dataset
        this._checkEnds();
    },

    _filterSelectedYears : function (cache) {
        var selectedYears = this.getSelectedYears();

        var filtered = [];

        cache.forEach(function (c) {

            var item = {
                date : c.date, 
                scf : {}
            }

            selectedYears.forEach(function (s) {
                item.scf[s] = c.scf[s];
            });
            filtered.push(item);
        });

        console.log('_filterSelectedYears cache', cache);

        return filtered;

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

    cube : function () {
        return this.options.cube;
    },

    _cache : {
        masks : {},
        data : {}
    },

    getDatasetsEndDate : function () {
        // get datasets
        var datasets = this.cube().getDatasets();

        // get last dataset
        var last = _.last(datasets);

        // get date
        var date = moment(last.timestamp);

        // return day/year    
        return {
            year : date.year(),
            day : date.dayOfYear()
        }
    },

    _setLastDate : function () {
        if (this._dateSet) return;

        // get end date
        var date = this.getDatasetsEndDate();

        // set date in graph
        this._setDate(date.year, date.day);

        // mark
        this._dateSet = true;
    },

    _setCurrentTime : function () {
        // return if already set
        if (this._current && this._current.year && this._current.day) return; 

        // set current time to last day in dataset timeseries
        this._current = this.getDatasetsEndDate();
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
        this.cube().setCursor(moment().year(year).dayOfYear(day));

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
        var cache = this.cache().mask();
        var scf = _.find(cache, function (c) {
            return c.date.isSame(date, 'day');
        });
        var scfTitle = scf ? (Math.round(scf.scf * 10) / 10) + '%' : '';
        return dateTitle + ' &nbsp;&nbsp;&nbsp;   <span style="font-weight:900">SCF: ' + scfTitle + '</span>';
    },

    _getMaskTitle : function () {
        // if (!this._mask) return;
        if (!this._mask) return;
        var d = this._mask.title;
        if (_.isString(d)) return d.camelize();
        return '';

    },

    _getMaskDescription : function () {
        // if (!this._mask) return;
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
        if (this.cache().mask()) return this._setLineGraph();

        // return if already fetching data
        if (this._fetching) return console.error('already fetching data...');

        // mark fetching (to avoid parallel fetching)
        this._fetching = true;

        // data not available yet, need to fetch
        var query_options = {
            query_type : 'scf-geojson',
            // mask_id : this._mask ? this._mask.id : false, //'mask-gkceetoa', // debug
            mask_id : this._mask ? this._mask.id : false, //'mask-gkceetoa', // debug
            year : this._current.year,   
            day : this._current.day,
            options : {
                currentYearOnly : true,
                filter_query : false,
                // force_query : true,
            },
        }

        // query data from cube
        this.cube().query(query_options, function (err, query_results) {
            if (err) return console.error(err, query_results);

            // mark done fetching
            this._fetching = false;

            // parse
            var fractions = Wu.parse(query_results);

            // parse dates
            var cache = this._parseDates(fractions);

            if (!cache || !_.isArray(cache) || !_.size(cache)) return;

            // set cache
            this.cache().mask(cache);

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

    cache : function () {
        return {
            data : function (data) {
                if (data) {
                    this._cache.data[this._mask.id] = this._cache.data[this._mask.id] || {};
                    this._cache.data[this._mask.id] = data;
                } else {
                    if (!this._cache || !this._cache.data || !this._cache.data[this._mask.id]) return false;   
                    return this._cache.data[this._mask.id];
                }
            }.bind(this),
           
            mask : function (cache, year) {
                var year = year || this._current.year;
                if (cache) {
                    this._cache.masks[this._mask.id] = this._cache.masks[this._mask.id] || {};
                    this._cache.masks[this._mask.id][year] = cache;
                } else {     
                    if (!this._cache || !this._cache.masks || !this._cache.masks[this._mask.id] || !this._cache.masks[this._mask.id][year]) return false;   
                    return this._cache.masks[this._mask.id][year];
                }
            }.bind(this),
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

    // addLineData : function (options) {

    //     // parse dates
    //     var data = this._parseDates(options.data);

    //     // validate
    //     if (!_.isArray(data)) return console.error('Malformed data', data);

    //     // get year
    //     var year = moment(data[0].date).year();

    //     // set data to cache
    //     this.cache(data, year);

    //     // update line graph
    //     this._setLineGraph();
    // },

    _parseDates : function (cache) {
        if (!_.isArray(cache)) return;
        cache.forEach(function (c) {
            c.date = moment(c.date);
        });
        return cache;
    },

    _checkEnds : function () {

        // get cached line graph data
        var cache = this.cache().mask();

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
                scf : d.scf,
                date : new Date(moment().year(d.year).dayOfYear(d.doy).toString())
            });
        });
        return fixed;
    },

    // _prepareData : function (year) {

    //     // set year
    //     var year = year || this._current.year;

    //     // get data
    //     // var data = this._data;
    //     // var data = this._cache.data[this._mask.id];
    //     var data = this.cache().data();

    //     // clear
    //     this._annualAverageData = [];

    //     // for each day
    //     _.times(365, function (n) {

    //         var doy = n+1;

    //         // get this day's values
    //         var today = _.filter(data, function (d) {
    //             return d.doy == doy;
    //         });

    //         // { 
    //         //     age : "0.99",
    //         //     ccf : "99.19",
    //         //     doy : "1",
    //         //     scf : "82.61",
    //         //     year : "2001"
    //         // }

    //         // get this day's max
    //         var max = _.max(today, function (d) {
    //             return d.scf;
    //         }).scf;

    //         // get this day's min
    //         var min = _.min(today, function (d) {
    //             return d.scf;
    //         }).scf;

    //         // get this day's avg
    //         var sum = 0;
    //         _.times(today.length, function (i) {
    //             sum += parseFloat(today[i].scf);
    //         });
    //         var avg = sum/today.length;
         
    //         // add to array
    //         this._annualAverageData.push({
    //             no   : doy,
    //             max  : max,
    //             date : moment().year(year).dayOfYear(data[doy].doy), // year doesn't matter, as it's avg for all years - but must be this._current.year
    //             min  : min,
    //             avg  : avg,
    //         });

    //         // console.log('this._ann', this._annualAverageData);

    //     }.bind(this));

    // },

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






// randomColor by David Merfield under the CC0 license
// https://github.com/davidmerfield/randomColor/

;(function(root, factory) {

  // Support AMD
  if (typeof define === 'function' && define.amd) {
    define([], factory);

  // Support CommonJS
  } else if (typeof exports === 'object') {
    var randomColor = factory();

    // Support NodeJS & Component, which allow module.exports to be a function
    if (typeof module === 'object' && module && module.exports) {
      exports = module.exports = randomColor;
    }

    // Support CommonJS 1.1.1 spec
    exports.randomColor = randomColor;

  // Support vanilla script loading
  } else {
    root.randomColor = factory();
  }

}(this, function() {

  // Seed to get repeatable colors
  var seed = null;

  // Shared color dictionary
  var colorDictionary = {};

  // Populate the color dictionary
  loadColorBounds();

  var randomColor = function (options) {

    options = options || {};

    // Check if there is a seed and ensure it's an
    // integer. Otherwise, reset the seed value.
    if (options.seed !== undefined && options.seed !== null && options.seed === parseInt(options.seed, 10)) {
      seed = options.seed;

    // A string was passed as a seed
    } else if (typeof options.seed === 'string') {
      seed = stringToInteger(options.seed);

    // Something was passed as a seed but it wasn't an integer or string
    } else if (options.seed !== undefined && options.seed !== null) {
      throw new TypeError('The seed value must be an integer or string');

    // No seed, reset the value outside.
    } else {
      seed = null;
    }

    var H,S,B;

    // Check if we need to generate multiple colors
    if (options.count !== null && options.count !== undefined) {

      var totalColors = options.count,
          colors = [];

      options.count = null;

      while (totalColors > colors.length) {

        // Since we're generating multiple colors,
        // incremement the seed. Otherwise we'd just
        // generate the same color each time...
        if (seed && options.seed) options.seed += 1;

        colors.push(randomColor(options));
      }

      options.count = totalColors;

      return colors;
    }

    // First we pick a hue (H)
    H = pickHue(options);

    // Then use H to determine saturation (S)
    S = pickSaturation(H, options);

    // Then use S and H to determine brightness (B).
    B = pickBrightness(H, S, options);

    // Then we return the HSB color in the desired format
    return setFormat([H,S,B], options);
  };

  function pickHue (options) {

    var hueRange = getHueRange(options.hue),
        hue = randomWithin(hueRange);

    // Instead of storing red as two seperate ranges,
    // we group them, using negative numbers
    if (hue < 0) {hue = 360 + hue;}

    return hue;

  }

  function pickSaturation (hue, options) {

    if (options.luminosity === 'random') {
      return randomWithin([0,100]);
    }

    if (options.hue === 'monochrome') {
      return 0;
    }

    var saturationRange = getSaturationRange(hue);

    var sMin = saturationRange[0],
        sMax = saturationRange[1];

    switch (options.luminosity) {

      case 'bright':
        sMin = 55;
        break;

      case 'dark':
        sMin = sMax - 10;
        break;

      case 'light':
        sMax = 55;
        break;
   }

    return randomWithin([sMin, sMax]);

  }

  function pickBrightness (H, S, options) {

    var bMin = getMinimumBrightness(H, S),
        bMax = 100;

    switch (options.luminosity) {

      case 'dark':
        bMax = bMin + 20;
        break;

      case 'light':
        bMin = (bMax + bMin)/2;
        break;

      case 'random':
        bMin = 0;
        bMax = 100;
        break;
    }

    return randomWithin([bMin, bMax]);
  }

  function setFormat (hsv, options) {

    switch (options.format) {

      case 'hsvArray':
        return hsv;

      case 'hslArray':
        return HSVtoHSL(hsv);

      case 'hsl':
        var hsl = HSVtoHSL(hsv);
        return 'hsl('+hsl[0]+', '+hsl[1]+'%, '+hsl[2]+'%)';

      case 'hsla':
        var hslColor = HSVtoHSL(hsv);
        return 'hsla('+hslColor[0]+', '+hslColor[1]+'%, '+hslColor[2]+'%, ' + Math.random() + ')';

      case 'rgbArray':
        return HSVtoRGB(hsv);

      case 'rgb':
        var rgb = HSVtoRGB(hsv);
        return 'rgb(' + rgb.join(', ') + ')';

      case 'rgba':
        var rgbColor = HSVtoRGB(hsv);
        return 'rgba(' + rgbColor.join(', ') + ', ' + Math.random() + ')';

      default:
        return HSVtoHex(hsv);
    }

  }

  function getMinimumBrightness(H, S) {

    var lowerBounds = getColorInfo(H).lowerBounds;

    for (var i = 0; i < lowerBounds.length - 1; i++) {

      var s1 = lowerBounds[i][0],
          v1 = lowerBounds[i][1];

      var s2 = lowerBounds[i+1][0],
          v2 = lowerBounds[i+1][1];

      if (S >= s1 && S <= s2) {

         var m = (v2 - v1)/(s2 - s1),
             b = v1 - m*s1;

         return m*S + b;
      }

    }

    return 0;
  }

  function getHueRange (colorInput) {

    if (typeof parseInt(colorInput) === 'number') {

      var number = parseInt(colorInput);

      if (number < 360 && number > 0) {
        return [number, number];
      }

    }

    if (typeof colorInput === 'string') {

      if (colorDictionary[colorInput]) {
        var color = colorDictionary[colorInput];
        if (color.hueRange) {return color.hueRange;}
      }
    }

    return [0,360];

  }

  function getSaturationRange (hue) {
    return getColorInfo(hue).saturationRange;
  }

  function getColorInfo (hue) {

    // Maps red colors to make picking hue easier
    if (hue >= 334 && hue <= 360) {
      hue-= 360;
    }

    for (var colorName in colorDictionary) {
       var color = colorDictionary[colorName];
       if (color.hueRange &&
           hue >= color.hueRange[0] &&
           hue <= color.hueRange[1]) {
          return colorDictionary[colorName];
       }
    } return 'Color not found';
  }

  function randomWithin (range) {
    if (seed === null) {
      return Math.floor(range[0] + Math.random()*(range[1] + 1 - range[0]));
    } else {
      //Seeded random algorithm from http://indiegamr.com/generate-repeatable-random-numbers-in-js/
      var max = range[1] || 1;
      var min = range[0] || 0;
      seed = (seed * 9301 + 49297) % 233280;
      var rnd = seed / 233280.0;
      return Math.floor(min + rnd * (max - min));
    }
  }

  function HSVtoHex (hsv){

    var rgb = HSVtoRGB(hsv);

    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? '0' + hex : hex;
    }

    var hex = '#' + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);

    return hex;

  }

  function defineColor (name, hueRange, lowerBounds) {

    var sMin = lowerBounds[0][0],
        sMax = lowerBounds[lowerBounds.length - 1][0],

        bMin = lowerBounds[lowerBounds.length - 1][1],
        bMax = lowerBounds[0][1];

    colorDictionary[name] = {
      hueRange: hueRange,
      lowerBounds: lowerBounds,
      saturationRange: [sMin, sMax],
      brightnessRange: [bMin, bMax]
    };

  }

  function loadColorBounds () {

    defineColor(
      'monochrome',
      null,
      [[0,0],[100,0]]
    );

    defineColor(
      'red',
      [-26,18],
      [[20,100],[30,92],[40,89],[50,85],[60,78],[70,70],[80,60],[90,55],[100,50]]
    );

    defineColor(
      'orange',
      [19,46],
      [[20,100],[30,93],[40,88],[50,86],[60,85],[70,70],[100,70]]
    );

    defineColor(
      'yellow',
      [47,62],
      [[25,100],[40,94],[50,89],[60,86],[70,84],[80,82],[90,80],[100,75]]
    );

    defineColor(
      'green',
      [63,178],
      [[30,100],[40,90],[50,85],[60,81],[70,74],[80,64],[90,50],[100,40]]
    );

    defineColor(
      'blue',
      [179, 257],
      [[20,100],[30,86],[40,80],[50,74],[60,60],[70,52],[80,44],[90,39],[100,35]]
    );

    defineColor(
      'purple',
      [258, 282],
      [[20,100],[30,87],[40,79],[50,70],[60,65],[70,59],[80,52],[90,45],[100,42]]
    );

    defineColor(
      'pink',
      [283, 334],
      [[20,100],[30,90],[40,86],[60,84],[80,80],[90,75],[100,73]]
    );

  }

  function HSVtoRGB (hsv) {

    // this doesn't work for the values of 0 and 360
    // here's the hacky fix
    var h = hsv[0];
    if (h === 0) {h = 1;}
    if (h === 360) {h = 359;}

    // Rebase the h,s,v values
    h = h/360;
    var s = hsv[1]/100,
        v = hsv[2]/100;

    var h_i = Math.floor(h*6),
      f = h * 6 - h_i,
      p = v * (1 - s),
      q = v * (1 - f*s),
      t = v * (1 - (1 - f)*s),
      r = 256,
      g = 256,
      b = 256;

    switch(h_i) {
      case 0: r = v; g = t; b = p;  break;
      case 1: r = q; g = v; b = p;  break;
      case 2: r = p; g = v; b = t;  break;
      case 3: r = p; g = q; b = v;  break;
      case 4: r = t; g = p; b = v;  break;
      case 5: r = v; g = p; b = q;  break;
    }

    var result = [Math.floor(r*255), Math.floor(g*255), Math.floor(b*255)];
    return result;
  }

  function HSVtoHSL (hsv) {
    var h = hsv[0],
      s = hsv[1]/100,
      v = hsv[2]/100,
      k = (2-s)*v;

    return [
      h,
      Math.round(s*v / (k<1 ? k : 2-k) * 10000) / 100,
      k/2 * 100
    ];
  }

  function stringToInteger (string) {
    var total = 0
    for (var i = 0; i !== string.length; i++) {
      if (total >= Number.MAX_SAFE_INTEGER) break;
      total += string.charCodeAt(i)
    }
    return total
  }

  return randomColor;
}));