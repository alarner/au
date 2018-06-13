class IdGenerator {
	constructor() {
		this.componentId = 1;
	}

	nextComponentId() {
		return this.componentId++;
	}
}
export default new IdGenerator();