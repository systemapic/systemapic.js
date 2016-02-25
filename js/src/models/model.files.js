Wu.Model.File = Wu.Model.extend({

	_ : 'file',

	_initialize : function (store) {

		// set store
		this.store = store;
	},

	getStore : function () {
		return this.store;
	},

	// getters
	getName : function () {
		return this.store.name;
	},
	getTitle : function () {
		return this.getName();
	},

	getType : function () {
		return this.store.type;
	},

	getUuid : function () {
		return this.store.uuid;
	},

	getLastUpdated : function () {
		return this.store.lastUpdated;
	},

	getKeywords : function () {
		return this.store.keywords;
	},

	getFormat : function () {
		return this.store.format;
	},

	getFileList : function () {
		return this.store.files;
	},

	getDatasize : function () {
		return this.store.dataSize;
	},

	getCreatedByName : function () {
		return this.store.createdByName || app.Users[this.getCreatedBy()].getFullName();
	},

	getCreatedBy : function () {
		return this.store.createdBy;
	},

	getCreated : function () {
		return this.store.created;
	},

	getCreatedPretty : function () {
		var date_created = this.store.created;
		return Wu.Util.prettyDate(date_created);
	},

	getCategory : function () {
		return this.store.category;
	},

	getStatus : function () {
		return this.store.status;
	},

	getVersion : function () {
		return this.store.version;
	},

	getDescription : function () {
		return this.store.description;
	},

	getLayer : function () {
		var fileUuid = this.getUuid();
		var project = _.find(app.Projects, function (p) {
			return p.files[fileUuid];
		});
		var layer = _.find(project.layers, function (l) {
			return l.getFileUuid() == fileUuid;
		});
		return layer;
	},

	getCopyright : function () {
		return this.store.copyright;
	},

	setCopyright : function (copyright) {
		this.store.copyright = copyright;
		this.save('copyright');
	},

	_addToProject : function (projectUuid) {
		var options = {
			project_id : projectUuid,
			file_id : this.getUuid()
		};
		app.api.addFileToTheProject(options, function (err, response) {
			if (response.error) return app.feedback.setError({
				title : "Could not add file to the project",
				description : response.error.message
			});

			Wu.Mixin.Events.fire('fileHasBeenAdded', { detail : {}});
		}.bind(this));
	},

	// get all templates
	getStyleTemplates: function () {
		return this.store.styleTemplates; // array
	},

	// set all templates
	setStyleTemplates : function (templates) {
		this.store.styleTemplates = templates;
		this.save('styleTemplates');
	},

	// add template to exisiting array
	setStyleTemplate : function (template) {
		this.store.styleTemplates.push(template);
		this.save('styleTemplates');
	},

	// get single template based on uuid (or other key)
	getStyleTemplate : function (uuid) {
		var template = _.find(this.getStyleTemplates(), function (t) {
			return t.uuid == uuid;
		});
		return template;
	},

	// // template can look like anything, since it's stored as JSON string, but should contain at least:
	// var template = {
	// 	uuid : Wu.Util.guid('style-template'), // "style-template-23424-asddsa-23223-asdasd"
	// 	timestamp : Date.now(),
	// 	carto : [object], // should be non-stringified json2carto object
	// 	createdBy : app.Account.getUuid(), // uuid of user that created template
	// 	// etc
	// }

	// setters
	setName : function (name) {
		this.store.name = name;
		this.save('name');
	},

	setKeywords : function (keywords) {
		this.store.keywords = keywords; // todo: must be array
		this.save('keywords');
	},

	setTag : function () {
		// this.store.keywords.push(newTag); 
		this.save('keywords');
	},

	setFormat : function (format) {
		this.store.format = format;
		this.save('format');
	},

	setCategory : function (category) {
		this.store.category = category; // should be string
		this.save('category');
	},

	setStatus : function (status) {
		this.store.status = status;
		this.save('status');
	},

	setVersion : function (version) {
		this.store.version = version;
		this.save('version');
	},

	setDescription : function (description) {
		this.store.description = description;
		this.save('description');
	},

	// save field to server
	save : function (field) {

		// set fields
		var json = {};
		json[field] = this.store[field];
		json.uuid = this.store.uuid;

		// save to server
		this._save(json);

	},

	// save json to server
	_save : function (options) {

		app.api.updateFile(options, function (err, response) {
			if (response.error) return app.feedback.setError({
				title : "Could not update file", 
				description : response.error
			});

			Wu.Mixin.Events.fire('fileChanged', { detail : {
				fileUuid : options.uuid
			}});
  		}); 

	},


	// todo: move all delete of files here
	_deleteFile : function (done) {

		// check if dataset has layers
		this._getLayers(function (err, layers) {
			if (err) console.log('err', err);
			
			var num_layers = layers.length;
			var pretty_layers = [];

			if (num_layers) layers.forEach(function (l, n, m) {
				pretty_layers.push('- ' + l.title);
			});

			var has_layers_msg = 'There exists ' + num_layers + ' layers based on this dataset: \n' + pretty_layers.join('\n') + '\n\nDeleting dataset will delete all layers. Are you sure?';
			var just_confirm = 'Do you really want to delete dataset ' + this.getName() + '?';
			var message = num_layers ? has_layers_msg : just_confirm;
			var confirmed = confirm(message);

			if (!confirmed) return console.log('Nothing deleted.');
			
			// delete file
			var postgisOptions = this._getLayerData();

			app.api.deleteDataset({file_id : this.getUuid()}, function (err, response) {
				var removedObjects = Wu.parse(response);

				// clean up locally
				this._fileDeleted(removedObjects, layers);

				// callback
				done && done(null, removedObjects);
			}.bind(this));


		}.bind(this));

	},


	_fileDeleted : function (result, layers) {

		// update user locally
		app.Account.removeFile(this.getUuid());

		// update projects locally
		this._removeLayersLocally(layers);

		// fire event
		Wu.Mixin.Events.fire('fileDeleted', {detail : {
			fileUuid : this.getUuid()
		}});
	},


	_removeLayersLocally : function (layers) {

		_.isArray(layers) && layers.forEach(function (layer) {

			// find project 
			var project = _.find(app.Projects, function (p) {
				return p.getLayer(layer.uuid);
			});

			// remove layer
			project && project.removeLayer(layer);
		});

		// fire event
		Wu.Mixin.Events.fire('layerDeleted', {detail : {
			fileUuid : 'lol'
		}});
	},

	
	_getLayers : function (callback) {
		// get layers connected to dataset
		var options = this._getLayerData();
		app.api.fileGetLayers(options, function (err, response) {
			if (err) {
				return app.feedback.setError({
					title : 'Something went wrong',
					description : err
				});
			}

			var layers = Wu.parse(response);
			callback(err, layers);
		});
	},

	getPostGISData : function () {
		if (!this.store.data) return false;
		return this.store.data.postgis;
	},

	_getLayerData : function () {
		if (!this.store.data) return false;
		if (this.store.data.postgis) {
			var options = {
				data : this.store.data.postgis, 
				type : 'postgis'
			}
			return options;
		}
		if (this.store.data.raster) {
			var options = {
				data : this.store.data.raster, 
				type : 'raster'
			}
			return options;
		}
		return false;
	},

	_shareFile : function () {
	},

	_downloadFile : function () {
		if (this.isPostgis()) this._downloadDataset();
		if (this.isRaster()) this._downloadRaster();
	}, 	

	_downloadRaster : function () {

		// parse results
		var path = app.options.servers.portal;
		path += 'api/file/download/';
		path += '?file=' + this.getUuid();
		path += '&access_token=' + app.tokens.access_token;

		window.open(path, 'mywindow')

	},

	_downloadDataset : function () {

		var options = {
			file_id : this.getUuid(),
			socket_notification : true
		};

		// set download id for feedback
		this._downloadingID = Wu.Util.createRandom(5);

		// post download request to server
		app.api.downloadDataset(options, function (err, response) {
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

		}.bind(this));

	},

	_onDownloadReady : function (e) {
		var options = e.detail,
		    file_id = options.file_id,
		    finished = options.finished,
		    filepath = options.filepath;

		// parse results
		var path = app.options.servers.portal;
		path += 'api/file/download/';
		path += '?file=' + filepath;
		path += '&type=shp';
		path += '&access_token=' + app.tokens.access_token;

		// open (note: some browsers will block pop-ups. todo: test browsers!)
		window.open(path, 'mywindow')

		// remove feedback
		app.feedback.remove(this._downloadingID);
	},

	_getGeometryType : function () {
		var meta = this.getMeta();
		return meta.geometry_type;
	},

	getGeometryType : function () {
		return this._getGeometryType();
	},

	_getDefaultStyling : function () {

		// get geom type
		var geometry_type = this._getGeometryType();

		// get style
		var style = this._defaultStyling;

		// enable style by geom type
		if (geometry_type == 'ST_Point') { 
			style.point.enabled = true;
		}
		if (geometry_type == 'ST_MultiPolygon') { 
			style.polygon.enabled = true;
		}
		if (geometry_type == 'ST_LineString') { 
			style.line.enabled = true;
		}

		return style;
	},

	_createDefaultCartocss : function (json, callback) {
		var styler = app.Tools.Styler;
		styler.createCarto(json, callback);
	},


	// default cartocss styling
	_defaultStyling : {
		
		// default styling
		point : { 
			enabled : false, 
			color : { 
				column : false, 
				range : [-426.6, 105.9], 
				// customMinMax : [-426.6, 105.9], 
				staticVal : "yellow",
				value : ["#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff"]
			},
			opacity : { 
				column : false,
				range : [-426.6, 105.9],
				value : 0.5
			}, 
			pointsize : { 
				column :false,
				range : [0, 10],
				value : 1
			}
		},

		polygon : { 
			enabled : false, 
			color : { 
				column : false, 
				range : [-426.6, 105.9], 
				staticVal : "red",
				value : ["#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff"]
			},
			opacity : { 
				column : false,
				range : [-426.6, 105.9],
				value : 0.5
			}, 
			line : {
				width : { 
					column :false,
					range : false,
					value : 1
				},
				opacity : {
					column : false,
					range : [-426.6, 105.9],
					value : 0.5
				},
				color : {
					column : false, 
					range : [-426.6, 105.9], 
					staticVal : "green",
					value : ["#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff"]
				}
			}
		},

		line : {
			enabled : false,
			width : { 
				column :false,
				range : false,
				value : 1
			},
			opacity : {
				column : false,
				value : 0.5
			},
			color : {
				column : false, 
				range : [-426.6, 105.9], 
				staticVal : "green",
				value : ["#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff"]
			}
		}
	},

	_getType : function () {
		if (this.store.data && this.store.data.postgis) return 'vector';
		if (this.store.data && this.store.data.raster) return 'raster';
		return false;
	},

	cutRasterColor : function (options, callback) {

		// request layer with cut
		this._requestDefaultRasterLayer({
			file : this,
			project : options.project,
			cutColor : options.color // todo: validate
		}, callback);


		// // fubar: it's the layer that needs cutting (with gm), not file.. 
		// app.api.cutRasterColor({
		// 	color : color,
		// 	file_id : file.getUuid()
		// }, function (err, results) {
		// 	console.log('cutRasterAlpha err, res', err, results);

		// 	// create new layer with cut
		// 	// add layer automatically
		// 	// layer gets cut on exit

		// });

	},

	_createLayer : function (project, callback) {
		this._createDefaultLayer(project, callback);


		// var options = {
		// 	file_id : this.getUuid(),
		// 	project_id : project.getUuid()
		// }

		// // create default layer from file on server, returns Wu.Layer + tile-layer
		// app.api.createDefaultLayer(options, function (err, layers) {
		// 	console.log('app.api.createDefaultLayer err, layuers', err, layers);
		// });
	},


	_createDefaultLayer : function (project, callback) {
		this.isVector() && this._createDefaultVectorLayer(project, callback);
		this.isRaster() && this._createDefaultRasterLayer(project, callback);
	},

	_createDefaultVectorLayer : function (project, done) {
		var file_id = this.getUuid();
		var file = this;

		// get default style
		var defaultStyle = this._getDefaultStyling();
		
		// create css from json (server side) (json2carto)
		this._createDefaultCartocss(defaultStyle, function (ctx, defaultCartocss) {

			var options = {
				file : file,
				defaultCartocss : defaultCartocss,
				project : project,
				defaultStyle : defaultStyle
			}

			// create layer on server
			this._requestDefaultVectorLayer(options, done)


		}.bind(this));
	},

	_requestDefaultVectorLayer : function (options, done) {

		var file = options.file,
		    file_id = file.getUuid(),
		    project = options.project,
		    defaultCartocss = options.defaultCartocss,
		    defaultStyle = options.defaultStyle;


		var layerJSON = {
			"geom_column": "the_geom_3857",
			"geom_type": "geometry",
			"raster_band": "",
			"srid": "",
			"affected_tables": "",
			"interactivity": "",
			"attributes": "",
			"access_token": app.tokens.access_token,
			"cartocss_version": "2.0.1",
			"cartocss": defaultCartocss, 	// save default cartocss style (will be active on first render)
			"sql": "(SELECT * FROM " + file_id + ") as sub",
			"file_id": file_id,
			"return_model" : true,
			"projectUuid" : project.getUuid()
		};

		// create postgis layer
		app.api.createTileLayer(layerJSON, function (err, layerJSON) {
			if (err) {
				return app.feedback.setError({
					title : 'Something went wrong',
					description : err
				});
			}
			var layer = Wu.parse(layerJSON);

			var options = {
				projectUuid : project.getUuid(), // pass to automatically attach to project
				data : {
					postgis : layer.options
				},
				metadata : layer.options.metadata,
				title : file.getName(),
				description : 'Description: Layer created from ' + file.getName(),
				file : file.getUuid(),
				style : JSON.stringify(defaultStyle) // save default json style
			};

			// create new layer model
			this._createLayerModel(options, function (err, layerModel) {

				// refresh Sidepane Options
				var layer = project.addLayer(layerModel);

				// todo: set layer icon
				app.feedback.setMessage({
					title : 'Layer added to project',
					// description : 'Added <strong>' + layerModel.title + '</strong> to project.',
				});	

				// select project
				Wu.Mixin.Events.fire('layerAdded', {detail : {
					projectUuid : project.getUuid(),
					layerUuid : layerModel.uuid
				}});

				// callback
				done && done(null, layer);
			});
			
		}.bind(this));

	},

	

	_createDefaultRasterLayer : function (project, callback) {
		
		var options = {
			file : this,
			defaultCartocss : '#layer { raster-opacity:1.0 }', // TODO tweak a default CSS for raster
			project : project
		}

		// create layer on server
		this._requestDefaultRasterLayer(options, callback)

	},

	_requestDefaultRasterLayer : function (options, callback) {

		var file = options.file,
		    file_id = file.getUuid(),
		    defaultCartocss = options.defaultCartocss,
		    project = options.project;

		var cutColor = options.cutColor || false;

		var layerJSON = {
			"geom_column": "rast",
			"geom_type": "raster",
			"raster_band": "",
			"srid": "",
			"affected_tables": "",
			"interactivity": "",
			"attributes": "",
			"access_token": app.tokens.access_token,
			"cartocss_version": "2.0.1",
			"cartocss": defaultCartocss, 	// save default cartocss style (will be active on first render)
			"sql": "(SELECT * FROM " + file_id + ") as sub",
			"file_id": file_id,
			"return_model" : true,
			"projectUuid" : project.getUuid(),
			"cutColor" : cutColor
		};

		// create postgis layer
		app.api.createTileLayer(layerJSON, function (err, layerJSON) {
			if (err) {
				return app.feedback.setError({
					title : 'Something went wrong',
					description : err
				});
			}

			var layer = Wu.parse(layerJSON);
			if ( ! layer.options )
			{
				return app.feedback.setError({
					title : 'Unexpected layerJSON',
					description : layerJSON
				});
			}

			var options = {
				projectUuid : project.getUuid(), // pass to automatically attach to project
				data : {
					raster : layer.layerUuid
				},
				metadata : layer.options.metadata, 	// TODO
				title : file.getName(),
				description : 'Description: Layer created from ' + file.getName(),
				file : file.getUuid()
			};

			// create new layer model
			this._createLayerModel(options, function (err, layerModel) {

				// create layer on project
				var layer = project.addLayer(layerModel);

				// todo: set layer icon
				app.feedback.setMessage({
					title : 'Layer added to project',
					// description : 'Added <strong>' + layerModel.title + '</strong> to project.',
				});	

				// select project
				Wu.Mixin.Events.fire('layerAdded', { detail : {
					projectUuid : project.getUuid(),
					layerUuid : layerModel.uuid
				}});

				// callback
				callback && callback(null, layer);
			});
			
		}.bind(this));
	},

	_createLayerModel : function (options, done) {
		app.api.createLayer(options, function (err, body) {
			if (err) return app.feedback.setError({
				title : 'Something went wrong',
				description : err
			});
			var layerModel = Wu.parse(body);
			done(null, layerModel);
		});
	},

	getMeta : function () {

		if (this.isRaster()) {
			return this.getRasterMeta();
		}

		if (this.isVector()) {
			return this.getPostgisMeta();
		}

		return false;
	},

	getPostgisMeta : function () {
		if (!this.store.data.postgis) return false;
		if (!this.store.data.postgis.metadata) return false;
		var meta = Wu.parse(this.store.data.postgis.metadata);
		return meta;
	},

	getRasterMeta : function () {
		if (!this.store.data.raster) return false;
		if (!this.store.data.raster.metadata) return false;
		var meta = Wu.parse(this.store.data.raster.metadata);
		return meta;
	},

	getHistograms : function () {
		var meta = this.getMeta();
		if (!meta) return false;
		var histogram = meta.histogram;
		return histogram;
	},

	getHistogram : function (column) {
		var h = this.getHistograms();
		if (!h) return false;
		return h[column];
	},

	setMetadata : function (metadata) {
		if (this.store.data.raster) {
			this.store.data.raster.metadata = JSON.stringify(metadata);
			return this.save('data');
		}
		if (this.store.data.postgis) {
			this.store.data.postgis.metadata = JSON.stringify(metadata);
			return this.save('data');
		}

	},

	isRaster : function () {
		if (!this.store.data || !this.store.data.raster || !this.store.data.raster.file_id) return false;
		return true;
	},
	isVector : function () {
		return this.isPostgis();
	},
	isPostgis : function () {
		if (!this.store.data || !this.store.data.postgis) return false;
		return true;
	},

	getDatasizePretty : function () {
		var size = this.getDatasize();
		var pretty = Wu.Util.bytesToSize(size);
		return pretty;
	},
});
