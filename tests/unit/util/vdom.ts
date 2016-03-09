import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import { attach, append, clear, setRoot, scheduleRender } from 'src/util/vdom';
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
		const attachHandle = attach();
		assert.strictEqual(document.body.childNodes.length, childNodeLength + 1);
		assert.strictEqual((<HTMLElement> document.body.lastChild).innerHTML, nodeText);
		assert.strictEqual((<HTMLElement> document.body.lastChild).tagName.toLowerCase(), 'h2');
		nodeText = 'bar';
		scheduleRender();
		setTimeout(() => {
			assert.strictEqual((<HTMLElement> document.body.lastChild).innerHTML, nodeText);
			renderable.destroy().then(() => {
				scheduleRender();
				setTimeout(dfd.callback(() => {
					assert.strictEqual(document.body.childNodes.length, childNodeLength);
					attachHandle.destroy();
				}), 100);
			});
		}, 100);
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
		assert.strictEqual(div.childNodes.length, 0);
		const attachHandle = attach(projector);
		assert.strictEqual(div.childNodes.length, 1);
		assert.strictEqual((<HTMLElement> div.firstChild).tagName.toLowerCase(), 'h1');
		assert.strictEqual((<HTMLElement> div.firstChild).innerHTML, nodeText);
		nodeText = 'foo';
		scheduleRender(projector);
		setTimeout(() => {
			assert.strictEqual((<HTMLElement> div.firstChild).innerHTML, nodeText);
			addHandle.destroy();
			scheduleRender(projector);
			setTimeout(dfd.callback(() => {
				assert.strictEqual(div.childNodes.length, 0);
				attachHandle.destroy();
			}), 100);
		}, 100);
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
	}
});
