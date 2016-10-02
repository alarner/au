'use strict';

var Event = require('../event/index');
module.exports = function (storeDescriptor, dispatcher) {
	return function Store(events) {
		// listen for events on the dispatcher
		this.events = events || {};
		var componentEvents = {};
		var eventHandler = new Event();

		for (var eventName in this.events) {
			dispatcher.on(storeDescriptor, eventName, this.events[eventName].dependencies || [], this.events[eventName].run.bind(this));
		}

		this.connectToState = function (componentName, setState, key) {
			var _this = this;

			this.listen(componentName, function (resolve, reject) {
				var newState = {};
				newState[key || storeDescriptor] = _this.get();
				setState(newState);
				resolve();
			});

			return this.get();
		};

		this.listen = function (componentName, cb) {
			if (!componentEvents.hasOwnProperty(componentName)) {
				componentEvents[componentName] = eventHandler.on('CHANGE', cb);
			} else {
				throw new Error('"' + componentName + '" component is already listening to the store ' + ('"' + storeDescriptor + '"'));
			}
		};

		this.ignore = function (componentName) {
			if (componentEvents.hasOwnProperty(componentName)) {
				eventHandler.off(componentEvents[componentName]);
			}
		};

		// trigger a change event on the store
		this.change = function (eventName) {
			return eventHandler.trigger('CHANGE', { event: eventName });
		};
	};
};