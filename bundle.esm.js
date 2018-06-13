import React from 'react';
import { Map } from 'immutable';

class ActionResult {
	constructor(immediate, deferred) {
		if (deferred && !(deferred instanceof Function)) {
			throw new Error('Second argument to ActionResult constructor must be a function if supplied.');
		}
		this.immediate = immediate;
		this.deferred = deferred;
	}
}

var stores = {};

class IdGenerator {
	constructor() {
		this.componentId = 1;
	}

	nextComponentId() {
		return this.componentId++;
	}
}
var ids = new IdGenerator();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var buildSmartComponent = ((Component, ...connectedStores) => {
	class SmartComponent extends React.Component {
		constructor(props) {
			super(props);
			this.state = {};
			this.key = ids.nextComponentId();
			for (const key of connectedStores) {
				if (!stores.hasOwnProperty(key)) {
					throw new Error(`Cannot connect component "${Component.name}" to non-existant store "${key}"`);
				}
				stores[key].connectToState(this.key, this.setState.bind(this));
				this.state[key] = stores[key].fullState();
			}
		}
		componentWillUnmount() {
			for (const key of connectedStores) {
				connectedStores[key].ignore(this.key);
			}
		}

		render() {
			const errors = {};
			const values = {};
			for (const key in this.state) {
				errors[key] = this.state[key].errors;
				values[key] = this.state[key].value;
			}
			return React.createElement(Component, _extends({
				errors: errors
			}, values, this.props));
		}
	}
	return SmartComponent;
});

class RecoverableError extends Error {
	constructor(message, key = 'default') {
		let data = null;
		if (message instanceof RecoverableError) {
			data = message.data;
		} else if (message instanceof Error) {
			data = Map().set('default', message);
		} else if (typeof message === 'string') {
			data = Map().set(key, message);
		} else {
			data = Map(message);
		}

		message = '';
		jsData = data.toJS();
		for (const key of jsData) {
			message += `${key}: ${jsData[key]}\n`;
		}

		super(message);

		this.data = data;
	}

	toJS() {
		return this.data.toJS();
	}
}

function Dispatcher() {
	let _stores = [];
	const _actionQueue = [];
	let _currentAction = null;

	this.subscribe = function (store) {
		if (!store || !store.isStore) {
			throw new Error('Dispatcher.subscribe requires a store.');
		}
		_stores.push(store);
	};

	// Returns a Promise that resolves to true if the action was successful and false if there was
	// an error (recoverable or non-recoverable) thrown.
	this.trigger = function (name, data = {}) {
		// Determine which stores will handle this action.
		const stores = _stores.filter(s => s.canHandleAction(name));

		if (!stores.length) {
			throw new Error(`There are no handlers for action "${name}"`);
		}

		// Get the immediately new state for each store
		const results = stores.map(s => processImmediateAction(s, name, data, s.state()));

		let returnValue = null;

		if (results.some(result => result.error)) {
			returnValue = false;
		}

		if (!results.some(result => result.deferred) && _actionQueue.length === 0) {
			returnValue = true;
		}

		// Apply the new dirty states for each store
		for (const result of results) {
			if (!result.error) {
				result.store.setState(result.state, false);
				// There is no deferred piece to the result and no pending deferrec actions, so set
				// the clean state as well
				if (returnValue === true) {
					result.store.setState(result.state, true);
				}
			} else {
				result.store.setError(result.error);
			}
			result.store.triggerStateChange();
		}

		if (returnValue !== null) {
			// If we are waiting on anything in the queue then we also need to push this on to the
			// queue so that we can re-play it once the previous actions are complete.
			if (_actionQueue.length) {
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
			attemptNextActionFromQueue();
		});
	};

	const attemptNextActionFromQueue = function () {
		if (!_currentAction) {
			_currentAction = _actionQueue.shift();
			if (_currentAction) {
				processActionFromQueue(_currentAction);
			}
		}
	};

	const processActionFromQueue = async function ({ name, data, results, resolve, reject }) {
		// Determine which stores will handle this action.
		const stores = _stores.filter(s => s.canHandleAction(name));

		// Get the clean state from the server for all deferred actions
		const cleanResults = await Promise.all(results.map(processDeferredAction));

		// Group clean results by their store key
		const stateByStoreKey = {};
		for (const { state, error, store } of cleanResults) {
			stateByStoreKey[store.key()] = { clean: state, error, dirty: state, store };
			store.setState(state, true);
		}

		// Re-apply future actions
		for (const action of _actionQueue) {
			// Determine which stores will handle this action.
			const stores = _stores.filter(s => s.canHandleAction(action.name));

			// Get the immediately new state for each store
			const results = stores.map(s => processImmediateAction(s, action.name, action.data, s.state()));

			// Apply the new dirty states for each store
			for (const result of results) {
				const key = result.store.key();
				if (stateByStoreKey.hasOwnProperty(key)) {
					stateByStoreKey[key].dirty = result.state;
				}
			}
		}

		// Set the clean and dirty state for all stores and trigger updates
		let hasError = false;
		for (const key in stateByStoreKey) {
			const { store, clean, dirty, error } = stateByStoreKey[key];
			if (!error) {
				store.setState(clean, true);
				store.setState(dirty, false);
			} else {
				hasError = true;
				store.setError(error);
			}
			store.triggerStateChange();
		}

		resolve(!hasError);
		_currentAction = null;

		attemptNextActionFromQueue(stores);
	};
}
const processImmediateAction = (store, name, data, state) => {
	let finalError = null;
	let deferred = null;
	try {
		const result = store.handleAction(name, data, state);
		if (result instanceof ActionResult) {
			state = result.immediate;
			deferred = result.deferred;
		} else {
			state = result;
		}
	} catch (error) {
		if (error instanceof RecoverableError) {
			finalError = error;
		} else {
			throw error;
		}
	}
	return { state, error: finalError, deferred, store };
};

const processDeferredAction = async oldResult => {
	let { state } = oldResult;
	let finalError = null;

	try {
		if (oldResult.deferred) {
			state = await oldResult.deferred();
		}
	} catch (error) {
		if (error instanceof RecoverableError) {
			finalError = error;
		} else {
			throw error;
		}
	}
	return { state, error: finalError, store: oldResult.store };
};

var d = new Dispatcher();

var buildStore = ((actions, dispatcher = d) => {
	let _key = null;
	const _state = {
		clean: null,
		dirty: null
	};
	let _components = [];
	let _errors = {};

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

		setState(state, clean = false) {
			_state[clean ? 'clean' : 'dirty'] = state;
			if (clean) {
				_state.dirty = state;
			}

			const toMerge = {};
			toMerge[this.key()] = _state.dirty;
		}

		state(clean = false) {
			return _state[clean ? 'clean' : 'dirty'];
		}

		fullState(clean = false) {
			return {
				value: this.state(clean),
				errors: _errors
			};
		}

		setError(error) {
			_errors = error.toJS();
		}

		triggerStateChange() {
			const toMerge = {};
			toMerge[this.key()] = this.fullState();
			return Promise.all(_components.map(c => new Promise(resolve => c.setState(toMerge, resolve))));
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
			if (!_components.some(c => c.key === componentKey)) {
				_components.push({
					key: componentKey,
					setState: setStateFn
				});
			} else {
				throw new Error(`component (key=${componentKey}) is already listening to the store ` + `(key=${this.key()})`);
			}
		}

		ignore(componentKey) {
			_components = _components.filter(c => c.key !== componentKey);
		}
	};
});

const init = userStores => {
	for (const key in userStores) {
		const store = userStores[key];
		store.setKey(key);
		store.dispatcher().subscribe(store);
		stores[key] = store;
	}
};

export { ActionResult, buildSmartComponent, buildStore, d, Dispatcher, init, RecoverableError, stores };
//# sourceMappingURL=bundle.esm.js.map
