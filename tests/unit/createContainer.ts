import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import createContainer from 'src/createContainer';

registerSuite({
	name: 'createContainer',
	'construction'() {
		const container = createContainer();
		assert(container);
		assert.isFunction(container.destroy);
		assert.isFunction(container.emit);
		assert.isFunction(container.getChildrenNodes);
		assert.isFunction(container.getNodeAttributes);
		assert.isFunction(container.insert);
		assert.isFunction(container.invalidate);
		assert.isFunction(container.observeState);
		assert.isFunction(container.on);
		assert.isFunction(container.own);
		assert.isFunction(container.render);
		assert.isFunction(container.setState);
		assert.isObject(container.children);
		assert.isObject(container.listeners);
	},
	'render()'() {
		const container = createContainer();
		container.append(createContainer());
		assert.deepEqual(container.render(), {
			vnodeSelector: 'dojo-container',
			properties: {},
			children: [
				{
					vnodeSelector: 'dojo-container',
					properties: {},
					children: [],
					text: undefined,
					domNode: null
				}
			],
			text: undefined,
			domNode: null
		});
	}
});
