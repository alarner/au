const d = require('../dispatcher');
const likeCount = require('../stores/likeCount');
module.exports = React.createClass({
    componentWillMount: function() {
        likeCount.connectToState('Button', this.setState.bind(this));
    },
    render: function() {
        return (
            <button onClick={() => d.trigger('click')}>{this.state.LikeCount}</button>
        );
    }
});