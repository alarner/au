const auto = require('promise.auto');
const Event = require('../event/index');
const OptimisticPromise = require('../optimistic-promise/index');
const isFunction = require('../is-function');

module.exports = function Dispatcher() {
	const storeEventHandlers = {};
	const eventHandler = new Event();
	const eventQueue = [];
	let currentEvent = undefined;

	this.on = function(store, eventName, dependencies, run) {
		if(!store || !store.descriptor || !isFunction(store.descriptor) || typeof store.descriptor() !== 'string') {
			throw new Error('First argument must be a Store');
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
		storeEventHandlers[eventName][store.descriptor()] = {
			dependencies,
			run,
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
				const {run, store, dependencies} = handlersByStore[storeDescriptor];
				autoObj[storeDescriptor] = {
					dependencies: dependencies || [],
					promise: this.handleStoreEvents(eventName, run, store, data)
				};
			}

			return auto(autoObj, { stopOnError: true }).then(resolve).catch(reject);

		};
	};

	this.handleStoreEvents = function (eventName, run, store, data) {
		function success(result) {
			let optimisticData = result;
			if(result instanceof OptimisticPromise) {
				optimisticData = result.optimisticValue();
				result.promise().then(success).catch(failure);
			}
			store.setData(optimisticData);
			store.setErrors({});
			store.change(eventName);
		}
		function failure(errors) {
			if(errors instanceof Error) {
				throw errors;
			}
			store.setErrors(errors);
			store.change(eventName);
		}
		return function (resolve, reject, result) {
			return new Promise(function (resolve, reject) {
				run(resolve, reject, { event: data, result});
			})
			.then((result) => {
				success(result);
				resolve();
			})
			.catch((errors) => {
				failure(errors);
				resolve();
			});
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