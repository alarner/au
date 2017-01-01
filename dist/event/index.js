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