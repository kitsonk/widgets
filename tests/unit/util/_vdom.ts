import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import { attach, append, insert, clear, setRoot, scheduleRender } from 'src/util/_vdom';
import { createProjector, h } from 'maquette/maquette';
import createRenderable from 'src/mixins/createRenderable';

registerSuite({
	name: 'util/vdom',
	'setup'() {
		clear();
	},
	'default lifecycle'() {
		const dfd = this.async();
		const childNodeLength = document.body.childNodes.length;
		let nodeText = 'foo';
		const renderable = createRenderable({
			render() {
				return h('h2', [ nodeText ] );
			}
		});
		append(renderable);
		const attachHandle = attach();
		assert.strictEqual(document.body.childNodes.length, childNodeLength + 1, 'child should have been added');
		assert.strictEqual((<HTMLElement> document.body.lastChild).innerHTML, nodeText);
		assert.strictEqual((<HTMLElement> document.body.lastChild).tagName.toLowerCase(), 'h2');
		nodeText = 'bar';
		scheduleRender();
		setTimeout(() => {
			assert.strictEqual((<HTMLElement> document.body.lastChild).innerHTML, nodeText);
			renderable.destroy().then(() => {
				scheduleRender();
				setTimeout(dfd.callback(() => {
					assert.strictEqual(document.body.childNodes.length, childNodeLength, 'child should have been removed');
					attachHandle.destroy();
				}), 150);
			});
		}, 150);
	},
	'lifecycle'() {
		const dfd = this.async();
		const div = document.createElement('div');
		document.body.appendChild(div);
		const projector = createProjector({});
		setRoot(div, projector);
		let nodeText = 'bar';
		const renderable = createRenderable({
			render() {
				return h('h1', [ nodeText ]);
			}
		});
		const addHandle = append(renderable, projector);
		assert.strictEqual(div.childNodes.length, 0, 'there should be no children');
		const attachHandle = attach(projector);
		assert.strictEqual(div.childNodes.length, 1, 'a child should be added');
		assert.strictEqual((<HTMLElement> div.firstChild).tagName.toLowerCase(), 'h1');
		assert.strictEqual((<HTMLElement> div.firstChild).innerHTML, nodeText);
		nodeText = 'foo';
		scheduleRender(projector);
		setTimeout(() => {
			assert.strictEqual((<HTMLElement> div.firstChild).innerHTML, nodeText);
			addHandle.destroy();
			scheduleRender(projector);
			setTimeout(dfd.callback(() => {
				assert.strictEqual(div.childNodes.length, 0, 'the node should be removed');
				attachHandle.destroy();
			}), 150);
		}, 150);
	},
	'reattach'() {
		const projector = createProjector({});
		const div = document.createElement('div');
		setRoot(div, projector);
		const handle = attach(projector);
		assert.strictEqual(handle, attach(projector), 'same handle should be returned');
		handle.destroy();
	},
	'setRoot throws when already attached'() {
		const projector = createProjector({});
		const div = document.createElement('div');
		setRoot(div, projector);
		const handle = attach(projector);
		assert.throws(() => {
			setRoot(document.body, projector);
		}, Error, 'already attached');
		handle.destroy();
	},
	'append()'() {
		const dfd = this.async();
		const projector = createProjector({});
		const div = document.createElement('div');
		document.body.appendChild(div);
		setRoot(div, projector);
		const handle = append([
			createRenderable({ render() { return h('foo', [ 'foo' ]); } }),
			createRenderable({ render() { return h('bar', [ 'bar' ]); } })
		], projector);
		const attachHandle = attach(projector);
		setTimeout(() => {
			assert.strictEqual(div.childNodes.length, 2);
			assert.strictEqual((<HTMLElement> div.firstChild).innerHTML, 'foo');
			assert.strictEqual((<HTMLElement> div.lastChild).innerHTML, 'bar');
			handle.destroy();
			scheduleRender();
			setTimeout(dfd.callback(() => {
				handle.destroy();
				assert.strictEqual(div.childNodes.length, 0);
				attachHandle.destroy();
			}), 150);
		}, 150);
	},
	'insert()'() {
		const dfd = this.async();
		const projector = createProjector({});
		const div = document.createElement('div');
		document.body.appendChild(div);
		setRoot(div, projector);
		const handle = insert(createRenderable({ render() { return h('foo', [ 'foo' ]); } }), 'first', undefined, projector);
		const attachHandle = attach(projector);
		setTimeout(() => {
			assert.strictEqual(div.childNodes.length, 1);
			assert.strictEqual((<HTMLElement> div.firstChild).innerHTML, 'foo');
			handle.destroy();
			scheduleRender();
			setTimeout(dfd.callback(() => {
				handle.destroy();
				assert.strictEqual(div.childNodes.length, 0);
				attachHandle.destroy();
			}), 150);
		}, 150);
	}
});
