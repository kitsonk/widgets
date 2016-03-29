import './util/has!dom-requestanimationframe?:maquette/maquette-polyfills.min'; /* IE9/Node do not support RequestAnimationFrame */
import { h, createProjector as createMaquetteProjector, Projector as MaquetteProjector, VNode, VNodeProperties } from 'maquette/maquette';
import compose, { ComposeFactory } from 'dojo-compose/compose';
import global from 'dojo-core/global';
import { Handle } from 'dojo-core/interfaces';
import { assign } from 'dojo-core/lang';
import { queueTask } from 'dojo-core/queue';
import WeakMap from 'dojo-core/WeakMap';
import { EventedOptions } from './mixins/createEvented';
import createVNodeEvented, { VNodeEvented } from './mixins/createVNodeEvented';
import createParentMixin, { ParentMixin, ParentMixinOptions, Child } from './mixins/createParentMixin';

/* maquette polyfills changed from 2.2 to 2.3 */
global.requestAnimationFrame = global.requestAnimationFrame || global.window.requestAnimationFrame;

export interface ProjectorOptions extends ParentMixinOptions<RenderableChild>, EventedOptions {
	root?: Element;
}

export interface RenderableChild extends Child {
	render(): VNode;
}

export interface Projector extends VNodeEvented, ParentMixin<RenderableChild> {
	getNodeAttributes(overrides?: VNodeProperties): VNodeProperties;
	render(): VNode;
	attach(append?: boolean): Handle;
	invalidate(): void;
	setRoot(root: Element): void;
	projector: MaquetteProjector;
	tagName?: string;
	classes?: string[];
	styles?: { [style: string]: string; };
}

export interface ProjectorFactory extends ComposeFactory<Projector, ProjectorOptions> { }

export enum ProjectorState {
	Attached,
	Detached
};

interface ProjectorData {
	projector?: MaquetteProjector;
	root?: Element;
	state?: ProjectorState;
	attachHandle?: Handle;
	boundRender?: () => VNode;
}

const projectorDataMap = new WeakMap<Projector, ProjectorData>();

const noopHandle = { destroy() { } };

function detach(projectorData: ProjectorData): void {
	projectorData.attachHandle = noopHandle;
	projectorData.projector.detach(projectorData.boundRender);
}

export const createProjector = compose<any, ProjectorOptions>({
		getNodeAttributes(overrides?: VNodeProperties): VNodeProperties {
			/* TODO: This is the same logic as createCachedRenderMixin, merge somehow */
			const projector: Projector = this;
			const props: VNodeProperties = {};
			for (let key in projector.listeners) {
				props[key] = projector.listeners[key];
			}
			const classes: { [index: string]: boolean; } = {};
			if (projector.classes) {
				projector.classes.forEach((c) => classes[c] = true);
			}
			props.classes = classes;
			props.styles = projector.styles || {};
			if (overrides) {
				assign(props, overrides);
			}
			return props;
		},
		render(): VNode {
			const projector: Projector = this;
			const childVNodes: VNode[] = [];
			projector.children.forEach((child) => childVNodes.push(child.render()));
			return h(projector.tagName || 'div', projector.getNodeAttributes(), childVNodes);
		},
		attach(append?: boolean): Handle {
			const projector: Projector = this;
			const projectorData = projectorDataMap.get(projector);
			if (projectorData.state === ProjectorState.Attached) {
				return projectorData.attachHandle;
			}
			projectorData.boundRender = projector.render.bind(projector);
			/* attaching async, in order to help ensure that if there are any other async behaviours scheduled at the end of the
			 * turn, they are executed before this, since the attachement is actually done in turn, but subsequent schedule
			 * renders are done out of turn */
			queueTask(() => {
				(append ? projectorData.projector.append : projectorData.projector.merge)(projectorData.root, projectorData.boundRender);
			});
			projectorData.state = ProjectorState.Attached;
			return projector.own({
				destroy() {
					detach(projectorData);
				}
			});
		},
		invalidate(): void {
			const projectorData = projectorDataMap.get(this);
			if (projectorData.state === ProjectorState.Attached) {
				projectorData.projector.scheduleRender();
			}
		},
		setRoot(root: Element): void {
			const projectorData = projectorDataMap.get(this);
			if (projectorData.state === ProjectorState.Attached) {
				throw new Error('Projector already attached, cannot change root element');
			}
			projectorData.root === root;
		},
		get projector(): MaquetteProjector {
			return projectorDataMap.get(this).projector;
		}
	})
	.mixin({
		mixin: createParentMixin,
		initialize(instance: Projector, options: ProjectorOptions) {
			const projector = createMaquetteProjector({});
			const root = options && options.root || document.body;
			projectorDataMap.set(instance, {
				projector,
				root,
				state: ProjectorState.Detached
			});
		}
	})
	.mixin({
		mixin: createVNodeEvented,
		initialize(instance: Projector) {
			instance.on('mousemove', function () {});
			instance.on('mouseup', function () {});
		}
	});

const defaultProjector = createProjector();

export default defaultProjector;
