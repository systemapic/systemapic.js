Wu.TopoJSONLayer = Wu.Model.Layer.extend({
    initialize : function () {
        console.error('todo: topojson');
    }
});



// todo: move to separate file
Wu.Model.Layer.GeoJSONMaskLayer = Wu.Model.Layer.extend({

    options : {
        style : {
            fillColor : 'blue',
            weight : 0.5,
            fillOpacity : 0.6,

        }
    },

    initialize : function (options) {
        console.error('GeoJSONMaskLayer', options);
        
        // set options
        Wu.setOptions(this, options);

        // set map
        this._map = app._map;

        // init layer
        this._initLayer();

        console.log('geojsonlayermask this', this);

    },

    _initLayer : function () {

        console.error('geosjonsosn', this.options.geojson);

        // ensure simple geometry of geojson (as far as possible)
        var geojson = this.ensureFlat(this.options.geojson);

        // create geojson layer
        this.layer = L.geoJson(geojson);

        // set default style
        this.layer.setStyle(this.options.style);
    },

    ensureFlat : function (geojson) {
        // combine features of feature collection
        // todo: may not work with multipolygons
        if (_.size(geojson.features) > 1 && geojson.type == 'FeatureCollection') {
            geojson = this.mergePolygons(geojson);
        }
        return geojson;
    },

    // merge multifeatured polygon into flat polygon
    // see https://github.com/Turfjs/turf/blob/393013ff3f24c71fb7dd9dac99435271d94c0e06/CHANGELOG.md#301
    // and http://morganherlocker.com/post/Merge-a-Set-of-Polygons-with-turf/
    mergePolygons : function (polygons) {
        var merged = _.clone(polygons.features[0]);
        var features = polygons.features;
        for (var i = 0, len = features.length; i < len; i++) {
            var poly = features[i];
            if (poly.geometry) merged = turf.union(merged, poly);
        }
        return merged;
    },

    getLayer : function () {
        return this.layer;
    },

    add : function () {
        this._map.addLayer(this.layer);
        // this._addEvents();
    },

    remove : function () {
        this._map.removeLayer(this.layer);
        // this._removeEvents();
    },

    // _addEvents : function () {
    //     this.layer.on('mouseover', this._onMouseover.bind(this));
    //     this.layer.on('mouseout', this._onMouseout.bind(this));
    // },

    // _removeEvents : function () {
    //     this.layer.off('mouseover', this._onMouseover);
    //     this.layer.off('mouseout', this._onMouseout);
    // },

    // _onMouseover : function (e) {
    //     console.log('_onMouseover', e);
        
    //     // set style
    //     this.layer.setStyle({
    //         fillColor : 'blue',
    //         fillOpacity : 0.8
    //     });
    // },

    // _onMouseout : function (e) {

    //     // reset style
    //     this.layer.setStyle(this.options.style);
    // },

});
