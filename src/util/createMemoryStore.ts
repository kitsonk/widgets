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
	idProperty: string | symbol;

	get(id: StoreIndex): MemoryStorePromise<T>;

	observe(id: StoreIndex): Observable<T>;

	put(item: T, options?: MemoryStorePragma): MemoryStorePromise<T>;
	add(item: T, options?: MemoryStorePragma): MemoryStorePromise<T>;

	delete(id: StoreIndex): MemoryStorePromise<boolean>;
	delete(item: T): MemoryStorePromise<boolean>;

	fromArray(items: T[]): MemoryStorePromise<void>;
}

const dataWeakMap = new WeakMap<MemoryStore<Object>, OrderedMap<StoreIndex, Object>>();
const observerWeakMap = new WeakMap<MemoryStore<Object>, Map<StoreIndex, Observer<Object>[]>>();

export interface MemoryStoreFactory extends ComposeFactory<MemoryStore<Object>, MemoryStoreOptions<Object>> {
	<T extends Object>(options?: MemoryStoreOptions<T>): MemoryStore<T>;
}

const storeMethods = [ 'get', 'put', 'add', 'delete', 'fromArray' ];

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
		const data = dataWeakMap.get(this);
		return wrapResult(this, data && data.get(String(id)));
	},

	observe(id: StoreIndex): Observable<Object> {
		const store = this;
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
		const data = dataWeakMap.get(this);
		const idProperty = this.idProperty;
		const id =  options && 'id' in options ? options.id :
			idProperty in item ? item[idProperty] :
			data ? data.size : 0;
		if (options && options.replace === false && data && data.has(id)) {
			return wrapError(this, Error(`Duplicate id "${id}" when pragma "replace" is false`));
		}
		item[idProperty] = id;
		dataWeakMap.set(this, (data ? data : OrderedMap<StoreIndex, Object>()).set(String(id), item));

		const observers = observerWeakMap.get(this);
		if (observers && observers.has(String(id))) {
			observers.get(String(id)).forEach((observer) => observer.next(item));
		}
		return wrapResult(this, item);
	},

	add(item: Object, options?: MemoryStorePragma): MemoryStorePromise<Object> {
		return this.put(item, assign(options ? options : {}, { replace: false }));
	},

	delete(item: StoreIndex | { [property: string]: number | string; }): MemoryStorePromise<boolean> {
		const store = this;

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

		const idProperty: string = store.idProperty;
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
		const map: Object = {};
		const idProperty = this.idProperty;
		items.forEach((item: { [prop: string]: StoreIndex }, idx: number) => {
			const id = idProperty in item ? item[idProperty] : idx;
			item[idProperty] = id;
			(<any> map)[id] = item;
		});
		dataWeakMap.set(this, OrderedMap<StoreIndex, Object>(map));
		return wrapResult(this, undefined);
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

export default createMemoryStore;
