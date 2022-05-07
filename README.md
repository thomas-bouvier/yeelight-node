# yeelight-node

[![npm](https://img.shields.io/npm/v/yeelight-node.svg)](https://www.npmjs.com/package/yeelight-node)
[![Build Status](https://travis-ci.com/thomas-bouvier/yeelight-node.svg?branch=master)](https://travis-ci.com/thomas-bouvier/yeelight-node)

A simple Node.js library to discover and control Xiaomi Yeelights over LAN.

This solution offers a 1:1 implementation of the [official docs from Xiaomi](http://www.yeelight.com/download/Yeelight_Inter-Operation_Spec.pdf), and also includes an SSDP implementation to retrieve the IP of your light.

<p align="center">
  <!-- Why isn't there Markdown for centered images? -->
  <img src="https://imgs.xkcd.com/comics/standards.png" alt="Competing standards">
</p>

## Installation

```bash
# Run this in your favourite terminal
npm i yeelight-node
```

## Usage

**⚠️ Make sure you enabled the *LAN Control* option in the Yeelight app.**

You can get started by running the example, which will discover and ping your devices over LAN:

```bash
node example/index.js
```

In your code, simply require and instantiate the package as a class, passing in the IP address and port of the device as an object.

```javascript
const { Yeelight } = require('yeelight-node')

const yeelight = new Yeelight({ ip: '0.0.0.0', port: 55443 })

yeelight.set_power('on')
yeelight.set_rgb([250, 150, 120])

yeelight.get_prop('bright').then(
    data => console.log(data)
)
```

If you don't know the IP of your device, you can use the SSDP client to scan your network:

```javascript
const { Client } = require('yeelight-node')

const client = new Client()

client.bind(yeelight => {
    yeelight.set_power('on')
    yeelight.set_rgb([250, 150, 120])

    yeelight.get_prop('bright').then(
        data => console.log(data)
    )
})
```

You can now call any of the operations from the [official docs](http://www.yeelight.com/download/Yeelight_Inter-Operation_Spec.pdf) on this instance.

As stated in the docs, Xiaomi devices support up to 4 simultaneous TCP connections. Any further connect attempt will be rejected. This library exposes the `yeelight.closeConnection()` to close the TCP connection at will, should your use case require it.

## Tests

To run the tests:

```javascript
mocha tests/yeelight.test.js
```

## Credits

Original work by [@cpav3](https://github.com/cpave3).