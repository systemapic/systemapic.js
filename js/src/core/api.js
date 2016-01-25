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

	verifyAccessToken : function () {
		var path = '/api/token/check';
		this.post(path, {}, function (err, body) {
			if (err == 401) console.error('you been logged out');
		});
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
		this.post(path, options, done)
  	},


  	getProject : function (options, done) {
  		var path = '/api/project/get';
		this.post(path, options, done)
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