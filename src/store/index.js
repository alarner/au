const Event = require('../event/index');
const EventSnapshot = require('../event-snapshot/index');
// const OptimisticPromise = require('../optimistic-promise/index');
module.exports = {
	build(storeDescriptor, dispatcher, events = {}) {

		function Store(initialState = {}) {
			const _componentEvents = {};
			const _eventHandler = new Event();
			const _eventHistory = [];
			const _stateHistory = [];
			let _loading = false;
			let _errors = {};

			_stateHistory.push(initialState);

			this.connectToState = function(componentName, setState, key) {
				this.listen(componentName, (resolve, reject) => {
					const newState = {};
					newState[key || storeDescriptor] = this.get();
					setState(newState);
					resolve();
				});

				return this.get();
			};

			this.listen = function(componentName, cb) {
				if(!_componentEvents.hasOwnProperty(componentName)) {
					_componentEvents[componentName] = _eventHandler.on('CHANGE', cb);
				}
				else {
					throw new Error(
						`"${componentName}" component is already listening to the store ` +
						`"${storeDescriptor}"`
					);
				}
			};

			this.ignore = function(componentName) {
				if(_componentEvents.hasOwnProperty(componentName)) {
					_eventHandler.off(_componentEvents[componentName]);
					delete _componentEvents[componentName];
				}
			};

			this.change = function(eventName) {
				return _eventHandler.trigger('CHANGE', {event: eventName});
			};

			this.loading = function(val = true) {
				_loading = val;
				this.change('loading');
			};

			this.get = function() {
				return {
					data: this.state(),
					errors: _errors,
					loading: _loading
				};
			};

			this.state = function() {
				return _stateHistory[_stateHistory.length - 1];
			};

			this.descriptor = function() {
				return storeDescriptor;
			};

			this.setData = function(data) {
				_stateHistory.push(data);
			};

			this.setErrors = function(errors) {
				_errors = errors;
			};

			this.processEvent = function(eventName, data) {
				if(!events[eventName]) {
					throw new Error(`${storeDescriptor} has no event named "${eventName}"`);
				}
				const eventSnapshot = new EventSnapshot(eventName, data, this.state());
				// _eventHistory.push(eventSnapshot);
				const promise = new Promise(
					(resolve, reject) => events[eventName].run.call(this, data.event, this.state(), resolve, reject)
				);

				return promise.then((result) => {
					eventSuccess(eventSnapshot, result);
					return Promise.resolve(result);
				})
				.catch((errors) => {
					eventFailure(eventSnapshot, errors);
					return Promise.resolve();
				});
			};

			const eventSuccess = (eventSnapshot, result) => {
				let data = result;
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
				this.setData(data);
				this.setErrors({});
				this.change(eventSnapshot.eventName());
			};

			const eventFailure = (eventSnapshot, errors) => {
				if(errors instanceof Error) {
					throw errors;
				}
				this.setErrors(errors);
				this.change(eventSnapshot.eventName());
			};

			// const reprocessEventHistory = (updatedEventSnapshot) => {
			// 	const index = _eventHistory.indexOf(updatedEventSnapshot);
			// };

			for(const eventName in events) {
				dispatcher.on(
					this,
					eventName,
					events[eventName].dependencies || [],
					events[eventName].run.bind(this)
				);
			}
		};

		return Store;
	}
};