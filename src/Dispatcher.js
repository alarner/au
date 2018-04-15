import auto from 'async.auto';

export default function Dispatcher() {
	const storeActionHandlers = {};
	const actionQueue = [];
	let currentAction = undefined;
	const actionHandlers = {};

	this.on = function(store, action, dependencies) {
		if(!store || !store.isStore) {
			throw new Error('First argument must be a Store');
		}
		if(typeof action !== 'string') {
			throw new Error('Second argument "action" must be a string');
		}
		dependencies = dependencies || [];
		if(!storeActionHandlers.hasOwnProperty(action)) {
			storeActionHandlers[action] = {};
		}
		storeActionHandlers[action][store.id()] = {
			dependencies,
			store
		};

		if(!actionHandlers[action]) {
			actionHandlers[action] = [];
		}
		const existingHandler = actionHandlers[action].find((h) => h.store === store);
		if(existingHandler) {
			existingHandler.dependencies = dependencies;
		}
		else {
			actionHandlers[action].push({ store, dependencies });
		}
	};

	this.handleAction = function(action, data = {}) {
		return new Promise((resolve, reject) => {
			if(!storeActionHandlers.hasOwnProperty(action) || !Object.keys(storeActionHandlers[action]).length) {
				return reject(new Error(`There are no handlers for action "${action}"`));
			}
			const autoObj = {};
			for(const storeId in storeActionHandlers[action]) {
				const { dependencies, store } = storeActionHandlers[action][storeId];
				autoObj[store.key()] = dependencies.slice(0);
				autoObj[store.key()].push((cb) => {
					store.handleAction(action, data)
					.then(() => cb(null, true))
					.catch((error) => {
						let recoverable = false;
						if(error.name === 'StoreError') {
							recoverable = error.recoverable;
						}
						if(recoverable) {
							cb(null, false);
						}
						else {
							cb(error);
						}
					});
				});
			}

			auto(autoObj, (error, results) => {
				if(error) {
					reject(error);
				}
				else {
					const values = Object.values(results);
					resolve(values.every(v => v));
				}
			});

		});
	};

	this.trigger = function(action, data = {}, queue = true) {
		if(!queue) {
			return this.handleAction(action, data);
		}
		return new Promise((resolve, reject) => {
			actionQueue.push({
				action,
				data,
				resolve: resolve,
				reject: reject
			});
			if(!currentAction) {
				next();
			}
		});
	};

	const next = function() {
		currentAction = actionQueue.shift();
		if(currentAction) {
			processAction(currentAction);
		}
	};

	const processAction = ({ action, data, resolve, reject }) => {
		this.handleAction(action, data)
		.then((data) => {
			resolve(data);
			next();
		})
		.catch((err) => {
			reject(err);
			next();
		});
	};
}
