import createMemoryStore from 'src/util/createMemoryStore';
import createWidget from 'src/createWidget';
import createButton from 'src/createButton';
import createTextInput from 'src/createTextInput';
import createList from 'src/createList';
import createContainer from 'src/createContainer';
import { Renderable } from 'src/mixins/createRenderable';
import { attach, append } from 'src/util/vdom';

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
		{ id: 'remove', label: 'Remove', name: 'remove', disabled: true },
		{ id: 'first-name', name: 'first-name', value: 'qat' },
		{ id: 'add', label: 'Add', name: 'add' },
		{ id: 'list', items: listItems },
		{ id: 'container' },
		{ id: 'bar', label: 'I am contained' },
		{ id: 'change-text', label: 'Change' }
	]
});

const widgets: Renderable[] = [];

/**
 * Header widget
 */
widgets.push(createWidget({
	id: 'foo',
	stateFrom: widgetStore,
	tagName: 'h1'
}));

/**
 * Removes item from list when clicked
 */
const buttonRemove = createButton({
	id: 'remove',
	stateFrom: widgetStore
});

widgets.push(buttonRemove);

/**
 * Text input for labels for items added to list
 */
const textInput = createTextInput({
	id: 'first-name',
	stateFrom: widgetStore
});

widgets.push(textInput);

/**
 * Button adds item to list
 */
const buttonAdd = createButton({
	id: 'add',
	stateFrom: widgetStore
});

widgets.push(buttonAdd);

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

widgets.push(list);

const container = createContainer({
	id: 'container',
	stateFrom: widgetStore
});

container.append(createWidget({
	id: 'bar',
	stateFrom: widgetStore
}));

container.append(createButton({
	id: 'change-text',
	stateFrom: widgetStore,
	listeners: {
		click() {
			widgetStore.patch({ id: 'bar', label: 'And I changed!' });
		}
	}
}));

widgets.push(container);

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

/* Append widgets to projector */
append(widgets);

/* Attach projector to DOM */
attach();
