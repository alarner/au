// Todo: test this

let MemoryCacher = require('./MemoryCacher');

module.exports = function(cacheDescriptor) {
	let cache = new MemoryCacher();

	let fromLocalstorage = window.localstorage.getItem(cacheDescriptor) || {};
	
	for(const key in fromLocalstorage) {
		for(const id in fromLocalstorage[key]) {
			cache.save(key, id, fromLocalstorage[key][id]);
		}
	}

	this.save = function(key, idProp, data) {
		// Todo: ensure that data is an object
		if(!data.hasOwnProperty(idProp)) {
			throw new Error(`LocalstorageCacher: data does not have '${idProp}' property`);
		}
		cache.save(key, idProp, data);
		window.localstorage.setItem(cacheDescriptor, JSON.stringify(cache.toJSON()));
	}

	// Returns a promise
	this.get = cache.get;
}