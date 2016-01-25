Wu.Pane.Login = Wu.Pane.extend({

	open : function () {

		// frames
		this._loginFullscreen = Wu.DomUtil.create('div', 'fullscreen-background', app._appPane);
		this._login_wrapper = Wu.DomUtil.create('div', 'login-wrapper', this._loginFullscreen);
		this._login_box = Wu.DomUtil.create('div', 'login-box', this._login_wrapper);

		// logo
		var logo = Wu.DomUtil.create('div', 'login-popup-logo', this._login_box);

		// email input
		this._email_input = this._createInput({
			label : 'Email',
			placeholder : 'name@domain.com',
			appendTo : this._login_box,
			type : 'email'
		});

		// password input
		this._password_input = this._createInput({
			label : 'Password',
			placeholder : 'Enter your password',
			appendTo : this._login_box,
			type : 'password'
		});

		// error feedback
		this._error_feedback = Wu.DomUtil.create('div', 'smooth-fullscreen-error-label', this._login_box);

		// button
		this._loginBtn = Wu.DomUtil.create('div', 'smooth-fullscreen-save invite', this._login_box, 'Login');
		
		// cancel button
		this._cancelBtn = Wu.DomUtil.create('div', 'smooth-fullscreen-save invite cancel', this._login_box, 'Cancel');

		// add events
		this.addEvents();

		// focus
		this._email_input.focus();
	},

	addEvents : function () {
		// add events
		Wu.DomEvent.on(this._loginFullscreen, 'click', this.close, this);
		Wu.DomEvent.on(this._login_box, 'click', Wu.DomEvent.stop, this);
		Wu.DomEvent.on(this._loginBtn, 'click', this._doLogin, this);
		Wu.DomEvent.on(this._cancelBtn, 'click', this.close, this);
		Wu.DomEvent.on(this._password_input, 'keydown', this._checkEnter, this);
		Wu.DomEvent.on(window, 'keydown', this._keyDown, this);
	},

	removeEvents : function () {
		// remove events
		Wu.DomEvent.off(this._loginFullscreen, 'click', this.close, this);
		Wu.DomEvent.off(this._login_box, 'click', Wu.DomEvent.stop, this);
		Wu.DomEvent.off(this._loginBtn, 'click', this._doLogin, this);
		Wu.DomEvent.off(this._cancelBtn, 'click', this.close, this);
		Wu.DomEvent.off(this._password_input, 'keydown', this._checkEnter, this);
		Wu.DomEvent.off(window, 'keydown', this._keyDown, this);

	},

	_keyDown : function (e) {
		var code = (e.keyCode ? e.keyCode : e.which);
		if(code == 27) { //Enter keycode
			this.close(e);
		}
	},

	_checkEnter : function (e) {
		var code = (e.keyCode ? e.keyCode : e.which);
		if(code == 13) { //Enter keycode	
			this._doLogin(e);
		}	
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
		window.location = app.options.servers.portal;

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
		this.removeEvents();
		Wu.DomUtil.remove(this._loginFullscreen);
		// Wu.Mixin.Events.fire('closeMenuTabs');
	},

	_onCloseMenuTabs : function () {
		this.close();
	},

})