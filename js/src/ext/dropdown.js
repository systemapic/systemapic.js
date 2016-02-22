Wu.Dropdown = Wu.Class.extend({
    // this function will run automatically on new Wu.Dropdown()
	initialize : function (options) {
    	var me = this;

  		Wu.setOptions(this, options); // will put options in this.options
    	me._initLayout();
	},

	_initLayout : function () {
		var me = this;

		me._baseLayerDropdownContainer = Wu.DomUtil.create('div', 'base-layer-dropdown-container', this.options.appendTo);
		me._initLayoutActiveLayers();
	},

	_initLayoutActiveLayers : function (options) {
		var me = this;
		
		me._activeLayersWrap = Wu.DomUtil.create('div', 'baselayer-dropdown-wrapper', me._baseLayerDropdownContainer);
		me._selectWrap = Wu.DomUtil.create('div', 'chrome chrome-content active-layer select-wrap', me._activeLayersWrap);
		me._select = Wu.DomUtil.create('select', 'active-layer-select', me._selectWrap);

		// Create select options
		me.options.content.forEach(function(selectOption) {
			var option = Wu.DomUtil.create('option', 'active-layer-option', me._select);

			option.value = selectOption.getUuid();

			var isSelected = me.isBaseLayerOn(selectOption.getUuid());

			if ( isSelected ) {
				option.selected = true;
			}
			
			option.innerHTML = selectOption.getTitle();

		}.bind(this));

		Wu.DomEvent.on(me._select, 'change', me.options.fn, me.options.scope || this);
	},

	isBaseLayerOn : function (uuid) {
		var on = false;
		this._project.store.baseLayers.forEach(function (baseLayer) {
			if ( uuid == baseLayer.uuid ) {
				on = true;
			}
		}.bind(this));
		return on;
	}

});