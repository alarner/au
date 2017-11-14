import React from 'react';

class StoreError2 extends Error {
	constructor({ message, key, recoverable }) {
		super(message);
		this.key = key || 'default';
		this.recoverable = recoverable || recoverable === undefined;
		this.name = 'StoreError';
	}
}

const renderError2 = (error, key, ErrorComponent) => {
	return error && error.key === key ? <ErrorComponent error={error} /> : null;
};


export const StoreError = StoreError2;
export const renderError = renderError2;
export default {
	StoreError: StoreError2,
	renderError: renderError2
};
