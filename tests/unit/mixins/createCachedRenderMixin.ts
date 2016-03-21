import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import createCachedRenderMixin from 'src/mixins/createCachedRenderMixin';
import { before } from 'dojo-core/aspect';
import { createProjector } from 'maquette/maquette';
import { attach } from 'src/util/vdom';

registerSuite({
	name: 'mixins/createCachedRenderMixin',
	api() {
		const cachedRender = createCachedRenderMixin();
		assert(cachedRender);
		assert.isFunction(cachedRender.getNodeAttributes);
		assert.isFunction(cachedRender.getChildrenNodes);
		assert.isFunction(cachedRender.invalidate);
	},
	'getNodeAttributes()'() {
		let count = 0;
		const click = function click() {
			count++;
		};
		const cachedRender = createCachedRenderMixin({
			listeners: { click },
			state: { id: 'foo' }
		});

		let nodeAttributes = cachedRender.getNodeAttributes();
		assert.strictEqual(nodeAttributes.id, 'foo');
		assert.isFunction(nodeAttributes.onclick);
		nodeAttributes.onclick();
		assert.strictEqual(count, 1);
		assert.strictEqual(Object.keys(nodeAttributes).length, 2);

		nodeAttributes = cachedRender.getNodeAttributes({
			name: 'foo',
			id: 'bar'
		});

		assert.strictEqual(nodeAttributes.name, 'foo');
		assert.strictEqual(nodeAttributes.id, 'bar');
		assert.strictEqual(Object.keys(nodeAttributes).length, 3);
	},
	'getChildrenNodes()'() {
		const cachedRender = createCachedRenderMixin();
		assert.isUndefined(cachedRender.getChildrenNodes());
		cachedRender.setState({ label: 'foo' });
		assert.deepEqual(cachedRender.getChildrenNodes(), [ 'foo' ]);
	},
	'render()/invalidate()'() {
		const cachedRender = createCachedRenderMixin({
			state: { id: 'foo', label: 'foo' }
		});
		cachedRender.invalidate();
		cachedRender.invalidate();
		const result1 = cachedRender.render();
		const result2 = cachedRender.render();
		cachedRender.setState({});
		const result3 = cachedRender.render();
		const result4 = cachedRender.render();
		assert.strictEqual(result1, result2);
		assert.strictEqual(result3, result4);
		assert.notStrictEqual(result1, result3);
		assert.notStrictEqual(result2, result4);
		assert.deepEqual(result1, result3);
		assert.deepEqual(result2, result4);
		assert.deepEqual(result1, {vnodeSelector: 'div',
			properties: { id: 'foo' },
			children: undefined,
			text: 'foo',
			domNode: null
		});
	},
	'invalidate invalidates parent projector'() {
		let count = 0;
		const projector = createProjector({});
		before(projector, 'scheduleRender', () => {
			count++;
		});
		attach(projector);
		const cachedRender = createCachedRenderMixin();
		cachedRender.parent = projector;
		cachedRender.invalidate();
		assert.strictEqual(count, 0);
		cachedRender.render();
		cachedRender.invalidate();
		assert.strictEqual(count, 1);
	},
	'invalidate invalidates parent widget'() {
		let count = 0;
		const createParent = createCachedRenderMixin.before('invalidate', () => {
			count++;
		});
		const parent = createParent();
		const cachedRender = createCachedRenderMixin();
		cachedRender.parent = <any> parent; /* trick typescript, becuase this isn't a real parent */
		cachedRender.invalidate();
		assert.strictEqual(count, 0);
		cachedRender.render();
		cachedRender.invalidate();
		assert.strictEqual(count, 1);
	}
});
