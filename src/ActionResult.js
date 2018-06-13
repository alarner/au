export default class ActionResult {
	constructor(immediate, deferred) {
		if(deferred && !(deferred instanceof Function)) {
			throw new Error(
				'Second argument to ActionResult constructor must be a function if supplied.'
			);
		}
		this.immediate = immediate;
		this.deferred = deferred;
	}
}