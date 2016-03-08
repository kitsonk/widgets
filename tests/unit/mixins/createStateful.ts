import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import createStateful, { StateChangeEvent } from 'src/mixins/createStateful';

let _hasStrictModeCache: boolean;

/**
 * Detects if the current runtime environment fully supports
 * strict mode (IE9 does not).
 */
function hasStrictMode(): boolean {
	if (_hasStrictModeCache !== undefined) {
		return _hasStrictModeCache;
	}
	try {
		const f = new Function(`return function f() {
			'use strict';
			var a = 021;
			var b = function (eval) {}
			var c = function (arguments) {}
			function d(foo, foo) {}
			function e(eval, arguments) {}
			function eval() {}
			function arguments() {}
			function interface(){}
			with (x) { }
			try { eval++; } catch (arguments) {}
			return { x: 1, y: 2, x: 1 }
		}`);
		f();
	}
	catch (err) {
		return _hasStrictModeCache = true;
	}
	return _hasStrictModeCache = false;
}

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
		const stateful = createStateful({
			state: {
				foo: 'foo'
			}
		});

		if (hasStrictMode()) {
			assert.throws(() => {
				stateful.state = { foo: 'bar' };
			}, TypeError);
		}
		else {
			assert.deepEqual(stateful.state, { foo: 'foo' });
			stateful.state = { foo: 'bar' };
			assert.deepEqual(stateful.state, { foo: 'foo' });
		}
	},
	'state on creation'() {
		const stateful = createStateful({
			state: { foo: 'bar' }
		});

		assert.strictEqual(stateful.state.foo, 'bar');
	}
});
