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
export default new IdGenerator();