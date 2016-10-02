// Todo: test this

let Event = require('../event/index');
module.exports = function(storeDescriptor, dispatcher) {
	return function Store() {
		// listen for events on the dispatcher
		this.events = this.events || {};
		let componentEvents = {};
		let eventHandler = new Event();

		for(const eventName in this.events) {
			dispatcher.on(
				storeDescriptor,
				eventName,
				this.events[eventName].dependencies || [],
				this.events[eventName].run
			);
		}

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
			if(!componentEvents.hasOwnProperty(componentName)) {
				componentEvents[componentName] = eventHandler.on('CHANGE', cb);
			}
			else {
				throw new Error(
					`"${componentName}" component is already listening to the store ` +
					`"${storeDescriptor}"`
				);
			}
		};

		this.ignore = function(componentName) {
			if(componentEvents.hasOwnProperty(componentName)) {
				eventHandler.off(componentEvents[componentName]);
			}
		};

		// trigger a change event on the store
		this.change = function(eventName) {
			return eventHandler.trigger('CHANGE', {event: eventName});
		};
	};
};