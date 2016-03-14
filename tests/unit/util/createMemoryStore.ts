import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import createMemoryStore from 'src/util/createMemoryStore';

registerSuite({
	name: 'util/createMemoryStore',
	'creation': {
		'no options'() {
			const store = createMemoryStore();
			assert.strictEqual(store.idProperty, 'id');
			assert.isFunction(store.add);
			assert.isFunction(store.get);
			assert.isFunction(store.put);
			assert.isFunction(store.delete);
			assert.isFunction(store.fromArray);
		},
		'options idProperty'() {
			const store = createMemoryStore({
				idProperty: 'foo'
			});
			assert.strictEqual(store.idProperty, 'foo');
		// },
		// 'options data'() {
		// 	const store = createMemoryStore({
		// 		data: [
		// 			{ id: 1, foo: 'bar' },
		// 			{ id: 2, foo: 'baz' },
		// 			{ id: 3, foo: 'qat' },
		// 			{ id: 4, foo: 'qux' }
		// 		]
		// 	});
		// 	return store.get(3).then((item) => {
		// 		assert.deepEqual(item, { id: 3, foo: 'qat' });
		// 	});
		}
	},
	'add()': {
		'resolves to value'() {
			const store = createMemoryStore();
			return store.add({
				id: 1,
				foo: 'bar'
			}).then((value) => {
				assert.deepEqual(value, { id: 1, foo: 'bar' });
			});
		},
		'can be chained'() {
			const store = createMemoryStore();
			return store
				.add({ id: 1, foo: 'bar' })
				.add({ id: 2, foo: 'baz' })
				.then((result) => {
					assert.deepEqual(result, { id: 2, foo: 'baz' });
					return store.get(1).then((item) => {
						assert.deepEqual(item, { id: 1, foo: 'bar' });
					});
				});
		},
		'add duplicate rejects'() {
			const store = createMemoryStore();
			return store
				.add({ id: 1, foo: 'bar' })
				.add({ id: 1, foo: 'baz' })
				.catch((error) => {
					assert.instanceOf(error, Error);
					assert.include(error.message, 'Duplicate id');
				});
		}
	}
});
