import React from 'react';
import stores from './stores';
import ids from './ids';

export default (Component, ...connectedStores) => {
	class SmartComponent extends React.Component {
		constructor(props) {
			super(props);
			this.state = {};
			this.key = ids.nextComponentId();
			for(const key of connectedStores) {
				if(!stores.hasOwnProperty(key)) {
					throw new Error(`Cannot connect component "${Component.name}" to non-existant store "${key}"`);
				}
				stores[key].connectToState(this.key, this.setState.bind(this));
				this.state[key] = stores[key].fullState();
			}
		}
		componentWillUnmount() {
			for(const key of connectedStores) {
				connectedStores[key].ignore(this.key);
			}
		}

		render() {
			const errors = {};
			const values = {};
			for(const key in this.state) {
				errors[key] = this.state[key].errors;
				values[key] = this.state[key].value;
			}
			return (
				<Component
					errors={errors}
					{...values}
					{...this.props}
				/>
			);
		}
	}
	return SmartComponent;
}