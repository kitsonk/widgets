import { VNode } from 'maquette/maquette';
import { ComposeFactory } from 'dojo-compose/compose';
import createCachedRenderMixin, { CachedRenderMixin, CachedRenderState } from './createCachedRenderMixin';
import createParentMixin, { ParentMixinOptions, ParentMixin } from './createParentMixin';
import { Renderable } from './createRenderable';
import { StatefulOptions } from './createStateful';

export interface ContainerMixinOptions<R extends Renderable, S extends ContainerMixinState> extends StatefulOptions<S>, ParentMixinOptions<R> { }

export interface ContainerMixinState extends CachedRenderState { }

export interface ContainerMixin<R extends Renderable, S extends ContainerMixinState> extends CachedRenderMixin<S>, ParentMixin<R> {
	/**
	 * Return an array of VNodes/strings the represent the rendered results of the children of this instance
	 */
	getChildrenNodes(): (VNode | string)[];
}

export interface ContainerMixinFactory extends ComposeFactory<ContainerMixin<Renderable, ContainerMixinState>, ContainerMixinOptions<Renderable, ContainerMixinState>> {
	/**
	 * Create a new instance of a Container
	 * @param options Any options to use during creation
	 */
	<R extends Renderable>(options?: ContainerMixinOptions<R, ContainerMixinState>): ContainerMixin<R, ContainerMixinState>;
}

const createContainerMixin: ContainerMixinFactory = createParentMixin
	.mixin(createCachedRenderMixin)
	.extend({
		getChildrenNodes(): (VNode | string)[] {
			const container: ContainerMixin<Renderable, ContainerMixinState> = this;
			const results: (VNode | string)[] = [];
			/* Converting immutable lists toArray() is expensive */
			container.children.forEach((child) => results.push(child.render()));
			return results;
		}
	});

export default createContainerMixin;
