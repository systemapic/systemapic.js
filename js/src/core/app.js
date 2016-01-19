Wu.version = '1.3.5';
Wu.App = Wu.Class.extend({
	_ : 'app',

	// default options
	options : systemapicConfigOptions, // global var from config.js... perhaps refactor.

	language : language,

	_ready : false,

	initialize : function (options) {

		// print version
		console.log('Systemapic v.' + Wu.version);

		// set global app
		window.app = Wu.app = this; // todo: remove Wu.app, use only window.app

		// merge options
		Wu.setOptions(app, options);

		// init api
		app.api = new Wu.Api({});

		// auth
		app.api.auth(app.authed);
	},

	authed : function (err, access_token) {

		// catch err
		if (err) return console.error('Something went horribly wrong: ', err);

		// set access_token
		app.tokens = Wu.parse(access_token);

		// init socket
		app.Socket = new Wu.Socket();

		// error handling
		app._initErrorHandling();

		// set page title
		document.title = app.options.portalTitle;

		// get objects from server
		app.initServer();

		// init sniffers
		app._initSniffers();

	},

	_initSniffers : function () {

		// Detect mobile devices
		app.detectMobile();

		// get user agent
		app.sniffer = Sniffer(navigator.userAgent);
	},
	
	_initErrorHandling : function () {

		// log all errors
		window.onerror = app._onError;

		// forward console.error's to log also
		// console.error = function (message) {
		// 	try { throw Error(message); } 
		// 	catch (e) {}
		// }
	},

	_onError : function (message, file, line, char, ref) {
		var stack = ref.stack;
		var project = app.activeProject ? app.activeProject.getTitle() : 'No active project';
		var username = app.Account ? app.Account.getName() : 'No username';
		var options = JSON.stringify({
			message : message,
			file : file,
			line : line,
			user : username,
			stack : stack,
			project : project
		});
		Wu.save('/api/error/log', options); // todo: move req to api.js
	},

	_checkForInvite : function () {
		var pathname = window.location.pathname;
		if (pathname.indexOf('/invite/') == -1) return;
		var invite_token = pathname.split('/').reverse()[0];
		if (invite_token) app.options.invite_token = invite_token;
	},

	initServer : function () {
		console.log('Securely connected to server: \n', app.options.servers.portal);

		// check for invite link
		app._checkForInvite();

		// data for server
		var data = JSON.stringify(app.options);

		// get portal
		app.api.getPortal(function (err, response) {
			if (err) return console.error('Something went wrong.');

			// parse
			var store = Wu.parse(response);

			// build app
			app.build(store)
		});
	},


	build : function (portalStore) {

		// set vars
		app.options.json = portalStore;

		// load json model
		app._initObjects();

		// create app container
		app._initContainer();

		// init chrome
		app._initChrome();

		// create panes
		app._initPanes();

		// init pane view
		app._initView();

		// ready
		app._ready = true; // todo: fire app ready event

		// log entry
		app._logEntry();

		// analytics
		app.Analytics = new Wu.Analytics();
	},

	_logEntry : function () {
		var b = app.sniffer.browser;
		var o = app.sniffer.os;
		var browser = b.fullName + ' ' + b.majorVersion + '.' + b.minorVersion;
		var os = o.fullName + ' ' + o.majorVersion + '.' + o.minorVersion;

		app.Socket.sendUserEvent({
		    	user : app.Account.getFullName(),
		    	event : 'entered',
		    	description : 'the wu: `' + browser + '` on `' + os + '`',
		    	timestamp : Date.now()
		});
	},

	_initObjects : function () {

		// data controller
		app.Data = new Wu.Data();

		// controller .. todo: refactor what's in controller.. or expand..
		app.Controller = new Wu.Controller();

		// main user account
		app.Account = new Wu.User(app.options.json.account);

		// contact list
		app.Users = {};
		app.Account.getContactList().forEach(function(user) {
		       app.Users[user.uuid] = new Wu.User(user);    
		});
		app.options.json.users.project_users.forEach(function(user) {
		       if (!app.Users[user.uuid]) app.Users[user.uuid] = new Wu.User(user);             
		});

		// add self to users list
		app.Users[app.Account.getUuid()] = app.Account;

		// create project objects
		app.Projects = {};
		app.options.json.projects.forEach(function(elem, i, arr) {
		       app.Projects[elem.uuid] = new Wu.Project(elem);
		});
	},

	_initChrome : function () {

		// chrome
		app.Chrome = {};

		// top chrome
		app.Chrome.Top = new Wu.Chrome.Top();

		// right chrome
		app.Chrome.Right = new Wu.Chrome.Right();

		// right chrome
		app.Chrome.Left = new Wu.Chrome.Left();
	},

	_initPanes : function () {

		// render tooltip
		app.Tooltip = new Wu.Tooltip();

		// render style handler
		app.Style = new Wu.Style();

		// render progress bar
		app.ProgressBar = new Wu.ProgressPane({
			color : 'white',
			addTo : app._appPane
		});

		// render map pane
		app.MapPane = new Wu.MapPane();

		// render eror pane
		app.FeedbackPane = new Wu.FeedbackPane();

		// settings pane
		app.MapSettingsPane = new Wu.MapSettingsPane();

		// share pane
		app.Share = new Wu.Share();

		// add account tab
		// app.Account.addAccountTab();
		app.AccountPane = new Wu.Pane.Account();
	},

	// init default view on page-load
	_initView : function () {

		// check invite
		if (app._initInvite()) return;

		// check location
		if (app._initLocation()) return;
			
		// runs hotlink
		if (app._initHotlink()) return;

		// open first project (ordered by lastUpdated)
		app.Controller.openLastUpdatedProject();
	},

	_initInvite : function () {
		var project = app.options.json.invite;

		if (!project) return false;

		// select project
		Wu.Mixin.Events.fire('projectSelected', {detail : {
			projectUuid : project.id
		}});

		app.feedback.setMessage({
			title : 'Project access granted',
			description : 'You\'ve been given access to the project ' + project.name 
		});
	},

	_initLocation : function () {
		var path    = window.location.pathname,
		    username  = path.split('/')[1],
		    project = path.split('/')[2],
		    hash    = path.split('/')[3],
		    search  = window.location.search.split('?'),
		    params  = Wu.Util.parseUrl();

		// done if no location
		if (!username || !project) return false;

		// get project
		var project = app._projectExists(project, username);
		
		// return if no such project
		if (!project) {
			Wu.Util.setAddressBar(app.options.servers.portal);
			return false;
		}

		// set project
		app._setProject(project);

		// init hash
		if (hash) {
			console.log('got hash!', hash, project);
			app._initHash(hash, project);
		}
		return true;
	},

	_initHotlink : function () {
		
		// parse error prone content of hotlink..
		app.hotlink = Wu.parse(window.hotlink);

		// return if no hotlink
		if (!app.hotlink) return false;

		// check if project slug exists, and if belongs to client slug
		var project = app._projectExists(app.hotlink.project, app.hotlink.client);

		// return if not found
		if (!project) return false;

		// set project
		app._setProject(project);

		return true;
	},


	// check if project exists (for hotlink)
	_projectExists : function (project_slug, username) {

		// find project slug in Wu.app.Projects
		var project_slug = project_slug || window.hotlink.project;
		for (p in Wu.app.Projects) {
			var project = Wu.app.Projects[p];
			if (project_slug == project.store.slug) {
				if (project.store.createdByUsername == username) {
					return project; 
				}
			}
		}
		return false;
	},

	_initEvents : function () {
	},

	_getDimensions : function (e) {
		var w = window,
		    d = document,
		    e = d.documentElement,
		    g = d.getElementsByTagName('body')[0],
		    x = w.innerWidth || e.clientWidth || g.clientWidth,
		    y = w.innerHeight|| e.clientHeight|| g.clientHeight,
		    d = {
			height : y,
			width : x,
			e : e
		    }
		return d;
	},

	_initContainer : function () {

		// find or create container
		var id = app.options.id;
		app._appPane = Wu.DomUtil.get(id) || Wu.DomUtil.createId('div', id || 'app', document.body);

		// create map container
		app._mapContainer = Wu.DomUtil.createId('div', 'map-container', app._appPane);
	},

	_setProject : function (project) {

		// select project
		Wu.Mixin.Events.fire('projectSelected', {detail : {
			projectUuid : project.getUuid()
		}});
	},

	// get name provided for portal from options hash 
	getPortalName : function () {
		return app.options.portalName;
	},

	// shorthands for setting status bar
	setStatus : function (status, timer) {
		// app.StatusPane.setStatus(status, timer);
	},

	setSaveStatus : function (delay) {
		// app.StatusPane.setSaveStatus(delay);
	},

	// todo: move hashes to own script
	_initHash : function (hash, project) {

		// get hash values from server,
		app.getHash(hash, project, app._renderHash);
		return true;
	},

	// get saved hash
	getHash : function (id, project, callback) {

		// get a saved setup - which layers are active, position, 
		Wu.post('/api/project/hash/get', JSON.stringify({
			projectUuid : project.getUuid(),
			id : id
		}), callback, this);
	},

	_renderHash : function (context, json) {

		// parse
		var result = JSON.parse(json); 

		// handle errors
		if (result.error) console.log('error?', result.error);

		// set vars
		var hash = result.hash;
		var projectUuid = hash.project || result.project;	// hacky.. clean up setHash, _renderHash, errything..
		var project = app.Projects[projectUuid];

		// select project
		project.selectProject();

		// set position
		app.MapPane.setPosition(hash.position);

	},

	// save a hash 
	setHash : function (callback, project) {

		// get active layers
		var active = app.MapPane.getControls().layermenu._getActiveLayers();
		var layers = _.map(active, function (l) {
			return l.item.layer;
		})

		// get project;
		var project = project || app.activeProject;

		// save hash to server
		Wu.post('/api/project/hash/set', JSON.stringify({
			projectUuid : project.getUuid(),
			hash : {
				id 	 : Wu.Util.createRandom(6),
				position : app.MapPane.getPosition(),
				layers 	 : layers 			// layermenuItem uuids, todo: order as z-index
			}
		}), callback, this);

	},


	// todo: move phantom to own script.. app.phantomjs = new Wu.PhantomJS()
	phantomJS : function (args) {
		var projectUuid = args.projectUuid,
	   	    hash    	= args.hash,
	   	    isThumb     = args.thumb;

	   	// return if no project
	   	if (!projectUuid) return false;

	   	// set hash for phantom
	   	this._phantomHash = hash;

		// get project
		var project = app.Projects[projectUuid];
		
		// return if no such project
		if (!project) return false;

		// check for hash
		if (hash) {

			// select project
			project.selectProject();

			// set position
			app.MapPane.setPosition(hash.position);

			setTimeout(function () {

				// deselect all default layers
				var map = app._map;
				var lm = app.MapPane.getControls().layermenu;
				var activeLayers = lm._getActiveLayers();
				activeLayers.forEach(function (al) {
					al.layer.remove(map);
				});

				// set layers
				hash.layers.forEach(function (layerUuid) { 	
										
					// add layer
					var layer = project.getLayer(layerUuid);

					// if in layermenu
					var bases = project.getBaselayers();
					var base = _.find(bases, function (b) {
						return b.uuid == layerUuid;
					});

					if (base) {
						// add as baselayer
						layer.add('baselayer'); 
					} else {
						layer.add();
					}
					
				}, this);

			}.bind(this), 2000);


		}

		// add phantomJS stylesheet		
		isThumb ? app.Style.phantomJSthumb() : app.Style.phantomJS();

		app._isPhantom = true;

	},
	
	_setPhantomArgs : function (args) {
		app._phantomArgs = args;
	},
	
	phantomReady : function () {
		if (!app.activeProject) return false;

		var hashLayers = _.size(app._phantomHash.layers),
		    baseLayers = _.size(app.activeProject.getBaselayers()),
		    numLayers = hashLayers + baseLayers;

		// check if ready for screenshot
		if (!app._loaded || !app._loading) return false;

		// if no layers, return
		if (numLayers == 0) return true;

		// if not loaded, return
		if (app._loaded.length == 0 ) return false; 

		// if all layers loaded
		if (app._loaded.length == numLayers) return true;

		// not yet
		return false;
	},

	// phantomjs: loaded layers
	_loaded : [],

	_loading : [],

	// todo: move to own script
	detectMobile : function() {
		
		// Detect if it's a mobile
		if (L.Browser.mobile) {

			// Set mobile state to true
			Wu.app.mobile = false;
			Wu.app.pad = false;
			
			// Get screen resolution
			var w = screen.height;
			var h = screen.width;

			// Store resolution
			Wu.app.nativeResolution = [w, h];

			if ( w >= h ) var smallest = h;
			else var smallest = w;

			// Mobile phone
			if ( smallest < 450 ) {

				Wu.app.mobile = true;
				var mobilestyle = 'mobilestyle.css'
			// Tablet
			} else {

				Wu.app.pad = true;
				var mobilestyle = 'padstyle.css'
			}

			// Get the styletag
			var styletag = document.getElementById('mobilestyle');
			// Set stylesheet for 
			var styleURL = '<link rel="stylesheet" href="' + app.options.servers.portal + 'css/' + mobilestyle + '">';
			styletag.innerHTML = styleURL;
			
		}
	},

	debug : function () {

		// add red borders to tiles
		app.Style.setStyle('img.leaflet-tile', {
			'border-top': '1px solid rgba(255, 0, 0, 0.65)',
			'border-left': '1px solid rgba(255, 0, 0, 0.65)'
		});

		// click event to get tile address
		if (app._map) app._map.on('mousedown', function (e) {
			var lat = e.latlng.lat;
			var lng = e.latlng.lng;
			var zoom = app._map.getZoom();
			var tile = app._getTileURL(lat, lng, zoom);

			// log to console
			console.log('tile:', tile);
		});

		// extend Number with toRad
		if (typeof(Number.prototype.toRad) === "undefined") {
			Number.prototype.toRad = function() {
				return this * Math.PI / 180;
			}
		}
	},

	// for debug
	_getTileURL : function (lat, lon, zoom) {
		var xtile = parseInt(Math.floor( (lon + 180) / 360 * (1<<zoom) ));
		var ytile = parseInt(Math.floor( (1 - Math.log(Math.tan(lat.toRad()) + 1 / Math.cos(lat.toRad())) / Math.PI) / 2 * (1<<zoom) ));
		return "" + zoom + "/" + xtile + "/" + ytile;
	},

});