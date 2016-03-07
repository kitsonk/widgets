import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import createEvented from 'src/mixins/createEvented';

registerSuite({
	name: 'mixins/createEvented',
	creation() {
		const evented = createEvented();
		assert(evented);
		assert.isFunction(evented.on);
		assert.isFunction(evented.emit);
	},
	'listeners at creation'() {
		const eventStack: string[] = [];
		const evented = createEvented({
			listeners: {
				'foo'(event) {
					eventStack.push(event.type);
				},
				'bar'(event) {
					eventStack.push(event.type);
				}
			}
		});

		evented.emit({ type: 'foo' });
		evented.emit({ type: 'bar' });
		evented.emit({ type: 'baz' });

		evented.destroy();

		evented.emit({ type: 'foo' });
		evented.emit({ type: 'bar' });
		evented.emit({ type: 'baz' });

		assert.deepEqual(eventStack, [ 'foo', 'bar' ]);
	}
});
