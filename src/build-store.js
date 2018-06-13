import d from './default-dispatcher';

export default (actions, dispatcher = d) => {
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
				_components.map(c => new Promise(resolve => c.setState(this.state(), resolve)))
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