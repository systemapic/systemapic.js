Wu.Dropdown = Wu.Class.extend({
    // this function will run automatically on new Wu.Dropdown()
	initialize : function (options) {
  		Wu.setOptions(this, options); // will put options in this.options
    	this._initLayout();
	},

	_initLayout : function () {
		this._baseLayerDropdownContainer = Wu.DomUtil.create('div', 'base-layer-dropdown-container', this.options.appendTo);
		this._initLayoutActiveLayers();
		this._initEventsListners();
	},

	_initLayoutActiveLayers : function (options) {		
		this._activeLayersWrap = Wu.DomUtil.create('div', 'baselayer-dropdown-wrapper', this._baseLayerDropdownContainer);
		this._selectWrap = Wu.DomUtil.create('div', 'chrome chrome-content active-layer select-wrap', this._activeLayersWrap);
		this._select = Wu.DomUtil.create('div', 'form-combobox_inner', this._selectWrap);
		this._form_combobox_input = Wu.DomUtil.create('div', 'form-combobox_input', this._select);
		this._form_combobox__options_wrapper = Wu.DomUtil.create('div', 'form-combobox_options_wrapper', this._select);
		this._form_combobox__options = Wu.DomUtil.create('ul', 'form-combobox_options', this._form_combobox__options_wrapper);

		// Create select options
		this.options.content.forEach(function(selectOption) {
			var option = Wu.DomUtil.create('li', 'form-combobox_option item', this._form_combobox__options, selectOption.title);

			option.setAttribute('data-value', selectOption.value);

			var isSelected = this.isBaseLayerOn(selectOption.value);

			if ( isSelected ) {
				Wu.DomUtil.addClass(option, 'selected');
				this._form_combobox_input.setAttribute('data-value', selectOption.value);
				this._form_combobox_input.innerHTML = selectOption.title;
			}
			Wu.DomEvent.on(option, 'click', this._changeActive, this);

		}.bind(this));
		
		// Wu.DomEvent.on(me._select, 'change', me.options.fn, me.options.scope || this);
	},

	_initEventsListners : function () {
		Wu.DomEvent.on(this._select, 'click', this._toggleListItems, this);
	},

	_toggleListItems : function () {
		if (Wu.DomUtil.hasClass(this._form_combobox__options_wrapper, "open")) {
			Wu.DomUtil.removeClass(this._form_combobox__options_wrapper, "open");
		} else {
			Wu.DomUtil.addClass(this._form_combobox__options_wrapper, "open");
		}
	},

	_changeActive : function (e) {
		this._toggleListItems();
		this.setValue({
			value: e.currentTarget.getAttribute('data-value'),
			title: e.currentTarget.innerHTML
		});
		Wu.DomEvent.stop(e);
	},

	isBaseLayerOn : function (uuid) {
		var on = false;

		this.options.project.store.baseLayers.forEach(function (baseLayer) {
			if ( uuid == baseLayer.uuid ) {
				on = true;
			}
		}.bind(this));
		return on;
	},

	getValue: function () {
		return {
			value: this._form_combobox_input.getAttribute('data-value'),
			title: this._form_combobox_input.innerHTML
		}
	},

	setValue: function (selectOption) {
		this._form_combobox_input.setAttribute('data-value', selectOption.value);
		this._form_combobox_input.innerHTML = selectOption.title;
		this.options.fn(selectOption.value);
	}

});