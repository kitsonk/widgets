import compose, { ComposeFactory } from 'dojo-compose/compose';
import { Projector, VNode } from 'maquette/maquette';
import { append } from '../util/vdom';
import createDestroyable, { Destroyable } from './createDestroyable';

export interface RenderFunction {
	(): VNode;
}

export interface RenderableOptions {
	/**
	 * A render function to be used.
	 */
	render?: RenderFunction;

	tagName?: string;
}

export interface Renderable extends Destroyable {
	/**
	 * Takes no arguments and returns a VNode
	 */
	render: RenderFunction;

	tagName: string;

	projector: Projector;
}

export interface RenderableFactory extends ComposeFactory<Renderable, RenderableOptions> { }

export function isRenderable(value: any): value is Renderable {
	return value && typeof value.render === 'function';
}

const createRenderable: RenderableFactory = compose({
		render: <RenderFunction> null,

		tagName: 'div',

		projector: <Projector> null
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
			}
			instance.own(append(instance));
		}
	});

export default createRenderable;
