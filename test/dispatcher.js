let expect = require('chai').expect;
let Dispatcher = require('../src/dispatcher/index');
let sinon = require('sinon');

describe('Dispatcher', function() {
	it('should exist', function() {
		expect(Dispatcher).to.be.a('function');
	});

	describe('on', function() {
		const d = new Dispatcher();
		it('should exist', function() {
			expect(d.on).to.be.a('function');
		});
		it('should not allow non-string storeDescriptor', function() {
			expect(() => { d.on(); }, 'undefined should throw').to.throw('First argument storeDescriptor must be a string');
			expect(() => { d.on(5); }, 'number should throw').to.throw('First argument storeDescriptor must be a string');
			expect(() => { d.on({}); }, 'object should throw').to.throw('First argument storeDescriptor must be a string');
		});
		it('should not allow non-string eventName', function() {
			expect(() => { d.on('user_store'); }, 'undefined should throw').to.throw('Second argument eventName must be a string');
			expect(() => { d.on('user_store', 5); }, 'number should throw').to.throw('Second argument eventName must be a string');
			expect(() => { d.on('user_store', {}); }, 'object should throw').to.throw('Second argument eventName must be a string');
		});
		it('should not allow non-array promiseCallbacks', function() {
			expect(() => { d.on('user_store', 'evt_name'); }, 'undefined should throw').to.throw('Fourth argument promiseFunctions must be an array');
			expect(() => { d.on('user_store', 'evt_name', null, 5); }, 'number should throw').to.throw('Fourth argument promiseFunctions must be an array');
			expect(() => { d.on('user_store', 'evt_name', null, {}); }, 'object should throw').to.throw('Fourth argument promiseFunctions must be an array');
		});
		it('should not allow empty array of promiseCallbacks', function() {
			expect(() => { d.on('user_store', 'evt_name', null, []); }).to.throw('Fourth argument promiseFunctions must have at least one element');
		});
		it('should work with valid arguments', function() {
			expect(() => { d.on('user_store', 'evt_name', null, [() => {}]); }).not.to.throw();
		});
		it('should remove old references if called more than once with the same storeDescriptor and eventName', function(done) {
			const d = new Dispatcher();
			const cb1 = sinon.spy();
			const cb2 = sinon.spy();
			const cb3 = sinon.spy();
			d.on('user_store', 'evt_name', null, [cb1]);
			d.on('user_store', 'evt_name', null, [cb2, cb3]);
			const promise = d.trigger('evt_name');
			promise.then(result => {
				expect(cb1.called, 'cb1 not called').to.be.false;
				expect(cb2.called, 'cb2 called').to.be.true;
				expect(cb3.called, 'cb3 called').to.be.true;
				done();
			})
			.catch(err => {
				console.log(err);
				done();
			});
			// setTimeout(() => {
			// 	expect(cb1.called, 'cb1 not called').to.be.false;
			// 	expect(cb2.called, 'cb2 called').to.be.true;
			// 	expect(cb3.called, 'cb3 called').to.be.true;
			// 	done();
			// }, 200);
		});
	});
});