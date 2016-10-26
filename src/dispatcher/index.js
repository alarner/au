const auto = require('promise.auto');
const Event = require('../event/index');
const isFunction = require('../is-function');

module.exports = function Dispatcher() {
	const storeEventHandlers = {};
	const eventHandler = new Event();
	const eventQueue = [];
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
					promise: this.handleStoreEvents(store.run, data)
				};
			}

			return auto(autoObj, { stopOnError: true }).then(resolve).catch(reject);

		};
	};

	this.handleStoreEvents = function (run, data) {
		return function (resolve, reject, result) {
			return new Promise(function (resolve, reject) {
				run(resolve, reject, { event: data, result});
			}).then(resolve).catch(reject);
		};
	};

	this.trigger = function(eventName, data = {}, queue = true) {
		if(!queue) {
			return eventHandler.trigger(eventName, data);
		}
		return new Promise((resolve, reject) => {
			eventQueue.push({
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
		currentEvent = eventQueue.shift();
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