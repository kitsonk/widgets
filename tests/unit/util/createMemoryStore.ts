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
		},
		'options data'() {
			const store = createMemoryStore({
				data: [
					{ id: 1, foo: 'bar' },
					{ id: 2, foo: 'baz' },
					{ id: 3, foo: 'qat' },
					{ id: 4, foo: 'qux' }
				]
			});
			return store.get(3).then((item) => {
				assert.deepEqual(item, { id: 3, foo: 'qat' });
			});
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
	},
	'fromArray()'() {
		const store = createMemoryStore();
		return store.fromArray([
				{ id: 1, foo: 'bar' },
				{ id: 2, foo: 'baz' },
				{ id: 3, foo: 'qat' },
				{ id: 4, foo: 'qux' }
			])
			.then(() => {
				return store.get(2).then((item) => {
					assert.deepEqual(item, { id: 2, foo: 'baz' });
					return store.get(4).then((item) => {
						assert.deepEqual(item, { id: 4, foo: 'qux' });
					});
				});
			});
	},
	'observer()': {
		'subscribe'() {
			const dfd = this.async();
			const store = createMemoryStore<{ id: number; foo: string; }>();
			store
				.add({ id: 1, foo: 'bar' })
				.then(() => {
					const subscription = store.observe(1).subscribe(dfd.callback((item: { id: number; foo: string; }) => {
						assert.deepEqual(item, { id: 1, foo: 'bar' });
						subscription.unsubscribe();
					}));
				});
		},
		'receive updates'() {
			const dfd = this.async();
			const store = createMemoryStore({
				data: [
					{ id: 1, foo: 'bar' }
				]
			});

			let count = 0;

			const subscription = store.observe(1).subscribe((item) => {
				count++;
				if (count === 1) {
					assert.deepEqual(item, { id: 1, foo: 'bar' });
				}
				else if (count === 2) {
					assert.deepEqual(item, { id: 1, foo: 'baz' });
					subscription.unsubscribe();
					dfd.resolve();
				}
				else {
					dfd.reject(new Error('Wrong number of calls: ' + count));
				}
			});

			store.get(1).then((item) => {
				item.foo = 'baz';
				store.put(item);
			});
		}
	}
});
