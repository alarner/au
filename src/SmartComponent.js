import React from 'react';
import globals from './globals';
import ids from './ids';

export default {
	build(Component, ...stores) {
		const allStores = globals.get('stores');
		return class SmartComponent extends React.Component {
			constructor(props) {
				super(props);
				this.state = {};
				// todo: see if you can use the child component class name as part of the key for
				// better errors
				this.key = ids.nextComponentId();
				for(const store of stores) {
					allStores[store].connectToState(this.key, this.setState.bind(this));
					this.state[store] = allStores[store].all();
				}
			}
			componentWillUnmount() {
				for(const store of stores) {
					allStores[store].ignore(this.key);
				}
			}

			render() {
				const errors = {};
				const loading = {};
				const values = {};
				for(const store in this.state) {
					errors[store] = this.state[store].error;
					loading[store] = this.state[store].loading;
					values[store] = this.state[store].value;
				}
				return (
					<Component
						errors={errors}
						loading={loading}
						{...values}
						{...this.props}
					/>
				);
			}
		};
	}
};
