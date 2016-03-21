import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import createContainerMixin from 'src/mixins/createContainerMixin';
import createRenderable from 'src/mixins/createRenderable';

registerSuite({
	name: 'mixins/createContainerMixin',
	api() {
		const container = createContainerMixin();
		assert.isFunction(container.getChildrenNodes);
		assert.isFunction(container.append);
		assert.isFunction(container.insert);
		assert.strictEqual(container.children.size, 0);
	},
	'children at startup'() {
		const container = createContainerMixin({
			children: [
				createRenderable({ tagName: 'foo' }),
				createRenderable({ tagName: 'bar' })
			]
		});
		assert.strictEqual(container.children.size, 2);
		assert.strictEqual(container.children.get(0).tagName, 'foo');
		assert.strictEqual(container.children.get(0).parent, container);
		assert.strictEqual(container.children.get(1).tagName, 'bar');
		assert.strictEqual(container.children.get(1).parent, container);
	},
	'append()'() {
		const container = createContainerMixin();
		container.append(createRenderable({
			tagName: 'foo'
		}));
		container.append(createRenderable({
			tagName: 'bar'
		}));
		assert.strictEqual(container.children.size, 2);
		assert.strictEqual(container.children.get(0).tagName, 'foo');
		assert.strictEqual(container.children.get(0).parent, container);
		assert.strictEqual(container.children.get(1).tagName, 'bar');
		assert.strictEqual(container.children.get(1).parent, container);
	},
	'insert()'() {
		const container = createContainerMixin();
		container.insert(createRenderable({ tagName: 'foo' }), 'first');
		container.insert(createRenderable({ tagName: 'bar' }), 'first');
		assert.strictEqual(container.children.get(0).tagName, 'bar');
		assert.strictEqual(container.children.get(0).parent, container);
		assert.strictEqual(container.children.get(1).tagName, 'foo');
		assert.strictEqual(container.children.get(1).parent, container);
	}
});
