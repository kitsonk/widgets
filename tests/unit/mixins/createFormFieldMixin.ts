import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import createFormFieldMixin, { FormMixinFactory } from 'src/mixins/createFormFieldMixin';

registerSuite({
	name: 'mixins/createFormFieldMixin',
	construction() {
		const formfield = createFormFieldMixin({
			type: 'foo',
			state: {
				name: 'foo',
				value: 2,
				disabled: false
			}
		});
		assert.strictEqual(formfield.value, 2);
		assert.strictEqual(formfield.state.value, 2);
		assert.strictEqual(formfield.type, 'foo');
		assert.strictEqual(formfield.state.name, 'foo');
		assert.isFalse(formfield.state.disabled);
	},
	'.value'() {
		const value = { foo: 'foo' };
		const formfield = createFormFieldMixin({
			state: { value }
		});

		assert.strictEqual(formfield.value, formfield.state.value);
		formfield.setState({ value: { foo: 'bar' } });
		assert.deepEqual(formfield.value, { foo: 'bar' });
	},
	'.value - setState'() {
		let count = 0;
		const createAfterFormFieldMixin: FormMixinFactory = createFormFieldMixin
			.after('setState', () => count++);
		const formfield = createAfterFormFieldMixin<any>();
		formfield.value = 'foo';
		assert.strictEqual(count, 1);
		formfield.value = 'foo';
		assert.strictEqual(count, 1);
	},
	'getNodeAttributes()'() {
		const formfield = createFormFieldMixin({
			type: 'foo',
			state: {
				value: 'bar',
				name: 'baz'
			}
		});

		assert.deepEqual(formfield.getNodeAttributes(), { type: 'foo', value: 'bar', name: 'baz', classes: {}, styles: {} });

		formfield.setState({ disabled: true });

		assert.deepEqual(formfield.getNodeAttributes(), { type: 'foo', value: 'bar', name: 'baz', disabled: 'disabled', classes: {}, styles: {} });

		formfield.setState({ disabled: false });

		assert.deepEqual(formfield.getNodeAttributes(), { type: 'foo', value: 'bar', name: 'baz', classes: {}, styles: {} });
	}
});
