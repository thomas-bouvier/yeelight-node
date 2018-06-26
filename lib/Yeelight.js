const EventEmitter = require('events');
const net = require('net');

class Yeelight extends EventEmitter {
    constructor(config = {}) {
        super();
        this.ip = config.ip;
        this.port = config.port;
        this.id = config.id || 0;
        this.client = net.Socket();
        this.connected = false;
    }

    /**
     * Establish the connection to the LED, and set the listeners
     * and event passthrough
     */
    _connect() {
        this.client.connect(this.port, this.ip);
        this.client.on('data', (data) => {
            this.emit('data', data);
        });
        this.client.on('close', () => {
            this.emit('close', {
                id: this.id,
                client: [this.ip, this.port],
                connected: this.connected,
                message: 'Connection to client has been closed'
            });
        })
        this.connected = true;
    }

    /**
     * Wrap and send the TCP JSON command to the LED
     * @param {Object} objectCommand The command structure to send to the LED
     */
    _sendCommand(objectCommand) {
        if (!this.connected) {
            this._connect();
        }
        this.client.write(JSON.stringify(objectCommand)+'\r\n');
    }

    /**
     * Limit a number to stay between the range of min and max
     * @param {Number} input The base number to constrain
     * @param {Number} min The minimum allowed value
     * @param {Number} max The maximum allowed value
     */
    _constrain(input = 0, min = 0, max = 0) {
        const intInput = isNaN(parseInt(input)) ? 0 : parseInt(input);
        return Math.min(Math.max(intInput, min), max);
    }

    /**
     * Return a boolean indicating whether or not the needle is present in the haystack
     * @param {*} needle What you are searching for
     * @param {Array} haystack Array to search against
     */
    _inArray(needle = '', haystack = []) {
        return haystack.constructor == Array && haystack.includes(needle) != false;
    }

    /**
     * Check if a provided value is allowed, and if not, replace it with a valid fallback
     * @param {*} needle User supplied value
     * @param {Array} haystack Permitted values
     * @param {*} fallback The default, if the provided value is bad
     */
    _ifValid(needle = '', haystack = [], fallback = '') {
        return this._inArray(needle, haystack) ? needle : fallback;
    }

    /**
     * Toggle the state of the main light
     */
    toggle() {
        this._sendCommand({
            id: this.id,
            method: 'toggle',
            params: [],
        });
    }

    bg_toggle() {
        this._sendCommand({
            id: this.id,
            method: 'bg_toggle',
            params: [],
        });
    }

    dev_toggle() {
        this._sendCommand({
            id: this.id,
            method: 'dev_toggle',
            params: [],
        });
    }

    
    /**
     * This method is used to retrieve the current properties of the smart LED.
     * @param {String} first The property of the light you want to get
     * @param {String} other The other properties (if more than 1)
     */
    get_prop(first, ...other) {
        const args = [first, ...other];
        this._sendCommand({
            id: this.id,
            method: 'get_prop',
            params: args
        });
    }

    /**
     * Set the color temperature
     * @param {number} ct_value The color temperature as an int between 1700 and 6500 (k)
     * @param {string} effect Either the string 'smooth' or 'sudden'
     * @param {number} duration the time in ms that the effect will take to execute (min 30)
     */
    set_ct_abx(ct_value = 6500, effect = 'smooth', duration = 500) {
        this._sendCommand({
            id: this.id,
            method: 'set_ct_abx',
            params: [
                this._constrain(ct_value, 1700, 6500), 
                effect || 'smooth', 
                duration || 500,
            ],
        });
    }

    /**
     * Set the RGB color of the light
     * @param {Array} rgb Array of R,G,B as values between 0 and 255
     * @param {String} effect Either 'smooth' or 'sudden'
     * @param {Number} duration 
     */
    set_rgb(rgb = [255,255,255], effect = 'smooth', duration = 500) {
        const rgbValue = 
            (this._constrain(rgb[0], 0, 255)*65536)+
            (this._constrain(rgb[1], 0, 255)*256)+
            this._constrain(rgb[2], 0, 255);
        this._sendCommand({
            id: this.id,
            method: 'set_rgb',
            params: [
                rgbValue,
                effect || 'smooth',
                duration || 500
            ],
        });
    }

    /**
     * This method is used to change the color of the smart LED
     * @param {Number} hue Target hue value between 0 and 359
     * @param {Number} sat Target Saturation value between 0 and 100
     * @param {String} effect The desired transition effect
     * @param {Number} duration The Transition time in ms
     */
    set_hsv(hue = 255, sat = 45, effect = 'smooth', duration = 500) {
        this._sendCommand({
            id: this.id,
            method: 'set_hsv',
            params: [
                this._constrain(hsv, 0, 359),
                this._constrain(sat, 0, 100),
                this._ifValid(effect, ['smooth', 'sudden'], 'smooth'),
                duration || 500,
            ],
        });
    }

    bg_set_hsv(hue = 255, sat = 45, effect = 'smooth', duration = 500) {
        this._sendCommand({
            id: this.id,
            method: 'bg_set_hsv',
            params: [
                this._constrain(hsv, 0, 359),
                this._constrain(sat, 0, 100),
                this._ifValid(effect, ['smooth', 'sudden'], 'smooth'),
                duration || 500,
            ],
        }); 
    }

    /**
     * 
     * @param {Number} brightness 
     * @param {*} effect 
     * @param {*} duration 
     */
    set_bright(brightness = 50, effect = 'smooth', duration = 500) {
        this._sendCommand({
            id: this.id,
            method: 'set_bright',
            params: [
                this._constrain(brightness, 1, 100),
                this._ifValid(effect, ['smooth', 'sudden'], 'smooth'),
                duration || 500,
            ],
        });
    }

    bg_set_bright(brightness = 50, effect = 'smooth', duration = 500) {
        this._sendCommand({
            id: this.id,
            method: 'bg_set_bright',
            params: [
                this._constrain(brightness, 1, 100),
                this._ifValid(effect, ['smooth', 'sudden'], 'smooth'),
                duration || 500,
            ],
        }); 
    }

    set_power(power = 'on', effect = 'smooth', duration = 500, mode = 0) {
        this._sendCommand({
            id: this.id,
            method: 'set_power',
            params: [
                this._ifValid(power, ['on', 'off'], 'on'),
                this._ifValid(effect, ['smooth', 'sudden'], 'smooth'),
                duration || 500,
                this._ifValid(mode, [0,1,2,3,4,5], 0)
            ],
        });
    }

    bg_set_power(power = 'on', effect = 'smooth', duration = 500, mode = 0) {
        this._sendCommand({
            id: this.id,
            method: 'bg_set_power',
            params: [
                this._ifValid(power, ['on', 'off'], 'on'),
                this._ifValid(effect, ['smooth', 'sudden'], 'smooth'),
                duration || 500,
                this._ifValid(mode, [0,1,2,3,4,5], 0)
            ],
        });
    }

    set_default() {
        this._sendCommand({
            id: this.id,
            method: 'set_default',
            params: [],
        });
    }

    bg_set_default() {
        this._sendCommand({
            id: this.id,
            method: 'bg_set_default',
            params: [],
        });
    }

    // TODO: expand on this
    start_cf(count = 0, action = 0, flowExpression) {
        this._sendCommand({
            id: this.id,
            method: 'start_cf',
            params: [
                count || 0,
                this._ifValid(action, [0,1,2], 0),
                flowExpression
            ]
        });
    }

    stop_cf() {
        this._sendCommand({
            id: this.id,
            method: 'stop_cf',
            params: [],
        });
    }

    set_scene() {}

    cron_add(type = 0, value = 1) {
        this._sendCommand({
            id: this.id,
            method: 'cron_add',
            params: [
                this._ifValid(type, [0], 0),
                value || 1
            ],
        });
    }

    cron_get(type = 0) {
        this._sendCommand({
            id: this.id,
            methods: 'cron_get',
            params: [
                this._ifValid(type, [0], 0)
            ],
        });
    }

    cron_del(type = 0) {
        this._sendCommand({
            id: id,
            method: 'cron_del',
            params: [
                this._ifValid(type, [0], 0)
            ],    
        });
    }

    set_adjust(action = 'circle', prop = 'bright') {
        const validatedAction = prop === 'color' 
            ? 'circle' 
            : this._ifValid(action, ['increase', 'decrease', 'circle'], 'circle');
        this._sendCommand({
            id: id,
            method: 'set_adjust',
            params: [
                validatedAction,
                this._ifValid(prop, ['bright', 'ct', 'color'], 'circle')
            ],    
        });
    }

    set_music() {}

    set_name(name) {
        if (name) {
            this._sendCommand({
                id: this.id,
                method: 'set_name',
                params: [
                    name
                ]
            });
        }
    }
}

module.exports = Yeelight;
