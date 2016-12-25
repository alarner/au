const { Store } = require('../../../src/index');
const d = require('../dispatcher');

const LikeCount = Store.build('likeCount', d, {
    click: {
        // other stores that should process the click event before this one
        dependencies: [],
        // the function that should run when the click happens
        run(resolve, reject, action) {
            const oldVal = this.get().data;
            if(Math.random() < 0.333) {
                reject({
                    default: 'Something unexpected went wrong...'
                })
            }
            resolve(this.get().data + 1);
        }
    }
});

module.exports = new LikeCount(0);