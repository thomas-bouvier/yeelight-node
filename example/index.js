const { Client } = require('../lib');

const client = new Client();

client.on('message', data => {
    console.log(data.toString());
});

client.bind();