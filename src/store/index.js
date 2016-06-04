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

		this.listen = function(componentName, cb) {
			if(!componentEvents.hasOwnProperty(componentName)) {
				componentEvents[componentName] = eventHandler.on('CHANGE', cb);
			}
			else {
				console.warn(`${componentName} is already listening to this store`);
			}
		};

		this.ignore = function(componentName) {
			if(componentEvents.hasOwnProperty(componentName)) {
				eventHandler.off(componentEvents[componentName]);
			}
			else {
				console.warn(`${componentName} is not listening to this store`);
			}
		};

		// trigger a change event on the store
		this.change = function(eventName) {
			eventHandler.trigger('CHANGE', {event: eventName});
		};
	};
};