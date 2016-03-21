import { List } from 'immutable/immutable';
import { VNode } from 'maquette/maquette';
import { ComposeFactory } from 'dojo-compose/compose';
import { Handle } from 'dojo-core/interfaces';
import Promise from 'dojo-core/Promise';
import WeakMap from 'dojo-core/WeakMap';
import createCachedRenderMixin, { CachedRenderMixin, CachedRenderState } from './createCachedRenderMixin';
import { Renderable } from './createRenderable';
import { StatefulOptions } from './createStateful';
import { Position, insertInList } from '../util/lang';

export interface ContainerMixinOptions<R extends Renderable, S extends ContainerMixinState> extends StatefulOptions<S> {
	/**
	 * The children that should be owned by this instance
	 */
	children?: R[] | List<R>;
}

export interface ContainerMixinState extends CachedRenderState { }

export interface ContainerMixin<R extends Renderable, S extends ContainerMixinState> extends CachedRenderMixin<S> {
	/**
	 * Return an array of VNodes/strings the represent the rendered results of the children of this instance
	 */
	getChildrenNodes(): (VNode | string)[];

	/**
	 * Append an renderable item as a child of this instance
	 */
	append(item: Renderable): Handle;

	/**
	 * Insert a renderable item as a child of this instance
	 * @param item The item to add as a child
	 * @param position Where the item should be inserted in the children of this instance
	 * @param reference When the posistion is `before` or `after` this is the reference item
	 */
	insert(item: Renderable, position: Position, reference?: Renderable): Handle;

	/**
	 * A readonly list of children of this widget
	 */
	children: List<R>;
}

export interface ContainerMixinFactory extends ComposeFactory<ContainerMixin<Renderable, ContainerMixinState>, ContainerMixinOptions<Renderable, ContainerMixinState>> {
	<R extends Renderable>(options?: ContainerMixinOptions<R, ContainerMixinState>): ContainerMixin<R, ContainerMixinState>;
}

const childrenMap = new WeakMap<ContainerMixin<Renderable, ContainerMixinState>, List<Renderable>>();

/**
 * A utility function that returns a handle that removes an item as a child of the container
 * @param container The container to have the item removed
 * @param item The item to generate the removal handle for
 */
function getRemoveItemHandle(container: ContainerMixin<Renderable, ContainerMixinState>, item: Renderable): Handle {
	let destroyed = false;
	return {
		destroy() {
			const children = childrenMap.get(container);
			if (destroyed) {
				return;
			}
			const idx = children.lastIndexOf(item);
			if (idx > -1) {
				childrenMap.set(container, children.delete(idx));
			}
			if (item.parent === container) {
				item.parent = undefined;
			}
		}
	};
}

const createContainerMixin: ContainerMixinFactory = createCachedRenderMixin
	.mixin({
		mixin: {
			getChildrenNodes(): (VNode | string)[] {
				const container: ContainerMixin<Renderable, ContainerMixinState> = this;
				const results: (VNode | string)[] = [];
				childrenMap.get(container).forEach((child) => results.push(child.render()));
				return results;
			},

			append(item: Renderable): Handle {
				const container: ContainerMixin<Renderable, ContainerMixinState> = this;
				childrenMap.set(container, childrenMap.get(container).push(item));
				item.parent = container;
				return getRemoveItemHandle(container, item);
			},

			insert(item: Renderable, position: Position, reference?: Renderable): Handle {
				const container: ContainerMixin<Renderable, ContainerMixinState> = this;
				childrenMap.set(container, insertInList(childrenMap.get(container), item, position, reference));
				item.parent = container;
				return getRemoveItemHandle(container, item);
			},

			get children(): List<Renderable> {
				return childrenMap.get(this);
			}
		},
		initialize(instance: ContainerMixin<Renderable, ContainerMixinState>, options: ContainerMixinOptions<Renderable, ContainerMixinState>) {
			/* add any children passed in the options */
			childrenMap.set(instance, options && options.children ? List<Renderable>(options.children) : List<Renderable>());
			childrenMap.get(instance).forEach((child) => child.parent = instance);
		},
		aspectAdvice: {
			after: {
				destroy(result: Promise<boolean>) {
					const container: ContainerMixin<Renderable, ContainerMixinState> = this;
					/* clean up the children of this widget */
					return result.then((value) => {
						const children = childrenMap.get(container);
						children.forEach((child) => {
							if (child.parent === container) {
								child.parent = undefined;
							}
							child.destroy();
						});
						return value;
					});
				}
			}
		}
	});

export default createContainerMixin;
