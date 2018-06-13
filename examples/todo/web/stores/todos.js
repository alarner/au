import { List, Map } from 'immutable';
import { buildStore } from '../../../../bundle.esm';

let id = 0;

const TodosStore = buildStore({
	add_todo(state, data) {
		id++;
		return state.push(Map({ id, completed: false, ...data }));
	},
	toggle_todo(state, data) {
		let todo = state.find(item => item.get('id') === data.id);
		if(!todo) {
			return state;
		}
		todo = todo.set('completed', !todo.get('completed'));
		const index = state.findIndex(item => item.get('id') === data.id);
		return state.set(index, todo);
	}
});

export default new TodosStore(List());