import { List } from 'immutable/immutable';
import compose, { ComposeFactory } from 'dojo-compose/compose';
import { Handle } from 'dojo-core/interfaces';
import WeakMap from 'dojo-core/WeakMap';
import { Position, insertInList } from '../util/lang';
import createDestroyable, { Destroyable } from './createDestroyable';

export interface ParentMixinOptions<C extends Child> {
	children?: C[];
}

export interface Child extends Destroyable {
	parent: ParentMixin<any>;
}

export interface ParentMixin<C> extends Destroyable {
	/**
	 * An immutable list of children for this parent
	 */
	children?: List<C>;

	/**
	 * Append a child (or children) to the parent
	 * @param child The child to append
	 */
	append(child: C): Handle;
	/**
	 * Append a child (or children) to the parent
	 * @param children The children to append
	 */
	append(children: C[]): Handle;

	/**
	 * Insert a child in a specific position, providing the reference if required
	 * @param child The child to insert
	 * @param position The position to insert the child
	 * @param reference The referencable child, if required
	 */
	insert(child: C, position: Position, reference?: C): Handle;
}

export interface ParentMixinFactory<C extends Child> extends ComposeFactory<ParentMixin<C>, ParentMixinOptions<C>> { }

const childrenMap = new WeakMap<ParentMixin<Child>, List<Child>>();

/**
 * A utility function that generates a handle that destroys any children
 */
function getRemoveHandle(parent: ParentMixin<Child>, child: Child | Child[]): Handle {
	function getDestroyHandle(c: Child): Handle {
		let destroyed = false;
		return c.own({
			destroy() {
				if (destroyed) {
					return;
				}
				const children = childrenMap.get(parent);
				const idx = children.lastIndexOf(c);
				if (idx > -1) {
					childrenMap.set(parent, children.delete(idx));
				}
				destroyed = true;
				if (c.parent === parent) {
					c.parent = undefined;
				}
			}
		});
	}

	if (Array.isArray(child)) {
		let destroyed = false;
		const handles = child.map((c) => getDestroyHandle(c));
		return {
			destroy() {
				if (destroyed) {
					return;
				}
				handles.forEach((handle) => handle.destroy());
				destroyed = true;
			}
		};
	}
	else {
		const handle = getDestroyHandle(child);
		return {
			destroy() {
				handle.destroy();
			}
		};
	}
}

const createParentMixin: ParentMixinFactory<Child> = compose({
		get children(): List<Child> {
			return childrenMap.get(this);
		},

		append(child: Child | Child[]): Handle {
			const parent: ParentMixin<Child> = this;
			if (Array.isArray(child)) {
				childrenMap.set(parent, <List<any>> childrenMap.get(parent).concat(child));
				child.forEach((c) => c.parent = parent);
			}
			else {
				childrenMap.set(parent, childrenMap.get(parent).push(child));
				child.parent = parent;
			}
			return getRemoveHandle(parent, child);
		},

		insert(child: Child, position: Position, reference?: Child): Handle {
			const parent: ParentMixin<Child> = this;
			childrenMap.set(parent, insertInList(childrenMap.get(parent), child, position, reference));
			child.parent = parent;
			return getRemoveHandle(parent, child);
		}
	})
	.mixin({
		mixin: createDestroyable,
		initialize(instance, options) {
			childrenMap.set(instance, List<any>());
			if (options && options.children && options.children.length) {
				instance.own(instance.append(options.children));
			}
			instance.own({
				destroy() {
					const children = childrenMap.get(instance);
					childrenMap.set(instance, List<Child>());
					children.forEach((child) => child.destroy());
				}
			});
		}
	});

export default createParentMixin;
