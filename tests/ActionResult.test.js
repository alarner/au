import { ActionResult } from '../bundle.umd';

describe('ActionResult', () => {
	it('should exist', () => {
		const a = new ActionResult();
		expect(a).toBeInstanceOf(ActionResult);
	});

	it('should throw if the 2nd argument to the constructor supplied and is not a function', () => {
		expect(() => new ActionResult('foo', 'bar')).toThrow(
			'Second argument to ActionResult constructor must be a function if supplied.'
		);
	})
});