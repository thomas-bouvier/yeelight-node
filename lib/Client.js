const dgram = require('dgram')
const qs = require('querystring')
const url = require('url')
const EventEmitter = require('events')

const Yeelight = require('./Yeelight')

const defaultConfig = {
    ip: '239.255.255.250',
    port: 1982,
    service: 'wifi_bulb',
    man: '"ssdp:discover"'
}

class Client extends EventEmitter {
    constructor(config = defaultConfig) {
        super()
        //  We need to set the config provided by the user here.
        //  Anything that they don't provide needs to be taken from the default.
        Object.keys(defaultConfig).forEach(key => {
            if (!config[key]) {
                config[key] = defaultConfig[key]
            }
        })
        this.config = config
        this.socket = dgram.createSocket('udp4')
        this.lights = []
    }

    search() {
        // Send out an M-SEARCH from this client
        const message = new Buffer.from([
            'M-SEARCH * HTTP/1.1',
            `HOST: ${this.config.ip}:${this.config.port}`,
            `MAN: ${this.config.man}`,
            `ST: ${this.config.service}`
        ].join('\r\n'))

        this.socket.send(message, 0, message.length, this.config.port, this.config.ip)
    }

    bind(callback) {
        this.socket.on('message', (message, rinfo) => {
            this.emit('message', message)

            const data = qs.parse(message.toString(), '\r\n', ': ')
            const light = this.lights.find(yee => yee.id === parseInt(data['id'], 16))

            if (!light) {
                const location = data['Location']

                if (location) {
                    const urlObj = url.parse(location)
                    const yeelight = new Yeelight({
                        id: parseInt(data['id'], 16),
                        ip: urlObj['hostname'],
                        port: urlObj['port'],
                        name: Buffer.from(data['name'], 'base64').toString(),
                        model: data['model'],
                        fw_ver: data['fw_ver'],
                        methods: data['support'].split(' '),
                        state: {
                            on: data['power'] == 'on' ? true : false,
                            brightness: data['bright'],
                            color_mode: data['color_mode'],
                            color_temp: data['ct'],
                            rgb: data['rgb'],
                            hue: data['hue'],
                            sat: data['sat']
                        }
                    })
                    this.lights.push(yeelight)
                    if (callback) {
                        callback(yeelight)
                    }
                }
            }
        })

        // Bind the internal socket to the requested port
        this.socket.on('listening', () => {
            this.socket.addMembership(this.config.ip)
            this.search()
        })

        this.socket.on('error', error => {
            this.socket.close()
        })

        this.socket.bind(this.config.port)
    }
}

module.exports = Client
