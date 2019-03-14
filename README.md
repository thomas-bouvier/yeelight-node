# node-yeelight

**node-yeelight** is a 0 dependency solution for controlling Xiaomi Yeelights. This version also includes an SSDP implementation to retrieve the IP of your light.

<p align="center">
  <!-- Why isn't there Markdown for centered images? -->
  <img src="https://imgs.xkcd.com/comics/standards.png" alt="Competing standards">
</p>

## How do I use this?

Simply require and instantiate the package as a class, passing in the ip address and port of the light as an object.

```
const Yeelight = require('node-yeelight');

const yeelight = new Yeelight({ ip: '0.0.0.0', port: 55443 });
yeelight.set_rgb([250, 150, 120])
```

If you don't know the IP of your light, you can use the SSDP client to scan your network:

```
const Client = require('node-yeelight');

new Client().bind(yeelight => {
    yeelight.set_rgb([250, 150, 120])
});
```

You can now call any of the operations from the official docs on this instance.

**⚠️ Make sure you enabled the *LAN Control* option in the Yeelight app.**

## Credits

Original work by [@cpav3](https://github.com/cpave3).