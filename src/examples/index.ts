import createMemoryStore from 'src/util/createMemoryStore';
import createWidget from 'src/createWidget';
import createButton from 'src/createButton';
import createTextInput from 'src/createTextInput';
import createList from 'src/createList';
import { attach } from 'src/util/vdom';

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
 * A memory store which handles the widget states
 */
const widgetStore = createMemoryStore({
	data: [
		{ id: 'foo', label: 'dojo-widget Examples'},
		{ id: 'remove', label: 'Remove', name: 'remove' },
		{ id: 'first-name', name: 'first-name', value: 'qat' },
		{ id: 'add', label: 'Add', name: 'add' },
		{ id: 'list', items: listItems }
	]
});

/**
 * Header widget
 */
createWidget({
	id: 'foo',
	stateFrom: widgetStore,
	tagName: 'h1'
});

/**
 * Removes item from list when clicked
 */
const buttonRemove = createButton({
	id: 'remove',
	stateFrom: widgetStore
});

/**
 * Text input for labels for items added to list
 */
const textInput = createTextInput({
	id: 'first-name',
	stateFrom: widgetStore
});

/**
 * Button adds item to list
 */
const buttonAdd = createButton({
	id: 'add',
	stateFrom: widgetStore
});

/**
 * ID counter for items
 */
let id = 5;

/**
 * List item widget
 */
const list = createList({
	id: 'list',
	stateFrom: widgetStore
});

/* On click handler for remove button */
buttonRemove.on('click', (e: MouseEvent) => {
	listItems.pop();
	widgetStore.patch({ id: 'list', items: listItems });
	return true;
});

/* On click handler for add button */
buttonAdd.on('click', (e: MouseEvent) => {
	listItems.push({ id: ++id, label: textInput.state.value });
	widgetStore.patch({ id: 'list', items: listItems });
	return true;
});

console.log('buttonRemove', buttonRemove);
console.log('buttonAdd', buttonAdd);
console.log('textInput', textInput);
console.log('list', list);

/* Attach projector to DOM */
attach();
