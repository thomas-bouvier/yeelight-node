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
        return Math.min(Math.max(parseInt(input), min), max);
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
                effect || 'smooth',
                duration || 500,
            ],
        });
    }

    set_bright() {}

    set_power() {}

    set_default() {}

    start_cf() {}

    stop_cf() {}

    set_scene() {}

    cron_add()

    cron_get()

    cron_del() {}

    set_adjust() {}

    set_music() {}

    set_name() {}

    bg_set_hsv() {}

    bg_set_bright() {}

    bg_set_power() {}

    bg_set_default() {}
    
    bg_toggle() {}

    dev_toggle() {}


}

module.exports = Yeelight;
