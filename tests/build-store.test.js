import { buildStore, d, Dispatcher } from '../bundle.umd';

describe('buildStore', () => {
	it('should exist', () => {
		expect(typeof buildStore).toBe('function');
	});

	describe('constructor', () => {
		it('should set the starting value of the state', () => {
			const Store = buildStore({});
			const s = new Store(7);
			expect(s.state()).toEqual(7);
		});
	});

	describe('connectToState', () => {
		it('should add a component setState function to the store', () => {
			const Store = buildStore({});
			const s = new Store(7);

			expect(() => s.connectToState(1, () => {})).not.toThrow();
		});

		it('should throw an error if the component had already been added to the state', () => {
			const Store = buildStore({});
			const s = new Store(7);
			s.setKey('myStore');

			expect(() => s.connectToState(1, () => {})).not.toThrow();
			expect(() => s.connectToState(1, () => {})).toThrow(
				'component (key=1) is already listening to the store (key=myStore)'
			);
		});
	});

	describe('setKey / key', () => {
		it('should set and get the value of the key', () => {
			const Store = buildStore({});
			const s = new Store(7);
			s.setKey('foo');
			expect(s.key()).toEqual('foo');
		});
	});

	describe('setState / state', () => {
		it('should set and get the value of the state', () => {
			const Store = buildStore({});
			const s = new Store(7);
			s.setState('panda');
			expect(s.state()).toEqual('panda');
			expect(s.state(true)).toEqual(7);
		});

		it('should be able to set and get the clean value of the state', () => {
			const Store = buildStore({});
			const s = new Store(7);
			s.setState('panda', true);
			expect(s.state(true)).toEqual('panda');
		});
	});

	describe('triggerStateChange', () => {
		it('should trigger a setState call to each component that is connected', async () => {
			const Store = buildStore({});
			const s = new Store(7);
			const setStateFns = {
				test1: (state, cb) => cb(),
				test2: (state, cb) => cb()
			};
			const test1 = jest.spyOn(setStateFns, 'test1');
			const test2 = jest.spyOn(setStateFns, 'test2');
			s.connectToState(1, test1);
			s.connectToState(2, test2);

			await s.triggerStateChange();

			expect(test1).toHaveBeenCalled();
			expect(test2).toHaveBeenCalled();
		});
	});

	describe('dispatcher', () => {
		it('should get the default dispatcher if not dispatcher is supplied to buildStore', () => {
			const Store = buildStore({});
			const s = new Store(7);
			expect(s.dispatcher()).toEqual(d);
		});

		it('should be able to get the custom dispatcher', () => {
			const custom = new Dispatcher();
			const Store = buildStore({}, custom);
			const s = new Store(7);
			expect(s.dispatcher()).toEqual(custom);
		});
	});

	describe('canHandleAction', () => {
		it('should return true if the store handles the specified action', () => {
			const Store = buildStore({
				my_action() {}
			});
			const s = new Store(7);
			expect(s.canHandleAction('my_action')).toEqual(true);
		});

		it('should return false if the store does not handle the specified action', () => {
			const Store = buildStore({
				my_action() {}
			});
			const s = new Store(7);
			expect(s.canHandleAction('my_action2')).toEqual(false);
		});
	});

	describe('handleAction', () => {
		it('should call the specified action', () => {
			const Store = buildStore({
				add(state, data) {
					return state + 1
				}
			});
			const s = new Store(7);
			expect(s.handleAction('add', {}, 7)).toEqual(8);
		});
	});
});