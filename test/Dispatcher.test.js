import Dispatcher from '../src/Dispatcher';
import Store from '../src/Store';
import { StoreError } from '../src/error';
import globals from '../src/globals';

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
					async run(action) {
						call = true;
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
					async run(action) {
						call = true;
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
					async run(action) {
						call = true;
					}
				}
			});
			const us = new UserStore();
			
			d.on(us, 'evt_name', ['FooStore']);
			d.on(us, 'evt_name', null);
			await d.trigger('evt_name');
			expect(call).toBeTruthy();
		});
		it('should not run subsequent handlers if a previous one is rejected', async () => {
			const d1 = new Dispatcher();
			const callOrder1 = [];
			const UserStore = Store.build({
				evt_name1: {
					async run(data) {
						callOrder1.push(1);
						throw new StoreError({ message: 'A recoverable error', recoverable: false });
					}
				}
			}, d1);
			const TestStore = Store.build({
				evt_name1: {
					dependencies: ['user'],
					async run(data) {
						await new Promise((resolve, reject) => {
							setTimeout(() => {
								callOrder1.push(2);
								resolve();
							}, 50);
						});
					}
				},
				evt_name2: {
					async run(data) {
						callOrder1.push(3);
					}
				}
			}, d1);
			const stores = {
				user: new UserStore(),
				test: new TestStore()
			};
			globals.set('stores', stores);

			try {
				await d1.trigger('evt_name1');
			}
			catch(error) {
				callOrder1.push('e');
			}
			await d1.trigger('evt_name2');
			expect(callOrder1).toEqual([1, 'e', 3]);
		});
	});

	describe('trigger', () => {
		it('should exist', () => {
			const d = new Dispatcher();
			expect(d.trigger).toBeTruthy();
		});

		it('should throw an error if there are no handlers to process the action', async () => {
			const d = new Dispatcher();
			try {
				await d.trigger('foo');
				expect(true).toEqual(false);
			}
			catch(error) {
				expect(error.message).toEqual('There are no handlers for action "foo"');
			}
		});

		it('should return true if there is no error thrown', async () => {
			const d1 = new Dispatcher();
			const UserStore = Store.build({
				async foo() {
					return false;
				}
			}, d1);
			const stores = {
				user: new UserStore()
			};
			globals.set('stores', stores);

			const result = await d1.trigger('foo');
			expect(result).toEqual(true);
		});

		it('should throw an error if any action throws', async () => {
			const d1 = new Dispatcher();
			const UserStore = Store.build({
				async foo() {
					throw new Error('non-recoverable');
				}
			}, d1);
			const stores = {
				user: new UserStore()
			};
			globals.set('stores', stores);
			
			try {
				await d1.trigger('foo');
				expect(true).toEqual(false);
			}
			catch(error) {
				expect(error.message).toEqual('non-recoverable');
			}
		});
	});
});