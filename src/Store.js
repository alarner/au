import ids from './ids';
import globals from './globals';
import { StoreError } from './error';
const build2 = (actions, dispatcher) => {
	const _dispatcher = dispatcher || globals.get('defaultDispatcher');
	const _id = ids.nextStoreId();
	const _history = [];
	let _undoHistory = [];
	const _componentListeners = {};
	let _loading = false;
	let _key = null;

	class Store {
		constructor(initialStateValue) {
			_history.push({
				action: null,
				state: {
					value: initialStateValue,
					error: null
				}
			});

			this.isStore = true;

			for(const action in actions) {
				_dispatcher.on(
					this,
					action,
					actions[action].dependencies || []
				);
			}
		}

		listen(componentKey, cb) {
			if(!_componentListeners.hasOwnProperty(componentKey)) {
				_componentListeners[componentKey] = cb;
			}
			else {
				throw new Error(
					`component (key=${componentKey}) is already listening to the store ` +
					`(id=${_id}, key=${_key})`
				);
			}
		}

		connectToState(componentKey, setState) {
			this.listen(componentKey, (resolve, reject) => {
				const key = this.key() || this.id();
				const newState = {};
				newState[key] = this.all();
				setState(newState, resolve);
			});
		}

		ignore(componentKey) {
			if(_componentListeners.hasOwnProperty(componentKey)) {
				delete _componentListeners[componentKey];
			}
		}

		handleAction(action, data) {
			if(!actions[action]) {
				return Promise.reject(new StoreError({
					message: `Store "${this.key()}" does not have an action "${action}"`
				}));
			}
			if(!actions[action].run) {
				const message = (
					`Store "${this.key()}" does not have a run method for action "${action}"`
				);
				return Promise.reject(new StoreError({ message, recoverable: false }));
			}
			const historyAction = { name: action, data };
			const p = new Promise((resolve, reject) => {
				actions[action].run.call(this, resolve, reject, data);
			});
			return p.then((result) => {
				_history.push({
					action: historyAction,
					state: {
						value: result,
						error: null
					}
				});
				this.change(action);
				_undoHistory = [];
			})
			.catch((error) => {
				let recoverable = false;
				if(error instanceof StoreError) {
					recoverable = error.recoverable;
				}
				else if(error.message && !(error instanceof Error)) {
					error = new StoreError(error);
					recoverable = error.recoverable;
				}

				const currentState = this.state();
				_history.push({
					action: historyAction,
					state: {
						value: currentState.value,
						error: error
					}
				});
				this.change(action);
				if(!recoverable) {
					throw error;
				}
				_undoHistory = [];
			});
		}

		change(action) {
			const keys = Object.keys(_componentListeners);
			return Promise.all(
				keys.map(
					(key) => new Promise(_componentListeners[key])
				)
			);
		}

		state() {
			return _history.length ? _history[_history.length - 1].state : undefined;
		}

		value() {
			return this.state() ? this.state().value : undefined;
		}

		loading() {
			return _loading;
		}

		error() {
			return this.state() ? this.state().error : undefined;
		}

		all() {
			return {
				value: this.value(),
				loading: this.loading(),
				error: this.error()
			};
		}

		setKey(key) {
			_key = key;
		}

		key() {
			return _key;
		}

		id() {
			return _id;
		}

		history() {
			return _history;
		}

		undo() {
			if(_history.length <= 1) return;
			_undoHistory.push(_history.pop());
			this.change('undo');
		}

		redo() {
			if(_undoHistory.length < 1) return;
			_history.push(_undoHistory.pop());
			this.change('redo');
		}
	}

	return Store;
};

export const build = build2;

export default {
	build: build2
};
