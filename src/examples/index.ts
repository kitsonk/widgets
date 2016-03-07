import createWidget from 'src/createWidget';
import createButton, { ButtonState } from 'src/createButton';
import { attach } from 'src/util/vdom';

createWidget({
	state: {
		id: 'foo',
		label: 'Hello World!'
	},
	tagName: 'h1'
});

const button = createButton<ButtonState>({
	state: {
		id: 'bar',
		label: 'A brave new world...',
		name: 'foo'
	}
});

button.on('click', (e: MouseEvent) => {
	button.setState({
		label: 'I was clicked!'
	});
	return true;
});

attach();
