import { d, Dispatcher } from '../bundle.umd';

describe('Dispatcher', () => {
	it('default should exist', () => {
		expect(d).toBeInstanceOf(Dispatcher);
	});
	it('should throw an error if subscribe is not passed a store', () => {
		expect(() => d.subscribe('foo')).toThrow('Dispatcher.subscribe requires a store.');
	});
});