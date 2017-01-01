'use strict';

var isFunction = require('../is-function');

module.exports = function EventSnapshot(eventName, data, state) {
    var _eventName = eventName;
    var _data = data;
    var _state = state;

    this.eventName = function () {
        return _eventName;
    };
    this.data = function () {
        return _data;
    };
    this.state = function () {
        return _state;
    };
};