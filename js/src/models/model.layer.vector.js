// postgis vector layer
Wu.VectorLayer = Wu.Model.Layer.extend({

    initLayer : function () {
        this.update();
        this.addHooks();

        this._listenLocally();

        this._inited = true;
    },

    _listenLocally : function () {
        Wu.DomEvent.on(this.layer, 'load', this._onLayerLoaded, this);
        Wu.DomEvent.on(this.layer, 'loading', this._onLayerLoading, this);
    },

    _onLayerLoading : function () {
        this._loadStart = Date.now();
    },

    _onLayerLoaded : function () {
        var loadTime = Date.now() - this._loadStart;

        // fire loaded event
        app.Analytics._eventLayerLoaded({
            layer : this.getTitle(),
            load_time : loadTime
        });
    },

    update : function (options, callback) {
        var map = app._map;

        // remove
        if (this.layer) this._flush();

        // prepare raster
        this._prepareRaster();

        // prepare utfgrid
        this._prepareGrid();

        // enable
        if (options && options.enable) {
            map.addLayer(this.layer);
            this.layer.bringToFront();
        }

        // callback
        callback && callback();
    },

    setData : function (data) {
        if (!data) return console.error('no styloe to set!');
        this.store.data.postgis = data;
        this.save('data');
    },
    setStyle : function (data) {
        console.error('deprecated??');
        return this.setData(data);
    },

    // on change in style editor, etc.
    updateStyle : function (style) {

        var layerUuid = style.layerUuid;
        var postgisOptions = style.options;

        // save 
        this.setData(postgisOptions);

        // update layer option
        this._refreshLayer(layerUuid);
    },

    _refreshLayer : function (layerUuid) {

        this.layer.setOptions({
            layerUuid : layerUuid
        });

        this.layer.redraw();
    },

    _getLayerUuid : function () {
        return this.store.data.postgis.layer_id;
    },

    getCartoCSS : function (cartoid, callback) {
        return this.store.data.postgis.cartocss;
    },

    getSQL : function () {
        return this.store.data.postgis.sql;
    },

    setFilter : function (filter) {
        this.store.filter = filter;
        this.save('filter');
    },

    getFilter : function () {
        return this.store.filter;
    },

    getPostGISData : function () {
        return this.store.data.postgis;
    },

    _prepareRaster : function () {
        var fileUuid = this._fileUuid;
        var subdomains = app.options.servers.tiles.subdomains;
        var access_token = '?access_token=' + app.tokens.access_token;
        var layerUuid = this._getLayerUuid();
        var url = app.options.servers.tiles.uri + '{layerUuid}/{z}/{x}/{y}.png' + access_token;

        // add vector tile raster layer
        this.layer = L.tileLayer(url, {
            layerUuid: this._getLayerUuid(),
            subdomains : subdomains,
            maxRequests : 0,
            maxZoom : 19
        });
    },

    _invalidateTiles : function () {
        return;
    },

    _updateGrid : function (l) {

        // refresh of gridlayer is attached to layer. this because vector tiles are not made in vile.js, 
        // and it's much more stable if gridlayer requests tiles after raster layer... perhpas todo: improve this hack!
        // - also, removed listeners in L.UtfGrid (onAdd)
        // 

        if (this.gridLayer) {
            this.gridLayer._update();
        }
    },

    _prepareGrid : function () {

        // set ids
        var subdomains  = app.options.servers.utfgrid.subdomains;
        var access_token = '?access_token=' + app.tokens.access_token;
        
        var layerUuid = this._getLayerUuid();
        var url = app.options.servers.tiles.uri + "{layerUuid}/{z}/{x}/{y}.grid" + access_token;

        // create gridlayer
        this.gridLayer = new L.UtfGrid(url, {
            useJsonP: false,
            subdomains: subdomains,
            maxRequests : 0,
            requestTimeout : 10000,
            layerUuid : layerUuid,
            maxZoom : 19
        });

        // add grid events
        this._addGridEvents();
    },


    _fetchData : function (e, callback) {
        var keys = Object.keys(e.data);
        var column = keys[0];
        var row = e.data[column];
        var layer_id = e.layer.store.data.postgis.layer_id;

        var options = {
            column : column,
            row : row,
            layer_id : layer_id,
            access_token : app.tokens.access_token
        };

        // fetch data from server
        app.api.dbFetch(options, callback.bind(this));
    },

    _gridOnMousedown : function(e) {},

    _gridOnMouseup : function (e) {
        if (!e.data) return;

        // pass layer
        e.layer = this;

        var event = e.e.originalEvent;

        if (this._event === undefined || this._event.x == event.x) {
            
        } else {
            // clear old
            app.MapPane._clearPopup();
        }

    },

    _gridOnClick : function (e) {
        if (!e.data) return;
        if (app.MapPane._drawing) return;

        // pass layer
        e.layer = this;

        // fetch data
        this._fetchData(e, function (ctx, json) {
            
            if ( !json ) {
                console.error('no data for popup!');
                return;
            }

            var data = JSON.parse(json);

            console.log('e:', e);

            e.data = data;
            var event = e.originalEvent;
            this._event = {
                x : event.x,
                y : event.y
            };

            // open popup
            app.MapPane._addPopupContent(e);

            // analytics/slack
            app.Analytics.onPointQuery(e);
        });
    },

    downloadLayer : function () {

        var options = {
            layer_id : this.getUuid(), 
            socket_notification : true
        };

        // set download id for feedback
        this._downloadingID = Wu.Util.createRandom(5);

        app.api.downloadLayerDataset(options, function (err, resp) {
            if (err) {
                return app.feedback.setError({
                    title : 'Something went wrong',
                    description : err
                });
            }
            // give feedback
            app.feedback.setMessage({
                title : 'Preparing download',
                description : 'Hold tight! Your download will be ready in a minute.',
                id : this._downloadingID
            }); 
        });

    },

    _onDownloadReady : function (e) {
        var options = e.detail;
        var file_id = options.file_id;
        var finished = options.finished;
        var filepath = options.filepath;

        // parse results
        var path = app.options.servers.portal;
        path += 'api/file/download/';
        path += '?file=' + filepath;
        path += '&type=shp';
        path += '&access_token=' + app.tokens.access_token;

        // open (note: some browsers will block pop-ups. todo: test browsers!)
        window.open(path, 'mywindow');

        // remove feedback
        app.feedback.remove(this._downloadingID);
    },

    shareLayer : function () {

    },

    deleteLayer : function () {

        // confirm
        var message = 'Are you sure you want to delete this layer? \n - ' + this.getTitle();
        if (!confirm(message)) return console.log('No layer deleted.');

        // get project
        var layerUuid = this.getUuid();
        var project = _.find(app.Projects, function (p) {
            return p.layers[layerUuid];
        });

        // delete layer
        project.deleteLayer(this);
    },
    
    isVector : function () {
        return true;
    },

});
