Wu.Api = Wu.Class.extend({









	// PORTAL


	getPortal : function (done) {
		// var path = '/api/portal';	// TODO: GET request
		var path = '/v2/portal';
		this.post(path, {}, done);
	},












	// PROJECTS


	createProject : function (options, done) {
		// var path = '/api/project/create';
		var path = '/v2/projects/create';
		this.post(path, options, done);
	},

	updateProject : function (options, done) {
		// var path = '/api/project/update';
		var path = '/v2/projects/update';
		this.post(path, options, done);
	},

	deleteProject : function (options, done) {
		// var path = '/api/project/delete';
		var path = '/v2/projects/delete';
		this.post(path, options, done);
	},

	getProject : function (options, done) {
  		// var path = '/api/project/get/public';
  		var path = '/v2/projects/public';		// todo: GET request
		this.post(path, options, done)
  	},

  	getPrivateProject : function (options, done) {
  		// var path = '/api/project/get/private';
  		var path = '/v2/projects/private';
		this.post(path, options, done)
  	},

  	addFileToTheProject : function (options, done) {
		// var path = '/api/file/addtoproject';
		var path = '/v2/projects/data';
		this.post(path, options, done);
	},

	projectSetAccess  : function (options, done) {
		// var path = '/api/project/setAccess';
		var path = '/v2/projects/access';		// todo: refactor to update
		this.post(path, options, done);
	},







  	// USERS


	auth : function (done) {
		// var path = '/api/user/session';		// TODO: GET request
		var path = '/v2/users/session';
		this.post(path, {}, done);
	},

	getTokenFromPassword : function (options, done) {	// TODO: GET request
		// var path = '/api/token';
		var path = '/v2/users/token';
		this.post(path, options, done);
	},

	deleteUser : function (options, done) {
		// var path = '/api/user/delete';
		var path = '/v2/users/delete';
		this.post(path, options, done);
	},

	updateUser: function (options, done) {
		// var path = '/api/user/update';
		var path = '/v2/users/update';
		this.post(path, options, done);
	},

	uniqueEmail: function (options, done) {
		// var path = '/api/user/uniqueEmail';
		var path = '/v2/users/email/unique';	// todo: refactor, just check if user email
		this.post(path, options, done);
	},

	uniqueUsername: function (options, done) {
		// var path = '/api/user/uniqueUsername';
		var path = '/v2/users/username/unique';
		this.post(path, options, done);
	},

	requestContact : function (options, done) {
		// var path = '/api/user/requestContact';
		// var path = '/v2/contacts/request';			// todo: move to /users/
		var path = '/v2/users/contacts/request';			// todo: move to /users/
		this.post(path, options, done);
	},
	
	resetPassword : function (options, done) {
   		// var path = '/reset';
   		var path = '/v2/users/password/reset';
		this.post(path, options, done) 		
  	},

	userInvite : function (options, done) {
		// var path = '/api/user/invite';
		// var path = '/v2/invites/user';	// todo: refactor invite endpoints
		var path = '/v2/users/invite';
		this.post(path, options, done);
	},

	addInvites: function (options, done) {
		// var path = '/api/project/addInvites';
		// var path = '/v2/invites/project';
		var path = '/v2/users/invite/project';	// todo: refactor, see /v2/users/invite/projects (with s) below
		this.post(path, options, done);
	},

	inviteLink : function (options, done) {
		// var path = '/api/invite/link';
		// var path = '/v2/invites/link';
		var path = '/v2/users/invite/link';
		this.post(path, options, done);
	},

	inviteToProjects : function (options, done) {
		// var path = '/api/user/inviteToProjects';
		// var path = '/v2/invites/user/project';		//todo: refactor
		var path = '/v2/users/invite/projects';		//todo: refactor
		this.post(path, options, done);
	},

	













	// DATA 


	shareDataset : function (options, done) {
		// var path = '/api/dataset/share'; // todo: fix api names, organize
		var path = '/v2/data/share'; // todo: fix api names, organize
		this.post(path, options, done);
	},

	deleteDataset : function (options, done) {
		// var path = '/api/file/delete';
		var path = '/v2/data/delete';
		this.post(path, options, done);
	},

	updateFile : function (options, done) {
		// var path = '/api/file/update';
		var path = '/v2/data/update';
		this.post(path, options, done);
  	},

  	fileGetLayers : function (options, done) {
		// var path = '/api/file/getLayers';
		var path = '/v2/data/layers';			// TODO: GET request
		this.post(path, options, done);
	},

	downloadDataset : function (options, done) {
		// var path = '/api/file/downloadDataset';
		var path = '/v2/data/download';
		this.post(path, options, done);
	},








  	// LAYERS


	deleteLayer : function (options, done) {
		// var path = '/api/layers/delete';
		var path = '/v2/layers/delete';
		this.post(path, options, done);
	},

	updateLayer : function (options, done) {
		// var path = '/api/layer/update';
		var path = '/v2/layers/update';
		this.post(path, options, done);
	},

	setCartocss : function (options, done) {
		// var path = '/api/layers/cartocss/set';
		var path = '/v2/layers/carto';
		this.post(path, options, done);
	},

	getCartocss : function (options, done) {
		// var path = '/api/layers/cartocss/get';
		var path = '/v2/layers/carto/get';		// TODO: GET request
		this.post(path, options, done);
	},

	json2carto : function (options, done) {
		// var path = '/api/geo/json2carto';
		// var path = '/v2/carto/json';
		var path = '/v2/layers/carto/json';
		this.post(path, options, done);
	},

	downloadLayerDataset : function (options, done) {
		// var path = '/api/layer/downloadDataset';
		var path = '/v2/layers/download';
		this.post(path, options, done);
	},

	createLayer : function (options, done) {
		// var path = '/api/layers/new';
		var path = '/v2/layers/create';
		this.post(path, options, done);
	},

	createDefaultLayer : function (options, done) {
		// var path = '/api/layers/default';			// todo: refactor
		var path = '/v2/layers/create/default';
		this.post(path, options, done);
	},

	reloadMeta : function (options, done) {
		// var path = '/api/layer/reloadmeta';
		var path = '/v2/layers/meta';
		this.post(path, options, done);
	},

	






	// TILES
	// [pile]
	createTileLayer : function (options, done) {
		var path = '/v2/tiles/create';
		this.post(path, options, done);
	},














	// LEGENDS


	createLegends : function (options, done) {
		// var path = '/api/layer/createlegends';
		var path = '/v2/legends/create';
		this.post(path, options, done);
	},

	

	




















	// CARTO












	// HASHES
	
	
	getHash : function (options, done) {
		// var path = '/api/project/hash/get';
		var path = '/v2/hashes/get';		// todo: GET request
		this.post(path, options, done);
	},

	hashSet : function (options, done) {
		// var path = '/api/project/hash/set';
		var path = '/v2/hashes/set';
		this.post(path, options, done);
	},





	// QUERIES

	
	dbFetchArea : function (options, done) {
		var path = '/v2/query/polygon';
		this.post(path, options, done);
	},

	dbFetch : function (options, done) {
		var path = '/v2/query/point';
		this.post(path, options, done);
	},

	fetchHistogram : function (options, done) {
		var path = '/v2/query/histogram';
		this.post(path, options, done);
	},




	// LOG


	errorLog : function (options, done) {
		// var path = '/api/error/log';
		var path = '/v2/log/error';
		this.post(path, options, done);
	},

	analyticsSet : function (options, done) {
		// var path = '/api/analytics/set';
		var path = '/v2/log';
		this.post(path, options, done);
	},

	analyticsGet : function (options, done) {
		// var path = '/api/analytics/get';
		var path = '/v2/log/get';		// todo: GET request
		this.post(path, options, done);
	},









	// STATIC



	createThumb : function (options, done) {
		// var path = '/api/util/createThumb';
		var path = '/v2/static/thumb';		// todo: GET ?
		this.post(path, options, done);
	},

	pdfsnapshot : function (options, done) {
		// var path = '/api/util/pdfsnapshot';
		var path = '/v2/static/pdf';
		this.post(path, options, done);
	},

	utilSnapshot : function (options, done) {
		// var path = '/api/util/snapshot';
		var path = '/v2/static/screen';
		this.post(path, options, done);
	},

	
	

	// setrolemember : function (options, done) {
	// 	var path = '/api/access/super/setrolemember';
	// 	this.post(path, options, done);
	// },

	// portalSetrolemember : function (options, done) {
	// 	var path = '/api/access/portal/setrolemember';
	// 	this.post(path, options, done);
	// },

	

	
	// clientNew : function (options, done) {
	// 	var path = '/api/client/new';
	// 	this.post(path, options, done);
	// },

	// clientDelete : function (options, done) {
	// 	var path = '/api/client/delete';
	// 	this.post(path, options, done);
	// },

	

	

	// accessSetrolemember : function (options, done) {
	// 	var path = '/api/access/setrolemember';
	// 	this.post(path, options, done);
	// },

	

	// clientUpdate : function (options, done) {
	// 	var path = '/api/client/update';
	// 	this.post(path, options, done);
	// },

	
	// helper fn's
	post : function (path, options, done) {
		this._post(path, JSON.stringify(options), function (err, response) {
			done && done(err, response);
		});
	},

	_post : function (path, json, done, context, baseurl) {
		var http = new XMLHttpRequest();
		var url = baseurl || Wu.Util._getServerUrl();
		url += path;

		// open
		http.open("POST", url, true);

		// set json header
		http.setRequestHeader('Content-type', 'application/json');

		// response
		http.onreadystatechange = function() {
			if (http.readyState == 4) {
				if (http.status == 200) {
					done && done(null, http.responseText); 
				} else {
					done && done(http.status, http.responseText);
				}
			}
		};

		// add access_token to request
		var access_token = app.tokens ? app.tokens.access_token : null;
		var options = _.isString(json) ? Wu.parse(json) : json;
		options.access_token = access_token;
		var send_json = Wu.stringify(options);

		// send
		http.send(send_json);
	},

	get : function (path, options, done) {
		this._get(path, JSON.stringify(options), function (err, response) {
			done && done(err, response);
		});
	},

	_get : function (path, json, done, context, baseurl) {
		var http = new XMLHttpRequest();
		var url = baseurl || Wu.Util._getServerUrl();
		url += path;

		// open
		http.open("GET", url, true);

		// set json header
		http.setRequestHeader('Content-type', 'application/json');

		// response
		http.onreadystatechange = function() {
			if (http.readyState == 4) {
				if (http.status == 200) {
					done && done(null, http.responseText);
				} else {
					done && done(http.status, http.responseText);
				}
			}
		};

		// add access_token to request
		var options = _.isString(json) ? Wu.parse(json) : json;
		options.access_token = app.tokens ? app.tokens.access_token : null;
		var send_json = Wu.stringify(options);

		// send
		http.send(send_json);
	}

});