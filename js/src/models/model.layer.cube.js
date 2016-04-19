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
//
// websocket loading of tiles
//  - as an add-on later, in order to request tiles faster
//  - until then, try to separate request logic as much as possible, so that Wu.CubeLayer.Websockets can easily override Wu.CubeLayer






// metalayer with several postgis raster layers 
Wu.CubeLayer = Wu.Model.Layer.extend({

    options : {
        fps : 1,
        cacheSize : 3, // frames to cache ahead
        timestampResolution : 'YYYY-DDDD' // moment format at which to compare dates (year/day only here)
    },

    _cache : [],

    initialize : function (store) {

        // set store
        this._setStore(store);

        // listen up
        this._listen();
    },

    _setStore : function (store) {

        // set store        
        this.store = store;

        // parse cube json
        this._cube = Wu.parse(this.store.data.cube);
    },

    initLayer : function () {

        // init cursor
        this._initCursor();

        // init cache
        this._initCache();

        // mark inited
        this._inited = true;
    },

    _initCursor : function () {

        // set cursor to 0
        this._setCursor({
            idx : 0,
            layer : null,
            dataset : null
        });
    },

    _initCache : function () {

        // get datasets
        var datasets = this.getDatasets();

        // no cache if empty datasets
        if (!_.size(datasets)) return;

        // cache is current cursor index and cacheSize long
        var cache = _.slice(datasets, this._cursor.idx, this._cursor.idx + this.options.cacheSize);

        // load cache
        cache.forEach(this._cacheDataset, this);

        // set cursor to first in cache
        this._setCursor(this._cache[0]);
    },

    _setCursor : function (cursor) {
        var layer = cursor.layer;

        // set cursor
        this._cursor = cursor;

        // set layer 
        if (layer) {

            // this.layer needed for model.layers.js fn's
            this.layer = layer;

            // show layer
            this._showLayer(layer);
        }
    },

    _cacheDataset : function (dataset, idx) {

        console.log('_cacheDataset', idx);

        // url template
        var access_token = '?access_token=' + app.tokens.access_token;
        var url = app.options.servers.cubes.uri + '{cube_id}/{dataset_id}/{z}/{x}/{y}.png' + access_token + '&cache={cache}';

        // create leaflet layer
        var layer = L.tileLayer(url, {
            cube_id : this.getCubeId(),
            dataset_id : dataset.id,
            subdomains : app.options.servers.cubes.subdomains,
            maxRequests : 0,
            cache : Wu.Util.getRandomChars(6)
        });

        // add to map
        app._map.addLayer(layer);

        // hide by default
        this._hideLayer(layer);

        // cache frame
        this._cache[idx] = {
            idx : idx,
            dataset : dataset,
            layer : layer
        }

    },

    update : function () {
        console.error('update');
        var map = app._map;

        // prepare raster
        // this._prepareRaster();
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

    _showLayer : function (layer) {
        layer.getContainer().style.display = 'block';
    },

    _hideLayer : function (layer) {
        layer.getContainer().style.display = 'none';
    },

    playAnimation : function () {

        // debug: start on layer 0
        this._currentFrame = this._cache[0].layer;

        // show one layer after the other (in loop)
        this._player = setInterval(function () {

            // figure out which frame is current and next
            this._setFrames();

            // hide current frame
            this._hideFrame && this._hideLayer(this._hideFrame);

            // show next frame
            this._showFrame && this._showLayer(this._showFrame);

        }.bind(this), (1000 / this.options.fps));
    },

    stopAnimation : function () {
        this._player && clearInterval(this._player);
    },

    _onSetFPS : function (e) {
        var fps = e.detail.fps;
        this.options.fps = fps;
    },

    _onAnimationSlide : function (e) {
        if (!this._added) return;

        // get event payload
        var value = e.detail.value;
        var timestamp = e.detail.timestamp; // moment
        var format = this.options.timestampResolution;

        console.log('_onAnimationSlide', value, timestamp);

        // find dataset corresponding to current date
        var dataset = _.find(this.getDatasets(), function (d) { 
            var a = moment(d.timestamp).format(format); // YYYY-DDDD of dataset
            var b = moment(timestamp).format(format);   // YYYY-DDDD of animation
            return a == b;
        });

        console.log('found dataset of the day!', dataset);

        // todo: move cursor to dataset of the day!
    },

    _onAnimationPlay : function () {
        if (!this._added) return;

        // play
        this.playAnimation();
    },

    _onAnimationStop : function () {
        if (!this._added) return;
        
        // stop
        this.stopAnimation();
    },

    _setFrames : function () {
        
        // find current index
        var curIdx = _.findIndex(this._layers, this._currentFrame);

        console.log('curIdx = ', curIdx);

        // find next index
        var nextIdx = curIdx + 1;
        if (nextIdx > this._layers.length -1) {
            nextIdx = 0;
        }

        // set frames
        this._showFrame = this._layers[nextIdx];
        this._hideFrame = this._layers[curIdx];
        this._currentFrame = this._showFrame;
    },

    add : function (type) {

        // add
        this.addTo();
    },

    addTo : function () {
        if (!this._inited) this.initLayer();

        this._added = true;

        // add to map
        this._addTo();
    },

    _addTo : function (type) {
        if (!this._inited) this.initLayer();

        var map = app._map;
        var layer = this._cursor.layer;

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

            // save updated cube
            var cube = Wu.parse(cubeJSON)
            this._saveCube(cube);

            // refresh layers
            this._refreshLayer();
            
        }.bind(this));
    },

    _saveCube : function (cube) {
        this.store.data.cube = JSON.stringify(cube);
        this.save('data');

        // set updated cube
        this._cube = cube;

        return this;
    },

    _refreshLayer : function () {

        // refresh all layers
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

});