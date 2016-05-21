


// slider events
// 
// - `set` event is fired AFTER slide is done, 
// - `update` event is fired for any change/action
// - `slide` is fired while sliding
//
// - currently, CUBE layer is updated on `set`
//   and GRAPH is updated on `update` 



Wu.Animator = Wu.Evented.extend({

    options : {

        // Animation frames per second
        fps : 2,

        // Max value for steps on slider
        maxLength : 365,

        // Defines what kind of graph we want
        graphType : 'annualCycles',

        // how often to register updates when sliding
        sliderThrottle : 500,

        buttons : {
            play : false,
            yearly : false,
            daily : true
        }

    },

    _initialize : function (options) {

        // fetching data is async, so must wait for callback
        this._fetchData(this._renderData.bind(this));

        // todo: fetching data should query raster itself. in other words, must be connected to cube layer directly, 
        // and fetch data thru it.

    },
  
    // fetch data from server
    _fetchData : function (done) { // todo: query raster instead

        // get data from server
        app.api.getCustomData({
            name : this.options.data
        }, done);

    },

    // Callback for when data is ready
    _renderData : function (err, data) {
        if (err) return console.error(err);

        // set data
        this._data = Wu.parse(data);

        // create slider
        this._createSlider();

        // add hooks
        this._addHooks();       

        // create graph
        this._createGraph();
     
        // mark inited
        this._inited = true;
    },

    // Set Frames Per Second
    setFPS : function (fps) {

        // set locally
        this.options.fps = fps;

        // propagate
        Wu.Mixin.Events.fire('setFPS', {detail : {
            fps : fps
        }});
    },  

    _createSlider : function () {

        // create divs
        this.sliderOuterContainer       = Wu.DomUtil.create('div', 'big-slider-outer-container', app._appPane);
        var sliderInnerContainer        = Wu.DomUtil.create('div', 'big-slider-inner-container', this.sliderOuterContainer);
        var slider                      = Wu.DomUtil.create('div', 'big-slider', sliderInnerContainer);
        this.sliderButtonsContainer     = Wu.DomUtil.create('div', 'big-slider-button-container', sliderInnerContainer);
        this.stepBackward               = Wu.DomUtil.create('div', 'big-slider-step-backward', this.sliderButtonsContainer, '<i class="fa fa-fast-backward"></i>');
        this.tapBackward                = Wu.DomUtil.create('div', 'big-slider-tap-backward', this.sliderButtonsContainer, '<i class="fa fa-step-backward"></i>');
        this.playButton                 = Wu.DomUtil.create('div', 'big-slider-play-button', this.sliderButtonsContainer, '<i class="fa fa-play"></i>');        
        this.tapForward                 = Wu.DomUtil.create('div', 'big-slider-tap-forward', this.sliderButtonsContainer, '<i class="fa fa-step-forward"></i>');
        this.stepForward                = Wu.DomUtil.create('div', 'big-slider-step-forward', this.sliderButtonsContainer, '<i class="fa fa-fast-forward"></i>');
        this.tickContainer              = Wu.DomUtil.create('div', 'big-slider-tick-container', sliderInnerContainer);

        // Set number of slider steps
        // var dataLength = (_.size(this._data) > this.options.maxLength) ? this.options.maxLength : _.size(this._data);

        this._defaultSliderOptions = {
            start: [this._sliderValue],
            range: {
                'min': 1,
                'max': this.options.maxLength
            },
            step : 1,
            connect : 'lower'
        }

        // create slider
        this.slider = noUiSlider.create(slider, this._defaultSliderOptions);

        // hide by default if option set
        if (this.options.hide) this.hide();

        // hide/show buttons according to options
        this._displayButtons();

    },

    _addHooks : function () {

        // dom events
        Wu.DomEvent.on(this.stepBackward, 'click', this.moveBackward, this);
        Wu.DomEvent.on(this.tapBackward,  'click', this.stepOneBackward, this);
        Wu.DomEvent.on(this.stepForward,  'click', this.moveForward, this);
        Wu.DomEvent.on(this.tapForward,   'click', this.stepOneForward, this);
        Wu.DomEvent.on(this.playButton,   'click', this.play, this);

        // slider events
        this.slider.on('update', this._sliderUpdateEvent.bind(this));
        this.slider.on('set', this._sliderSetEvent.bind(this));
        this.slider.on('slide', this._onSlide.bind(this));

        // listen for events
        Wu.Mixin.Events.on('setSlider', this.setSlider, this);
        Wu.Mixin.Events.on('updateSliderButtons', this.updateButtons, this);
        Wu.Mixin.Events.on('setSliderRange', this._onSetSliderRange, this);
        Wu.Mixin.Events.on('unsetSliderRange', this._onUnsetSliderRange, this);
        Wu.Mixin.Events.on('shadeButtons', this._onShadeButtons, this);
        Wu.Mixin.Events.on('unshadeButtons', this._onUnshadeButtons, this);
    },

    _onSlide : function (values) {
        var value = parseInt(values[0]);

        // force limit
        if (value > this._limit) {
            // force limit on slider
            this.slider.set(this._limit);

            // shade buttons
            this._onShadeButtons();
        }
    },

    setSliderLimit : function (limit) {
        this._limit = limit.limit;
    },

    getSliderLimit : function () {
        return this._limit;
    },  

    _displayButtons : function () {
        // display buttons based on options
        this.playButton.style.display   = this.options.buttons.play   ? 'inline-block' : 'none';
        this.stepBackward.style.display = this.options.buttons.yearly ? 'inline-block' : 'none';
        this.stepForward.style.display  = this.options.buttons.yearly ? 'inline-block' : 'none';
        this.tapForward.style.display   = this.options.buttons.daily  ? 'inline-block' : 'none';
        this.tapBackward.style.display  = this.options.buttons.daily  ? 'inline-block' : 'none';
    },

    _createGraph : function () { // todo: should separate these more

        // create graph
        // this.graph = new Wu.Graph.Year({
        this.graph = new Wu.Graph.Annual({ // todo: clean the f up
            data     : this._data,
            appendTo : this.sliderOuterContainer,
            type     : this.options.graphType,
            cube     : this.options.cube
        });
    },

    _onShadeButtons : function () {
       
        // shade forward button
        this.tapForward.style.color = 'rgb(81, 92, 111)';

        // remove event
        Wu.DomEvent.off(this.tapForward,  'click', this.stepOneForward, this);

        // shade slider handle
        this._getSliderHandle().style.background = 'rgb(82, 93, 111)';
        this._getSliderTail().style.background = 'rgb(82, 93, 111)';
    },

    _onUnshadeButtons : function () {
       
        // shade forward button
        this.tapForward.style.color = '#FCFCFC';

        // reactivate event
        Wu.DomEvent.on(this.tapForward,  'click', this.stepOneForward, this);

        // shade slider handle
        this._getSliderHandle().style.background = '#ECEDEF';
        this._getSliderTail().style.background = '#ECEDEF';
    },

    _getSliderHandle : function () {
        var handle = this.slider.target.childNodes[0].childNodes[0].childNodes[0];
        return handle;
    },

    _getSliderTail : function () {
        var handle = this.slider.target.childNodes[0].childNodes[0];
        return handle;
    },

    _onSetSliderRange : function (e) {
        var range = e.detail.range;

        // update range option
        this.setSliderOptions({
            range : range
        }, true);
    },

    _onUnsetSliderRange : function () {
        // set default slider options
        this.setSliderOptions(this._defaultSliderOptions, true);
    },

    setSliderOptions : function (options, dontInvalidate) {
        // set slider options
        this.slider.updateOptions(options, dontInvalidate);
    },

    // @ only update graph
    // event that runs when sliding (ie. a lot!)
    // see http://refreshless.com/nouislider/events-callbacks/
    _sliderUpdateEvent : function (value) {
        if (!this._inited) return;

        // set slider value
        this._sliderValue = value ? Math.round(value) : 0;

        // fire slider update event (for graph)
        Wu.Mixin.Events.fire('sliderUpdate', { detail : {
            value : this._sliderValue,
        }});
    },

    // @ event: update layers
    // event that runs when new value is set (either after slide, or with .set())
    _sliderSetEvent : function (value, handle, unencoded, tap) {
        if (!this._inited) return;

        // set slider value
        this._sliderValue = value ? Math.round(value) : 0;

        // get current date
        var timestamp = this._getCurrentDate();

        // add delay if tap (to )
        setTimeout(function () {

            // fire slider set event
            Wu.Mixin.Events.fire('sliderSet', { detail : {
                value : this._sliderValue,
                timestamp : timestamp
            }});

        }.bind(this), tap ? 300 : 0);
       
    },

    // todo: slider should know which date it is without asking graph
    _getCurrentDate : function () {
    	var date = this.graph.getCurrentDate(this._sliderValue);
    	return date;
    },

    // Enable layer
    _layerEnabled : function (e) {

    	// get event payload
        var layer = e.detail.layer;
        var show = e.detail.showSlider;

        // set current layer
        this._currentLayer = layer;

        // set title 
        this.setTitle(layer.getTitle());

        // show
        if (show) this.show();
    },

    // Disable layer
    _layerDisabled : function (e) {
        var layer = e.detail.layer;

        // hide if current layer
        if (layer.getUuid() == this._currentLayer.getUuid()) {
                this.hide();
        }
    },

    // Set slider value
    setSlider : function (e) {

        // get/set value
        var value = (e && e.detail) ? e.detail.value : e;
        this._sliderValue = value;

        // set slider
        this.slider.set(this._sliderValue);
    },

    updateButtons : function (e) {

        var disableForward  = e.detail.diableForward;
        var disableBackward = e.detail.diableBackward

        if (disableForward) { 
            Wu.DomUtil.addClass(this.stepForward, 'disable-button');
        } else { 
            Wu.DomUtil.removeClass(this.stepForward, 'disable-button'); 
        }

        if (disableBackward) { 
            Wu.DomUtil.addClass(this.stepBackward, 'disable-button');
        } else { 
            Wu.DomUtil.removeClass(this.stepBackward, 'disable-button'); 
        }
    },

    // Set title
    setTitle : function (title) {

    	// return if no layer
        if (!this._currentLayer) return;

        // fire event
        Wu.Mixin.Events.fire('setSliderTitle', {detail : {
            title : title
        }});
    },

    // These are the actions for the play, pause, step forward and backward buttons
    play : function () {        
        this.playing ? this.stopPlaying() : this.startPlaying();
    },

    startPlaying : function () {

        // set pause icon
        this.playButton.innerHTML = '<i class="fa fa-pause"></i>';

        // mark as playing
        this.playing = true;

        // move frame @ fps
        this.playInterval = setInterval(function() {

            // check if last day of year
            if (this._sliderValue == 365) {     // todo: move to next year...?

                // stop playing
                return clearInterval(this.playInterval);

            } else {                

                // move cursor forward
                this.stepOneForward();
            }           

        }.bind(this), (1000/this.options.fps)) 

        // fire animation play
        Wu.Mixin.Events.fire('animationPlay');
    },

    stopPlaying : function () {

        // set play icon
        this.playButton.innerHTML = '<i class="fa fa-play"></i>';

        // stop playing
        clearInterval(this.playInterval);
        this.playing = false;

        // fire animation stop
        Wu.Mixin.Events.fire('animationStop');
    },

    stepOneForward : function () {      
        var value = this._sliderValue + 1;

        if ( value > this.options.maxLength ) {
                this.stepAfterEnd()
                value = 1;

        }

        this.slider.set(value);

    },

    stepOneBackward : function () {
        var value = this._sliderValue - 1;
        
        if (value <= 0) {
            this.stepBeforeBeginning();
            value = this.options.maxLength;
        }

        this.slider.set(value);
    },

    stepBeforeBeginning : function () {
        Wu.Mixin.Events.fire('stepBeforeBeginning');
    },

    stepAfterEnd : function () {
        Wu.Mixin.Events.fire('stepAfterEnd');
    },    

    moveBackward : function () {
        Wu.Mixin.Events.fire('sliderMoveBackward');
    },

    moveForward : function () {
        Wu.Mixin.Events.fire('sliderMoveForward');
    },  

    // Update message box, if it exists before
    update : function (message, severity) {},

    remove : function (id) {},

    hide : function () {
        this.sliderOuterContainer.style.display = 'none';
    },

    show : function () {
        if (!this._inited) return;
        this.sliderOuterContainer.style.display = 'block';
    },  

});

