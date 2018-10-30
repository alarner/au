import ids from './ids';
import globals from './globals';
import { StoreError } from './error';

const build2 = (actions, dispatcher) => {
	const _dispatcher = dispatcher || globals.get('defaultDispatcher');
	const _id = ids.nextStoreId();
	const _history = [];
	let _undoHistory = [];
	let _loading = false;
	let _key = null;

	class Store {
		constructor(initialStateValue) {
			this._componentListeners = {};
			_history.push({
				action: null,
				state: initialStateValue
			});

			this.isStore = true;

			for(const action in actions) {
				_dispatcher.on(this, action);
			}
		}

		listen(componentKey, cb) {
			if(!this._componentListeners.hasOwnProperty(componentKey)) {
				this._componentListeners[componentKey] = cb;
			}
			else {
				throw new Error(
					`component (key=${componentKey}) is already listening to the store ` +
					`(id=${_id}, key=${_key})`
				);
			}
		}

		connectToState(componentKey, setState) {
			this.listen(componentKey, (resolve) => {
				const key = this.key() || this.id();
				const newState = {};
				newState[key] = this.value();
				setState(newState, resolve);
			});
			return this.value();
		}

		ignore(componentKey) {
			console.log('ignore', componentKey);
			if(this._componentListeners.hasOwnProperty(componentKey)) {
				delete this._componentListeners[componentKey];
			}
		}

		handleAction(action, data={}) {
			if(!actions[action]) {
				return Promise.reject(new StoreError({
					message: `Store "${this.key()}" does not have an action "${action}"`
				}));
			}
			let run = null;
			if(typeof actions[action] === 'function') {
				run = actions[action];
			}
			else if(actions[action].run && typeof actions[action].run === 'function') {
				run = actions[action].run;
			}
			if(!run) {
				const message = (
					`Store "${this.key()}" does not have a run method for action "${action}"`
				);
				return Promise.reject(new StoreError({ message, recoverable: false }));
			}
			const historyAction = { name: action, data };
			return run.call(this, data).then((result) => {
				if(result !== this.value()) {
					_history.push({
						action: historyAction,
						state: result
					});
					this.change(action);
					_undoHistory = [];
				}
			});
		}

		change(action) {
			const keys = Object.keys(this._componentListeners);
			console.log('change', keys, this._componentListeners);
			return Promise.all(
				keys.map(
					(key) => {
						console.log('test', key, this._componentListeners[key])
						return new Promise(
							(resolve, reject) => this._componentListeners[key].call(
								this,
								resolve,
								reject,
								{ action }
							)
						);
					}
				)
			);
		}

		state() {
			return _history.length ? _history[_history.length - 1].state : undefined;
		}

		value() {
			return this.state();
		}

		setValue(state, action) {
			action = action || 'setValue';
			_history.push({
				action,
				state
			});
			this.change(action);
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
