import { globals, changeGlobals } from '../bundle';
const stores = { foo: { setKey() {} } };
globals.set('stores', stores);
changeGlobals();
console.log(globals);