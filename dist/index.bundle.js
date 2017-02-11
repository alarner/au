(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

// Todo: test this

module.exports = function Cache(cache) {
	this.save = function (key, id, data) {
		// Todo: ensure that key is a string
		if (id === undefined || data === undefined) {
			return function (id, data) {
				return cache.save(key, id, data);
			};
		}

		return cache.save(key, id, data);
	};

	// Returns a promise or a curried function
	this.get = function (key, id, fallback) {
		// Todo: ensure that key is a string
		if (id === undefined) {
			return function (id) {
				return cache.get(key, id);
			};
		}

		return cache.get(key, id);
	};
};
},{}],2:[function(require,module,exports){
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
},{"../event/index":4,"../is-function":6,"promise.auto":9}],3:[function(require,module,exports){
'use strict';

var isFunction = require('../is-function');

module.exports = function EventSnapshot(eventName, data, state) {
    var _eventName = eventName;
    var _data = data;
    var _state = state;

    this.eventName = function () {
        return _eventName;
    };
    this.data = function () {
        return _data;
    };
    this.state = function () {
        return _state;
    };
};
},{"../is-function":6}],4:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var isFunction = require('../is-function');

module.exports = function Event() {
	var listeners = {};
	var count = 0;

	// Returns an id that can be used to stop listening for the event
	this.on = function (eventName, cb) {
		if (!eventName || typeof eventName !== 'string') {
			throw new Error('Event.on requires a string eventName');
		}
		if (!isFunction(cb)) {
			throw new Error('Event.on requires a function callback');
		}
		if (!listeners.hasOwnProperty(eventName)) {
			listeners[eventName] = [];
		}

		var id = count++;
		listeners[eventName].push({ eventName: eventName, cb: cb, id: id });
		return id;
	};

	this.off = function () {
		var _arguments = arguments;

		if (typeof arguments[0] === 'number') {
			for (var i in listeners) {
				listeners[i] = listeners[i].filter(function (listener) {
					return listener.id !== _arguments[0];
				});
			}
		} else if (typeof arguments[0] === 'string') {
			if (isFunction(arguments[1])) {
				if (listeners.hasOwnProperty(arguments[0])) {
					listeners[arguments[0]] = listeners[arguments[0]].filter(function (listener) {
						return listener.cb !== _arguments[1];
					});
				}
			} else {
				delete listeners[arguments[0]];
			}
		} else {
			throw new Error('Event.off requires an id or eventName & optional callback');
		}
	};

	this.trigger = function (eventName, data) {
		if (!eventName || typeof eventName !== 'string') {
			throw new Error('Event.trigger requires a string eventName');
		}
		if (listeners.hasOwnProperty(eventName) && listeners[eventName].length) {
			var _ret = function () {
				var incomplete = listeners[eventName].slice(0);
				var makePromise = function makePromise(cb) {
					if (!listeners[eventName].some(function (listenerInfo) {
						return cb === listenerInfo.cb;
					})) {
						return Promise.resolve();
					}
					return new Promise(function (resolve, reject) {
						return cb(resolve, reject, data);
					});
				};
				var promise = makePromise(incomplete.splice(0, 1)[0].cb);

				var _loop = function _loop() {
					var cb = incomplete.splice(0, 1)[0].cb;
					promise = promise.then(function () {
						return makePromise(cb);
					});
				};

				while (incomplete.length > 0) {
					_loop();
				}
				return {
					v: promise
				};
			}();

			if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
		}
		return Promise.resolve();
	};
};
},{"../is-function":6}],5:[function(require,module,exports){
'use strict';

module.exports = {
	Cache: require('./cache/index'),
	Dispatcher: require('./dispatcher/index'),
	Event: require('./event/index'),
	Store: require('./store/index'),
	OptimisticPromise: require('./optimistic-promise/index')
};
},{"./cache/index":1,"./dispatcher/index":2,"./event/index":4,"./optimistic-promise/index":7,"./store/index":8}],6:[function(require,module,exports){
'use strict';

module.exports = function (functionToCheck) {
	var getType = {};
	return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
};
},{}],7:[function(require,module,exports){
"use strict";

// class OptimisticPromise {
//     constructor(fn, optimisticValue) {
//         this.promise = 
//         this.optimisticValue = optimisticValue;
//     }
// }

// module.exports = OptimisticPromise;

function OptimisticPromise(fn, optimisticValue) {
    var promise = new Promise(fn);
    this.promise = function () {
        return promise;
    };
    this.optimisticValue = function () {
        return optimisticValue;
    };
};

module.exports = OptimisticPromise;
},{}],8:[function(require,module,exports){
'use strict';

var Event = require('../event/index');
var EventSnapshot = require('../event-snapshot/index');
// const OptimisticPromise = require('../optimistic-promise/index');
module.exports = {
	build: function build(storeDescriptor, dispatcher) {
		var events = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};


		function Store() {
			var _this3 = this;

			var initialState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			var _componentEvents = {};
			var _eventHandler = new Event();
			var _eventHistory = [];
			var _stateHistory = [];
			var _loading = false;
			var _errors = {};

			_stateHistory.push(initialState);

			this.connectToState = function (componentName, setState, key) {
				var _this = this;

				this.listen(componentName, function (resolve, reject) {
					var newState = {};
					newState[key || storeDescriptor] = _this.get();
					setState(newState, resolve);
				});

				return this.get();
			};

			this.listen = function (componentName, cb) {
				if (!_componentEvents.hasOwnProperty(componentName)) {
					_componentEvents[componentName] = _eventHandler.on('CHANGE', cb);
				} else {
					throw new Error('"' + componentName + '" component is already listening to the store ' + ('"' + storeDescriptor + '"'));
				}
			};

			this.ignore = function (componentName) {
				if (_componentEvents.hasOwnProperty(componentName)) {
					_eventHandler.off(_componentEvents[componentName]);
					delete _componentEvents[componentName];
				}
			};

			this.change = function (eventName) {
				return _eventHandler.trigger('CHANGE', { event: eventName });
			};

			this.loading = function () {
				var val = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
				var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

				_loading = val;
				if (_loading || force) {
					this.change('loading');
				}
			};

			this.get = function () {
				return {
					data: this.state(),
					errors: _errors,
					loading: _loading
				};
			};

			this.state = function () {
				return _stateHistory[_stateHistory.length - 1];
			};

			this.descriptor = function () {
				return storeDescriptor;
			};

			this.setData = function (data) {
				_stateHistory.push(data);
			};

			this.setErrors = function (errors) {
				_errors = errors;
			};

			this.processEvent = function (eventName, data) {
				var _this2 = this;

				if (!events[eventName]) {
					throw new Error(storeDescriptor + ' has no event named "' + eventName + '"');
				}
				var eventSnapshot = new EventSnapshot(eventName, data, this.state());
				// _eventHistory.push(eventSnapshot);
				var promise = new Promise(function (resolve, reject) {
					return events[eventName].run.call(_this2, resolve, reject, data.event, _this2.state(), data.result);
				});

				return promise.then(function (result) {
					eventSuccess(eventSnapshot, result);
					return Promise.resolve(result);
				}).catch(function (errors) {
					eventFailure(eventSnapshot, errors);
					return Promise.resolve();
				});
			};

			var eventSuccess = function eventSuccess(eventSnapshot, result) {
				var data = result;
				// eventSnapshot.setResult(result);
				// if(result instanceof OptimisticPromise) {
				// 	data = result.optimisticValue();
				// 	result.promise()
				// 		.then((promiseResult) => {
				// 			eventSnapshot.setResult(promiseResult);
				// 			reprocessEventHistory(eventSnapshot);
				// 		})
				// 		.catch((promiseError) => {

				// 		});
				// }
				_this3.setData(data);
				_this3.setErrors({});
				_this3.change(eventSnapshot.eventName());
			};

			var eventFailure = function eventFailure(eventSnapshot, errors) {
				if (errors instanceof Error) {
					throw errors;
				}
				_this3.setErrors(errors);
				_this3.change(eventSnapshot.eventName());
			};

			// const reprocessEventHistory = (updatedEventSnapshot) => {
			// 	const index = _eventHistory.indexOf(updatedEventSnapshot);
			// };

			for (var eventName in events) {
				dispatcher.on(this, eventName, events[eventName].dependencies || [], events[eventName].run.bind(this));
			}
		};

		return Store;
	}
};
},{"../event-snapshot/index":3,"../event/index":4}],9:[function(require,module,exports){
"use strict";

module.exports = function (promiseWrappers, options) {
	var pw = Object.assign({}, promiseWrappers);
	options = Object.assign({
		stopOnError: false,
		debug: false
	}, options);
	var results = {};
	var errors = {};
	var count = {
		success: 0,
		error: 0,
		running: 0
	};

	return new Promise(function (resolve, reject) {
		function then(key) {
			return function (result) {
				results[key] = result;
				count.success++;
				count.running--;
				run();
			};
		}

		function error(key) {
			return function (error) {
				errors[key] = error;
				count.error++;
				count.running--;
				run();
			};
		}

		function run() {
			var _loop = function _loop(key) {
				var runnable = true;
				var deps = pw[key].dependencies || [];
				for (var i = 0; i < deps.length; i++) {
					var dep = deps[i];
					if (!results.hasOwnProperty(dep)) {
						runnable = false;
						break;
					}
				}
				if (runnable) {
					count.running++;
					var promise = new Promise(function (resolve, reject) {
						pw[key].promise(resolve, reject, results);
					}).then(then(key));
					if (!options.stopOnError) {
						promise.catch(error(key));
					} else {
						promise.catch(function (err) {
							var errObj = {};
							errObj[key] = err;
							reject(errObj);
						});
					}

					delete pw[key];
				}

				if (count.error && options.debug) {
					for (var i = 0; i < deps.length; i++) {
						var dep = deps[i];
						if (!errors.hasOwnProperty(dep)) {
							console.warn(key + " will not run because of failed dependency " + dep);
						}
					}
				}
			};

			for (var key in pw) {
				_loop(key);
			}
			if (count.running === 0) {
				if (options.debug && Object.keys(pw).length) {
					console.warn("The following promises didn't run because of unmet dependencies: " + Object.keys(pw).join());
				}
				resolve({
					results: results,
					errors: errors
				});
			}
		}
		run();
	});
};
},{}]},{},[5]);
