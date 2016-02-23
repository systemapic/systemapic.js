Wu.Invite = Wu.Class.extend({

	options : {

	},

	initialize : function (options) {

		// set options
		Wu.setOptions(this, options);

		// invite store
		this._invite = options.store || {};

		// set config
		this.config = systemapicConfigOptions;

		// set api
		this.api = new Wu.Api({url : window.location.origin });

		console.log('this.api', this.api);

		// set page title
		document.title = this.config.portalTitle;

		// init container
		this._initContainer();

		// init content
		this._initContent();
	},

	_initContainer : function () {
		this._container = Wu.DomUtil.get(this.options.container);
	},

	_initContent : function () {

		// logo
		this._createLogo();

		// wrapper
		this._centralWrapper = Wu.DomUtil.create('div', 'central', this._container);

		// login
		this._createLogin();

		// register
		this._createRegister();

		// shade login on load
		this._rightshader.style.opacity = 1;
	},

	_createLogo : function () {

		// wrap
		var logo_wrap = Wu.DomUtil.create('div', 'logo-wrap', this._container);

		// logo
		var logo = Wu.DomUtil.create('div', 'logo', logo_wrap);

		// set image
		var logo_img = this.config.invitationLogo;
		logo.style.backgroundImage = logo_img;
		
		// set width
		var width = this.config.loginLogoWidth || 210;
		logo.style.width = width + 'px';
	},
	

	_createLogin : function () {

		// login wrapper
		var wrapper = Wu.DomUtil.create('div', 'left', this._centralWrapper);

		// shader
		this._rightshader = Wu.DomUtil.create('div', 'shader', wrapper);

		// label
		var label = Wu.DomUtil.create('div', 'top-label', wrapper, 'Log in');
	
		// wrapper
		var input_wrapper = Wu.DomUtil.create('form', 'input-wrapper', wrapper);

		// email label
		var email_input = Wu.DomUtil.create('input', 'input', input_wrapper, 'Email Address');
		email_input.setAttribute('name', 'email');

		// password label
		var password_input = Wu.DomUtil.create('input', 'input', input_wrapper, 'Password');
		password_input.setAttribute('type', 'password');
		password_input.setAttribute('name', 'password');

		// button
		var button = Wu.DomUtil.create('button', 'button', input_wrapper, 'Login');

		// forgot password
		var forgotWrapper = Wu.DomUtil.create('div', 'forgot-wrapper', input_wrapper);
		var forgotLink = Wu.DomUtil.create('a', 'forgot-link', forgotWrapper, 'Forgot your password?');
		forgotLink.setAttribute('href', 'https://' + window.location.host + '/forgot');

		// shader
		Wu.DomEvent.on(wrapper, 'mouseenter', function () {
			this._rightshader.style.opacity = 0;
			this._leftshader.style.opacity = 1;
		}, this);


		Wu.DomEvent.on(button, 'click', function (e) {
			Wu.DomEvent.stop(e);

			// accept invite, login
			this._loginUser({
				email : email_input.value,
				password : password_input.value,
				invite_token : this._invite.token
			});

		}, this);
	},

	_createRegister : function () {

		// register
		var wrapper = this._rightWrapper = Wu.DomUtil.create('div', 'right', this._centralWrapper);

		// shader
		this._leftshader = Wu.DomUtil.create('div', 'shader', wrapper);

		// label
		var label = Wu.DomUtil.create('div', 'top-label', wrapper, 'Create account');

		// form
		var input_wrapper = Wu.DomUtil.create('form', 'input-wrapper-right', wrapper);

		// username
		var username_input = Wu.DomUtil.create('input', 'input firstname', input_wrapper, 'Choose a username');
		username_input.setAttribute('name', 'username');

		// first name
		var firstname_input = Wu.DomUtil.create('input', 'input firstname', input_wrapper, 'First Name');
		firstname_input.setAttribute('name', 'firstname');

		// last name
		var lastname_input = Wu.DomUtil.create('input', 'input lastname', input_wrapper, 'Last Name');
		lastname_input.setAttribute('name', 'lastname');

		// company
		var company_input = Wu.DomUtil.create('input', 'input company', input_wrapper, 'Company');
		company_input.setAttribute('name', 'company');

		// position
		var position_input = Wu.DomUtil.create('input', 'input position', input_wrapper, 'Position');
		position_input.setAttribute('name', 'position');

		// email
		var email_input = Wu.DomUtil.create('input', 'input email', input_wrapper, 'Email Address');
		email_input.setAttribute('name', 'email');
		email_input.value = this._invite.email || '';

		// password label
		var password_input = Wu.DomUtil.create('input', 'input password', input_wrapper, 'Password (minimum 8 characters)');
		password_input.setAttribute('type', 'password');
		password_input.setAttribute('name', 'password');

		// hidden
		var invite_token = Wu.DomUtil.create('input', '', input_wrapper);
		invite_token.value = this._invite.token || false;
		invite_token.style.display = 'none';
		invite_token.setAttribute('name', 'invite_token');

		// privacy policy
		var privacy_checkbox = Wu.DomUtil.create('input', '', input_wrapper, 'Password (minimum 8 characters)');
		privacy_checkbox.setAttribute('type', 'checkbox');
		privacy_checkbox.id = 'privacy-checkbox';
		var privacy_label = document.createElement('label')
		privacy_label.htmlFor = 'privacy-checkbox';
		privacy_label.innerHTML = 'I have read and agree to Systemapic\'s <a href="privacy-policy" target="_blank">Terms and Conditions</a>';
		input_wrapper.appendChild(privacy_label);

		// submit button
		var button = this._submitBtn = Wu.DomUtil.create('button', 'button', input_wrapper, 'Sign up');
		button.disabled = true;

		// enable submit button when privacy policy is accepted
		Wu.DomEvent.on(privacy_checkbox, 'click', function () {
			button.disabled = !privacy_checkbox.checked;
			this._privacyChecked = privacy_checkbox.checked;
			this.checkSubmitBtn();
		}, this);

		// shader
		Wu.DomEvent.on(wrapper, 'mouseenter', function () {
			this._rightshader.style.opacity = 1;
			this._leftshader.style.opacity = 0;
		}, this);

		Wu.DomEvent.on(button, 'click', function (e) {
			Wu.DomEvent.stop(e);
			
			// create user, accept invite, login
			this._registerUser({
				username : username_input.value,
				email : email_input.value,
				firstname : firstname_input.value,
				lastname : lastname_input.value,
				position : position_input.value,
				company : company_input.value,
				password : password_input.value,
				invite_token : this._invite.token
			});

		}, this);

		// check unique username
		Wu.DomEvent.on(username_input, 'keyup', this._checkUniqueUsername, this);
		Wu.DomEvent.on(username_input, 'blur',  this._checkUniqueUsername, this);
		
		// check unique email
		Wu.DomEvent.on(email_input, 'keyup', this._checkUniqueEmail, this);
		Wu.DomEvent.on(email_input, 'blur',  this._checkUniqueEmail, this);
	
		// check email immediately, since it's autofilled
		setTimeout(function () { // delay hack due to slow DOM
			this._checkUniqueEmail({target : email_input});
		}.bind(this), 500);
	},


	_loginUser : function (options) {

		// get access token
		this._getAccessToken(options, function (err, token) {
			if (err) return console.error(err);

			// add access_token to request
			options.access_token = token.access_token;

			// accept invite
			this._inviteUser(options, function (err, invitation) {
				if (err) return console.error(err);

				// enter portal
				window.location.href = '/';
			});
		}.bind(this));

	},

	// create user, get token, accept invite, login
	_registerUser : function (options) {

		// create user
		this._createUser(options, function (err, user) {
			if (err) return console.error(err);

			// get access token
			this._getAccessToken(options, function (err, response) {
				if (err) return console.error(err);

				// parse
				var token = Wu.parse(response);

				// add access_token to request
				options.access_token = token.access_token;

				// accept invite
				this._inviteUser(options, function (err, invitation) {
					if (err) return console.error(err);

					// enter portal
					window.location.href = '/';
				});
			}.bind(this));
		}.bind(this));
	},

	_getAccessToken : function (options, done) {
		// this._get('/v2/users/token', options, done);
		this.api.getTokenFromPassword(options, done);
	},

	_createUser : function (options, done) {
		// this._post('/v2/users/create', options, done);
		this.api.createUser(options, done);
	},

	_inviteUser : function (options, done) {
		// this._post('/v2/users/invite/accept', options, done);
		this.api.acceptInvite(options, done);
	},

	checkSubmitBtn : function () {
		var allgood = (this._uniqueUsername && this._uniqueEmail && this._privacyChecked);
		this._submitBtn.disabled = !allgood;
	},

	_checkUniqueEmail : function (e) {
		var input = e.target;
		var email = input.value;
		if (!email) return;

		// post to endpoint
		// this._post('/v2/users/email/unique', {	
		this.api.uniqueEmail({		
			email : email
		}, function (err, result) {

			// remember
			this._uniqueEmail = result.unique;

			// mark submit button disabled/enabled
			this.checkSubmitBtn();

			// mark input
			input.style.backgroundColor = this._uniqueEmail ? 'transparent' : 'rgba(255, 74, 74, 0.45)';

		}.bind(this));
	},


	_checkUniqueUsername : function (e) {
		var input = e.target;
		var username = input.value;
		if (!username) return;

		// post to endpoint
		// this._post('/v2/users/username/unique', {
		this.api.uniqueUsername({			
			username : username
		}, function (err, result) {

			if (result.error) {
				console.error('something went worng', result);
			} else {
				// remember
				this._uniqueUsername = result.unique;

				// mark submit button disabled/enabled
				this.checkSubmitBtn();

				// mark input
				input.style.backgroundColor = this._uniqueUsername ? 'transparent' : 'rgba(255, 74, 74, 0.45)';
			}
		}.bind(this));
	},

	_post : function (endpoint, json, done) {	
		var url = window.location.origin + endpoint;
		var http = new XMLHttpRequest();
		http.open("POST", url, true);
		http.setRequestHeader('Content-type', 'application/json');
		http.onreadystatechange = function() {
			if (http.readyState == 4 && http.status == 200) {
				var answer = Wu.parse(http.responseText);
				done && done(null, answer);
			}
		}
		if (Wu.Util.isObject(json)) json = JSON.stringify(json);
		http.send(json);
	},

	_get : function (endpoint, options, done) {
		var http = new XMLHttpRequest();
		var url = window.location.origin + endpoint;

		// add options to query
		url = this._addQueryOptions(url, options);

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
		
		// send
		http.send();
	},

	_addQueryOptions : function (url, options) {
		var options = options || {};
		options = _.isObject(options) ? options : Wu.parse(options);
		if (!_.isEmpty(options)) {
			_.forOwn(options, function (value, key) {
				// encode and add
				url += _.contains(url, '?') ? '&' : '?';
				url += encodeURIComponent(key) + '=' + encodeURIComponent(value);
			});
		}
		return url;
	},

});

