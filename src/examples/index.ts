import createWidget from 'src/createWidget';
import createButton from 'src/createButton';
import createTextInput from 'src/createTextInput';
import createList, { ListState } from 'src/createList';
import { attach } from 'src/util/vdom';

createWidget({
	state: {
		id: 'foo',
		label: 'Hello World!'
	},
	tagName: 'h1'
});

const button = createButton({
	state: {
		id: 'bar',
		label: 'A brave new world...',
		name: 'foo'
	}
});

createTextInput({
	state: {
		name: 'first-name',
		id: 'fist-name',
		value: 'hello'
	}
});

const listItems = [
	{ id: 1, label: 'foo' },
	{ id: 2, label: 'bar' },
	{ id: 3, label: 'baz' },
	{ id: 4, label: 'qux' },
	{ id: 5, label: 'norf' }
];

const listState: ListState = {
	id: 'list',
	items: listItems
};

const list = createList({
	state: listState
});

button.on('click', (e: MouseEvent) => {
	listItems.pop();
	list.setState({
		items: listItems
	});
	return true;
});

attach();
