(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("react"));
	else if(typeof define === 'function' && define.amd)
		define(["react"], factory);
	else if(typeof exports === 'object')
		exports["au-flux"] = factory(require("react"));
	else
		root["au-flux"] = factory(root["React"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Dispatcher__ = __webpack_require__(1);

class Globals {
	constructor() {
		this.globals = {
			stores: {},
			defaultDispatcher: new __WEBPACK_IMPORTED_MODULE_0__Dispatcher__["a" /* default */]()
		};
	}

	set(key, value) {
		// @todo validation

		if (key === 'stores') {
			this.initializeStores(value);
		} else {
			this.globals[key] = value;
		}
	}

	get(key) {
		return this.globals[key];
	}

	initializeStores(stores) {
		for (const key in stores) {
			stores[key].setKey(key);
			this.globals.stores[key] = stores[key];
		}
	}
}

/* harmony default export */ __webpack_exports__["a"] = (new Globals());

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Dispatcher;
function Dispatcher() {
	const storeActionHandlers = {};
	const actionQueue = [];
	let currentAction = undefined;

	this.on = function (store, action) {
		if (!store || !store.isStore) {
			throw new Error('First argument must be a Store');
		}
		if (typeof action !== 'string') {
			throw new Error('Second argument "action" must be a string');
		}
		if (!storeActionHandlers.hasOwnProperty(action)) {
			storeActionHandlers[action] = [];
		}
		storeActionHandlers[action].push(store);
	};

	this.handleAction = function (action, data = {}) {
		if (!storeActionHandlers.hasOwnProperty(action) || !storeActionHandlers[action].length) {
			return Promise.reject(new Error(`There are no handlers for action "${action}"`));
		}
		return Promise.all(storeActionHandlers[action].map(store => store.handleAction(action, data))).then(() => Promise.resolve(true));
	};

	this.trigger = function (action, data = {}) {
		return new Promise((resolve, reject) => {
			actionQueue.push({
				action,
				data,
				resolve: resolve,
				reject: reject
			});
			if (!currentAction) {
				next();
			}
		});
	};

	const next = function () {
		currentAction = actionQueue.shift();
		if (currentAction) {
			processAction(currentAction);
		}
	};

	const processAction = ({ action, data, resolve, reject }) => {
		this.handleAction(action, data).then(data => {
			resolve(data);
			next();
		}).catch(err => {
			reject(err);
			next();
		});
	};
}

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class IdGenerator {
	constructor() {
		this.storeId = 1;
		this.componentId = 1;
	}

	nextStoreId() {
		return this.storeId++;
	}

	nextComponentId() {
		return this.componentId++;
	}
}
/* harmony default export */ __webpack_exports__["a"] = (new IdGenerator());

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);


class StoreError2 extends Error {
	constructor({ message, key, recoverable }) {
		super(message);
		this.key = key || 'default';
		this.recoverable = recoverable || recoverable === undefined;
		this.name = 'StoreError';
	}
}

const renderError2 = (error, key, ErrorComponent) => {
	return error && error.key === key ? __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(ErrorComponent, { error: error }) : null;
};

const StoreError = StoreError2;
/* harmony export (immutable) */ __webpack_exports__["a"] = StoreError;

const renderError = renderError2;
/* unused harmony export renderError */

/* harmony default export */ __webpack_exports__["b"] = ({
	StoreError: StoreError2,
	renderError: renderError2
});

/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Dispatcher__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__globals__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__SmartComponent__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__Store__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__error__ = __webpack_require__(4);






const d = __WEBPACK_IMPORTED_MODULE_1__globals__["a" /* default */].get('defaultDispatcher');
/* harmony export (immutable) */ __webpack_exports__["d"] = d;

const Dispatcher = __WEBPACK_IMPORTED_MODULE_0__Dispatcher__["a" /* default */];
/* harmony export (immutable) */ __webpack_exports__["Dispatcher"] = Dispatcher;

const globals = __WEBPACK_IMPORTED_MODULE_1__globals__["a" /* default */];
/* harmony export (immutable) */ __webpack_exports__["globals"] = globals;

const renderError = __WEBPACK_IMPORTED_MODULE_4__error__["b" /* default */].renderError;
/* harmony export (immutable) */ __webpack_exports__["renderError"] = renderError;

const SmartComponent = __WEBPACK_IMPORTED_MODULE_2__SmartComponent__["a" /* default */];
/* harmony export (immutable) */ __webpack_exports__["SmartComponent"] = SmartComponent;

const Store = __WEBPACK_IMPORTED_MODULE_3__Store__["a" /* default */];
/* harmony export (immutable) */ __webpack_exports__["Store"] = Store;

const StoreError = __WEBPACK_IMPORTED_MODULE_4__error__["b" /* default */].StoreError;
/* harmony export (immutable) */ __webpack_exports__["StoreError"] = StoreError;


/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__globals__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ids__ = __webpack_require__(3);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };





/* harmony default export */ __webpack_exports__["a"] = ({
	build(Component, ...stores) {
		const allStores = __WEBPACK_IMPORTED_MODULE_1__globals__["a" /* default */].get('stores');
		const d = __WEBPACK_IMPORTED_MODULE_1__globals__["a" /* default */].get('defaultDispatcher');
		class SmartComponent extends __WEBPACK_IMPORTED_MODULE_0_react___default.a.Component {
			constructor(props) {
				super(props);
				this.state = {};
				// todo: see if you can use the child component class name as part of the key for
				// better errors
				this.key = __WEBPACK_IMPORTED_MODULE_2__ids__["a" /* default */].nextComponentId();
				for (const store of stores) {
					allStores[store].connectToState(this.key, this.setState.bind(this));
					this.state[store] = allStores[store].value();
				}
			}
			componentWillUnmount() {
				for (const store of stores) {
					allStores[store].ignore(this.key);
				}
			}

			render() {
				return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(Component, _extends({
					d: d
				}, this.state, this.props));
			}
		}
		return SmartComponent;
	}
});

/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ids__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__globals__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__error__ = __webpack_require__(4);




const build2 = (actions, dispatcher) => {
	const _dispatcher = dispatcher || __WEBPACK_IMPORTED_MODULE_1__globals__["a" /* default */].get('defaultDispatcher');
	const _id = __WEBPACK_IMPORTED_MODULE_0__ids__["a" /* default */].nextStoreId();
	const _history = [];
	let _undoHistory = [];
	let _loading = false;
	let _key = null;

	class Store {
		constructor(initialStateValue) {
			this._componentListeners = {};
			_history.push({
				action: null,
				state: initialStateValue
			});

			this.isStore = true;

			for (const action in actions) {
				_dispatcher.on(this, action);
			}
		}

		listen(componentKey, cb) {
			if (!this._componentListeners.hasOwnProperty(componentKey)) {
				this._componentListeners[componentKey] = cb;
			} else {
				throw new Error(`component (key=${componentKey}) is already listening to the store ` + `(id=${_id}, key=${_key})`);
			}
		}

		connectToState(componentKey, setState) {
			this.listen(componentKey, resolve => {
				const key = this.key() || this.id();
				const newState = {};
				newState[key] = this.value();
				setState(newState, resolve);
			});
			return this.value();
		}

		ignore(componentKey) {
			if (this._componentListeners.hasOwnProperty(componentKey)) {
				delete this._componentListeners[componentKey];
			}
		}

		handleAction(action, data = {}) {
			if (!actions[action]) {
				return Promise.reject(new __WEBPACK_IMPORTED_MODULE_2__error__["a" /* StoreError */]({
					message: `Store "${this.key()}" does not have an action "${action}"`
				}));
			}
			let run = null;
			if (typeof actions[action] === 'function') {
				run = actions[action];
			} else if (actions[action].run && typeof actions[action].run === 'function') {
				run = actions[action].run;
			}
			if (!run) {
				const message = `Store "${this.key()}" does not have a run method for action "${action}"`;
				return Promise.reject(new __WEBPACK_IMPORTED_MODULE_2__error__["a" /* StoreError */]({ message, recoverable: false }));
			}
			const historyAction = { name: action, data };
			return run.call(this, data).then(result => {
				if (result !== this.value()) {
					_history.push({
						action: historyAction,
						state: result
					});
					this.change(action);
					_undoHistory = [];
				}
			});
		}

		change(action) {
			const keys = Object.keys(this._componentListeners);
			return Promise.all(keys.map(key => new Promise((resolve, reject) => this._componentListeners[key].call(this, resolve, reject, { action }))));
		}

		state() {
			return _history.length ? _history[_history.length - 1].state : undefined;
		}

		value() {
			return this.state();
		}

		setValue(state, action) {
			action = action || 'setValue';
			_history.push({
				action,
				state
			});
			this.change(action);
		}

		setKey(key) {
			_key = key;
		}

		key() {
			return _key;
		}

		id() {
			return _id;
		}

		history() {
			return _history;
		}

		undo() {
			if (_history.length <= 1) return;
			_undoHistory.push(_history.pop());
			this.change('undo');
		}

		redo() {
			if (_undoHistory.length < 1) return;
			_history.push(_undoHistory.pop());
			this.change('redo');
		}
	}

	return Store;
};

const build = build2;
/* unused harmony export build */


/* harmony default export */ __webpack_exports__["a"] = ({
	build: build2
});

/***/ })
/******/ ]);
});