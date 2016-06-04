// Todo: test this

module.exports = function Cache(cache) {
	this.save = function(key, id, data) {
		// Todo: ensure that key is a string
		if(id === undefined || data === undefined) {
			return (id, data) => cache.save(key, id, data);
		}

		return cache.save(key, id, data);
	};

	// Returns a promise or a curried function
	this.get = function(key, id, fallback) {
		// Todo: ensure that key is a string
		if(id === undefined) {
			return (id) => cache.get(key, id);
		}

		return cache.get(key, id);
	};
};