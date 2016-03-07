import { VNode, VNodeProperties, h } from 'maquette/maquette';
import { ComposeFactory } from 'dojo-compose/compose';
import { Handle, EventObject } from 'dojo-core/interfaces';
import { assign } from 'dojo-core/lang';
import Map from 'dojo-core/Map';
import WeakMap from 'dojo-core/WeakMap';
import { EventedOptions, EventedCallback } from './mixins/createEvented';
import createVNodeEvented, { VNodeEvented } from './mixins/createVNodeEvented';
import createDestroyable, { Destroyable } from './mixins/createDestroyable';
import createRenderable, { Renderable, RenderableOptions } from './mixins/createRenderable';
import createStateful, { State, Stateful, StatefulOptions, StateChangeEvent } from './mixins/createStateful';
import { scheduleRender } from './util/vdom';

export interface WidgetState extends State {
	/**
	 * The ID of this widget
	 */
	id?: string;

	/**
	 * Any label text for this widget
	 */
	label?: string;
}

export interface WidgetOptions<S extends WidgetState> extends RenderableOptions, EventedOptions, StatefulOptions<S> {
}

export interface Widget<S extends WidgetState> extends VNodeEvented, Destroyable, Renderable, Stateful<S> {
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

export interface WidgetFactory extends ComposeFactory<Widget<WidgetState>, WidgetOptions<WidgetState>> {
	<S extends WidgetState>(options?: WidgetOptions<S>): Widget<S>;
}

/**
 * A map of dirty flags used when determining if the render function
 * should be called
 */
const dirtyMap = new Map<Widget<WidgetState>, boolean>();

/**
 * A weak map of the rendered VNode to return when the widget is
 * not dirty.
 */
const renderCache = new WeakMap<Widget<WidgetState>, VNode>();

const createWidget: WidgetFactory = createDestroyable
	.mixin(createRenderable)
	.mixin(createStateful)
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

export default createWidget;
