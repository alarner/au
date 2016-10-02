const storeBuilder = require('../../../src/index').storeBuilder;
const d = require('../dispatcher');
const Store = storeBuilder('likeCount', d);

class LikeCount extends Store {
    constructor(initialValue) {
        super({
            click: {
                // other stores that should process the click event before this one
                dependencies: [],
                // the function that should run when the click happens
                run(resolve, reject, data) {
                    this.count++;
                    this.change('click');
                }
            }
        });
        this.count = initialValue || 0;
    }

    get() {
        return this.count;
    }
}

module.exports = new LikeCount(0);