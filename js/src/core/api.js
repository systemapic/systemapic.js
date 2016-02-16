Wu.Api = Wu.Class.extend({

	// initialize : function (options) {
	// },

	shareDataset : function (options, done) {
		var path = '/api/dataset/share'; // todo: fix api names, organize
		this.post(path, options, done);
	},

	deleteDataset : function (options, done) {
		var path = '/api/file/delete';
		this.post(path, options, done);
	},

	getPortal : function (done) {
		var path = '/api/portal';
		this.post(path, {}, done);
	},

	createProject : function (options, done) {
		var path = '/api/project/create';
		this.post(path, options, done);
	},

	updateProject : function (options, done) {
		var path = '/api/project/update';
		this.post(path, options, done);
	},

	deleteProject : function (options, done) {
		var path = '/api/project/delete';
		this.post(path, options, done);
	},

	auth : function (done) {
		var path = '/api/user/session';
		this.post(path, {}, done);
	},

	getTokenFromPassword : function (options, done) {
		var path = '/api/token';
		this.post(path, options, done);
	},

	updateFile : function (options, done) {
		var path = '/api/file/update';
		this.post(path, options, done);
  	},

	deleteLayer : function (options, done) {
		var path = '/api/layers/delete';
		this.post(path, options, done);
	},

	getHash : function (options, done) {
		var path = '/api/project/hash/get';
		this.post(path, options, done);
	},

	updateLayer : function (options, done) {
		var path = '/api/layer/update';
		this.post(path, options, done);
	},

	setCartocss : function (options, done) {
		var path = '/api/layers/cartocss/set';
		this.post(path, options, done);
	},

	getCartocss : function (options, done) {
		var path = '/api/layers/cartocss/get';
		this.post(path, options, done);
	},

	createLegends : function (options, done) {

		// return;
		
		// console.log('%c createlegends ', 'background: brown: color: white;');
		var path = '/api/layer/createlegends';
		// console.log('path', path);
		// console.log('options', options);
		
		this.post(path, options, done);
	},

	getfeaturesvalues : function (options, done) {
		var path = '/api/util/getfeaturesvalues';
		this.post(path, options, done);
	},

	hashSet : function (options, done) {
		var path = '/api/project/hash/set';
		this.post(path, options, done);
	},

	fileGetLayers : function (options, done) {
		var path = '/api/file/getLayers';
		this.post(path, options, done);
	},

	downloadDataset : function (options, done) {
		var path = '/api/file/downloadDataset';
		this.post(path, options, done);
	},

	downloadLayerDataset : function (options, done) {
		var path = '/api/layer/downloadDataset';
		this.post(path, options, done);
	},

	createThumb : function (options, done) {
		var path = '/api/util/createThumb';
		this.post(path, options, done);
	},

	pdfsnapshot : function (options, done) {
		var path = '/api/util/pdfsnapshot';
		this.post(path, options, done);
	},

	analyticsSet : function (options, done) {
		var path = '/api/analytics/set';
		this.post(path, options, done);
	},

	projectSetAccess  : function (options, done) {
		var path = '/api/project/setAccess';
		this.post(path, options, done);
	},

	userInvite : function (options, done) {
		var path = '/api/user/invite';
		this.post(path, options, done);
	},

	dbFetchArea : function (options, done) {
		var path = '/api/db/fetchArea';
		this.post(path, options, done);
	},

	dbFetch : function (options, done) {
		var path = '/api/db/fetch';
		this.post(path, options, done);
	},

	setrolemember : function (options, done) {
		var path = '/api/access/super/setrolemember';
		this.post(path, options, done);
	},

	portalSetrolemember : function (options, done) {
		var path = '/api/access/portal/setrolemember';
		this.post(path, options, done);
	},

	requestContact : function (options, done) {
		var path = '/api/user/requestContact';
		this.post(path, options, done);
	},

	inviteToProjects : function (options, done) {
		var path = '/api/user/inviteToProjects';
		this.post(path, options, done);
	},

	utilSnapshot : function (options, done) {
		var path = '/api/util/snapshot';
		this.post(path, options, done);
	},

	errorLog : function (options, done) {
		var path = '/api/error/log';
		this.post(path, options, done);
	},

	clientNew : function (options, done) {
		var path = '/api/client/new';
		this.post(path, options, done);
	},

	clientDelete : function (options, done) {
		var path = '/api/client/delete';
		this.post(path, options, done);
	},

	createLayer : function (options, done) {
		var path = '/api/layers/new';
		this.post(path, options, done);
	},

	createTileLayer : function (options, done) {
		var path = '/api/db/createLayer';
		this.post(path, options, done);
	},

	createDefaultLayer : function (options, done) {
		var path = '/api/layers/default';
		this.post(path, options, done);
	},

	deleteUser : function (options, done) {
		var path = '/api/user/delete';
		this.post(path, options, done);
	},

	createOsmLayer : function (options, done) {
		var path = '/api/layers/osm/new';
		this.post(path, options, done);
	},

	fetchHistogram : function (options, done) {
		var path = '/api/db/fetchHistogram';
		this.post(path, options, done);
	},

	accessSetrolemember : function (options, done) {
		var path = '/api/access/setrolemember';
		this.post(path, options, done);
	},

	analyticsGet : function (options, done) {
		var path = '/api/analytics/get';
		this.post(path, options, done);
	},

	clientUpdate : function (options, done) {
		var path = '/api/client/update';
		this.post(path, options, done);
	},

	inviteLink : function (options, done) {
		var path = '/api/invite/link';
		this.post(path, options, done);
	},

	addFileToTheProject : function (options, done) {
		var path = '/api/file/addtoproject';
		this.post(path, options, done);
	},

  	getProject : function (options, done) {
  		var path = '/api/project/get/public';
		this.post(path, options, done)
  	},

  	getPrivateProject : function (options, done) {
  		var path = '/api/project/get/private';
		this.post(path, options, done)
  	},
	
  	resetPassword : function (options, done) {
   		var path = '/reset';
		this.post(path, options, done) 		
  	},

	reloadMeta : function (options, done) {
		var path = '/api/layer/reloadmeta';
		this.post(path, options, done);
	},

	json2carto : function (options, done) {
		var path = '/api/geo/json2carto';
		this.post(path, options, done);
	},

	updateUser: function (options, done) {
		var path = '/api/user/update';
		this.post(path, options, done);
	},

	uniqueEmail: function (options, done) {
		var path = '/api/user/uniqueEmail';
		this.post(path, options, done);
	},

	uniqueUsername: function (options, done) {
		var path = '/api/user/uniqueUsername';
		this.post(path, options, done);
	},

	addInvites: function (options, done) {
		var path = '/api/project/addInvites';
		this.post(path, options, done);
	},

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
					console.log('http.status: ', http.status);
					console.log('httP', http);
					done && done(http.status, http.responseText);
				}
			}

		}

		// add access_token to request
		var access_token = app.tokens ? app.tokens.access_token : null;
		var options = _.isString(json) ? Wu.parse(json) : json;
		options.access_token = access_token;
		var send_json = Wu.stringify(options);

		// send
		http.send(send_json);
	},
});