import compose, { ComposeFactory } from 'dojo-compose/compose';
import { Projector, VNode } from 'maquette/maquette';
import { append } from '../util/vdom';
import { ContainerMixin, ContainerMixinState } from './createContainerMixin';
import createDestroyable, { Destroyable } from './createDestroyable';

export type Parent = Projector | ContainerMixin<Renderable, ContainerMixinState>;

export interface RenderFunction {
	(): VNode;
}

export interface RenderableOptions {
	/**
	 * A render function to be used.
	 */
	render?: RenderFunction;

	tagName?: string;

	parent?: Parent;
}

export interface Renderable extends Destroyable {
	/**
	 * Takes no arguments and returns a VNode
	 */
	render: RenderFunction;

	tagName: string;

	parent: Parent;
}

export interface RenderableFactory extends ComposeFactory<Renderable, RenderableOptions> { }

export function isRenderable(value: any): value is Renderable {
	return value && typeof value.render === 'function';
}

function isContainerMixin(value: any): value is ContainerMixin<Renderable, ContainerMixinState> {
	return;
}

const createRenderable: RenderableFactory = compose({
		render: <RenderFunction> null,

		tagName: 'div',

		parent: <Parent> null
	}, (instance: Renderable, options: RenderableOptions) => {
		if (options && options.tagName) {
			instance.tagName = options.tagName;
		}
	})
	.mixin({
		mixin: createDestroyable,
		initialize(instance: Renderable, options: RenderableOptions) {
			if (options) {
				if (options.render) {
					instance.render = options.render;
				}
				if (options.tagName) {
					instance.tagName = options.tagName;
				}
				if (options.parent) {
					if (isContainerMixin(options.parent)) {
						//
					}
					else {
						instance.own(append(instance));
					}
				}
			}
		}
	});

export default createRenderable;
