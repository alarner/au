import ActionResult from './ActionResult';
import buildSmartComponent from './build-smart-component';
import buildStore from './build-store';
import d from './default-dispatcher';
import { Dispatcher } from './Dispatcher';
import RecoverableError from './RecoverableError';
import stores from './stores';

const init = (userStores) => {
	for(const key in userStores) {
		const store = userStores[key];
		store.setKey(key);
		store.dispatcher().subscribe(store);
		stores[key] = store;
	}
};

export {
	ActionResult,
	buildSmartComponent,
	buildStore,
	d,
	Dispatcher,
	init,
	RecoverableError,
	stores
};