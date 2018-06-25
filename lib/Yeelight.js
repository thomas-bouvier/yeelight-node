const EventEmitter = require('events');
const net = require('net');

class Yeelight extends EventEmitter {
    constructor(config = {}) {
        super();
        this.ip = config.ip;
        this.port = config.port;
        this.id = config.id || 0;
        this.client = net.Socket();
        this.client.connect(this.port, this.ip);
    }

    _sendCommand(objectCommand) {
        this.client.write(JSON.stringify(objectCommand)+'\r\n');
    }

    _constrain(input = 0, min = 0, max = 0) {
        return Math.min(Math.max(parseInt(input), min), max);
    }

    toggle() {
        this._sendCommand({
            id: this.id,
            method: 'toggle',
            params: [],
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

    set_hsv() {}

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
