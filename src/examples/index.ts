import createWidget from 'src/createWidget';
import createButton from 'src/createButton';
import createTextInput from 'src/createTextInput';
import createList, { ListState } from 'src/createList';
import { attach } from 'src/util/vdom';

/**
 * Header widget
 */
createWidget({
	state: {
		id: 'foo',
		label: 'dojo-widget Examples'
	},
	tagName: 'h1'
});

/**
 * Removes item from list when clicked
 */
const buttonRemove = createButton({
	state: {
		id: 'remove',
		label: 'Remove',
		name: 'remove'
	}
});

/**
 * Text input for labels for items added to list
 */
const textInput = createTextInput({
	state: {
		name: 'first-name',
		id: 'fist-name',
		value: 'qat'
	}
});

/**
 * Button adds item to list
 */
const buttonAdd = createButton({
	state: {
		id: 'add',
		label: 'Add',
		name: 'add'
	}
});

/**
 * List items to populate list widget
 */
const listItems = [
	{ id: 1, label: 'foo' },
	{ id: 2, label: 'bar' },
	{ id: 3, label: 'baz' },
	{ id: 4, label: 'qux' },
	{ id: 5, label: 'norf' }
];

/**
 * ID counter for items
 */
let id = 5;

/**
 * State for List Items
 */
const listState: ListState = {
	id: 'list',
	items: listItems
};

/**
 * List item widget
 */
const list = createList({
	state: listState
});

/* On click handler for remove button */
buttonRemove.on('click', (e: MouseEvent) => {
	listItems.pop();
	list.setState({
		items: listItems
	});
	return true;
});

/* On click handler for add button */
buttonAdd.on('click', (e: MouseEvent) => {
	listItems.push({ id: ++id, label: textInput.state.value });
	list.setState({
		items: listItems
	});
	return true;
});

console.log('buttonRemove', buttonRemove);
console.log('buttonAdd', buttonAdd);
console.log('textInput', textInput);
console.log('list', list);

/* Attach projector to DOM */
attach();
