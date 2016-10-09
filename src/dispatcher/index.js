const Event = require('../event/index');
const auto = require('../promise.auto');
const isFunction = require('../is-function');

module.exports = function Dispatcher() {
	const storeEventHandlers = {};
	const eventHandler = new Event();
	const queue = [];
	let currentEvent = undefined;

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

	this.trigger = function(eventName, data) {
		return new Promise((resolve, reject) => {
			queue.push({
				run: () => eventHandler.trigger(eventName, data),
				resolve: resolve,
				reject: reject
			});
			if(!currentEvent) {
				next();
			}
		});
	};

	const next = function() {
		currentEvent = queue.shift();
		if(currentEvent) {
			processEvent(currentEvent);
		}
	};

	const processEvent = (event) => {
		event.run()
		.then((data) => {
			event.resolve(data);
			next();
		})
		.catch((err) => {
			event.reject(err);
			next();
		});
	};
};