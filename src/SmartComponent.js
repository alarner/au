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
				this.state = {
					error: '',
					loading: false
				};
				// todo: see if you can use the child component class name as part of the key for
				// better errors
				this.key = ids.nextComponentId();
				this.trigger = this.trigger.bind(this);
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
						trigger={this.trigger}
						{...this.state}
						{...this.props}
					/>
				);
			}

			async trigger(action, data) {
				const newState = {};
				let success = true;
				this.setState({ loading: true, error: false });
				try {
					await d.trigger(action, data);
				}
				catch(error) {
					success = false;
					newState.error = error.message;
				}
				finally {
					newState.loading = false;
				}
				this.setState(newState);
				return success;
			}
		}
		return SmartComponent;
	}
};
