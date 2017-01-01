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