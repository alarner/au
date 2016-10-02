const Event = require('../event/index');
const auto = require('../promise.auto');
const isFunction = require('../is-function');

module.exports = function Dispatcher() {
	let storeEventHandlers = {};
	let eventHandler = new Event();

	this.on = function(storeDescriptor, eventName, dependencies, run) {
		if(typeof storeDescriptor !== 'string') {
			throw new Error('First argument storeDescriptor must be a string');
		}
		if(typeof eventName !== 'string') {
			throw new Error('Second argument eventName must be a string');
		}
		if(!isFunction(run)) {
			throw new Error('Fourth argument run must be a function');
		}
		dependencies = dependencies || [];
		if(!storeEventHandlers.hasOwnProperty(eventName)) {
			storeEventHandlers[eventName] = {};
		}
		if(!storeEventHandlers[eventName].hasOwnProperty(storeDescriptor)) {
			storeEventHandlers[eventName][storeDescriptor] = [];
		}
		storeEventHandlers[eventName][storeDescriptor] = {
			dependencies,
			run
		};

		eventHandler.off(eventName);
		eventHandler.on(eventName, this.handleAllEvents(eventName));
	};

	this.handleAllEvents = function(eventName) {
		return (resolve, reject, data) => {
			if(!storeEventHandlers.hasOwnProperty(eventName)) {
				return;
			}
			let autoObj = {};
			let handlersByStore = storeEventHandlers[eventName];
			for(const storeDescriptor in handlersByStore) {
				const store = handlersByStore[storeDescriptor];
				autoObj[storeDescriptor] = {
					dependencies: store.dependencies || [],
					run: this.handleStoreEvents(store.run, data)
				};
			}

			return auto(autoObj).then(resolve).catch(reject);

		};
	};

	this.handleStoreEvents = function(run, data) {
		return function(resolve, reject) {
			return new Promise((resolve, reject) => {
				run(resolve, reject, data);
			}).then(resolve).catch(reject);
		};
	};

	this.trigger = eventHandler.trigger;
};