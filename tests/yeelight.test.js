'use strict'

const chai = require('chai')
    , expect = chai.expect
    , sinon = require('sinon')

const Yeelight = require('../').Yeelight

describe('_constrain', () => {
    it('should limit a number to the max value', () => {
        const yeelight = new Yeelight()
        expect(yeelight._constrain(100, 10, 25)).to.equal(25)
    })

    it('should limit a number to the min value', () => {
        const yeelight = new Yeelight()
        expect(yeelight._constrain(1, 10, 25)).to.equal(10)
    })

    it('should not affect valid values', () => {
        const yeelight = new Yeelight()
        expect(yeelight._constrain(5, 0, 10)).to.equal(5)
    })

    it('should set non numbers to the minimum', () => {
        const yeelight = new Yeelight()
        expect(yeelight._constrain(NaN, 0, 10)).to.equal(0)
        expect(yeelight._constrain([], 0, 10)).to.equal(0)
        expect(yeelight._constrain('string', 0, 10)).to.equal(0)
    })
})

describe('_inArray', () => {
    it('should find an item in an array', () => {
        const yeelight = new Yeelight()
        expect(yeelight._inArray('findMe', ['foo', 2, 'bar', 'findMe', 'baz'])).to.equal(true)
    })

    it('should not find an item which is not in the array', () => {
        const yeelight = new Yeelight()
        expect(yeelight._inArray('findMeNot', ['foo', 2, 'bar', 'findMe', 'baz'])).to.equal(false)
    })

    it('should return false when given a non array as the haystack', () => {
        const yeelight = new Yeelight()
        expect(yeelight._inArray('string', 'notAnArray')).to.equal(false)
    })
})

describe('_ifValid', () => {
    it('should return the input if valid', () => {
        const yeelight = new Yeelight()
        expect(yeelight._ifValid('validString', ['validString', 2, 3, 4], 'default')).to.equal('validString')
        expect(yeelight._ifValid('validString', ['validString', 2, 3, 4])).to.equal('validString')
    })

    it('should return the default if input is invalid', () => {
        const yeelight = new Yeelight()
        expect(yeelight._ifValid('invalidString', ['validString', 2, 3, 4], 'default')).to.equal('default')
        expect(yeelight._ifValid('invalidString', ['validString', 2, 3, 4])).to.equal('')
    })
})

describe('Yeelight Class', () => {
    const yeelight = new Yeelight({ ip: '0.0.0.0', port: 55443 })
    this.write = sinon.stub(yeelight.client, 'write').returns(true)
    this.connect = sinon.stub(yeelight.client, 'connect')

    it('should emit values coming from the data listener', (done) => {
        yeelight.on('data', (data) => {
            expect(data).to.equal(true)
            done()
        })
        yeelight.emit('data', true)
    })

    it('should emit values coming from the close listener', (done) => {
        function onClose(data) {
            expect(yeelight.connected).to.equal(false)
            expect(data).to.be.an('object')
            yeelight.removeListener('close', onClose);
            done()
        }
        yeelight.on('close', onClose)
        yeelight.emit('close', {})
    })

    it('should touch the command sneder with toggle', () => {
        yeelight.toggle()
    })

    it('should close the tcp connection', () => {
        yeelight.closeConnection()
        expect(yeelight.connected).to.equal(false)
    })
})
