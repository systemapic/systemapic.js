// wms layer
Wu.WMSLayer = Wu.Model.Layer.extend({

    initialize : function (layer) {

        // set source
        this.store = layer; // db object
        
        // data not loaded
        this.loaded = false;

    },

    initLayer : function () {
        this.update();
    },

    update : function () {
        var map = app._map;

        // prepare raster
        this._prepareLayer();
    },

    _prepareLayer : function () {

        console.log('_prepareLayer');

        // set ids
        // var fileUuid    = this._fileUuid;   // file id of geojson
        // var cartoid     = this.store.data.cartoid || this._defaultCartoid;
        // var tileServer  = app.options.servers.tiles.uri;
        // var subdomains  = app.options.servers.tiles.subdomains;
        // var access_token = '?access_token=' + app.tokens.access_token;
        // var layerUuid = this._getLayerUuid();
        // var url = app.options.servers.tiles.uri + '{layerUuid}/{z}/{x}/{y}.png' + access_token;

        // // add vector tile raster layer
        // this.layer = L.tileLayer(url, {
        //     fileUuid: fileUuid,
        //     layerUuid : layerUuid,
        //     subdomains : subdomains,
        //     maxRequests : 0
        // });

        var wms_source = 'http://195.1.20.83/wms-follo/';
        var layer_name = 'EIENDOMSKART';

        // create layer
        this.layer = L.tileLayer.betterWms(wms_source, {
            layers: layer_name,
            transparent: true,
            format: 'image/png',
            prepareContent : this._prepareContent.bind(this),
            parentLayer : this
        });

        // on popup close
        app._map.on('popupclose', function (e) {

            // get popups
            var popup = e.popup;
            var open_popup = this.layer.getPopup();

            // remove polygon is closed popup is our popup
            if (popup._leaflet_id == open_popup._leaflet_id) {
                _.forEach(this._overlays, function (o) {
                    o.remove();
                    delete this._overlays[o];
                }.bind(this));
                // this._currentOverlay.remove();
            }

        }.bind(this));
    },


    _prepareContent : function (content) {

        console.log('_prepareContent', this);

        if (!this._added) return;

        // parse content
        var content = Wu.parse(content);

        console.log('content', content);

        // create container
        var html = Wu.DomUtil.create('div', 'wms-content');

        _.forEach(content, function (c) {

            // skip teiggrenser
            if (c.FeatureType == 'Teiggrense') return;

            // container
            var container = Wu.DomUtil.create('div', 'wms-content-container', html);
            var header = Wu.DomUtil.create('div', 'wms-content-header', container);
            var attributes = Wu.DomUtil.create('div', 'wms-content-attributes-container', container);

            // set header
            header.innerHTML = _.capitalize(c.FeatureType);

            // attributes
            _.forEach(c.AttributesList, function (a) {

                var wrap = Wu.DomUtil.create('div', 'wms-content-attributes-wrapper', attributes)
                var namediv = Wu.DomUtil.create('div', 'wms-content-attributes-name', wrap);
                var valuediv = Wu.DomUtil.create('div', 'wms-content-attributes-value', wrap);

                // set values
                var name = a.Name + ':';
                var value = a.Value;

                // create link
                if (a.Name == 'Link') {
                    value = '<a href="' + value + '" target="_blank">Se eiendom</a>';
                } 
                
                // add values
                namediv.innerHTML = name;
                valuediv.innerHTML = value;

            });

            console.log('FeatureType', c.FeatureType);

            if (c.FeatureType == 'Eiendom') {

                // create polygon from geometry
                var geometry = [];
                _.forEach(c.Geometry.Positions, function (g) {
                    geometry.push([g.X, g.Y]);
                });

                // create polygon
                var polygon = turf.polygon([geometry]);

                // add geojson
                var overlay = this._overlays[c.FeatureType] = L.geoJSON(polygon, {
                    style : {
                        // "color": "#ff7800",
                        "color": "red",
                        "weight": 5,
                        "opacity": 0.65
                    }
                });

                // add permanently
                overlay.addTo(app._map);


            } else {

                var exempt = ['Kommune', 'Vei', 'Kommuneplan'];
                // if (c.FeatureType != 'Kommune' && c.FeatureType != 'Vei') {
                if (!_.includes(exempt, c.FeatureType)) {


                    // create polygon from geometry
                    var geometry = [];
                    _.forEach(c.Geometry.Positions, function (g) {
                        geometry.push([g.X, g.Y]);
                    });

                    // create polygon
                    var polygon = turf.polygon([geometry]);

                    // add geojson
                    var overlay = this._overlays[c.FeatureType] = L.geoJSON(polygon, {
                        style : {
                            "color": "#ff7800",
                            "weight": 5,
                            "opacity": 0.65
                        }
                    });

                    // hover events on popup
                    Wu.DomEvent.on(container, 'mouseenter', function (e) {
                        console.log('mouseenter', e);
                        container.style.background = 'gainsboro';
                        overlay.addTo(app._map);
                    });
                     // hover events on popup
                    Wu.DomEvent.on(container, 'mouseleave', function (e) {
                        console.log('mouseleave', e);
                        container.style.background = '';
                        overlay.remove();
                    });

                } 
            }



        }.bind(this));

        return html;
    },

    _overlays : {},

    // _getLayerUuid : function () {
    //     return this.store.data.postgis.layer_id;
    // },

    // getMeta : function () {
    //     var metajson = this.store.metadata;
    //     var meta = Wu.parse(metajson);
    //     return meta;
    // },

    // getData : function () {
    //     return this.store.data.postgis;
    // },

    // getFileMeta : function () {
    //     var file = app.Account.getFile(this.store.file);
    //     var metajson = file.store.data.raster.metadata;
    //     var meta = Wu.parse(metajson);
    //     return meta;
    // },

    getExtent : function () {
        var meta = this.getMeta();
        if (!meta) return;
        var extent_geojson = meta.extent_geojson;
        if (!extent_geojson) return;
        var coordinates = extent_geojson.coordinates;
        if (!coordinates) return;
        var coords = coordinates[0];

        var extent = [
            coords[0][0],
            coords[0][1],
            coords[2][0],
            coords[2][1]
        ];
        return extent;
    },

    flyTo : function () {

        var extent = this.getExtent();

        if (!extent) return;

        var southWest = L.latLng(extent[1], extent[0]);
        var northEast = L.latLng(extent[3], extent[2]);
        var bounds = L.latLngBounds(southWest, northEast);
        var map = app._map;
        var row_count = parseInt(this.getMeta().row_count);
        var flyOptions = {};

        // if large file, don't zoom out
        if (row_count > 500000) { 
            var zoom = map.getZoom();
            flyOptions.minZoom = zoom;
        }

        // fly
        map.fitBounds(bounds, flyOptions);
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

    downloadLayer : function () {
        console.log('wms downloadLayer');
    },

    isRaster : function () {
        return true;
    },

    setData : function (data) {
        if (!data) return console.error('no style to set!');
        this.store.data.postgis = data;
        this.save('data');
    },
   
    _refreshLayer : function (layerUuid) {

        this.layer.setOptions({
            layerUuid : layerUuid
        });

        this.layer.redraw();
    },

    add : function (type) {

        // mark as base or layermenu layer
        this._isBase = (type == 'baselayer');
        
        // add
        this.addTo();
    },

    addTo : function () {
        if (!this._inited) this.initLayer();

        // add to map
        this._addTo();
        
        // add to controls
        this.addToControls();
    },

    _addTo : function (type) {
        if (!this._inited) this.initLayer();

        var map = app._map;

        // leaflet fn
        map.addLayer(this.layer);

        // add to active layers
        app.MapPane.addActiveLayer(this);   // includes baselayers

        // mark
        this._added = true;

        // fire event
        Wu.Mixin.Events.fire('layerEnabled', { detail : {
            layer : this
        }}); 

    },


    remove : function (map) {
        var map = map || app._map;

        // leaflet fn
        if (map.hasLayer(this.layer)) map.removeLayer(this.layer);

        // remove from active layers
        app.MapPane.removeActiveLayer(this);    

        // remove gridLayer if available
        if (this.gridLayer) {
            this.gridLayer._flush();
            if (map.hasLayer(this.gridLayer)) map.removeLayer(this.gridLayer); 
        }

        // remove from zIndex
        this._removeFromZIndex();

        // remove from descriptionControl if avaialbe
        var descriptionControl = app.MapPane.getControls().description;
        if ( descriptionControl ) descriptionControl._removeLayer(this);

        // remove overlays
        _.forEach(this._overlays, function (o) {
            o.remove();
            delete this._overlays[o];
        }.bind(this))

        this._added = false;

        // fire layer enabled
        this.fire('disabled', {
            layer : this
        });
    },

    isAdded : function () {
        return this._added;
    },


});



L.TileLayer.BetterWMS = L.TileLayer.WMS.extend({

    options : {
        prepareContent : function () {},
        parentLayer : null
    },
  
    onAdd: function (map) {
        // Triggered when the layer is added to a map.
        //   Register a click listener, then do all the upstream WMS things
        L.TileLayer.WMS.prototype.onAdd.call(this, map);
        map.on('click', this.getFeatureInfo, this);
    },

    onRemove: function (map) {
        // Triggered when the layer is removed from a map.
        //   Unregister a click listener, then do all the upstream WMS things
        L.TileLayer.WMS.prototype.onRemove.call(this, map);
        map.off('click', this.getFeatureInfo, this);

        if (this._popup) {
            this._popup.remove();
        }
    },

    getFeatureInfo: function (evt) {
        // Make an AJAX request to the server and hope for the best
        var url = this.getFeatureInfoUrl(evt.latlng);
        var showResults = L.Util.bind(this.showGetFeatureInfo, this);

        $.ajax({
            url: url,
            success: function (data, status, xhr) {
                var err = typeof data === 'string' ? null : data;
                showResults(err, evt.latlng, data);
            },
            error: function (xhr, status, error) {
                showResults(error);  
            }
        });
    },

    getFeatureInfoUrl: function (latlng) {
        // Construct a GetFeatureInfo request URL given a point
        var point = this._map.latLngToContainerPoint(latlng, this._map.getZoom());
        var size = this._map.getSize();

        // console.log('poinint:', point, latlng);
        // var params = {
        //     request: 'GetFeatureInfo',
        //     service: 'WMS',
        //     srs: 'EPSG:4326',
        //     styles: this.wmsParams.styles,
        //     transparent: this.wmsParams.transparent,
        //     version: this.wmsParams.version,      
        //     format: this.wmsParams.format,
        //     bbox: this._map.getBounds().toBBoxString(),
        //     height: size.y,
        //     width: size.x,
        //     layers: this.wmsParams.layers,
        //     query_layers: this.wmsParams.layers,
        //     info_format: 'text/html'
        // };

        // var params = {
        //     request: 'GetFeatureInfo',
        //     service: 'WMS',
        //     srs: 'EPSG:4326',
        //     // styles: this.wmsParams.styles,
        //     // transparent: this.wmsParams.transparent,
        //     version: '1.1.0',
        //     tolerance : 25,  
        //     styles : '',    
        //     // format: this.wmsParams.format,
        //     // bbox: this._map.getBounds().toBBoxString(),
        //     height: size.y,
        //     width: size.x,
        //     layers: this.wmsParams.layers,
        //     query_layers: 'SKI_WMS-FOLLO:EIENDOMSKART,KULTURMINNER',
        //     layers: 'SKI_WMS-FOLLO:EIENDOMSKART,KULTURMINNER',
        //     format : 'image/png',

        //     info_format: 'text/html',
        //     x : point.x,
        //     y : point.y,
        //     bbox : app._map.getBounds().toBBoxString(),
        // };


        // norkart proxy query
        var params = {
            service: 'WMS',
            srs: 'EPSG:4326',
            tolerance : 15,  
            y : latlng.lat,
            x : latlng.lng,
            appId : 'CPC-Kommunekart',
            querylayers : 'SKI_WMS-FOLLO:EIENDOMSKART'
        };

        var querylayers = 'SKI_WMS-FOLLO:EIENDOMSKART,KULTURMINNER,PBLTILTAK,BYGGESAKER_UNDER_ARBEID,KP2,RP2,BP3VN2,RP3VN2,KP3,AR5,VEIKATEGORI,RODER;GeoServer_WMS_DOK:layergroup_63;Follo-WMS-TURKART-SOMMER:SYKKELRUTE,SYKKELRUTEFORSLAG,FOTRUTE,FOTRUTEFORSLAG;AreaWMS:0213;';
        params.querylayers = querylayers;

        // debug url, norkart proxy
        var url = 'https://kommunekart.com/api/WebPublisher/GfiProxy?';
        var done_url = url + L.Util.getParamString(params, url, true);
        return done_url;
    },

    getPopup : function () {
        return this._popup;
    },

    showGetFeatureInfo: function (err, latlng, content) {
        if (err) { console.log(err); return; } // do nothing if there's an error

        // don't add if layer was removed from map while querying
        if (!this.options.parentLayer.isAdded()) return;

        // parse content
        var parsed_content = this.options.prepareContent(content);

        // open popup
        var popup = this._popup = L.popup({ 
            maxWidth: 800,
            minWidth : 200,
            offset : L.point(0, -20),
            className : 'wms-popup-fixed'
        })
        .setLatLng(latlng)
        .setContent(parsed_content)
        .openOn(this._map);
    },

});

L.tileLayer.betterWms = function (url, options) {
  return new L.TileLayer.BetterWMS(url, options);  
};
