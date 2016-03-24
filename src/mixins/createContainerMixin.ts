import { List } from 'immutable/immutable';
import { VNode } from 'maquette/maquette';
import compose, { ComposeFactory } from 'dojo-compose/compose';
import { Handle } from 'dojo-core/interfaces';
import WeakMap from 'dojo-core/WeakMap';
import createCachedRenderMixin, { CachedRenderMixin, CachedRenderState } from './createCachedRenderMixin';
import { Renderable } from './createRenderable';
import { StatefulOptions } from './createStateful';
import { Position, insertInList } from '../util/lang';

export interface ContainerMixinOptions<R extends Renderable, S extends ContainerMixinState> extends StatefulOptions<S> {
	/**
	 * The children that should be owned by this instance
	 */
	children?: R[];
}

export interface ContainerMixinState extends CachedRenderState { }

export interface ContainerMixin<R extends Renderable, S extends ContainerMixinState> extends CachedRenderMixin<S> {
	/**
	 * Return an array of VNodes/strings the represent the rendered results of the children of this instance
	 */
	getChildrenNodes(): (VNode | string)[];

	/**
	 * Append an renderable item as a child of this instance
	 * @param child The child to append
	 */
	append(child: Renderable | Renderable[]): Handle;

	/**
	 * Insert a renderable item as a child of this instance
	 * @param child The child to add
	 * @param position Where the item should be inserted in the children of this instance
	 * @param reference When the posistion is `before` or `after` this is the reference item
	 */
	insert(child: Renderable, position: Position, reference?: Renderable): Handle;

	/**
	 * A readonly list of children of this widget
	 */
	children: List<R>;
}

export interface ContainerMixinFactory extends ComposeFactory<ContainerMixin<Renderable, ContainerMixinState>, ContainerMixinOptions<Renderable, ContainerMixinState>> {
	/**
	 * Create a new instance of a Container
	 * @param options Any options to use during creation
	 */
	<R extends Renderable>(options?: ContainerMixinOptions<R, ContainerMixinState>): ContainerMixin<R, ContainerMixinState>;
}

/**
 * A weak map of immutables Lists of children associated with containers
 */
const childrenMap = new WeakMap<ContainerMixin<Renderable, ContainerMixinState>, List<Renderable>>();

/**
 * A utility function that generates a handle that destroys any children
 */
function getRemoveFromContainerHandle(container: ContainerMixin<Renderable, ContainerMixinState>, renderable: Renderable | Renderable[]): Handle {
	function getDestroyHandle(r: Renderable): Handle {
		let destroyed = false;
		return r.own({
			destroy() {
				if (destroyed) {
					return;
				}
				const children = childrenMap.get(container);
				const idx = children.lastIndexOf(r);
				if (idx > -1) {
					childrenMap.set(container, children.delete(idx));
				}
				destroyed = true;
				if (r.parent === container) {
					r.parent = undefined;
				}
			}
		});
	}

	if (Array.isArray(renderable)) {
		let destroyed = false;
		const handles = renderable.map((r) => getDestroyHandle(r));
		return {
			destroy() {
				if (destroyed) {
					return;
				}
				handles.forEach((handle) => handle.destroy());
				container.invalidate();
				destroyed = true;
			}
		};
	}
	else {
		const handle = getDestroyHandle(renderable);
		return {
			destroy() {
				handle.destroy();
				container.invalidate();
			}
		};
	}
}

const createContainerMixin: ContainerMixinFactory = compose({
		append(child: Renderable | Renderable[]): Handle {
			const container: ContainerMixin<Renderable, ContainerMixinState> = this;
			if (Array.isArray(child)) {
				childrenMap.set(container, <List<any>> childrenMap.get(container).concat(child));
				child.forEach((c) => c.parent = container);
			}
			else {
				childrenMap.set(container, childrenMap.get(container).push(child));
				child.parent = container;
			}
			return getRemoveFromContainerHandle(container, child);
		},

		insert(child: Renderable, position: Position, reference?: Renderable): Handle {
			const container: ContainerMixin<Renderable, ContainerMixinState> = this;
			childrenMap.set(container, insertInList(childrenMap.get(container), child, position, reference));
			child.parent = container;
			return getRemoveFromContainerHandle(container, child);
		},

		get children(): List<Renderable> {
			return childrenMap.get(this);
		}
	}, (instance: ContainerMixin<Renderable, ContainerMixinState>, options: ContainerMixinOptions<Renderable, ContainerMixinState>) => {
		/* add any children passed in the options */
		childrenMap.set(instance, List<Renderable>());
		if (options && options.children && options.children.length) {
			instance.own(instance.append(options.children));
		}

		/* create handle the will destroy children */
		instance.own({
			destroy() {
				const children = childrenMap.get(instance);
				childrenMap.set(instance, List<Renderable>());
				children.forEach((child) => child.destroy());
			}
		});
	})
	.mixin(createCachedRenderMixin)
	.extend({
		getChildrenNodes(): (VNode | string)[] {
			const container: ContainerMixin<Renderable, ContainerMixinState> = this;
			const results: (VNode | string)[] = [];
			/* Converting immutable lists toArray() is expensive */
			childrenMap.get(container).forEach((child) => results.push(child.render()));
			return results;
		}
	});

export default createContainerMixin;
