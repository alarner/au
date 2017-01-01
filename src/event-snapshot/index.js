const isFunction = require('../is-function');

module.exports = function EventSnapshot(eventName, data, state) {
    const _eventName = eventName;
    const _data = data;
    const _state = state;

    this.eventName = () => _eventName;
    this.data = () => _data;
    this.state = () => _state;
};