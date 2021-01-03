const EventEmitter = require('events')
const net = require('net')

class Yeelight extends EventEmitter {
    constructor(config = {}) {
        super()
        this.id = config.id || 0
        this.ip = config.ip
        this.port = config.port
        this.name = config.name
        this.model = config.model
        this.fw_ver = config.fw_ver
        this.methods = config.methods
        this.state = config.state
        this.client = net.Socket()
        this.client.setEncoding("utf8")
        this.connected = false
    }

    /**
     * Establish the connection to the LED, and set the listeners
     * and event passthrough.
     */
    _connect() {
        this.client.connect(this.port, this.ip)

        this.client.on('close', () => {
            this.emit('close', {
                id: this.id,
                client: [this.ip, this.port],
                connected: this.connected,
                message: 'Connection to client has been closed'
            })
            this.connected = false
        })
        this.connected = true
    }

    /**
     * Wrap and send the TCP JSON command to the LED, and asynchronously
     * get the response.
     * 
     * @param {Object} objectCommand The command structure to send to the LED
     */
    async _sendCommand(objectCommand) {
        if (!this.connected) {
            this._connect()
        }
        objectCommand.id = Math.floor((Math.random() * 100000) + 1)

        return new Promise((resolve, reject) => {
            this.client.write(JSON.stringify(objectCommand) + '\r\n')
            const handleError = error => {
                removeListeners()
                reject(error)
            }
            const handleData = data => {
                const regex = new RegExp('{"id":' + objectCommand.id + '.*}', 'g')
                const match = regex.exec(data)
                if (match) {
                    removeListeners()
                    resolve(match[0])
                }
            }
            const removeListeners = () => {
                this.client.removeListener('error', handleError)
                this.client.removeListener('data', handleData)
            }
            this.client.on('error', handleError)
            this.client.on('data', handleData)
        })
    }

    /**
     * Limit a number to stay between the range of min and max.
     * 
     * @param {Number} input The base number to constrain
     * @param {Number} min The minimum allowed value
     * @param {Number} max The maximum allowed value
     */
    _constrain(input = 0, min = 0, max = 0) {
        const intInput = isNaN(parseInt(input)) ? 0 : parseInt(input)
        return Math.min(Math.max(intInput, min), max)
    }

    /**
     * Return a boolean indicating whether or not the needle is present in the haystack.
     * 
     * @param {*} needle What you are searching for
     * @param {Array} haystack Array to search against
     */
    _inArray(needle = '', haystack = []) {
        return Array.isArray(haystack) && haystack.includes(needle)
    }

    /**
     * Check if a provided value is allowed, and if not, replace it with a valid fallback.
     * 
     * @param {*} needle User supplied value
     * @param {Array} haystack Permitted values
     * @param {*} fallback The default, if the provided value is bad
     */
    _ifValid(needle = '', haystack = [], fallback = '') {
        return this._inArray(needle, haystack) ? needle : fallback
    }

    /**
     * Close TCP connection to lamp.
     */
    closeConnection() {
        this.client.destroy()
        this.connected = false
    }

    /**
     * Toggle the state of the main light.
     */
    toggle() {
        return this._sendCommand({
            method: 'toggle',
            params: []
        })
    }

    /**
     * Toggle the state of the background light if applicable.
     */
    bg_toggle() {
        return this._sendCommand({
            method: 'bg_toggle',
            params: []
        })
    }

    /**
     * Toggle the state of both the main and background light.
     */
    dev_toggle() {
        return this._sendCommand({
            method: 'dev_toggle',
            params: []
        })
    }

    /**
     * This method is used to retrieve the current properties of the smart LED.
     * 
     * @param {String} first The property of the light you want to get
     * @param {String} other The other properties (if more than 1)
     */
    get_prop(first, ...other) {
        const args = [first, ...other]
        return this._sendCommand({
            method: 'get_prop',
            params: args
        })
    }

    /**
     * Set the color temperature.
     * 
     * @param {number} ct_value The color temperature as an int between 1700 and 6500 (k)
     * @param {string} effect Either the string 'smooth' or 'sudden'
     * @param {number} duration the time in ms that the effect will take to execute (min 30)
     */
    set_ct_abx(ct_value = 6500, effect = 'smooth', duration = 500) {
        return this._sendCommand({
            method: 'set_ct_abx',
            params: [
                this._constrain(ct_value, 1700, 6500),
                this._ifValid(effect, ['smooth', 'sudden'], 'smooth'),
                duration || 500
            ]
        })
    }

    /**
     * Set the RGB color of the light.
     * 
     * @param {Array} rgb Array of R,G,B as values between 0 and 255
     * @param {String} effect Either 'smooth' or 'sudden'
     * @param {Number} duration
     */
    set_rgb(rgb = [255, 255, 255], effect = 'smooth', duration = 500) {
        const rgbValue =
            (this._constrain(rgb[0], 0, 255) * 65536) +
            (this._constrain(rgb[1], 0, 255) * 256) +
            (this._constrain(rgb[2], 0, 255))
        return this._sendCommand({
            method: 'set_rgb',
            params: [
                rgbValue,
                this._ifValid(effect, ['smooth', 'sudden'], 'smooth'),
                duration || 500
            ]
        })
    }

    /**
     * This method is used to change the color of the smart LED.
     * 
     * @param {Number} hue Target hue value between 0 and 359
     * @param {Number} sat Target Saturation value between 0 and 100
     * @param {String} effect The desired transition effect
     * @param {Number} duration The Transition time in ms
     */
    set_hsv(hue = 255, sat = 45, effect = 'smooth', duration = 500) {
        return this._sendCommand({
            method: 'set_hsv',
            params: [
                this._constrain(hue, 0, 359),
                this._constrain(sat, 0, 100),
                this._ifValid(effect, ['smooth', 'sudden'], 'smooth'),
                duration || 500
            ]
        })
    }

    /**
     * This method is used to change the color of the background smart LED.
     * 
     * @param {Number} hue Target hue value between 0 and 359
     * @param {Number} sat Target Saturation value between 0 and 100
     * @param {String} effect The desired transition effect
     * @param {Number} duration The Transition time in ms
     */
    bg_set_hsv(hue = 255, sat = 45, effect = 'smooth', duration = 500) {
        return this._sendCommand({
            method: 'bg_set_hsv',
            params: [
                this._constrain(hue, 0, 359),
                this._constrain(sat, 0, 100),
                this._ifValid(effect, ['smooth', 'sudden'], 'smooth'),
                duration || 500
            ]
        })
    }

    /**
     * This method is used to change the brightness of the Smart LED.
     * 
     * @param {Number} brightness The desired brightness between 1 and 100
     * @param {String} effect Either the string 'sudden' or 'smooth'
     * @param {Number} duration the time in ms for the transition to take effect
     */
    set_bright(brightness = 50, effect = 'smooth', duration = 500) {
        return this._sendCommand({
            method: 'set_bright',
            params: [
                this._constrain(brightness, 1, 100),
                this._ifValid(effect, ['smooth', 'sudden'], 'smooth'),
                duration || 500
            ]
        })
    }

    /**
     * This method is used to change the brightness of the background Smart LED.
     * 
     * @param {Number} brightness The desired brightness between 1 and 100
     * @param {String} effect Either the string 'sudden' or 'smooth'
     * @param {Number} duration the time in ms for the transition to take effect
     */
    bg_set_bright(brightness = 50, effect = 'smooth', duration = 500) {
        return this._sendCommand({
            method: 'bg_set_bright',
            params: [
                this._constrain(brightness, 1, 100),
                this._ifValid(effect, ['smooth', 'sudden'], 'smooth'),
                duration || 500
            ]
        })
    }

    /**
     * This method is used to switch the Smart LED on or off at the software level.
     * 
     * @param {String} power Either the string 'on' or 'off'
     * @param {String} effect Either the string 'sudden' or 'smooth'
     * @param {Number} duration The duration in ms for the transition to occur
     * @param {Number} mode 0 = normal, 1 = CT mode, 2 = RGB mode, 3 = HSV mode, 4 = CF mode, 5 = Night mode
     */
    set_power(power = 'on', effect = 'smooth', duration = 500, mode = 0) {
        return this._sendCommand({
            method: 'set_power',
            params: [
                this._ifValid(power, ['on', 'off'], 'on'),
                this._ifValid(effect, ['smooth', 'sudden'], 'smooth'),
                duration || 500,
                this._ifValid(mode, [0, 1, 2, 3, 4, 5], 0)
            ]
        })
    }

    /**
     * This method is used to switch the background Smart LED on or off at the software level.
     * 
     * @param {String} power Either the string 'on' or 'off'
     * @param {String} effect Either the string 'sudden' or 'smooth'
     * @param {Number} duration The duration in ms for the transition to occur
     * @param {Number} mode 0 = normal, 1 = CT mode, 2 = RGB mode, 3 = HSV mode, 4 = CF mode, 5 = Night mode
     */
    bg_set_power(power = 'on', effect = 'smooth', duration = 500, mode = 0) {
        return this._sendCommand({
            method: 'bg_set_power',
            params: [
                this._ifValid(power, ['on', 'off'], 'on'),
                this._ifValid(effect, ['smooth', 'sudden'], 'smooth'),
                duration || 500,
                this._ifValid(mode, [0, 1, 2, 3, 4, 5], 0)
            ]
        })
    }

    /**
     * This method saves the current state of the smart LED to memory.
     * 
     */
    set_default() {
        return this._sendCommand({
            method: 'set_default',
            params: []
        })
    }

    /**
     * This method saves the current state of the background Smart LED to memory.
     */
    bg_set_default() {
        return this._sendCommand({
            method: 'bg_set_default',
            params: []
        })
    }

    /**
     * This method is used to start a color flow. Color flow is a series of smart
     * LED visible state changing. It can be brightness changing, color changing or color
     * temperature changing. This is the most powerful command. All our recommended scenes,
     * e.g. Sunrise/Sunset effect is implemented using this method. With the flow expression, user
     * can actually “program” the light effect.
     *
     * @param {Number} count The number of state changes before color flow stops. 0 = infinite
     * @param {Number} action The action after stopping CF. 0 = revert to previous state, 1 stay at state when stopped, 2 = turn off smart LED
     * @param {Array} flow A series of tuples defining the [duration, mode, value, brightness]
     */
    start_cf(count = 0, action = 0, flow = []) {
        /**
         * The flow expression is composed by combining the given flow array into a string.
         * The flow array should consist of arrays, each containing 4 values.
         * [
         *  duration -- time in ms for the transition,
         *  mode -- 1 == color, 2 == color temperature, 7 == sleep,
         *  value -- RGB value for mode 1, CT value for mode 2, ignored for mode 7,
         *  brightness -- value between 1 and 100
         * ]
         */
        const flowExpression = flow.reduce((accum, curr) => {
            return `${accum}${accum?',':''}${curr.join(',')}`
        }, '')
        return this._sendCommand({
            method: 'start_cf',
            params: [
                count || 0,
                this._ifValid(action, [0, 1, 2], 0),
                flowExpression
            ]
        })
    }

    /**
     * This method is used to stop a running color flow.
     */
    stop_cf() {
        return this._sendCommand({
            method: 'stop_cf',
            params: []
        })
    }

    /**
     * This method sets the LED directly to a specified state.
     * 
     * @param {String} action The type of action being performed
     * @param {*} args Parameters to be passed depedning on the chosen action
     */
    set_scene(action, ...args) {
        return this._sendCommand({
            method: 'set_scene',
            params: [
                this._ifValid(action, ['color', 'hsv', 'ct', 'cf', 'auto_delay_off'], 'color'),
                ...args
            ]
        })
    }

    /**
     * Set a timer job on the LED.
     * 
     * @param {Number} type Currently only 0 (power off)
     * @param {Number} value Timer length in minutes
     */
    cron_add(type = 0, value = 1) {
        return this._sendCommand({
            method: 'cron_add',
            params: [
                this._ifValid(type, [0], 0),
                value || 1
            ]
        })
    }

    /**
     * Get running timer jobs of the specified type.
     * 
     * @param {Number} type Currently only 0 (power off)
     */
    cron_get(type = 0) {
        return this._sendCommand({
            methods: 'cron_get',
            params: [
                this._ifValid(type, [0], 0)
            ]
        })
    }

    /**
     * Stop the specified cron job.
     * 
     * @param {Number} type Currently only 0 (power off)
     */
    cron_del(type = 0) {
        return this._sendCommand({
            method: 'cron_del',
            params: [
                this._ifValid(type, [0], 0)
            ]
        })
    }

    /**
     * This method is used to change the brightness, color, or CT of the smart LED without
     * knowing the current value.
     * 
     * @param {String} action The direction of the adjustment (increase, decrease, circle)
     * @param {String} prop The property to adjust
     */
    set_adjust(action = 'circle', prop = 'bright') {
        const validatedAction = prop === 'color'
            ? 'circle'
            : this._ifValid(action, ['increase', 'decrease', 'circle'], 'circle')
        return this._sendCommand({
            method: 'set_adjust',
            params: [
                validatedAction,
                this._ifValid(prop, ['bright', 'ct', 'color'], 'circle')
            ]
        })
    }

    /**
     * This method starts or stops a music server, able to send all supported commands
     * to simulate a music effect.
     * 
     * @param {Number} action The action of the set_music command, euther 0 = off or 1 = on
     * @param {String} host The host address of the TCP server
     * @param {Number} port The TCP port of the TCP server
     */
    set_music(action = 0, host, port) {
        return this._sendCommand({
            method: 'set_music',
            params: [
                this._ifValid(action, [0, 1], 0),
                host,
                port
            ]
        })
    }

    /**
     * This method is used to name the device. The name will be stored in device memory.
     * 
     * @param {String} name The name to set
     */
    set_name(name) {
        if (name) {
            return this._sendCommand({
                method: 'set_name',
                params: [
                    name
                ]
            })
        }
        return null
    }
}

module.exports = Yeelight
