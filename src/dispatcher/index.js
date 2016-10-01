// Todo: test this

let Event = require('../event/index');
let auto = require('../promise.auto');

module.exports = function Dispatcher() {
	let storeEventHandlers = {};
	let eventHandler = new Event();

	this.on = function(storeDescriptor, eventName, dependencies, promiseFunctions) {
		if(typeof storeDescriptor !== 'string') {
			throw new Error('First argument storeDescriptor must be a string');
		}
		if(typeof eventName !== 'string') {
			throw new Error('Second argument eventName must be a string');
		}
		if(Object.prototype.toString.call(promiseFunctions) !== '[object Array]') {
			throw new Error('Fourth argument promiseFunctions must be an array');
		}
		if(!promiseFunctions.length) {
			throw new Error('Fourth argument promiseFunctions must have at least one element');
		}
		dependencies = dependencies || [];
		if(!storeEventHandlers.hasOwnProperty(eventName)) {
			storeEventHandlers[eventName] = {};
		}
		if(!storeEventHandlers[eventName].hasOwnProperty(storeDescriptor)) {
			storeEventHandlers[eventName][storeDescriptor] = [];
		}
		let cbs = storeEventHandlers[eventName][storeDescriptor];
		storeEventHandlers[eventName][storeDescriptor] = cbs.concat({
			dependencies,
			promiseFunctions
		});

		eventHandler.off(eventName);
		eventHandler.on(eventName, this.handleAllEvents(eventName));
	};

	this.handleAllEvents = function(eventName) {
		return (data) => {
			console.log('handleAllEvents');
			if(!storeEventHandlers.hasOwnProperty(eventName)) {
				return;
			}
			let autoObj = {};
			let handlersByStore = storeEventHandlers[eventName];
			for(const storeDescriptor in handlersByStore) {
				const store = handlersByStore[storeDescriptor];
				autoObj[storeDescriptor] = {
					dependencies: store.dependencies || [],
					run: this.handleStoreEvents(store.promiseFunctions)
				};
			}

			// Todo: should we call .then or .catch here?
			return auto(autoObj);

		};
	};

	this.handleStoreEvents = function(promiseFunctions) {
		return function(resolve, reject) {
			if(!promiseFunctions.length) {
				return;
			}
			let promise = new Promise(promiseFunctions[0]);
			for(let i=1; i<promiseFunctions.length; i++) {
				promise = promise.then(promiseFunctions[i]);
			}
			promise.then(resolve).catch(reject);
		};
	};

	this.trigger = eventHandler.trigger;
};