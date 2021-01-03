const { Client } = require('../lib')

const client = new Client()

client.on('message', data => {
    console.log(data.toString())
})

client.bind(yeelight => {
    yeelight.set_power('on')
    yeelight.start_cf(10, 2, [[1000, 2, 2700, 100], [500, 1, 255, 10], [5000, 7, 0, 0], [500, 2, 5000, 1]])

    yeelight.get_prop('bright').then(
        data => console.log(data)
    )
})
