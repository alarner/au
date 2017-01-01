'use strict';

var auto = require('promise.auto');
var Event = require('../event/index');
var isFunction = require('../is-function');

module.exports = function Dispatcher() {
	var storeEventHandlers = {};
	var eventHandler = new Event();
	var eventQueue = [];
	var currentEvent = undefined;

	this.on = function (store, eventName, dependencies) {
		if (!store || !store.descriptor || !isFunction(store.descriptor) || typeof store.descriptor() !== 'string') {
			throw new Error('First argument must be a Store');
		}
		if (typeof eventName !== 'string') {
			throw new Error('Second argument eventName must be a string');
		}
		dependencies = dependencies || [];
		if (!storeEventHandlers.hasOwnProperty(eventName)) {
			storeEventHandlers[eventName] = {};
		}
		storeEventHandlers[eventName][store.descriptor()] = {
			dependencies: dependencies,
			store: store
		};

		eventHandler.off(eventName);
		eventHandler.on(eventName, this.handleAllEvents(eventName));
	};

	this.handleAllEvents = function (eventName) {
		return function (resolve, reject, data) {
			if (!storeEventHandlers.hasOwnProperty(eventName)) {
				return;
			}
			var autoObj = {};
			var handlersByStore = storeEventHandlers[eventName];

			var _loop = function _loop(storeDescriptor) {
				var _handlersByStore$stor = handlersByStore[storeDescriptor],
				    store = _handlersByStore$stor.store,
				    dependencies = _handlersByStore$stor.dependencies;

				autoObj[storeDescriptor] = {
					dependencies: dependencies || [],
					promise: function promise(resolve, reject, result) {
						return store.processEvent(eventName, { event: data, result: result }).then(resolve).catch(reject);
					}
				};
			};

			for (var storeDescriptor in handlersByStore) {
				_loop(storeDescriptor);
			}

			return auto(autoObj, { stopOnError: true }).then(resolve).catch(reject);
		};
	};

	this.trigger = function (eventName) {
		var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
		var queue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

		if (!queue) {
			return eventHandler.trigger(eventName, data);
		}
		return new Promise(function (resolve, reject) {
			eventQueue.push({
				run: function run() {
					return eventHandler.trigger(eventName, data);
				},
				resolve: resolve,
				reject: reject
			});
			if (!currentEvent) {
				next();
			}
		});
	};

	var next = function next() {
		currentEvent = eventQueue.shift();
		if (currentEvent) {
			processEvent(currentEvent);
		}
	};

	var processEvent = function processEvent(event) {
		event.run().then(function (data) {
			event.resolve(data);
			next();
		}).catch(function (err) {
			event.reject(err);
			next();
		});
	};
};