import { OrderedMap, Map } from 'immutable/immutable';
import { Observable, Observer } from 'rxjs/Rx';
import { assign } from 'dojo-core/lang';
import Promise, { isThenable } from 'dojo-core/Promise';
import WeakMap from 'dojo-core/WeakMap';
import compose, { ComposeFactory } from 'dojo-compose/compose';

export type StoreIndex = number | string;

export interface MemoryStorePragma {
	id?: StoreIndex;
	replace?: boolean;
}

export interface MemoryStorePromise<T> extends Promise<T>, MemoryStore<T> { }

export interface MemoryStoreOptions<T extends Object> {
	data?: T[];
	idProperty?: string | symbol;
}

export interface MemoryStore<T extends Object> {
	/**
	 * The property that determines the ID of the object (defaults to `id`)
	 */
	idProperty: string | symbol;

	/**
	 * Retrieve an object from the store based on the object's ID
	 * @param id The ID of the object to retrieve
	 */
	get(id: StoreIndex): MemoryStorePromise<T>;

	/**
	 * Observe an object, any subsequent changes to the object can also be observed via the observable
	 * interface that is returned.  If the object is not present in the store, the observation will be
	 * immediatly completed.  If the object is deleted from the store, the observation will be completed
	 * @param id The ID of the object to observe
	 */
	observe(id: StoreIndex): Observable<T>;

	/**
	 * Put an item in the object store.
	 * @param item The item to put
	 * @param options The pragma to use when putting the object
	 */
	put(item: T, options?: MemoryStorePragma): MemoryStorePromise<T>;

	/**
	 * Add an item to the object store.
	 * @param add The item to add
	 * @param options The pragma to use when adding the object
	 */
	add(item: T, options?: MemoryStorePragma): MemoryStorePromise<T>;

	/**
	 *
	 */
	patch(partial: any, options?: MemoryStorePragma): MemoryStorePromise<T>;

	/**
	 * Remove an object from the store.
	 * @param id The ID of the object to remove
	 * @param item The object to remove
	 */
	delete(id: StoreIndex): MemoryStorePromise<boolean>;
	delete(item: T): MemoryStorePromise<boolean>;

	/**
	 * Set the stores objects to an array
	 */
	fromArray(items: T[]): MemoryStorePromise<void>;
}

const dataWeakMap = new WeakMap<MemoryStore<Object>, OrderedMap<StoreIndex, Object>>();
const observerWeakMap = new WeakMap<MemoryStore<Object>, Map<StoreIndex, Observer<Object>[]>>();

export interface MemoryStoreFactory extends ComposeFactory<MemoryStore<Object>, MemoryStoreOptions<Object>> {
	<T extends Object>(options?: MemoryStoreOptions<T>): MemoryStore<T>;
}

const storeMethods = [ 'get', 'put', 'add', 'patch', 'delete', 'fromArray' ];

function wrapResult<R>(store: MemoryStore<Object>, result: R): MemoryStorePromise<R> {
	const p = (isThenable(result) ? result : Promise.resolve(result)) as MemoryStorePromise<R>;
	storeMethods.forEach((method) => {
		(<any> p)[method] = (...args: any[]) => {
			return p.then(() => {
				return (<any> store)[method].apply(store, args);
			});
		};
	});
	return p;
}

function wrapError(store: MemoryStore<Object>, result: Error): MemoryStorePromise<Object> {
	const p = (isThenable(result) ? result : Promise.reject(result)) as MemoryStorePromise<Object>;
	storeMethods.forEach((method) => {
		(<any> p)[method] = (...args: any[]) => {
			return p.then(() => {
				return (<any> store)[method].apply(store, args);
			});
		};
	});
	return p;
}

const createMemoryStore: MemoryStoreFactory = compose({
	idProperty: 'id',

	get(id: StoreIndex): MemoryStorePromise<Object> {
		const store: MemoryStore<Object> = this;
		const data = dataWeakMap.get(store);
		return wrapResult(store, data && data.get(String(id)));
	},

	observe(id: StoreIndex): Observable<Object> {
		const store: MemoryStore<Object> = this;
		return new Observable(function subscribe(observer: Observer<Object>) {
			store.get(String(id)).then((item: Object) => {
				if (item) {
					observer.next(item);
					const observers = observerWeakMap.get(store);
					const observerArray: Observer<Object>[] = observers && observers.has(String(id)) ? observers.get(String(id)) : [];
					observerArray.push(observer);
					observerWeakMap.set(store, (observers ? observers : Map<StoreIndex, Observer<Object>[]>()).set(String(id), observerArray));
				}
				else {
					observer.complete();
				}
			}, (error: Error) => {
				console.log('reject');
				observer.error(error);
			});
		});
	},

	put(item: { [property: string]: number | string; }, options?: MemoryStorePragma): MemoryStorePromise<Object> {
		const store: MemoryStore<Object> = this;
		const data = dataWeakMap.get(store);
		const idProperty = store.idProperty;
		const id =  options && 'id' in options ? options.id :
			idProperty in item ? item[idProperty] :
			data ? data.size : 0;
		if (options && options.replace === false && data && data.has(id)) {
			return wrapError(store, Error(`Duplicate ID "${id}" when pragma "replace" is false`));
		}
		item[idProperty] = id;
		dataWeakMap.set(store, (data ? data : OrderedMap<StoreIndex, Object>()).set(String(id), item));

		const observers = observerWeakMap.get(store);
		if (observers && observers.has(String(id))) {
			observers.get(String(id)).forEach((observer) => observer.next(item));
		}
		return wrapResult(store, item);
	},

	add(item: Object, options?: MemoryStorePragma): MemoryStorePromise<Object> {
		return this.put(item, assign(options ? options : {}, { replace: false }));
	},

	patch(partial: { [property: string]: number | string; }, options?: MemoryStorePragma): MemoryStorePromise<Object> {
		const store: MemoryStore<Object> = this;
		const idProperty = store.idProperty;
		const id = options && 'id' in options ? options.id : partial[idProperty];
		if (!id) {
			return wrapError(store, new Error(`Object ID must either be passed in "partial.${idProperty}" or "options.id"`));
		}
		return wrapResult(store, store.get(id).then((item) => {
			if (item) {
				options = options || {};
				options.id = id;
				return store.put(assign(item, partial), options);
			}
			else {
				return wrapError(store, new Error(`Object with ID "${id}" not found, unable to patch.`));
			}
		}));
	},

	delete(item: StoreIndex | { [property: string]: number | string; }): MemoryStorePromise<boolean> {
		const store: MemoryStore<Object> = this;

		/**
		 * Complete any observers associated with this items id
		 */
		function completeObservable(id: StoreIndex) {
			const observers = observerWeakMap.get(store);
			if (observers && observers.has(String(id))) {
				observers.get(String(id)).forEach((observer) => observer.complete());
				observerWeakMap.set(store, observers.delete(id));
			}
		}

		const idProperty = store.idProperty;
		const data = dataWeakMap.get(store);
		if (typeof item === 'object') {
			if (idProperty in item && data && data.has(String(item[idProperty]))) {
				dataWeakMap.set(store, data.delete(String(item[idProperty])));
				completeObservable(item[idProperty]);
				return wrapResult(store, true);
			}
		}
		else {
			if (data && data.has(String(item))) {
				dataWeakMap.set(store, data.delete(String(item)));
				completeObservable(item);
				return wrapResult(store, true);
			}
		}
		return wrapResult(store, false);
	},
	fromArray(items: Object[]): MemoryStorePromise<void> {
		const store: MemoryStore<Object> = this;
		const map: Object = {};
		const idProperty = store.idProperty;
		items.forEach((item: { [prop: string]: StoreIndex }, idx: number) => {
			const id = idProperty in item ? item[idProperty] : idx;
			item[idProperty] = id;
			(<any> map)[id] = item;
		});
		dataWeakMap.set(store, OrderedMap<StoreIndex, Object>(map));
		return wrapResult(store, undefined);
	}
}, (instance: MemoryStore<Object>, options: MemoryStoreOptions<Object>) => {
	if (options) {
		if (options.idProperty) {
			instance.idProperty = options.idProperty;
		}
		if (options.data) {
			instance.fromArray(options.data);
		}
	}
});

export function fromArray(data: any[]): MemoryStore<any> {
	return createMemoryStore({ data });
};

export default createMemoryStore;
