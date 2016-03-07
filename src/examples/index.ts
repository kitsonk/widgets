import createWidget from 'src/createWidget';
import createButton from 'src/createButton';
import createTextInput from 'src/createTextInput';
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

const firstName = createTextInput({
	state: {
		name: 'first-name',
		id: 'fist-name',
		value: 'hello'
	}
});

button.on('click', (e: MouseEvent) => {
	console.log(firstName.value);
	return true;
});

attach();
