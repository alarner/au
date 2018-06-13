import { ActionResult, buildStore, d, Dispatcher } from '../bundle.umd';

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Dispatcher', () => {
	it('default should exist', () => {
		expect(d).toBeInstanceOf(Dispatcher);
	});

	describe('subscribe', () => {
		it('should throw an error if subscribe is not passed a store', () => {
			expect(() => d.subscribe('foo')).toThrow('Dispatcher.subscribe requires a store.');
		});

		it('should successfully subscribe a real Store', () => {
			const Store = buildStore({});
			const s = new Store(7);
			expect(() => d.subscribe(s)).not.toThrow();
		});
	});

	describe('trigger', () => {
		it('should process immediate actions when there is nothing in the queue', () => {
			const Store = buildStore({
				increment(state) {
					return state + 1;
				},
				decrement(state) {
					return state - 1;
				}
			});
			const s = new Store(7);

			d.subscribe(s);

			d.trigger('increment');

			expect(s.state(false)).toEqual(8);
			expect(s.state(true)).toEqual(8);

			d.trigger('decrement');

			expect(s.state(false)).toEqual(7);
			expect(s.state(true)).toEqual(7);
		});

		it('should process deferred actions when there is something in the queue', async () => {
			const Store = buildStore({
				increment(state) {
					return new ActionResult(
						state + 1,
						async () => {
							await pause(300);
							return 10;
						}
					);
				},
				decrement(state) {
					return new ActionResult(
						state + 1,
						async () => {
							await pause(300);
							return state - 1;
						}
					);
				}
			});
			const s = new Store(7);

			d.subscribe(s);

			const promise = d.trigger('increment');

			expect(s.state(false)).toEqual(8);
			expect(s.state(true)).toEqual(7);

			await promise;

			expect(s.state(false)).toEqual(10);
			expect(s.state(true)).toEqual(10);
		});

		it('should replay pending actions after a deferred action completes', async () => {
			const Store = buildStore({
				increment(state) {
					return new ActionResult(
						state + 1,
						async () => {
							await pause(300);
							return 10;
						}
					);
				},
				decrement(state) {
					return new ActionResult(
						state + 1,
						async () => {
							await pause(300);
							return state - 1;
						}
					);
				}
			});
			const s = new Store(7);
			s.setKey('counter');

			d.subscribe(s);

			const promise1 = d.trigger('increment');

			expect(s.state(false)).toEqual(8);
			expect(s.state(true)).toEqual(7);

			const promise2 = d.trigger('increment');

			expect(s.state(false)).toEqual(9);
			expect(s.state(true)).toEqual(7);

			const result1 = await promise1;

			expect(result1).toEqual(true);
			expect(s.state(false)).toEqual(11);
			expect(s.state(true)).toEqual(10);

			const result2 = await promise2;

			expect(result2).toEqual(true);
			expect(s.state(false)).toEqual(10);
			expect(s.state(true)).toEqual(10);
		});
	});
});