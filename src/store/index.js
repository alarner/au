const Event = require('../event/index');
module.exports = {
	build(storeDescriptor, dispatcher, events = {}) {

		function Store(initialState = {}) {
			const _componentEvents = {};
			const _eventHandler = new Event();
			const _actionHistory = [];
			const _stateHistory = [];

			_stateHistory.push(initialState);

			this.connectToState = function(componentName, setState, key) {
				this.listen(componentName, (resolve, reject) => {
					const newState = {};
					newState[key || storeDescriptor] = this.get();
					setState(newState);
					resolve();
				});

				return this.get();
			};

			this.listen = function(componentName, cb) {
				if(!_componentEvents.hasOwnProperty(componentName)) {
					_componentEvents[componentName] = _eventHandler.on('CHANGE', cb);
				}
				else {
					throw new Error(
						`"${componentName}" component is already listening to the store ` +
						`"${storeDescriptor}"`
					);
				}
			};

			this.ignore = function(componentName) {
				if(_componentEvents.hasOwnProperty(componentName)) {
					_eventHandler.off(_componentEvents[componentName]);
					delete _componentEvents[componentName];
				}
			};

			this.change = function(eventName) {
				return _eventHandler.trigger('CHANGE', {event: eventName});
			};

			this.get = function() {
				return _stateHistory[_stateHistory.length - 1];
			};

			this.descriptor = function() {
				return storeDescriptor;
			}

			for(const eventName in events) {
				dispatcher.on(
					this,
					eventName,
					events[eventName].dependencies || [],
					events[eventName].run.bind(this)
				);
			}
		};

		return Store;
	}
};