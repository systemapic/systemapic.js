Wu.Controller = Wu.Class.extend({

	initialize : function () {

		this._listen();
	},

	_listen : function () {

		Wu.Mixin.Events.on('projectSelected', this._projectSelected, this);
		
		// Wu.Mixin.Events.on('projectChanged', _.throttle(this._projectChanged, 1000), this);

		// Wu.Mixin.Events.on('editEnabled',     this._editEnabled, this);
		// Wu.Mixin.Events.on('editDisabled',    this._editDisabled, this);
		// Wu.Mixin.Events.on('layerEnabled',    this._layerEnabled, this);
		// Wu.Mixin.Events.on('layerDisabled',   this._layerDisabled, this);
	},

	// _initialize 		: function () {},
	// _editEnabled 	: function () {},
	// _editDisabled 	: function () {},
	// _layerEnabled 	: function () {},
	// _layerDisabled 	: function () {},
	// _updateView 		: function () {},


	
	_projectSelected : function (e) {
		var projectUuid = e.detail.projectUuid;

		if (!projectUuid) return Wu.Util.setAddressBar('');

		// set project
		this._project = app.activeProject = app.Projects[projectUuid];

		// set url
		this._project._setUrl(); // refactor

	},

	_loadState : function () {
		var project = this._project,
		    state = project.getState(),
		    saveState = project.getSettings().saveState;
		
		if (!saveState || !state) return;


		var json = {
			projectUuid : this._project.getUuid(),
			id : state
		}

		// get a saved setup - which layers are active, position, 
		Wu.post('/api/project/hash/get', JSON.stringify(json), function (ctx, reply) {

			var result = Wu.parse(reply);

			var hash = result.hash;

			// set position
			app.MapPane.setPosition(hash.position);

			// set layermenu layers
			var layers = hash.layers;
			_.each(layers, function (layerUuid) {
				app.MapPane.getControls().layermenu._enableLayerByUuid(layerUuid);
			});


		}.bind(this), this);

	},

	// todo!
	_saveState : function (options) {

		var project = options.project || app.activeProject;

		var layers = app.MapPane.getZIndexControls().l._index;


		var layerUuids = [];
		_.each(layers, function (l) {
			layerUuids.push(l.store.uuid);
		});


		// hash object
		var json = {
			projectUuid : project.getUuid(),
			hash : {
				id 	 : Wu.Util.createRandom(6),
				position : app.MapPane.getPosition(),
				layers 	 : layerUuids 			// layermenuItem uuids, todo: order as z-index
			},
			saveState : true
		}

		// save hash to server
		Wu.post('/api/project/hash/set', JSON.stringify(json), function (a, b) {
			console.log('saved state!', json);
		}, this);

	},

	// todo: remove these ??
	hideControls : function () {

		// layermenu
		var lm = app.MapPane.getControls().layermenu;
		if (lm) lm.hide();

		// inspect
		var ic = app.MapPane.getControls().inspect;
		if (ic) ic.hide();

		// legends
		var lc = app.MapPane.getControls().legends;
		if (lc) lc.hide();

		// description
		var dc = app.MapPane.getControls().description;
		if (dc) dc.hide();
	},

	showControls : function () {

		// layermenu
		var lm = app.MapPane.getControls().layermenu;
		if (lm) lm.show();

		// inspect
		var ic = app.MapPane.getControls().inspect;
		if (ic) ic.show();

		// legends
		var lc = app.MapPane.getControls().legends;
		if (lc) lc.show();

		// description
		var dc = app.MapPane.getControls().description;
		if (dc) dc.show();
	},

	showStartPane : function () {

		// called from project._unload(), ie. when deleting active project

		// flush mappane, headerpane, controls
		// show startpane

		app.MapPane._flush();
		app.HeaderPane._flush();
		app.HeaderPane._hide();

		var controls = app.MapPane.getControls();

		for (var c in controls) {
			var control = controls[c];
			control._off();
		}

		app.StatusPane.close()
		app.StartPane.activate();

	},

	openLastUpdatedProject : function () {
		var project = _.first(_.sortBy(_.toArray(app.Projects), function (p) {
			return p.store.lastUpdated;
		}).reverse());
		if (project) project.selectProject();
	},

	openFirstProject : function () {
		var project = _.first(_.sortBy(_.toArray(app.Projects), function (p) {
			return p.getName().toLowerCase();
		}));
		if (project) project.selectProject();
	},

});