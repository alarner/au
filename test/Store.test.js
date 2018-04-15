import Dispatcher from '../src/Dispatcher';
import Store from '../src/Store';
import globals from '../src/globals';

describe('storeBuilder', () => {
	it('should exist', () => {
		expect(Store.build).toBeTruthy();
	});

	it('should build a Store class', () => {
		const d = new Dispatcher();
		const TestStore = Store.build('TestStore', d);
		expect(TestStore).toBeTruthy();
	});
});

describe('Store', () => {
	const TestStore = Store.build({
		async foo() {
			return this.value();
		}
	});

	const ts = new TestStore({foo: 'bar'});

	describe('listen', () => {
		it('should exist', () => {
			expect(ts.listen).toBeTruthy();
		});

		it('should allow components to listen', () => {
			const test = new TestStore();
			test.listen('ButtonComponent', () => {});
			test.listen('FooComponent', () => {});
		});

		it('should not allow the same component to listen more than once', () => {
			const test = new TestStore();
			test.listen('ButtonComponent', () => {});
			expect(() => test.listen('ButtonComponent', () => {})).toThrowError(
				'component (key=ButtonComponent) is already listening to the store (id=1, key=null)'
			);
		});

		it('should call the callback function when the store is changed', async () => {
			const test = new TestStore();
			let called = false;
			test.listen('ButtonComponent', (resolve, reject, data) => {
				called = true;
				expect(data.action).toEqual('test_evt');
				resolve();
			});

			await test.change('test_evt');

			expect(called).toEqual(true);
		});
	});

	describe('ignore', () => {
		it('should exist', () => {
			expect(ts.ignore).toBeTruthy();
		});

		it('should allow components to ignore', () => {
			const test = new TestStore();
			test.ignore('ButtonComponent');
		});

		it('should not trigger the callback after being ignored', async () => {
			const test = new TestStore();
			let called = false;
			test.listen('ButtonComponent', (resolve, reject, data) => {
				called = true;
				resolve();
			});
			test.ignore('ButtonComponent');

			await test.change('test_evt');

			expect(called).toEqual(false);
		});

		it('should allow listening again after ignoring', () => {
			const test = new TestStore();
			let called = false;
			test.listen('ButtonComponent', (resolve, reject, data) => {
				called = true;
				resolve();
			});
			test.ignore('ButtonComponent');

			expect(() => { test.listen('ButtonComponent', () => {}); }).not.toThrow();
		});
	});

	describe('connectToState', () => {
		it('should exist', () => {
			expect(ts.connectToState).toBeTruthy();
		});

		it('should return the current value of the store', () => {
			const test = new TestStore({ foo: 'bar' });
			const setState = jest.fn();
			const state = test.connectToState('ButtonComponent', setState);

			expect(state).toEqual({ value: { foo: 'bar' }, loading: false, error: null });
		});

		it('should call setState with the new value from the get method', async () => {
			const d1 = new Dispatcher();
			const setState = jest.fn();
			const UserStore = Store.build({
				async foo() {
					return { foo: 'bar' };
				}
			}, d1);
			const stores = {
				user: new UserStore()
			};
			globals.set('stores', stores);
			const state = stores.user.connectToState('ButtonComponent', setState);

			await d1.trigger('foo');

			expect(setState.mock.calls.length).toEqual(1);
			expect(setState.mock.calls[0][0]).toEqual({ user: { value: { foo: 'bar' }, error: null, loading: false } });
		});
	});

	describe('all', () => {
		it('should exist', () => {
			expect(ts.all).toBeTruthy();
		});

		it('should return the value, loading and error properties', () => {
			expect(ts.all()).toEqual({ value: { foo: 'bar' }, error: null, loading: false });
		});
	});

	describe('value', () => {
		it('should exist', () => {
			expect(ts.value).toBeTruthy();
		});

		it('should return the current version of the state', () => {
			expect(ts.value()).toEqual({ foo: 'bar' });
		});
	});

	describe('error', () => {
		it('should exist', () => {
			expect(ts.error).toBeTruthy();
		});

		it('should return the current error', () => {
			expect(ts.error()).toBe(null);
		});
	});

	describe('loading', () => {
		it('should exist', () => {
			expect(ts.loading).toBeTruthy();
		});

		it('should return the current loading status', () => {
			expect(ts.loading()).toBe(false);
		});
	});
});