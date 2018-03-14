(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("react"));
	else if(typeof define === 'function' && define.amd)
		define(["react"], factory);
	else if(typeof exports === 'object')
		exports["au-flux"] = factory(require("react"));
	else
		root["au-flux"] = factory(root["React"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_5__) {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function arrayEach(arr, iterator) {
    var index = -1;
    var length = arr.length;

    while (++index < length) {
        iterator(arr[index], index, arr);
    }
};


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(5);
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
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Dispatcher__ = __webpack_require__(3);

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
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = Dispatcher;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_async_auto__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_async_auto___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_async_auto__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__error__ = __webpack_require__(1);



function Dispatcher() {
	const storeActionHandlers = {};
	const actionQueue = [];
	let currentAction = undefined;
	const actionHandlers = {};

	this.on = function (store, action, dependencies) {
		if (!store || !store.isStore) {
			throw new Error('First argument must be a Store');
		}
		if (typeof action !== 'string') {
			throw new Error('Second argument "action" must be a string');
		}
		dependencies = dependencies || [];
		if (!storeActionHandlers.hasOwnProperty(action)) {
			storeActionHandlers[action] = {};
		}
		storeActionHandlers[action][store.id()] = {
			dependencies,
			store
		};

		if (!actionHandlers[action]) {
			actionHandlers[action] = [];
		}
		const existingHandler = actionHandlers[action].find(h => h.store === store);
		if (existingHandler) {
			existingHandler.dependencies = dependencies;
		} else {
			actionHandlers[action].push({ store, dependencies });
		}
	};

	this.handleAction = function (action, data = {}) {
		return new Promise((resolve, reject) => {
			if (!storeActionHandlers.hasOwnProperty(action)) {
				return resolve();
			}
			const autoObj = {};
			for (const storeId in storeActionHandlers[action]) {
				const { dependencies, store } = storeActionHandlers[action][storeId];
				autoObj[store.key()] = dependencies.slice(0);
				autoObj[store.key()].push(cb => {
					store.handleAction(action, data).then(() => cb()).catch(error => {
						let recoverable = false;
						if (error instanceof __WEBPACK_IMPORTED_MODULE_1__error__["a" /* StoreError */]) {
							recoverable = error.recoverable;
						}
						if (recoverable) {
							cb(null, error);
						} else {
							cb(error);
						}
					});
				});
			}

			__WEBPACK_IMPORTED_MODULE_0_async_auto___default()(autoObj, (error, results) => {
				if (error) {
					reject(error);
				} else {
					resolve(results);
				}
			});
		});
	};

	this.trigger = function (action, data = {}, queue = true) {
		if (!queue) {
			return this.handleAction(action, data);
		}
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
};

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = Object.keys || function keys(obj) {
    var _keys = [];
    for (var k in obj) {
        if (obj.hasOwnProperty(k)) {
            _keys.push(k);
        }
    }
    return _keys;
};


/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ }),
/* 6 */
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
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Dispatcher__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__globals__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__SmartComponent__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__Store__ = __webpack_require__(22);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__error__ = __webpack_require__(1);






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
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var once = __webpack_require__(9);
var noop = __webpack_require__(10);
var _keys = __webpack_require__(4);
var reduce = __webpack_require__(11);
var indexOf = __webpack_require__(12);
var isArray = __webpack_require__(13);
var arrayEach = __webpack_require__(0);
var restParam = __webpack_require__(14);
var forEachOf = __webpack_require__(15);
var setImmediate = __webpack_require__(16);

module.exports = function auto(tasks, concurrency, cb) {
    if (typeof arguments[1] === 'function') {
        // concurrency is optional, shift the args.
        cb = concurrency;
        concurrency = null;
    }
    cb = once(cb || noop);
    var keys = _keys(tasks);
    var remainingTasks = keys.length;
    if (!remainingTasks) {
        return cb(null);
    }
    if (!concurrency) {
        concurrency = remainingTasks;
    }

    var results = {};
    var runningTasks = 0;

    var listeners = [];

    function addListener(fn) {
        listeners.unshift(fn);
    }

    function removeListener(fn) {
        var idx = indexOf(listeners, fn);
        if (idx >= 0) listeners.splice(idx, 1);
    }

    function taskComplete() {
        remainingTasks--;
        arrayEach(listeners.slice(0), function(fn) {
            fn();
        });
    }

    addListener(function() {
        if (!remainingTasks) {
            cb(null, results);
        }
    });

    arrayEach(keys, function(k) {
        var task = isArray(tasks[k]) ? tasks[k] : [tasks[k]];
        var taskCallback = restParam(function(err, args) {
            runningTasks--;
            if (args.length <= 1) {
                args = args[0];
            }
            if (err) {
                var safeResults = {};
                forEachOf(results, function(val, rkey) {
                    safeResults[rkey] = val;
                });
                safeResults[k] = args;
                cb(err, safeResults);
            } else {
                results[k] = args;
                setImmediate(taskComplete);
            }
        });
        var requires = task.slice(0, task.length - 1);
        // prevent dead-locks
        var len = requires.length;
        var dep;
        while (len--) {
            if (!(dep = tasks[requires[len]])) {
                throw new Error('Has inexistant dependency');
            }
            if (isArray(dep) && indexOf(dep, k) >= 0) {
                throw new Error('Has cyclic dependencies');
            }
        }

        function ready() {
            return runningTasks < concurrency && reduce(requires, function(a, x) {
                return (a && results.hasOwnProperty(x));
            }, true) && !results.hasOwnProperty(k);
        }
        if (ready()) {
            runningTasks++;
            task[task.length - 1](taskCallback, results);
        } else {
            addListener(listener);
        }

        function listener() {
            if (ready()) {
                runningTasks++;
                removeListener(listener);
                task[task.length - 1](taskCallback, results);
            }
        }
    });
};


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function once(fn) {
    return function() {
        if (fn === null) return;
        fn.apply(this, arguments);
        fn = null;
    };
};


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function noop () {};


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var arrayEach = __webpack_require__(0);

module.exports = function reduce(arr, iterator, memo) {
    arrayEach(arr, function(x, i, a) {
        memo = iterator(memo, x, i, a);
    });
    return memo;
};


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function indexOf(arr, item) {
    for (var i = 0; i < arr.length; i++) if (arr[i] === item) return i;
    return -1;
};


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = Array.isArray || function isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
};


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

module.exports = function restParam(func, startIndex) {
    startIndex = startIndex == null ? func.length - 1 : +startIndex;
    return function() {
        var length = Math.max(arguments.length - startIndex, 0);
        var rest = new Array(length);
        for (var index = 0; index < length; index++) {
            rest[index] = arguments[index + startIndex];
        }
        switch (startIndex) {
            case 0:
                return func.call(this, rest);
            case 1:
                return func.call(this, arguments[0], rest);
        }
    };
};


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var keys = __webpack_require__(4);
var arrayEach = __webpack_require__(0);

module.exports = function forEachOf(object, iterator) {
    arrayEach(keys(object), function(key) {
        iterator(object[key], key);
    });
};


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(setImmediate) {

var _setImmediate = typeof setImmediate === 'function' && setImmediate;
var fallback = function(fn) {
    setTimeout(fn, 0);
};

module.exports = function setImmediate(fn) {
    // not a direct alias for IE10 compatibility
    return (_setImmediate || fallback)(fn);
};

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(17).setImmediate))

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

var apply = Function.prototype.apply;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) {
  if (timeout) {
    timeout.close();
  }
};

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// setimmediate attaches itself to the global object
__webpack_require__(18);
exports.setImmediate = setImmediate;
exports.clearImmediate = clearImmediate;


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, process) {(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var registerImmediate;

    function setImmediate(callback) {
      // Callback can either be a function or a string
      if (typeof callback !== "function") {
        callback = new Function("" + callback);
      }
      // Copy function arguments
      var args = new Array(arguments.length - 1);
      for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i + 1];
      }
      // Store and register the task
      var task = { callback: callback, args: args };
      tasksByHandle[nextHandle] = task;
      registerImmediate(nextHandle);
      return nextHandle++;
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function run(task) {
        var callback = task.callback;
        var args = task.args;
        switch (args.length) {
        case 0:
            callback();
            break;
        case 1:
            callback(args[0]);
            break;
        case 2:
            callback(args[0], args[1]);
            break;
        case 3:
            callback(args[0], args[1], args[2]);
            break;
        default:
            callback.apply(undefined, args);
            break;
        }
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(runIfPresent, 0, handle);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    run(task);
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function installNextTickImplementation() {
        registerImmediate = function(handle) {
            process.nextTick(function () { runIfPresent(handle); });
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        registerImmediate = function(handle) {
            global.postMessage(messagePrefix + handle, "*");
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        registerImmediate = function(handle) {
            channel.port2.postMessage(handle);
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        registerImmediate = function(handle) {
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
        };
    }

    function installSetTimeoutImplementation() {
        registerImmediate = function(handle) {
            setTimeout(runIfPresent, 0, handle);
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();

    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();

    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();

    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();

    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(19), __webpack_require__(20)))

/***/ }),
/* 19 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 20 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 21 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__globals__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ids__ = __webpack_require__(6);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };





/* harmony default export */ __webpack_exports__["a"] = ({
	build(Component, ...stores) {
		const allStores = __WEBPACK_IMPORTED_MODULE_1__globals__["a" /* default */].get('stores');
		class SmartComponent extends __WEBPACK_IMPORTED_MODULE_0_react___default.a.Component {
			constructor(props) {
				super(props);
				this.state = {};
				// todo: see if you can use the child component class name as part of the key for
				// better errors
				this.key = __WEBPACK_IMPORTED_MODULE_2__ids__["a" /* default */].nextComponentId();
				for (const store of stores) {
					allStores[store].connectToState(this.key, this.setState.bind(this));
					this.state[store] = allStores[store].all();
				}
			}
			componentWillUnmount() {
				for (const store of stores) {
					allStores[store].ignore(this.key);
				}
			}

			render() {
				const errors = {};
				const loading = {};
				const values = {};
				for (const store in this.state) {
					errors[store] = this.state[store].error;
					loading[store] = this.state[store].loading;
					values[store] = this.state[store].value;
				}
				return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(Component, _extends({
					errors: errors,
					loading: loading
				}, values, this.props));
			}
		};
		return SmartComponent;
	}
});

/***/ }),
/* 22 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ids__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__globals__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__error__ = __webpack_require__(1);




function isFunction(functionToCheck) {
	var getType = {};
	return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

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
				state: {
					value: initialStateValue,
					error: null
				}
			});

			this.isStore = true;

			for (const action in actions) {
				_dispatcher.on(this, action, actions[action].dependencies || []);
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
			this.listen(componentKey, (resolve, reject) => {
				const key = this.key() || this.id();
				const newState = {};
				newState[key] = this.all();
				setState(newState, resolve);
			});
			return this.all();
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
			if (isFunction(actions[action])) {
				run = actions[action];
			} else if (actions[action].run && isFunction(actions[action].run)) {
				run = actions[action].run;
			}
			if (!run) {
				const message = `Store "${this.key()}" does not have a run method for action "${action}"`;
				return Promise.reject(new __WEBPACK_IMPORTED_MODULE_2__error__["a" /* StoreError */]({ message, recoverable: false }));
			}
			const historyAction = { name: action, data };
			return run.call(this, data).then(result => {
				if (this.error() || result !== this.value()) {
					_history.push({
						action: historyAction,
						state: {
							value: result,
							error: null
						}
					});
					this.change(action);
					_undoHistory = [];
				}
			}).catch(error => {
				let recoverable = false;
				if (error.name === 'StoreError') {
					recoverable = error.recoverable;
				} else if (error.message && !(error instanceof Error)) {
					error = new __WEBPACK_IMPORTED_MODULE_2__error__["a" /* StoreError */](error);
					recoverable = error.recoverable;
				}

				const currentState = this.state();
				_history.push({
					action: historyAction,
					state: {
						value: currentState.value,
						error: error
					}
				});
				this.change(action);
				if (!recoverable) {
					throw error;
				}
				_undoHistory = [];
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
			return this.state() ? this.state().value : undefined;
		}

		setValue(newValue, newError, action) {
			action = action || 'setValue';
			_history.push({
				action,
				state: {
					value: newValue,
					error: newError
				}
			});
			this.change(action);
		}

		loading() {
			return _loading;
		}

		setLoading(value) {
			if (_loading !== value) {
				_loading = value;
				this.change('setLoading');
			}
		}

		error() {
			return this.state() ? this.state().error : undefined;
		}

		all() {
			return {
				value: this.value(),
				loading: this.loading(),
				error: this.error()
			};
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