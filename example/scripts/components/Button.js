const d = require('../dispatcher');
const likeCount = require('../stores/likeCount');
const React = require('react');
module.exports = React.createClass({
    getInitialState: function() {
        return {
            likeCount: likeCount.connectToState('Button', this.setState.bind(this))
        };
    },
    render: function() {
        return (
            <div>
                { this.state.likeCount.errors.default || '' }
                <button onClick={() => d.trigger('click')}>{this.state.likeCount.data}</button>
            </div>
        );
    }
});