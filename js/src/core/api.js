Wu.Api = Wu.Class.extend({

	

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



	auth : function (done) {
		var path = '/api/user/info';
		this.post(path, {}, done);
		// console.log('auth!');
		// done(null);

	},


















	// helper fn's
	post : function (path, options, done) {
		this._post(path, JSON.stringify(options), function (err, response) {
			done && done(err, response);
		});
	},
	_post : function (path, json, done, context, baseurl) {
		var that = context;
		var http = new XMLHttpRequest();
		var url = baseurl || Wu.Util._getServerUrl();
		
		url += path;

		http.open("POST", url, true);

		//Send the proper header information along with the request
		http.setRequestHeader('Content-type', 'application/json');

		// set access_token on header
		// http.setRequestHeader("Authorization", "Bearer " + app.tokens.access_token);

		http.onreadystatechange = function() {
			if(http.readyState == 4 && http.status == 200) {

				// verify response
				// var valid = Wu.verify(http.responseText);

				// callback
				done && done(null, http.responseText); 
			}
		}

		// add access_token
		if (_.isString(json)) {
			var parsed = Wu.parse(json);
			parsed.access_token = app.tokens.access_token;
			var send_json = JSON.stringify(parsed);

		} else {
			json.access_token = app.tokens.access_token;
			var send_json = JSON.stringify(json);
		}

		// stringify objects
		// if (Wu.Util.isObject(json)) json = JSON.stringify(json);

		http.send(send_json);
	},


});