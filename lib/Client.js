const dgram  = require('dgram');
const EventEmitter = require('events');

const defaultConfig = {
    ip: '239.255.255.250',
    port: 1982,
    service: 'wifi_bulb',
    man: '"ssdp:discover"'
};

class Client extends EventEmitter {
    constructor(config = defaultConfig) {
        super();
        //  We need to set the config provided by the user here.
        //  Anything that they don't provide needs to be taken from the default.
        Object.keys(defaultConfig).forEach(key => {
            if (!config[key]) {
                config[key] = defaultConfig[key];
            }
        });
        this.config = config;
        this.socket = dgram.createSocket('udp4');
    }

    search() {
        // Send out an M-SEARCH from this client
        const message = new Buffer.from([
            'M-SEARCH * HTTP/1.1',
            `HOST: ${this.config.ip}:${this.config.port}`,
            `MAN: ${this.config.man}`,
            `ST: ${this.config.service}`
        ].join('\r\n'));

        this.socket.send(message, 0, message.length, this.config.port, this.config.ip);
    }

    bind() {
        // Bind the internal socket to the requested port
        this.socket.on('listening', () => {
            this.socket.addMembership(this.config.ip);
            this.search();
        });

        this.socket.on('message', (message) => {
            this.emit('message', message);
        });

        this.socket.bind(this.config.port);
    }
}

module.exports = Client;