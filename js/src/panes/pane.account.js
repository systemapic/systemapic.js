Wu.Pane.Account = Wu.Pane.extend({

	_initialize : function (options) {
		this.addAccountTab();
	},

	addAccountTab : function () {

		// register button in top chrome
		var top = app.Chrome.Top;

		// add a button to top chrome
		this._accountTab = top._registerButton({
			name : 'account',
			className : 'chrome-button account',
			trigger : this._toggleAccountTab,
			context : this,
			project_dependent : false
		});

		// user icon
		this._accountTab.innerHTML = '<i class="fa fa-user"></i>';
	},


	_toggleAccountTab : function () {
		this._accountTabOpen ? this._closeAccountTab() : this._openAccountTab();
	},


	// todo: refactor into new Wu.Pane.Account()
	_openAccountTab : function () {

		// close other tabs
		Wu.Mixin.Events.fire('closeMenuTabs');

		// for public account
		if (app.Account.isPublic()) {

			// temp hack
			return this.openLogin();

			// create login button if public account
			// create dropdown
			this._accountDropdown = Wu.DomUtil.create('div', 'share-dropdown account-dropdown', app._appPane);
			var account_name = 'Not logged in';

			// temp hack, set to left
			this._accountDropdown.style.left = 0;

			// items
			// this._accountName = Wu.DomUtil.create('div', 'share-item no-hover', this._accountDropdown, '<i class="fa fa-user logout-icon"></i>' + account_name);
			this._logoutDiv = Wu.DomUtil.create('div', 'share-item', this._accountDropdown, '<i class="fa fa-sign-in logout-icon"></i>Log in');

			// events
			Wu.DomEvent.on(this._logoutDiv,  'click', this.openLogin, this);


		// normal user account
		} else {

			// create dropdown
			this._accountDropdown = Wu.DomUtil.create('div', 'share-dropdown account-dropdown', app._appPane);
			var account_name = app.Account.getUsername();

			// items
			this._accountName = Wu.DomUtil.create('div', 'share-item no-hover', this._accountDropdown, '<i class="fa fa-user logout-icon"></i>' + account_name);
			this._logoutDiv = Wu.DomUtil.create('div', 'share-item', this._accountDropdown, '<i class="fa fa-sign-out logout-icon"></i>Log out');

			// events
			Wu.DomEvent.on(this._logoutDiv,  'click', this.logout, this);

		}
		
		// mark open
		this._accountTabOpen = true;

		// mark active
		Wu.DomUtil.addClass(this._accountTab, 'active');

	},

	_closeAccountTab : function () {
		if (!this._accountTabOpen) return;

		Wu.DomEvent.off(this._logoutDiv,  'click', this.logout, this);

		Wu.DomUtil.remove(this._accountDropdown);

		this._accountTabOpen = false;

		// mark closed
		Wu.DomUtil.removeClass(this._accountTab, 'active');
	},

	logout : function () {
		window.location.href = '/logout';
	},

	openLogin : function () {
		
		// close other tabs
		Wu.Mixin.Events.fire('closeMenuTabs');

		// open login
		var login = new Wu.Pane.Login();
		login.open();
	},

	_onCloseMenuTabs : function () {
		this._closeAccountTab();
	},


	
})