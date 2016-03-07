import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import createWidget from 'src/createWidget';

registerSuite({
	name: 'createWidget',
	'basic'() {
		assert(createWidget);
		const widget = createWidget();
		assert(widget);
	},
	'destroy()'() {
		const widget = createWidget();
		return widget.destroy();
	},
	'getNodeAttributes()'() {
		const widget1 = createWidget({
			listeners: {
				'click'() {}
			},
			state: {
				id: 'foo'
			},
			tagName: 'h1'
		});

		const nodeAttributes1 = widget1.getNodeAttributes();
		assert.strictEqual(Object.keys(nodeAttributes1).length, 2, 'should have two keys only');
		assert.strictEqual(nodeAttributes1.id, 'foo');
		assert.isFunction(nodeAttributes1.onclick, 'onclick is a function');

		const widget2 = createWidget({
			listeners: {
				'click'() {}
			}
		});
		const nodeAttributes2 = widget2.getNodeAttributes();
		assert.strictEqual(Object.keys(nodeAttributes2).length, 1, 'should have only one key');
		assert.isFunction(nodeAttributes1.onclick, 'onclick is a function');

		const widget3 = createWidget({
			state: {
				id: 'bar'
			}
		});
		const nodeAttributes3 = widget3.getNodeAttributes({ id: 'foo', onclick() {} });
		assert.strictEqual(Object.keys(nodeAttributes3).length, 2, 'should have two keys only');
		assert.strictEqual(nodeAttributes3.id, 'foo');
		assert.isFunction(nodeAttributes3.onclick, 'onclick is a function');
	}
});