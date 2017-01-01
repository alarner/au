const auto = require('promise.auto');
const Event = require('../event/index');
const isFunction = require('../is-function');

module.exports = function Dispatcher() {
	const storeEventHandlers = {};
	const eventHandler = new Event();
	const eventQueue = [];
	let currentEvent = undefined;

	this.on = function(store, eventName, dependencies) {
		if(!store || !store.descriptor || !isFunction(store.descriptor) || typeof store.descriptor() !== 'string') {
			throw new Error('First argument must be a Store');
		}
		if(typeof eventName !== 'string') {
			throw new Error('Second argument eventName must be a string');
		}
		dependencies = dependencies || [];
		if(!storeEventHandlers.hasOwnProperty(eventName)) {
			storeEventHandlers[eventName] = {};
		}
		storeEventHandlers[eventName][store.descriptor()] = {
			dependencies,
			store
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
				const {store, dependencies} = handlersByStore[storeDescriptor];
				autoObj[storeDescriptor] = {
					dependencies: dependencies || [],
					promise: (resolve, reject, result) => {
						return store.processEvent(eventName, { event: data, result })
							.then(resolve)
							.catch(reject);
					}
				};
			}

			return auto(autoObj, { stopOnError: true }).then(resolve).catch(reject);

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