import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import projector from 'src/projector';
import { h } from 'maquette/maquette';
import createRenderable from 'src/mixins/createRenderable';

registerSuite({
	name: 'projector',
	setup() {
		projector.clear();
	},
	basic() {
		const dfd = this.async();
		const childNodeLength = document.body.childNodes.length;
		let nodeText = 'foo';
		const renderable = createRenderable({
			render() {
				return h('h2', [ nodeText ] );
			}
		});
		projector.append(renderable);
		const attachHandle = projector.attach();
		assert.strictEqual(document.body.childNodes.length, childNodeLength + 1, 'child should have been added');
		assert.strictEqual((<HTMLElement> document.body.lastChild).innerHTML, nodeText);
		assert.strictEqual((<HTMLElement> document.body.lastChild).tagName.toLowerCase(), 'h2');
		nodeText = 'bar';
		projector.invalidate();
		setTimeout(() => {
			assert.strictEqual((<HTMLElement> document.body.lastChild).innerHTML, nodeText);
			renderable.destroy().then(() => {
				projector.invalidate();
				setTimeout(dfd.callback(() => {
					assert.strictEqual(document.body.childNodes.length, childNodeLength, 'child should have been removed');
					attachHandle.destroy();
				}), 150);
			});
		}, 150);
	}
});
