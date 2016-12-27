// class OptimisticPromise {
//     constructor(fn, optimisticValue) {
//         this.promise = 
//         this.optimisticValue = optimisticValue;
//     }
// }

// module.exports = OptimisticPromise;

function OptimisticPromise(fn, optimisticValue) {
    const promise = new Promise(fn);
    this.promise = () => promise;
    this.optimisticValue = () => optimisticValue;
};

module.exports = OptimisticPromise;