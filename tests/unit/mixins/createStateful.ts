import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import createStateful, { StateChangeEvent } from 'src/mixins/createStateful';

registerSuite({
	name: 'mixins/createStateful',
	creation() {
		const state = { foo: 'bar' };
		const stateful = createStateful();
		assert(stateful);
		assert.isObject(stateful.state, 'state should be an object');
		assert.isFunction(stateful.setState, 'setState should be a function');
		assert.deepEqual(stateful.setState(state), state, 'return from setState should be deep equal');
		assert.notStrictEqual(stateful.state, state, 'state should be deep assigned');
		assert.deepEqual(stateful.state, state, 'state should deeply equal state');
	},
	'statechange event'() {
		const dfd = this.async();

		const state = { foo: 'bar' };

		const stateful = createStateful();
		const handle = stateful.on('statechange', dfd.callback((event: StateChangeEvent<any>) => {
			assert.deepEqual(event.type, 'statechange');
			assert.deepEqual(event.state, state);
			assert.notStrictEqual(event.state, state);
			assert.strictEqual(event.state, stateful.state);
		}));

		stateful.setState(state);

		handle.destroy();
	},
	'state read only'() {
		const stateful = createStateful();

		assert.throws(() => {
			stateful.state = { foo: 'bar' };
		}, TypeError);
	},
	'state on creation'() {
		const stateful = createStateful({
			state: { foo: 'bar' }
		});

		assert.strictEqual(stateful.state.foo, 'bar');
	}
});
