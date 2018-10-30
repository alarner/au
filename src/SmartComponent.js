import React from 'react';
import globals from './globals';
import ids from './ids';

export default {
	build(Component, ...stores) {
		const allStores = globals.get('stores');
		const d = globals.get('defaultDispatcher');
		class SmartComponent extends React.Component {
			constructor(props) {
				super(props);
				this.state = {};
				// todo: see if you can use the child component class name as part of the key for
				// better errors
				this.key = ids.nextComponentId();
				for(const store of stores) {
					allStores[store].connectToState(this.key, this.setState.bind(this));
					this.state[store] = allStores[store].value();
				}
			}
			componentWillUnmount() {
				for(const store of stores) {
					allStores[store].ignore(this.key);
				}
			}

			render() {
				return (
					<Component
						d={d}
						{...this.state}
						{...this.props}
					/>
				);
			}
		}
		return SmartComponent;
	}
};
