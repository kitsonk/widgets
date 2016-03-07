import createWidget from 'src/createWidget';
import createButton from 'src/createButton';
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

button.on('click', (e: MouseEvent) => {
	button.setState({
		label: 'I was clicked!'
	});
	return true;
});

attach();
