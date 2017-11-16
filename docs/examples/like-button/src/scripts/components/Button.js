import { SmartComponent, d } from 'au-flux';
import React from 'react';

class Button extends React.Component {
	render() {
		return (
			<div>
				<button onClick={() => d.trigger('click')}>{this.props.likeCount}</button>
			</div>
		);
	}
}

export default SmartComponent.build(Button, 'likeCount');
