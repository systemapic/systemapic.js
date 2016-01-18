Wu.Pane.Login = Wu.Pane.extend({

	open : function () {

		console.log('open Login');

		// frame
		this._loginFullscreen = Wu.DomUtil.create('div', 'fullscreen-background', app._appPane);
		var login_wrapper = Wu.DomUtil.create('div', 'login-wrapper', this._loginFullscreen);
		var login_box = Wu.DomUtil.create('div', 'login-box', login_wrapper);

		// logo
		var logo = Wu.DomUtil.create('div', 'login-popup-logo', login_box);


		// email input
		this._email_input = this._createInput({
			label : 'Email',
			placeholder : 'name@domain.com',
			appendTo : login_box,
			type : 'email'
		});

		// password input
		this._password_input = this._createInput({
			label : 'Password',
			placeholder : 'Enter your password',
			appendTo : login_box,
			type : 'password'
		});

		// error feedback
		this._error_feedback = Wu.DomUtil.create('div', 'smooth-fullscreen-error-label', login_box);



		// button
		var loginBtn = Wu.DomUtil.create('div', 'smooth-fullscreen-save invite', login_box, 'Login');



		// events
		Wu.DomEvent.on(this._loginFullscreen, 'click', this.close, this);
		Wu.DomEvent.on(login_box, 'click', Wu.DomEvent.stop, this);
		Wu.DomEvent.on(loginBtn, 'click', this._doLogin, this);

	},

	_doLogin : function (e) {
		Wu.DomEvent.stop(e);

		// clear feedback
		this._error_feedback.innerHTML = '';

		// get fields
		var email = this._email_input.value;
		var password = this._password_input.value;

		// get token from user/pass from server
		app.api.getTokenFromPassword({
			email : email,
			password : password
		}, this._didLogin.bind(this));
	},

	_didLogin : function (err, result) {
		var tokens = Wu.parse(result);

		// invalid credentials
		if (err && err == 401) {
			// set error feedback
			this._error_feedback.innerHTML = tokens.error;
			return;
		}

		// set tokens + update user + update portal
		app.tokens = tokens;

		// reload
		window.location.reload(true);
	},

	_createInput : function (options) {

		var appendTo = options.appendTo;
		var label = options.label;
		var type = options.type;
		var placeholder = options.placeholder;


		// label
		var name = Wu.DomUtil.create('div', 'smooth-fullscreen-name-label invite-emails', appendTo, label);
		
		// container
		var invite_container = Wu.DomUtil.create('div', 'invite-container narrow', appendTo);
		
		var invite_inner = Wu.DomUtil.create('div', 'invite-inner', invite_container);
		var invite_input_container = Wu.DomUtil.create('div', 'invite-input-container', invite_inner);

		// input box
		var invite_input = Wu.DomUtil.create('input', 'invite-email-input-form', invite_input_container);
		var invite_error = Wu.DomUtil.create('div', 'smooth-fullscreen-error-label', appendTo);
		if (type) invite_input.setAttribute('type', type);
		if (placeholder) invite_input.setAttribute('placeholder', placeholder);

		return invite_input;
	},

	close : function () {
		Wu.DomUtil.remove(this._loginFullscreen);
	},


})