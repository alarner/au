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
			if (count.error && options.stopOnError) {
				return reject(errors);
			}
			for (var key in pw) {
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
					new Promise(pw[key].run).then(then(key)).catch(error(key));

					delete pw[key];
				}

				if (count.error && options.debug) {
					for (var _i = 0; _i < deps.length; _i++) {
						var _dep = deps[_i];
						if (!errors.hasOwnProperty(_dep)) {
							console.warn(key + " will not run because of failed dependency " + _dep);
						}
					}
				}
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