Wu.PhantomJS = Wu.Class.extend({


	// called from server-side phantomJS script
	get : function (options, done) {

		console.log('PhantomJSXXXXXX', options);

		// request project from server
		app.api.getPrivateProject({
			project_id : options.project_id,
			user_access_token : options.user_access_token,
		}, function (err, project_json) {
			// if (err) return app._login('Please log in to view this private project.');
			console.log('err, project_json', err, project_json);

			var project_store = Wu.parse(project_json);

			// import project
			app._importProject(project_store, function (err, project) {
				app._setProject(project);

				setTimeout(function () {

					// call phantom
					window.callPhantom({text: project.name});
					
				}, 1000);
			});
		});



		

	},





});