// PROBLEMS
// --------
// queueing of tiles
//  - a cube can contain hundreds of layers, even thousands
//  - no way to add all at the same time, so they must be added as we go along
//  - in terms of animation, this means a queue-ahead of say ten or twenty frames, which must be loaded in the
//      background while others are showing
//  - tiles must also be 100% unloaded after showing, so that there's no pile-up of mem-load
//  - need a system with a cursor, which decides at all times which frames should be preloaded and which should be destroyed
//  - event-driven (cause need to comm with other modules, like chart, animator-control)
//  - at init, cursor is at a specific point, and preloading of x tiles begin.
//  - when playing, cursor position updates, and another frame must be preloaded, and another frame destroyed
//  - when sliding, or moving cursor position a lot, all frames more than x away from cursor must be destroyed, 
//      and ten new frames preloaded
//  - preloading means creating a Leaflet layer and adding it to the map (display:none)
//  - destroying means removing Leaflet layer from map, and purging all refs, incl. images
//  - moveCursor(), which controls all of this
//  - how to id the cursor? how to get correct layer in cube based on id? simplest is order in array, first layer being 0. this 
//      needs to play well with dates in chart, etc, however. chart can perhaps accept a date, and when slider is moved, it can
//      emit a slider-moved event, which contains the date. cursor can then be updated by search&replace in cube array for correct date?
//      just gonna assume this will work, and do the work on graph afterwards.
//  - findDate(), find index of array corresponding to date.
//  - dates must be moment.js compatible
//  - problem of missing days in a raster set... could be solved with a simple check-and-skip i guess
//  - if cacheSize=3, then this._cache[] will always just contain three frames: 0, 1, 2
//  - when moving cursor, either when playing frames successively, or when jumping - the cache needs to refresh, taking into account
//      where the cursor is, and how many more frames should be cached.
//  - what should be the major count? simply frames/datasets from 0? 
//  - this._cache could be either 0,1,2 and loop, or 0,1,2,3,4,5->infitiny, and scrapping old one's. loop is very tricky, long array
//      could be costly? (perhaps not). so this._cache should be just a sequence of cached frames.
//  - a frame => dataset + layer + dataset-index. this._cache stores frames. frames are ready to be displayed (ie. contains layer)
//  - a dataset = dataset
//  - a layer = Leaflet layer, already added to map
//  
//  - create all Leaflet layers in cache at init, then re-use the layers
//
// websocket loading of tiles
//  - as an add-on later, in order to request tiles faster
//  - until then, try to separate request logic as much as possible, so that Wu.CubeLayer.Websockets can easily override Wu.CubeLayer






// metalayer with several postgis raster layers 
Wu.CubeLayer = Wu.Model.Layer.extend({

    options : {
        
        // frames to cache [before, after]
        cacheSize : [2, 15], 
        
        // moment format at which to compare dates (year/day only here)
        timeFormat : 'YYYY-DDDD', 
        
        // empty, transparent png
        emptyTile : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAB9JREFUaIHtwQENAAAAwqD3T20ON6AAAAAAAAAAAL4NIQAAAZpg4dUAAAAASUVORK5CYII=',
    },

    _cache : [],

    initialize : function (store) {

        // set store
        this._setStore(store);
    },

    _setStore : function (store) {

        // set store        
        this.store = store;

        // parse cube json
        this._cube = Wu.parse(this.store.data.cube);
    },

    initLayer : function () {

        // listen up
        this._listen();

        // init cursor
        this._initCursor();

        // init cache
        this._initCache();

        // mark inited
        this._inited = true;

        // debug
        app._cubeDebug = this;

    },

    _initCursor : function () {

        // init cursor
        this._cursor = 0;

    },

    _initDatasets : function () {
        var datasets = this.getDatasets();
        var f = this.options.timeFormat;
        datasets.forEach(function (d, n) {

            // prepare format for quicker search 
            d.formattedTime = moment(d.timestamp).format(f);
            
            // prepare index for quicker search
            d.idx = n;
        });
        return datasets;
    },

    _initCache : function () {

        // set datasets
        this._datasets = this._initDatasets();

        // total num of cached frames
        var cacheSize = this.options.cacheSize[0] + this.options.cacheSize[1];

        // create cache
        _.times(cacheSize, function (n) {

            // create empty Leaflet layer
            var layer = L.tileLayer(this._getTileUrl(), {
                errorTileUrl : this.options.emptyTile,
                cube_id : this.getCubeId(),
                subdomains : app.options.servers.cubes.subdomains,
                maxRequests : 0,
                dataset_id : null,
                cache : null
            });

            // add load event
            layer.on('load', this._onLayerLoaded, this);

            // add click event
            // layer.on('click', this._onLayerClick, this); // no effect?
            // layer.on('tileunload', this._onTileUnload, this); // no effect?
            // layer.on('tileload', this._onTileLoad, this); // no effect?

            // add layer to map
            app._map.addLayer(layer);

            // hide by default
            this._hideLayer(layer);

            // add to cache
            this._cache.push({
                layer : layer,
                dataset_id : null,
                idx : null
            });

        }, this);

        // set default layer
        this.layer = this._cache[0].layer;

    },

    _onTileUnload : function (e) {
        var layer = e.target;
        console.log('_onTileUnload', layer.options.dataset_id);
    },

    _onTileLoad : function (e) {
         var layer = e.target;
        console.log('_onTileLoad', layer.options.dataset_id);
    },

    _onLayerClick : function (e) {
        console.log('_layerClick', e);
    },

    _onLayerLoaded : function (e) {
        var layer = e.target;
        var dataset = _.find(this._datasets, {id : layer.options.dataset_id});

        if (!dataset) return;

        console.log('loaded:', dataset.idx);

        // mark cache loaded
        var cache = _.find(this._cache, {idx : dataset.idx});
        if (cache) {
            cache.loaded = true;
        }
    },

    _moveCursor : function (options) {

        // get options
        var timestamp = options.timestamp;

        // find index of dataset corresponding to current date
        var didx = this._findDatasetByTimestamp(timestamp);

        if (didx < 0) {
            console.error('no dataset corresponding to timestamp');
            this._hideLayer(this.layer);
            return;
        }

        // set direction (for cache algorithm)
        this._cursorDirection = (didx > this._cursor) ? 1 : -1;

        // set
        this._cursor = didx;
       
        // make sure cache is updated; got all correct layers loaded
        this._updateCache();

        // sets cursor at current frame (ie. show layer on map)
        this._updateCursor();

    },

    // this is where layers are shown on map 
    // hides, displays layers, nothing else...
    _updateCursor : function () {

        // hide current layer
        if (this.layer) {
            this._hideLayer(this.layer);
        }

        // find dataset
        var dataset = this._datasets[this._cursor];

        // find cached frame
        var cache = _.find(this._cache, function (c) {
            return c.dataset_id == dataset.id;
        });

        // get layer
        var layer = cache ? cache.layer : false;

        // should never happen, ideally
        if (!layer) return console.error('no layer @ cursor??');

        // show layer
        this._showLayer(layer);

        // set layer
        this.layer = layer;

        console.log('cursor @', this._cursor);
    },

    // update cache
    _updateCache : function () {

        // determine which datasets should be in cache
        // todo: this is only true for the current year... what when changing years? 
        var a = _.slice(this._datasets, this._cursor, this._cursor + this.options.cacheSize[1]);
        var b = _.slice(this._datasets, this._cursor - this.options.cacheSize[0], this._cursor);

        // sort datasets
        var datasets = _.sortBy(_.unique(a.concat(b)), function (d) {
            return _.findIndex(this._datasets, function (dd) {return d.id == dd.id});
        }, this);

        // cache datasets
        datasets.forEach(function (dataset) {

            // check if dataset already cached
            var cached = _.find(this._cache, function (c) {
                return c.dataset_id == dataset.id;
            });

            // if already in cache, all good
            if (cached) return;

            // set layer options
            var layerOptions = {
                dataset_id : dataset.id,
                cache : Wu.Util.getRandomChars(6)
            }

            // (20) loaded: 107 -- bug
            // -----------------------
            // clues:
            // - has to do with cache that is not yet completely loaded
            // - when thus reused, shit happens
            // - seems if layer is overwritten, then as soon as first 20 tiles are loaded, 
            //  the next 20 tiles all fire "loaded" event.
            // - fix with https://github.com/systemapic/systemapic.js/issues/210

            // get available cache
            var cache = this._getAvailableCache();

            // update cache
            cache.dataset_id = dataset.id;
            cache.age = Date.now();
            cache.idx = dataset.idx;
            cache.loaded = false;

            // update layer
            cache.layer.setOptions(layerOptions);

        }, this);
     
    },

    _getAvailableCache : function () {

        // if going forward in time
        if (this._cursorDirection > 0) {
            
            // return lowest cached dataet index
            return _.min(this._cache, function (c) {
                return c.idx;
            }); 

        // if going backwards in time
        } else {
            
            // return highest cached dataset index
            return _.max(this._cache, function (c) {
                return c.idx;
            });
        }
       
    },

    update : function () {
        console.error('update');
        var map = app._map;

    },

    getDatasets : function () {
        return this._cube.datasets;
    },

    getCubeId : function () {
        return this._cube.cube_id;
    },  

    _refreshCube : function () {
        console.error('_refreshCube');
        // this._prepareRaster();
    },

    // event when slider is set
    _onSliderSet : function (e) {
        if (!this._added) return;

        // get timestamp
        var timestamp = e.detail.timestamp; // moment

        // move cursor
        this._moveCursor({
            timestamp : timestamp
        });

    },

    _findDatasetByTimestamp : function (t) {
        var f = this.options.timeFormat;
        var b = moment(t).format(f); // YYYY-DDDD of animation
        var didx = _.findIndex(this._datasets, function (d) { 
            return d.formattedTime == b;
        });
        return didx;
    },

    _showLayer : function (layer) {
        layer.getContainer().style.display = 'block';
    },

    _hideLayer : function (layer) {
        layer.getContainer().style.display = 'none';
    },

    add : function (type) {
        this.addTo();
    },

    addTo : function () {
        if (!this._inited) this.initLayer();

        this._added = true;

        // add to map
        this._addTo();
    },

    _getCursorLayer : function () {
        var cache = this._cache[this._cursor];
        if (!cache) return false;
        return cache.layer;
    },

    _addTo : function (type) {
        if (!this._inited) this.initLayer();

        var map = app._map;
        var layer = this._getCursorLayer();
        if (!layer) return console.error('no layer @ cursor');

        // leaflet fn
        map.addLayer(layer);

        // add to active layers
        app.MapPane.addActiveLayer(this);   // includes baselayers, todo: evented

        // update zindex
        this._addToZIndex(type); // todo: evented

        this._added = true;

        // fire event
        Wu.Mixin.Events.fire('layerEnabled', { detail : {
            layer : this,
            showSlider : true
        }}); 
    },

    _addThin: function () {
        if (!this._inited) this.initLayer();

        // only add to map temporarily
        app._map.addLayer(this.layer);
        this.layer.bringToFront();
    },

    _removeThin : function () {
        if (!this._inited) this.initLayer();

        // remove from map
        app._map.removeLayer(this.layer);
    },

    remove : function (map) {
        var map = map || app._map;

        this._cache.forEach(function (cache) {
            var layer = cache.layer;

            // leaflet fn
            if (map.hasLayer(layer)) map.removeLayer(layer);
        });

        // remove from active layers
        app.MapPane.removeActiveLayer(this);    

        // remove from zIndex
        this._removeFromZIndex();

        // remove from descriptionControl if avaialbe.. TODO: make this evented instead
        var descriptionControl = app.MapPane.getControls().description;
        if (descriptionControl) descriptionControl._removeLayer(this);

        this._added = false;
    },

    isCube : function () {
        return true;
    },

    updateStyle : function (style) {

        var options = {
            cube_id : this.getCubeId(),
            style : style
        }

        // update cube on server
        app.api.updateCube(options, function (err, cubeJSON) {
            if (err) return console.error('Error updating Cube Style:', err, cubeJSON);

            // parse
            var cube = Wu.parse(cubeJSON)

            // save updated cube
            this._saveCube(cube);

            // refresh layers
            this._refreshLayer();
            
        }.bind(this));
    },

    _saveCube : function (cube) {

        // save cube locally and to server
        this.store.data.cube = JSON.stringify(cube);
        this.save('data');

        // set updated cube
        this._cube = cube;

        return this;
    },

    _refreshLayer : function () {

        // refresh all Leaflet layers
        this._cache.forEach(function (cache) {
            var layer = cache.layer;
            layer.setOptions({
                cache : Wu.Util.getRandomChars(6) // change url to skip browser cache
            });
            layer.redraw();
        });

    },

    setDatasetDate : function (options, done) {

        // get date, dataset
        var date = options.date;
        var dataset = options.dataset;

        // set new date (format: "2016-04-01T00:00:00+02:00")
        dataset.timestamp = moment(date).format();

        // get all datasets
        var datasets = this.getDatasets();

        // find index 
        var idx = _.findIndex(datasets, function (d) {
            return d.id == dataset.id;
        });

        // update dataset
        datasets[idx] = dataset;

        // save cube on server
        this.updateDataset(datasets, done);
    },

    updateDataset : function (datasets, done) {

        var options = {
            cube_id : this.getCubeId(),
            datasets : datasets
        }

        // update cube on server
        app.api.updateCube(options, function (err, cubeJSON) {
            if (err) return console.error('Error updating Cube Style:', err, cubeJSON);

            // parse
            var cube = Wu.parse(cubeJSON)

            // save updated cube
            this._saveCube(cube);

            // refresh layers
            this._refreshLayer();

            // return
            done && done(err, cube);
            
        }.bind(this));
    },

    _getTileUrl : function () {
        var access_token = '?access_token=' + app.tokens.access_token;
        var url = app.options.servers.cubes.uri + '{cube_id}/{dataset_id}/{z}/{x}/{y}.png' + access_token + '&cache={cache}';
        return url;
    },


});