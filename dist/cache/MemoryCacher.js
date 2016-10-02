"use strict";

// Todo: test this

module.exports = function () {
	var cache = {};

	this.save = function (key, id, data) {
		// Todo: ensure that data is an object
		if (!cache.hasOwnProperty(key)) {
			cache[key] = {};
		}
		cache[key][id] = data;
	};

	// Returns a promise
	this.get = function (key, id) {
		if (cache.hasOwnProperty(key) && cache[key].hasOwnProperty(id)) {
			return Promise.reslove(cache[key][id]);
		}
		return false;
	};

	this.toJSON = function () {
		return cache;
	};
};