'use strict';

const chai   = require('chai')
    , expect = chai.expect
    , sinon  = require('sinon');

const Yeelight = require('../');

describe('_constrain', () => {
    it('should limit a number to the max value', () => {
        const yee = new Yeelight();
        expect(yee._constrain(100, 10, 25)).to.equal(25);
    });

    it('should limit a number to the min value', () => {
        const yee = new Yeelight();
        expect(yee._constrain(1, 10, 25)).to.equal(10);
    });

    it('should not affect valid values', () => {
        const yee = new Yeelight();
        expect(yee._constrain(5, 0, 10)).to.equal(5);
    });

    it('should set non numbers to the minimum', () => {
        const yee = new Yeelight();
        expect(yee._constrain(NaN, 0, 10)).to.equal(0);
        expect(yee._constrain([], 0, 10)).to.equal(0);
        expect(yee._constrain('string', 0, 10)).to.equal(0);
    });
});

describe('_inArray', () => {
    it('should find an item in an array', () => {
        const yee = new Yeelight();
        expect(yee._inArray('findMe', ['foo', 2, 'bar', 'findMe', 'baz'])).to.equal(true);
    });

    it('should not find an item which is not in the array', () => {
        const yee = new Yeelight();
        expect(yee._inArray('findMeNot', ['foo', 2, 'bar', 'findMe', 'baz'])).to.equal(false);
    });

    it('should return false when given a non array as the haystack', () => {
        const yee = new Yeelight();
        expect(yee._inArray('string', 'notAnArray')).to.equal(false);
    });
});

describe('_ifValid', () => {
    it('should return the input if valid', () => {
        const yee = new Yeelight();
        expect(yee._ifValid('validString', ['validString', 2, 3, 4], 'default')).to.equal('validString');
        expect(yee._ifValid('validString', ['validString', 2, 3, 4])).to.equal('validString');
    });

    it('should return the default if input is invalid', () => {
        const yee = new Yeelight();
        expect(yee._ifValid('invalidString', ['validString', 2, 3, 4], 'default')).to.equal('default');
        expect(yee._ifValid('invalidString', ['validString', 2, 3, 4])).to.equal(''); 
    });
});

describe('Yeelight Class', () => {
    const yee = new Yeelight({ip: '0.0.0.0', port: 55443});
    this.write = sinon.stub(yee.client, 'write').returns(true);
    this.connect = sinon.stub(yee.client, 'connect');

    it('should emit values coming from the data listener', (done) => {
        yee.on('data', (data) => {
            expect(data).to.equal(true);
            done();
        });
        yee.emit('data', true);
    });

    it('should emit values coming from the close listener', (done) => {
        yee.on('close', (data) => {
            expect(yee.connected).to.equal(false);
            expect(data).to.be.an('object');
            done();
        });
        yee.emit('close', {});
    });
   
    it('should touch the command sneder with toggle', () => {
        yee.toggle();
    });
});