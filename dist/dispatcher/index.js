'use strict';

var auto = require('promise.auto');
var Event = require('../event/index');
var isFunction = require('../is-function');

module.exports = function Dispatcher() {
	var storeEventHandlers = {};
	var eventHandler = new Event();
	var eventQueue = [];
	var currentEvent = undefined;

	this.on = function (storeDescriptor, eventName, dependencies, run) {
		if (typeof storeDescriptor !== 'string') {
			throw new Error('First argument storeDescriptor must be a string');
		}
		if (typeof eventName !== 'string') {
			throw new Error('Second argument eventName must be a string');
		}
		if (!isFunction(run)) {
			throw new Error('Fourth argument run must be a function');
		}
		dependencies = dependencies || [];
		if (!storeEventHandlers.hasOwnProperty(eventName)) {
			storeEventHandlers[eventName] = {};
		}
		storeEventHandlers[eventName][storeDescriptor] = {
			dependencies: dependencies,
			run: run
		};

		eventHandler.off(eventName);
		eventHandler.on(eventName, this.handleAllEvents(eventName));
	};

	this.handleAllEvents = function (eventName) {
		var _this = this;

		return function (resolve, reject, data) {
			if (!storeEventHandlers.hasOwnProperty(eventName)) {
				return;
			}
			var autoObj = {};
			var handlersByStore = storeEventHandlers[eventName];
			for (var storeDescriptor in handlersByStore) {
				var store = handlersByStore[storeDescriptor];
				autoObj[storeDescriptor] = {
					dependencies: store.dependencies || [],
					promise: _this.handleStoreEvents(store.run, data)
				};
			}

			return auto(autoObj, { stopOnError: true }).then(resolve).catch(reject);
		};
	};

	this.handleStoreEvents = function (run, data) {
		return function (resolve, reject, result) {
			return new Promise(function (resolve, reject) {
				run(resolve, reject, { event: data, result: result });
			}).then(resolve).catch(reject);
		};
	};

	this.trigger = function (eventName, data) {
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