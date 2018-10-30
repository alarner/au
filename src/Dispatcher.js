export default function Dispatcher() {
	const storeActionHandlers = {};
	const actionQueue = [];
	let currentAction = undefined;

	this.on = function(store, action) {
		if(!store || !store.isStore) {
			throw new Error('First argument must be a Store');
		}
		if(typeof action !== 'string') {
			throw new Error('Second argument "action" must be a string');
		}
		if(!storeActionHandlers.hasOwnProperty(action)) {
			storeActionHandlers[action] = [];
		}
		storeActionHandlers[action].push(store);
	};

	this.handleAction = function(action, data = {}) {
		if(!storeActionHandlers.hasOwnProperty(action) || !storeActionHandlers[action].length) {
			return Promise.reject(new Error(`There are no handlers for action "${action}"`));
		}
		return Promise.all(
			storeActionHandlers[action].map(store => store.handleAction(action, data))
		)
		.then(() => Promise.resolve(true));
	};

	this.trigger = function(action, data = {}) {
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
