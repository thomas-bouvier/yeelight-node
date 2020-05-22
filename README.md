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

You can get started by running the example, which will discover and ping your lights over LAN:

```bash
node example/index.js
```

In your code, simply require and instantiate the package as a class, passing in the IP address and port of the light as an object.

```javascript
const { Yeelight } = require('yeelight-node')

const yeelight = new Yeelight({ ip: '0.0.0.0', port: 55443 })

yeelight.set_power('on')
yeelight.set_rgb([250, 150, 120])

yeelight.get_prop('bright').then(
    data => console.log(data)
)
```

If you don't know the IP of your light, you can use the SSDP client to scan your network:

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

**⚠️ Make sure you enabled the *LAN Control* option in the Yeelight app.**

## Credits

Original work by [@cpav3](https://github.com/cpave3).