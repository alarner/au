class ActionResult {
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

function Dispatcher() {
	let _stores = [];
	const _actionQueue = [];
	let _currentAction = null;

	this.subscribe = function(store) {
		if(!store || !store.isStore) {
			throw new Error('')
		}
		_stores.push(store);
	};

	// Returns a Promise that resolves to true if the action was successful and false if there was
	// an error (recoverable or non-recoverable) thrown.
	this.trigger = function(name, data = {}) {
		// Determine which stores will handle this action.
		const stores = _stores.filter(s => s.canHandleAction(name));

		if(!stores.length) {
			throw new Error(`There are no handlers for action "${action}"`);
		}

		// Get the immediately new state for each store
		const results = stores.map(s => processImmediateAction(s, name, data, s.state()));

		// Apply the new dirty states for each store
		for(const result of results) {
			if(!result.error) {
				result.store.setState(result.state, false, false);
			}
			else {
				result.store.setError(result.error, false);
			}
			result.store.triggerStateChange();
		}

		let returnValue = null;

		if(results.some(result => result.error)) {
			returnValue = false;
		}

		if(!results.some(result => result.deferred)) {
			returnValue = true;
		}

		if(returnValue !== null) {
			// If we are waiting on anything in the queue then we also need to push this on to the
			// queue so that we can re-play it once the previous actions are complete.
			if(_actionQueue.length) {
				_actionQueue.push({
					name,
					data,
					results,
					resolve: null,
					reject: null
				});
			}
			return returnValue;
		}

		// If there are deferred values to wait for then add the action to the queue 
		return new Promise((resolve, reject) => {
			_actionQueue.push({
				name,
				data,
				results,
				resolve,
				reject
			});
			attemptNextActionFromQueue(_stores);
		});
	};

	this.attemptNextActionFromQueue = function() {
		if(!_currentAction) {
			_currentAction = _actionQueue.shift();
			if(_currentAction) {
				this.processActionFromQueue(_currentAction, _stores);
			}
		}
	};

	this.processActionFromQueue = async function({ name, data, results, resolve, reject }) {
		// Determine which stores will handle this action.
		const stores = _stores.filter(s => s.canHandleAction(name));

		// Get the clean state from the server for all deferred actions
		const cleanResults = await Promise.all(results.map(processDeferredAction));

		// Group clean results by their store key
		const stateByStoreKey = {};
		for(const { state, error, store } of cleanResults) {
			stateByStoreKey[store.key()] = { clean: state, error, dirty: state, store };
		}

		// Re-apply future actions
		for(const action of _actionQueue) {
			// Determine which stores will handle this action.
			const stores = _stores.filter(s => s.canHandleAction(action.name));

			// Get the immediately new state for each store
			const results = stores.map(
				s => processImmediateAction(s, action.name, action.data, s.state())
			);

			// Apply the new dirty states for each store
			for(const result of results) {
				const key = result.store.key();
				if(stateByStoreKey.hasOwnProperty(key)) {
					stateByStoreKey[key].dirty = result.state;
				}
			}
		}

		// Set the clean and dirty state for all stores and trigger updates
		for(const key of stateByStoreKey) {
			const { store, clean, dirty, error } = stateByStoreKey[key];
			if(!error) {
				store.setState(clean, true, false);
				store.setState(dirty, false, false);
			}
			else {
				store.setError(error, false);
			}
			store.triggerStateChange();
		}

		attemptNextActionFromQueue(stores);
	};
}
const processImmediateAction = (store, name, data, state) => {
	let finalError = null;
	let deferred = null;
	try {
		const result = store.handleAction(name, data, state);
		if(result instanceof ActionResult) {
			state = result.immediate;
			deferred = result.deferred;
		}
		else {
			state = result;
		}
	}
	catch(error) {
		if(error instanceof StoreError) {
			finalError = error;
		}
		else {
			throw error;
		}
	}
	return { state, error: finalError, deferred, store };
};

const processDeferredAction = async (oldResult) => {
	let { state } = oldResult;
	let finalError = null;
	
	try {
		if(oldResult.deferred) {
			state = await oldResult.deferred();
		}
	}
	catch(error) {
		if(error instanceof StoreError) {
			finalError = error;
		}
		else {
			throw error;
		}
	}
	return { state, error: finalError, store: oldResult.store };
};

var d = new Dispatcher();

var buildStore = (actions, dispatcher = d) => {
	let _key = null;
	const _state = {
		clean: null,
		dirty: null
	};
	const _components = [];

	return class Store {
		constructor(initialStateValue) {
			this.isStore = true;
			_state.clean = initialStateValue;
			_state.dirty = initialStateValue;
		}

		setKey(key) {
			_key = key;
		}

		key() {
			return _key;
		}

		setState(state, clean = false, trigger = true) {
			_state[clean ? 'clean' : 'dirty'] = state;
			if(clean) {
				_state.dirty = state;
			}

			const toMerge = {};
			toMerge[this.key()] = _state.dirty;

			if(trigger) {
				return this.triggerStateChange();
			}
			return [];
		}

		state(clean = false) {
			return _state[clean ? 'clean' : 'dirty'];
		}

		triggerStateChange() {
			return Promise.all(
				_components.map(c => new Promise(resolve => c.setState(toMerge, resolve)))
			);
		}

		dispatcher() {
			return dispatcher;
		}

		canHandleAction(name) {
			return actions.hasOwnProperty(name);
		}

		handleAction(name, data, state) {
			return actions[name].call(this, state, data);
		}

		connectToState(componentKey, setStateFn) {
			if(!_components.some(c => c.key === componentKey)) {
				_components.push({
					key: componentKey,
					setState: setStateFn
				});
			}
			else {
				throw new Error(
					`component (key=${componentKey}) is already listening to the store ` +
					`(key=${this.key()})`
				);
			}
		}
	}
};

const init = (stores) => {
	for(const key in stores) {
		const store = stores[key];
		store.setKey(key);
		store.dispatcher().subscribe(store);
	}
};

export { ActionResult, buildStore, d, Dispatcher, init };
//# sourceMappingURL=bundle.esm.js.map
