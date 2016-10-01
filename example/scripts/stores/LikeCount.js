const Store = require('au').Store;
const d = require('../dispatcher');

function LikeCount(initialValue) {
    let count = initialValue;

    this.get = function() {
        return count;
    };

    this.events = {
        click: {
            // other stores that should process the click event before this one
            dependencies: [],
            // the function that should run when the click happens
            run(resolve, reject) {
                count++;
                this.change('click');
            }
        }
    };
};

LikeCount.prototype = new Store('LikeCount', d);

module.exports = new LikeCount(0);