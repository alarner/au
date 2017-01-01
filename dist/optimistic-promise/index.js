"use strict";

// class OptimisticPromise {
//     constructor(fn, optimisticValue) {
//         this.promise = 
//         this.optimisticValue = optimisticValue;
//     }
// }

// module.exports = OptimisticPromise;

function OptimisticPromise(fn, optimisticValue) {
    var promise = new Promise(fn);
    this.promise = function () {
        return promise;
    };
    this.optimisticValue = function () {
        return optimisticValue;
    };
};

module.exports = OptimisticPromise;