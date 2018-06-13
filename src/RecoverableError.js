import { Map } from 'immutable';

export default class RecoverableError extends Error {
	constructor(message, key = 'default') {
		let data = null;
		if(message instanceof RecoverableError) {
			data = message.data;
		}
		else if(message instanceof Error) {
			data = Map().set('default', message);
		}
		else if(typeof message === 'string') {
			data = Map().set(key, message);
		}
		else {
			data = Map(message);
		}

		message = '';
		jsData = data.toJS();
		for(const key of jsData) {
			message += `${key}: ${jsData[key]}\n`;
		}

		super(message);

		this.data = data;
	}

	toJS() {
		return this.data.toJS();
	}
}