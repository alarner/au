import ActionResult from './ActionResult';
import buildStore from './build-store';
import d from './default-dispatcher';
import { Dispatcher } from './Dispatcher';

const init = (stores) => {
	for(const key in stores) {
		const store = stores[key];
		store.setKey(key);
		store.dispatcher().subscribe(store);
	}
};

export {
	ActionResult,
	buildStore,
	d,
	Dispatcher,
	init
};