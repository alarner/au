import Dispatcher from './Dispatcher';
class Globals {
	constructor() {
		this.globals = {
			stores: {},
			defaultDispatcher: new Dispatcher()
		};
	}

	set(key, value) {
		// @todo validation

		if(key === 'stores') {
			this.initializeStores(value);
		}
		else {
			this.globals[key] = value;
		}
	}

	get(key) {
		return this.globals[key];
	}

	initializeStores(stores) {
		for(const key in stores) {
			stores[key].setKey(key);
			this.globals.stores[key] = stores[key];
		}
	}
}

export default new Globals();
