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
		it('should remove old references if called more than once with the same storeDescriptor and eventName', function*() {
			const d = new Dispatcher();
			let call1 = false;
			let call2 = false;
			let call3 = false;
			const cb1 = (resolve, reject, data) => {
				call1 = true;
				resolve();
			};
			const cb2 = (resolve, reject, data) => {
				call2 = true;
				resolve();
			};
			const cb3 = (resolve, reject, data) => {
				call3 = true;
				resolve();
			};
			d.on('user_store', 'evt_name', null, [cb1]);
			d.on('user_store', 'evt_name', null, [cb2, cb3]);
			yield d.trigger('evt_name');
			expect(call1, 'cb1 not called').to.be.false;
			expect(call2, 'cb2 called').to.be.true;
			expect(call3, 'cb3 called').to.be.true;
		});
		it('should respect dependencies', function*() {
			const d1 = new Dispatcher();
			const callOrder1 = [];
			const cb1 = (resolve, reject, data) => {
				callOrder1.push(1);
				resolve();
			};
			const cb2 = (resolve, reject, data) => {
				callOrder1.push(2);
				resolve();
			};
			const cb3 = (resolve, reject, data) => {
				callOrder1.push(3);
				resolve();
			};
			d1.on('user_store', 'evt_name', ['test_store'], [cb2, cb3]);
			d1.on('test_store', 'evt_name', null, [cb1]);
			yield d1.trigger('evt_name');
			expect(callOrder1).to.deep.equal([1, 2, 3]);

			const d2 = new Dispatcher();
			const callOrder2 = [];
			const cb4 = (resolve, reject, data) => {
				callOrder2.push(4);
				resolve();
			};
			const cb5 = (resolve, reject, data) => {
				callOrder2.push(5);
				resolve();
			};
			const cb6 = (resolve, reject, data) => {
				callOrder2.push(6);
				resolve();
			};
			d2.on('user_store', 'evt_name', null, [cb5, cb6]);
			d2.on('test_store', 'evt_name', ['user_store'], [cb4]);
			yield d2.trigger('evt_name');
			expect(callOrder2).to.deep.equal([5, 6, 4]);
		});
	});
});