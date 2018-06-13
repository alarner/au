import React from 'react';
import ReactDOM from 'react-dom';
import { buildSmartComponent, d, init } from '../../../bundle.esm';
import * as stores from './stores/index';

init(stores);

const TodoItem = ({ item, onClick }) => (
	<li
		onClick={() => onClick(item)}
		style={{ textDecoration: item.get('completed') ? 'line-through' : 'none' }}
	>
		{item.get('text')}
	</li>
);

class TodoList extends React.Component {
	render() {
		return (
			<main>
				<h1>Todo List</h1>
				<div>
					<form onSubmit={this.addTodo.bind(this)}>
						<input type="text" ref="todo" />
						<button type="submit">Add Todo</button>
					</form>
					<ul>
						{
							this.props.todos.map(
								(item, index) => (
									<TodoItem
										item={item}
										key={index}
										onClick={this.toggleTodo.bind(this)}
									/>
								)
							)
						}
					</ul>
				</div>
			</main>
		);
	}
	async addTodo(e) {
		e.preventDefault();
		const success = await d.trigger('add_todo', { text: this.refs.todo.value });
		if(success) {
			this.refs.todo.value = '';
			this.refs.todo.focus();
		}
	}
	toggleTodo(item) {
		d.trigger('toggle_todo', { id: item.get('id') });
	}
};

const SmartTodoList = buildSmartComponent(TodoList, 'todos');

ReactDOM.render(<SmartTodoList />, document.getElementById('app'));