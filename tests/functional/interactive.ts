import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';

registerSuite({
	name: 'interactive',

	setup() {
		return this.remote
			.get((<any> require).toUrl('./widgets.html'))
			.setFindTimeout(5000)
			.findByCssSelector('body.loaded');
	},

	'Button'() {
		return this.remote
			.findById('button1')
				.click()
				.end()
			.findById('output')
				.getVisibleText()
				.then((text: string) => {
					const output = JSON.parse(text);
					assert.deepEqual(output, {
						id: 'button1',
						label: 'button1'
					});
				});
	},

	'TextInput'() {
		return this.remote
			.findById('textinput1')
				.click()
				.type('bar')
				.end()
			.findById('output')
				.getVisibleText()
				.then((text: string) => {
					const output = JSON.parse(text);
					assert.deepEqual(output, {
						id: 'textinput1',
						name: 'textinput1',
						value: 'bar'
					});
				});
	}
});
