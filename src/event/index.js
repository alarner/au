const isFunction = require('../is-function');

module.exports = function Event() {
	const listeners = {};
	let count = 0;

	// Returns an id that can be used to stop listening for the event
	this.on = function(eventName, cb) {
		if(!eventName || typeof eventName !== 'string') {
			throw new Error('Event.on requires a string eventName');
		}
		if(!isFunction(cb)) {
			throw new Error('Event.on requires a function callback');
		}
		if(!listeners.hasOwnProperty(eventName)) {
			listeners[eventName] = [];
		}

		const id = count++;
		listeners[eventName].push({ eventName, cb, id });
		return id;
	};

	this.off = function() {
		if(typeof arguments[0] === 'number') {
			for(const i in listeners) {
				listeners[i] = listeners[i].filter(listener => {
					return listener.id !== arguments[0];
				});
			}
		}
		else if(typeof arguments[0] === 'string') {
			if(isFunction(arguments[1])) {
				if(listeners.hasOwnProperty(arguments[0])) {
					listeners[arguments[0]] = listeners[arguments[0]].filter(listener => {
						return listener.cb !== arguments[1];
					});
				}
			}
			else {
				delete listeners[arguments[0]];
			}
		}
		else {
			throw new Error('Event.off requires an id or eventName & optional callback');
		}
	};

	this.trigger = function(eventName, data) {
		if(!eventName || typeof eventName !== 'string') {
			throw new Error('Event.trigger requires a string eventName');
		}
		if(listeners.hasOwnProperty(eventName) && listeners[eventName].length) {
			const makePromise = (cb) => {
				if(!listeners[eventName].some((listenerInfo) => cb === listenerInfo.cb)) {
					return Promise.resolve();
				}
				return new Promise((resolve, reject) => cb(resolve, reject, data))
			};
			let promise = makePromise(listeners[eventName][0].cb);
			for(let i=1; i<listeners[eventName].length; i++) {
				promise = promise.then(() => makePromise(listeners[eventName][i].cb));
			}
			return promise;
		}
		return Promise.resolve();
	};
};