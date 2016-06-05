// Todo: test this

function isFunction(functionToCheck) {
	var getType = {};
	return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

module.exports = function Event() {
	let listeners = {};
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

		let id = count++;
		listeners[eventName].push({ eventName, cb, id });
		return id;
	};

	this.off = function() {
		if(typeof arguments[0] === 'number') {
			for(let i in listeners) {
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
		if(listeners.hasOwnProperty(eventName)) {
			listeners[eventName].forEach(listener => {
				listener.cb(data);
			});
		}
	};
};