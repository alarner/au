const Dispatcher = require('../src/Dispatcher');
const Store = require('../src/Store');

describe('Dispatcher', () => {
	it('should exist', () => {
		expect(Dispatcher).toBeTruthy();
	});

	describe('on', () => {
		it('should exist', () => {
			const d = new Dispatcher();
			expect(d.on).toBeTruthy();
		});
		it('should not allow non-Store first argument', () => {
			const d = new Dispatcher();
			expect(() => { d.on(); }).toThrowError('First argument must be a Store');
			expect(() => { d.on(5); }).toThrowError('First argument must be a Store');
			expect(() => { d.on({}); }).toThrowError('First argument must be a Store');
			expect(() => { d.on({descriptor: 0}); }).toThrowError('First argument must be a Store');
			expect(() => { d.on({descriptor() {return 5;}}); }).toThrowError('First argument must be a Store');
		});
		it('should not allow non-string eventName', () => {
			const d = new Dispatcher();
			const UserStore = Store.build({
				evt_name: {
					dependencies: [],
					run(resolve, reject, action) {
						call = true;
						resolve();
					}
				}
			});
			const us = new UserStore();
			expect(() => { d.on(us); }).toThrowError('Second argument "action" must be a string');
			expect(() => { d.on(us, 5); }).toThrowError('Second argument "action" must be a string');
			expect(() => { d.on(us, {}); }).toThrowError('Second argument "action" must be a string');
		});
		it('should work with valid arguments', () => {
			const d = new Dispatcher();
			const UserStore = Store.build({
				evt_name: {
					dependencies: [],
					run(resolve, reject, action) {
						call = true;
						resolve();
					}
				}
			});
			const us = new UserStore();
			expect(() => { d.on(us, 'evt_name', null); }).not.toThrow();
		});
		it('should remove old references if called more than once with the same storeDescriptor and action', async () => {
			const d = new Dispatcher();
			let call = false;
			const UserStore = Store.build({
				evt_name: {
					dependencies: [],
					run(resolve, reject, action) {
						call = true;
						resolve();
					}
				}
			});
			const us = new UserStore();
			
			d.on(us, 'evt_name', ['FooStore']);
			d.on(us, 'evt_name', null);
			await d.trigger('evt_name');
			expect(call).toBeTruthy();
		});
		it('should respect dependencies', async () => {
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
			d1.on(us, 'evt_name', ['TestStore'], cb2);
			d1.on(ts, 'evt_name', null, cb1);
			await d1.trigger('evt_name');
			expect(callOrder1).to.deep.equal([1, 2]);

			const d2 = new Dispatcher();
			const callOrder2 = [];
			const cb3 = (resolve, reject, data) => {
				callOrder2.push(1);
				resolve();
			};
			const cb4 = (resolve, reject, data) => {
				callOrder2.push(2);
				resolve();
			};
			d2.on(ts, 'evt_name', null, cb3);
			d2.on(us, 'evt_name', ['TestStore'], cb4);
			await d2.trigger('evt_name');
			expect(callOrder1).to.deep.equal([1, 2]);
		});
	});
});