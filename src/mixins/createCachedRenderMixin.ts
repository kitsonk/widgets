import { h, VNode, VNodeProperties } from 'maquette/maquette';
import { ComposeFactory } from 'dojo-compose/compose';
import { EventObject, Handle } from 'dojo-core/interfaces';
import { assign } from 'dojo-core/lang';
import Map from 'dojo-core/Map';
import WeakMap from 'dojo-core/WeakMap';
import { scheduleRender, isProjector } from '../util/vdom';
import createStateful, { State, Stateful, StateChangeEvent, StatefulOptions } from './createStateful';
import createRenderable, { Renderable } from './createRenderable';
import { EventedListener } from './createEvented';
import createVNodeEvented, { VNodeEvented } from './createVNodeEvented';

export interface CachedRenderState extends State {
	/**
	 * The ID of this widget
	 */
	id?: string;

	/**
	 * Any label text for this widget
	 */
	label?: string;
}

export interface CachedRenderMixin<S extends CachedRenderState> extends Stateful<S>, Renderable, VNodeEvented {
	/**
	 * Returns the node attribute properties to be used by a render function
	 * @param overrides Any optional overrides of properties
	 */
	getNodeAttributes(overrides?: VNodeProperties): VNodeProperties;

	/**
	 * Returns any children VNodes that are part of the widget
	 */
	getChildrenNodes(): (VNode | string)[];

	/**
	 * Invalidate the widget so that it will recalculate on its next render
	 */
	invalidate(): void;

	on(type: 'statechange', listener: EventedListener<StateChangeEvent<S>>): Handle;
	on(type: string, listener: EventedListener<EventObject>): Handle;
}

/**
 * A map of dirty flags used when determining if the render function
 * should be called
 */
const dirtyMap = new Map<CachedRenderMixin<CachedRenderState>, boolean>();

/**
 * A weak map of the rendered VNode to return when the widget is
 * not dirty.
 */
const renderCache = new WeakMap<CachedRenderMixin<CachedRenderState>, VNode>();

const createCachedRenderMixin: ComposeFactory<CachedRenderMixin<CachedRenderState>, StatefulOptions<CachedRenderState>> = createStateful
	.mixin(createRenderable)
	.mixin(createVNodeEvented)
	.mixin({
		mixin: {
			getNodeAttributes(overrides?: VNodeProperties): VNodeProperties {
				const cachedRender: CachedRenderMixin<CachedRenderState> = this;
				const props: VNodeProperties = cachedRender.state.id ? { id: cachedRender.state.id } : {};
				for (let key in cachedRender.listeners) {
					props[key] = cachedRender.listeners[key];
				}
				if (overrides) {
					assign(props, overrides);
				}
				return props;
			},

			getChildrenNodes(): (VNode | string)[] {
				const cachedRender: CachedRenderMixin<CachedRenderState> = this;
				return cachedRender.state.label ? [ cachedRender.state.label ] : undefined;
			},

			render(): VNode {
				const cachedRender: CachedRenderMixin<CachedRenderState> = this;
				let cached = renderCache.get(cachedRender);
				if (!dirtyMap.get(cachedRender) && cached) {
					return cached;
				}
				else {
					cached = h(cachedRender.tagName, cachedRender.getNodeAttributes(), cachedRender.getChildrenNodes());
					renderCache.set(cachedRender, cached);
					dirtyMap.set(cachedRender, false);
					return cached;
				}
			},

			invalidate(): void {
				const cachedRender: CachedRenderMixin<CachedRenderState> = this;
				if (dirtyMap.get(cachedRender)) { /* short circuit if already dirty */
					return;
				}
				const parent = cachedRender.parent;
				dirtyMap.set(cachedRender, true);
				/* TODO: Consider unifying the API, so the parent can always be invalidated() */
				if (isProjector(parent)) {
					scheduleRender(parent);
				}
				else if (parent) {
					parent.invalidate();
				}
			}
		},
		initialize(instance) {
			dirtyMap.set(instance, true);
		},
		aspectAdvice: {
			after: {
				setState() {
					this.invalidate();
				}
			}
		}
	});

export default createCachedRenderMixin;
