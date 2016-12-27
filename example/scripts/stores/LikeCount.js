const { Store, OptimisticPromise } = require('../../../src/index');
const d = require('../dispatcher');

const LikeCount = Store.build('likeCount', d, {
    click: {
        // other stores that should process the click event before this one
        dependencies: [],
        // the function that should run when the click happens
        run(resolve, reject, action) {
            resolve(new OptimisticPromise((resolve, reject) => {
                setTimeout(() => {
                    const rand = Math.random();
                    if(rand < 0.333) {
                        reject({
                            default: 'Something unexpected went wrong...'
                        })
                    }
                    else if(rand < 0.666) {
                        resolve(3);
                    }
                    else {
                        resolve(7);
                    }
                }, 1000);
            }, this.get().data + 1));
            // const oldVal = this.get().data;
            
            // resolve(this.get().data + 1);
        }
    }
});

module.exports = new LikeCount(0);