const Dispatcher = require('../src/Dispatcher');
const Store = require('../src/Store');
const globals = require('../src/globals');

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
		it('should not allow non-string action name', () => {
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
		it('should respect dependencies (order 1)', async () => {
			const d1 = new Dispatcher();
			const UserStore = Store.build({
				evt_name: {
					run(resolve, reject, data) {
						callOrder1.push(1);
						resolve();
					}
				}
			}, d1);
			const TestStore = Store.build({
				evt_name: {
					dependencies: ['user'],
					run(resolve, reject, data) {
						callOrder1.push(2);
						resolve();
					}
				}
			}, d1);
			const stores = {
				user: new UserStore(),
				test: new TestStore()
			};
			globals.default.set('stores', stores);

			const callOrder1 = [];
			await d1.trigger('evt_name');
			expect(callOrder1).toEqual([1, 2]);
		});
		it('should respect dependencies (order 2)', async () => {
			const d1 = new Dispatcher();
			const UserStore = Store.build({
				evt_name: {
					dependencies: ['test'],
					run(resolve, reject, data) {
						callOrder1.push(1);
						resolve();
					}
				}
			}, d1);
			const TestStore = Store.build({
				evt_name: {
					run(resolve, reject, data) {
						callOrder1.push(2);
						resolve();
					}
				}
			}, d1);
			const stores = {
				user: new UserStore(),
				test: new TestStore()
			};
			globals.default.set('stores', stores);

			const callOrder1 = [];
			await d1.trigger('evt_name');
			expect(callOrder1).toEqual([2, 1]);
		});
		it('should run actions in series', async () => {
			const d1 = new Dispatcher();
			const callOrder1 = [];
			const UserStore = Store.build({
				evt_name1: {
					dependencies: ['test'],
					run(resolve, reject, data) {
						callOrder1.push(1);
						resolve();
					}
				}
			}, d1);
			const TestStore = Store.build({
				evt_name1: {
					run(resolve, reject, data) {
						callOrder1.push(2);
						resolve();
					}
				},
				evt_name2: {
					run(resolve, reject, data) {
						callOrder1.push(3);
						resolve();
					}
				}
			}, d1);
			const stores = {
				user: new UserStore(),
				test: new TestStore()
			};
			globals.default.set('stores', stores);

			await Promise.all([
				d1.trigger('evt_name1'),
				d1.trigger('evt_name2'),
			]);
			expect(callOrder1).toEqual([2, 1, 3]);
		});
		it('should run subsequent actions if a previous one is rejected and recoverable', async () => {
			const d1 = new Dispatcher();
			const callOrder1 = [];
			const UserStore = Store.build({
				evt_name1: {
					run(resolve, reject, data) {
						callOrder1.push(1);
						reject({ message: 'A recoverable error' });
					}
				}
			}, d1);
			const TestStore = Store.build({
				evt_name1: {
					dependencies: ['user'],
					run(resolve, reject, data) {
						setTimeout(() => {
							callOrder1.push(2);
							resolve();
						}, 50);
					}
				},
				evt_name2: {
					run(resolve, reject, data) {
						callOrder1.push(3);
						resolve();
					}
				}
			}, d1);
			const stores = {
				user: new UserStore(),
				test: new TestStore()
			};
			globals.default.set('stores', stores);

			await Promise.all([
				d1.trigger('evt_name1'),
				d1.trigger('evt_name2'),
			]);
			expect(callOrder1).toEqual([1, 2, 3]);
		});
		it('should not run subsequent handlers if a previous one is rejected and not recoverable', async () => {
			const d1 = new Dispatcher();
			const callOrder1 = [];
			const UserStore = Store.build({
				evt_name1: {
					run(resolve, reject, data) {
						callOrder1.push(1);
						reject({ message: 'A recoverable error', recoverable: false });
					}
				}
			}, d1);
			const TestStore = Store.build({
				evt_name1: {
					dependencies: ['user'],
					run(resolve, reject, data) {
						setTimeout(() => {
							callOrder1.push(2);
							resolve();
						}, 50);
					}
				},
				evt_name2: {
					run(resolve, reject, data) {
						callOrder1.push(3);
						resolve();
					}
				}
			}, d1);
			const stores = {
				user: new UserStore(),
				test: new TestStore()
			};
			globals.default.set('stores', stores);

			try {
				await d1.trigger('evt_name1');
			}
			catch(error) {
				callOrder1.push('e');
			}
			await d1.trigger('evt_name2');
			expect(callOrder1).toEqual([1, 'e', 3]);
		});
		it('should eagerly run events if queue is false', async () => {
			const d1 = new Dispatcher();
			const callOrder1 = [];
			const UserStore = Store.build({
				evt_name1: {
					run(resolve, reject, data) {
						setTimeout(() => {
							callOrder1.push(1);
							resolve();
						}, 500);
					}
				}
			}, d1);
			const TestStore = Store.build({
				evt_name1: {
					dependencies: ['user'],
					run(resolve, reject, data) {
						callOrder1.push(2);
						resolve();
					}
				},
				evt_name2: {
					run(resolve, reject, data) {
						callOrder1.push(3);
						resolve();
					}
				}
			}, d1);
			const stores = {
				user: new UserStore(),
				test: new TestStore()
			};
			globals.default.set('stores', stores);

			await Promise.all([
				d1.trigger('evt_name1'),
				d1.trigger('evt_name2', null, false),
			]);
			expect(callOrder1).toEqual([3, 1, 2]);
		});
	});
});