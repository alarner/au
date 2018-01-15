!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t(require("react")):"function"==typeof define&&define.amd?define(["react"],t):"object"==typeof exports?exports["au-flux"]=t(require("react")):e["au-flux"]=t(e.React)}(this,function(e){return function(e){function t(r){if(n[r])return n[r].exports;var o=n[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,t),o.l=!0,o.exports}var n={};return t.m=e,t.c=n,t.d=function(e,n,r){t.o(e,n)||Object.defineProperty(e,n,{configurable:!1,enumerable:!0,get:r})},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=7)}([function(e,t,n){"use strict";e.exports=function(e,t){for(var n=-1,r=e.length;++n<r;)t(e[n],n,e)}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.renderError=t.StoreError=void 0;var r=function(e){return e&&e.__esModule?e:{default:e}}(n(5)),o=function(e){function t(e){var n=e.message,r=e.key,o=e.recoverable;!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t);var i=function(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,n));return i.key=r||"default",i.recoverable=o||void 0===o,i.name="StoreError",i}return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}(t,Error),t}(),i=function(e,t,n){return e&&e.key===t?r.default.createElement(n,{error:e}):null};t.StoreError=o,t.renderError=i;t.default={StoreError:o,renderError:i}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),o=function(e){return e&&e.__esModule?e:{default:e}}(n(3)),i=function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this.globals={stores:{},defaultDispatcher:new o.default}}return r(e,[{key:"set",value:function(e,t){"stores"===e?this.initializeStores(t):this.globals[e]=t}},{key:"get",value:function(e){return this.globals[e]}},{key:"initializeStores",value:function(e){for(var t in e)e[t].setKey(t),this.globals.stores[t]=e[t]}}]),e}();t.default=new i},function(e,t,n){"use strict";var r=function(e){return e&&e.__esModule?e:{default:e}}(n(8)),o=n(1);e.exports=function(){var e=this,t={},n=[],i=void 0,u={};this.on=function(e,n,r){if(!e||!e.isStore)throw new Error("First argument must be a Store");if("string"!=typeof n)throw new Error('Second argument "action" must be a string');r=r||[],t.hasOwnProperty(n)||(t[n]={}),t[n][e.id()]={dependencies:r,store:e},u[n]||(u[n]=[]);var o=u[n].find(function(t){return t.store===e});o?o.dependencies=r:u[n].push({store:e,dependencies:r})},this.handleAction=function(e,n){return new Promise(function(i,u){if(!t.hasOwnProperty(e))return i();var a={},c=function(r){var i=t[e][r],u=i.dependencies,c=i.store;a[c.key()]=u.slice(0),a[c.key()].push(function(t){c.handleAction(e,n).then(function(){return t()}).catch(function(e){var n=!1;e instanceof o.StoreError&&(n=e.recoverable),n?t(null,e):t(e)})})};for(var s in t[e])c(s);(0,r.default)(a,function(e,t){e?u(e):i(t)})})},this.trigger=function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return!(arguments.length>2&&void 0!==arguments[2])||arguments[2]?new Promise(function(r,o){n.push({action:e,data:t,resolve:r,reject:o}),i||a()}):this.handleAction(e,t)};var a=function(){(i=n.shift())&&c(i)},c=function(t){var n=t.action,r=t.data,o=t.resolve,i=t.reject;e.handleAction(n,r).then(function(e){o(e),a()}).catch(function(e){i(e),a()})}}},function(e,t,n){"use strict";e.exports=Object.keys||function(e){var t=[];for(var n in e)e.hasOwnProperty(n)&&t.push(n);return t}},function(t,n){t.exports=e},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),o=function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this.storeId=1,this.componentId=1}return r(e,[{key:"nextStoreId",value:function(){return this.storeId++}},{key:"nextComponentId",value:function(){return this.componentId++}}]),e}();t.default=new o},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0}),t.StoreError=t.Store=t.SmartComponent=t.renderError=t.globals=t.Dispatcher=t.d=void 0;var o=r(n(3)),i=r(n(2)),u=r(n(21)),a=r(n(22)),c=r(n(1));t.d=i.default.get("defaultDispatcher"),t.Dispatcher=o.default,t.globals=i.default,t.renderError=c.default.renderError,t.SmartComponent=u.default,t.Store=a.default,t.StoreError=c.default.StoreError},function(e,t,n){"use strict";var r=n(9),o=n(10),i=n(4),u=n(11),a=n(12),c=n(13),s=n(0),l=n(14),f=n(15),d=n(16);e.exports=function(e,t,n){function h(e){b.unshift(e)}function p(){y--,s(b.slice(0),function(e){e()})}"function"==typeof arguments[1]&&(n=t,t=null),n=r(n||o);var v=i(e),y=v.length;if(!y)return n(null);t||(t=y);var m={},g=0,b=[];h(function(){y||n(null,m)}),s(v,function(r){function o(){return g<t&&u(w,function(e,t){return e&&m.hasOwnProperty(t)},!0)&&!m.hasOwnProperty(r)}function i(){o()&&(g++,function(e){var t=a(b,e);t>=0&&b.splice(t,1)}(i),v[v.length-1](y,m))}for(var s,v=c(e[r])?e[r]:[e[r]],y=l(function(e,t){if(g--,t.length<=1&&(t=t[0]),e){var o={};f(m,function(e,t){o[t]=e}),o[r]=t,n(e,o)}else m[r]=t,d(p)}),w=v.slice(0,v.length-1),_=w.length;_--;){if(!(s=e[w[_]]))throw new Error("Has inexistant dependency");if(c(s)&&a(s,r)>=0)throw new Error("Has cyclic dependencies")}o()?(g++,v[v.length-1](y,m)):h(i)})}},function(e,t,n){"use strict";e.exports=function(e){return function(){null!==e&&(e.apply(this,arguments),e=null)}}},function(e,t,n){"use strict";e.exports=function(){}},function(e,t,n){"use strict";var r=n(0);e.exports=function(e,t,n){return r(e,function(e,r,o){n=t(n,e,r,o)}),n}},function(e,t,n){"use strict";e.exports=function(e,t){for(var n=0;n<e.length;n++)if(e[n]===t)return n;return-1}},function(e,t,n){"use strict";e.exports=Array.isArray||function(e){return"[object Array]"===Object.prototype.toString.call(e)}},function(e,t,n){"use strict";e.exports=function(e,t){return t=null==t?e.length-1:+t,function(){for(var n=Math.max(arguments.length-t,0),r=new Array(n),o=0;o<n;o++)r[o]=arguments[o+t];switch(t){case 0:return e.call(this,r);case 1:return e.call(this,arguments[0],r)}}}},function(e,t,n){"use strict";var r=n(4),o=n(0);e.exports=function(e,t){o(r(e),function(n){t(e[n],n)})}},function(e,t,n){"use strict";(function(t){var n="function"==typeof t&&t;e.exports=function(e){return(n||function(e){setTimeout(e,0)})(e)}}).call(t,n(17).setImmediate)},function(e,t,n){function r(e,t){this._id=e,this._clearFn=t}var o=Function.prototype.apply;t.setTimeout=function(){return new r(o.call(setTimeout,window,arguments),clearTimeout)},t.setInterval=function(){return new r(o.call(setInterval,window,arguments),clearInterval)},t.clearTimeout=t.clearInterval=function(e){e&&e.close()},r.prototype.unref=r.prototype.ref=function(){},r.prototype.close=function(){this._clearFn.call(window,this._id)},t.enroll=function(e,t){clearTimeout(e._idleTimeoutId),e._idleTimeout=t},t.unenroll=function(e){clearTimeout(e._idleTimeoutId),e._idleTimeout=-1},t._unrefActive=t.active=function(e){clearTimeout(e._idleTimeoutId);var t=e._idleTimeout;t>=0&&(e._idleTimeoutId=setTimeout(function(){e._onTimeout&&e._onTimeout()},t))},n(18),t.setImmediate=setImmediate,t.clearImmediate=clearImmediate},function(e,t,n){(function(e,t){!function(e,n){"use strict";function r(e){delete a[e]}function o(e){if(c)setTimeout(o,0,e);else{var t=a[e];if(t){c=!0;try{!function(e){var t=e.callback,r=e.args;switch(r.length){case 0:t();break;case 1:t(r[0]);break;case 2:t(r[0],r[1]);break;case 3:t(r[0],r[1],r[2]);break;default:t.apply(n,r)}}(t)}finally{r(e),c=!1}}}}if(!e.setImmediate){var i,u=1,a={},c=!1,s=e.document,l=Object.getPrototypeOf&&Object.getPrototypeOf(e);l=l&&l.setTimeout?l:e,"[object process]"==={}.toString.call(e.process)?i=function(e){t.nextTick(function(){o(e)})}:function(){if(e.postMessage&&!e.importScripts){var t=!0,n=e.onmessage;return e.onmessage=function(){t=!1},e.postMessage("","*"),e.onmessage=n,t}}()?function(){var t="setImmediate$"+Math.random()+"$",n=function(n){n.source===e&&"string"==typeof n.data&&0===n.data.indexOf(t)&&o(+n.data.slice(t.length))};e.addEventListener?e.addEventListener("message",n,!1):e.attachEvent("onmessage",n),i=function(n){e.postMessage(t+n,"*")}}():e.MessageChannel?function(){var e=new MessageChannel;e.port1.onmessage=function(e){o(e.data)},i=function(t){e.port2.postMessage(t)}}():s&&"onreadystatechange"in s.createElement("script")?function(){var e=s.documentElement;i=function(t){var n=s.createElement("script");n.onreadystatechange=function(){o(t),n.onreadystatechange=null,e.removeChild(n),n=null},e.appendChild(n)}}():i=function(e){setTimeout(o,0,e)},l.setImmediate=function(e){"function"!=typeof e&&(e=new Function(""+e));for(var t=new Array(arguments.length-1),n=0;n<t.length;n++)t[n]=arguments[n+1];var r={callback:e,args:t};return a[u]=r,i(u),u++},l.clearImmediate=r}}("undefined"==typeof self?void 0===e?this:e:self)}).call(t,n(19),n(20))},function(e,t){var n;n=function(){return this}();try{n=n||Function("return this")()||(0,eval)("this")}catch(e){"object"==typeof window&&(n=window)}e.exports=n},function(e,t){function n(){throw new Error("setTimeout has not been defined")}function r(){throw new Error("clearTimeout has not been defined")}function o(e){if(s===setTimeout)return setTimeout(e,0);if((s===n||!s)&&setTimeout)return s=setTimeout,setTimeout(e,0);try{return s(e,0)}catch(t){try{return s.call(null,e,0)}catch(t){return s.call(this,e,0)}}}function i(){p&&d&&(p=!1,d.length?h=d.concat(h):v=-1,h.length&&u())}function u(){if(!p){var e=o(i);p=!0;for(var t=h.length;t;){for(d=h,h=[];++v<t;)d&&d[v].run();v=-1,t=h.length}d=null,p=!1,function(e){if(l===clearTimeout)return clearTimeout(e);if((l===r||!l)&&clearTimeout)return l=clearTimeout,clearTimeout(e);try{l(e)}catch(t){try{return l.call(null,e)}catch(t){return l.call(this,e)}}}(e)}}function a(e,t){this.fun=e,this.array=t}function c(){}var s,l,f=e.exports={};!function(){try{s="function"==typeof setTimeout?setTimeout:n}catch(e){s=n}try{l="function"==typeof clearTimeout?clearTimeout:r}catch(e){l=r}}();var d,h=[],p=!1,v=-1;f.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)t[n-1]=arguments[n];h.push(new a(e,t)),1!==h.length||p||o(u)},a.prototype.run=function(){this.fun.apply(null,this.array)},f.title="browser",f.browser=!0,f.env={},f.argv=[],f.version="",f.versions={},f.on=c,f.addListener=c,f.once=c,f.off=c,f.removeListener=c,f.removeAllListeners=c,f.emit=c,f.prependListener=c,f.prependOnceListener=c,f.listeners=function(e){return[]},f.binding=function(e){throw new Error("process.binding is not supported")},f.cwd=function(){return"/"},f.chdir=function(e){throw new Error("process.chdir is not supported")},f.umask=function(){return 0}},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var o=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},i=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),u=r(n(5)),a=r(n(2)),c=r(n(6));t.default={build:function(e){for(var t=arguments.length,n=Array(t>1?t-1:0),r=1;r<t;r++)n[r-1]=arguments[r];var s=a.default.get("stores");return function(t){function r(e){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,r);var t=function(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}(this,(r.__proto__||Object.getPrototypeOf(r)).call(this,e));t.state={},t.key=c.default.nextComponentId();var o=!0,i=!1,u=void 0;try{for(var a,l=n[Symbol.iterator]();!(o=(a=l.next()).done);o=!0){var f=a.value;s[f].connectToState(t.key,t.setState.bind(t)),t.state[f]=s[f].all()}}catch(e){i=!0,u=e}finally{try{!o&&l.return&&l.return()}finally{if(i)throw u}}return t}return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}(r,u.default.Component),i(r,[{key:"componentWillUnmount",value:function(){var e=!0,t=!1,r=void 0;try{for(var o,i=n[Symbol.iterator]();!(e=(o=i.next()).done);e=!0){var u=o.value;s[u].ignore(this.key)}}catch(e){t=!0,r=e}finally{try{!e&&i.return&&i.return()}finally{if(t)throw r}}}},{key:"render",value:function(){var t={},n={},r={};for(var i in this.state)t[i]=this.state[i].error,n[i]=this.state[i].loading,r[i]=this.state[i].value;return u.default.createElement(e,o({errors:t,loading:n},r,this.props))}}]),r}()}}},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0}),t.build=void 0;var o=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),i=r(n(6)),u=r(n(2)),a=n(1),c=function(e,t){var n=t||u.default.get("defaultDispatcher"),r=i.default.nextStoreId(),c=[],s=[],l=!1,f=null;return function(){function t(r){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),this._componentListeners={},c.push({action:null,state:{value:r,error:null}}),this.isStore=!0;for(var o in e)n.on(this,o,e[o].dependencies||[])}return o(t,[{key:"listen",value:function(e,t){if(this._componentListeners.hasOwnProperty(e))throw new Error("component (key="+e+") is already listening to the store (id="+r+", key="+f+")");this._componentListeners[e]=t}},{key:"connectToState",value:function(e,t){var n=this;return this.listen(e,function(e,r){var o={};o[n.key()||n.id()]=n.all(),t(o,e)}),this.all()}},{key:"ignore",value:function(e){this._componentListeners.hasOwnProperty(e)&&delete this._componentListeners[e]}},{key:"handleAction",value:function(t,n){var r=this;if(!e[t])return Promise.reject(new a.StoreError({message:'Store "'+this.key()+'" does not have an action "'+t+'"'}));if(!e[t].run){var o='Store "'+this.key()+'" does not have a run method for action "'+t+'"';return Promise.reject(new a.StoreError({message:o,recoverable:!1}))}var i={name:t,data:n};return new Promise(function(o,i){e[t].run.call(r,o,i,n)}).then(function(e){e!==r.value()&&(c.push({action:i,state:{value:e,error:null}}),r.change(t),s=[])}).catch(function(e){var n=!1;e instanceof a.StoreError?n=e.recoverable:!e.message||e instanceof Error||(n=(e=new a.StoreError(e)).recoverable);var o=r.state();if(c.push({action:i,state:{value:o.value,error:e}}),r.change(t),!n)throw e;s=[]})}},{key:"change",value:function(e){var t=this,n=Object.keys(this._componentListeners);return Promise.all(n.map(function(n){return new Promise(function(r,o){return t._componentListeners[n].call(t,r,o,{action:e})})}))}},{key:"state",value:function(){return c.length?c[c.length-1].state:void 0}},{key:"value",value:function(){return this.state()?this.state().value:void 0}},{key:"setValue",value:function(e,t,n){n=n||"setValue",c.push({action:n,state:{value:e,error:t}}),this.change(n)}},{key:"loading",value:function(){return l}},{key:"setLoading",value:function(e){l!==e&&(l=e,this.change("setLoading"))}},{key:"error",value:function(){return this.state()?this.state().error:void 0}},{key:"all",value:function(){return{value:this.value(),loading:this.loading(),error:this.error()}}},{key:"setKey",value:function(e){f=e}},{key:"key",value:function(){return f}},{key:"id",value:function(){return r}},{key:"history",value:function(){return c}},{key:"undo",value:function(){c.length<=1||(s.push(c.pop()),this.change("undo"))}},{key:"redo",value:function(){s.length<1||(c.push(s.pop()),this.change("redo"))}}]),t}()};t.build=c;t.default={build:c}}])});