import { h, VNode, VNodeProperties } from 'maquette/maquette';
import { EventObject, Handle } from 'dojo-core/interfaces';
import { assign } from 'dojo-core/lang';
import Map from 'dojo-core/Map';
import WeakMap from 'dojo-core/WeakMap';
import { scheduleRender } from '../util/vdom';
import createStateful, { State, Stateful, StateChangeEvent } from './createStateful';
import createRenderable, { Renderable } from './createRenderable';
import { EventedCallback } from './createEvented';
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
	getChildrenNodes(): VNode[];

	/**
	 * Invalidate the widget so that it will recalculate on its next render
	 */
	invalidate(): void;

	on(type: 'statechange', listener: EventedCallback<StateChangeEvent<S>>): Handle;
	on(type: string, listener: EventedCallback<EventObject>): Handle;
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

const createCachedRenderMixin = createStateful
	.mixin(createRenderable)
	.mixin(createVNodeEvented)
	.mixin({
		mixin: {
			getNodeAttributes(overrides?: VNodeProperties): VNodeProperties {
				const props: VNodeProperties = this.state.id ? { id: this.state.id } : {};
				for (let key in this.listeners) {
					props[key] = this.listeners[key];
				}
				if (overrides) {
					assign(props, overrides);
				}
				return props;
			},

			getChildrenNodes(): VNode[] {
				return this.state.label ? [ this.state.label ] : undefined;
			},

			render(): VNode {
				let cached = renderCache.get(this);
				if (!dirtyMap.get(this) && cached) {
					return cached;
				}
				else {
					dirtyMap.set(this, false);
					cached = h(this.tagName, this.getNodeAttributes(), this.getChildrenNodes());
					renderCache.set(this, cached);
					return cached;
				}
			},

			invalidate(): void {
				dirtyMap.set(this, true);
				if (this.projector) {
					scheduleRender(this.projector);
				}
			}
		},
		initializer(instance) {
			dirtyMap.set(this, true);
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
