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
	/**
	 * The root element for the projector
	 */
	root?: Element;

	/**
	 * If `true`, automatically attach to the DOM during creation
	 */
	autoAttach?: boolean;

	/**
	 * If `true`, append instead of merge when attaching to the projector to the DOM
	 *
	 * Only applies if `autoAttach` is `true`
	 */
	append?: boolean;
}

export interface RenderableChild extends Child {
	/**
	 * Returns a VNode which represents the DOM of the item
	 */
	render(): VNode;
}

export interface Projector extends VNodeEvented, ParentMixin<RenderableChild> {
	/**
	 * Get the projector's VNode attributes
	 */
	getNodeAttributes(overrides?: VNodeProperties): VNodeProperties;

	/**
	 * Returns a VNode which represents the DOM for the projector
	 */
	render(): VNode;

	/**
	 * Attach the projector to the DOM and return a handle to detach it.
	 * @param append If true, it will append to the root instead of the default of merging
	 */
	attach(append?: boolean): Handle;

	/**
	 * Inform the projector that it is in a dirty state and should re-render.  Calling event handles will automatically
	 * schedule a re-render.
	 */
	invalidate(): void;

	/**
	 * If unattached, set the root element for the projector.
	 * @param root The Element that should serve as the root for the projector
	 */
	setRoot(root: Element): void;

	/**
	 * The native maquette Projector that is being managed
	 */
	projector: MaquetteProjector;

	/**
	 * The root of the projector
	 */
	root: Element;

	/**
	 * When appending, what tag name should be used
	 */
	tagName?: string;

	/**
	 * An array of classes that should be applied to the root of the projector
	 */
	classes?: string[];

	/**
	 * A hash of inline styles that should be applied to the root of the projector
	 */
	styles?: { [style: string]: string; };

	/**
	 * A reference to the document that the projector is attached to
	 */
	document: Document;

	/**
	 * The current state of the projector
	 */
	state: ProjectorState;
}

export interface ProjectorFactory extends ComposeFactory<Projector, ProjectorOptions> { }

export enum ProjectorState {
	Attached = 1,
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
const emptyVNode = h('div');
const noopVNode = function(): VNode { return emptyVNode; };

export const createProjector: ProjectorFactory = compose<any, ProjectorOptions>({
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
			projectorData.attachHandle = projector.own({
				destroy() {
					if (projectorData.state === ProjectorState.Attached) {
						projectorData.projector.stop();
						try {
							/* Sometimes Maquette can't seem to find function */
							projectorData.projector.detach(projectorData.boundRender);
						}
						catch (e) {
							if (e.message !== 'renderMaquetteFunction was not found') {
								throw e;
							}
							/* else, swallow */
						}
						/* for some reason, Maquette still tryies to call this in some situations, so the noopVNode is
						 * used to return an empty structure */
						projectorData.boundRender = noopVNode;
						projectorData.state = ProjectorState.Detached;
					}
					projectorData.attachHandle = noopHandle;
				}
			});
			return projectorData.attachHandle;
		},
		invalidate(): void {
			const projector: Projector = this;
			const projectorData = projectorDataMap.get(projector);
			if (projectorData.state === ProjectorState.Attached) {
				projector.emit({
					type: 'schedulerender',
					target: projector
				});
				projectorData.projector.scheduleRender();
			}
		},
		setRoot(root: Element): void {
			const projectorData = projectorDataMap.get(this);
			if (projectorData.state === ProjectorState.Attached) {
				throw new Error('Projector already attached, cannot change root element');
			}
			projectorData.root = root;
		},

		get root(): Element {
			const projectorData = projectorDataMap.get(this);
			return projectorData && projectorData.root;
		},

		get projector(): MaquetteProjector {
			return projectorDataMap.get(this).projector;
		},

		get document(): Document {
			const projectorData = projectorDataMap.get(this);
			return projectorData && projectorData.root && projectorData.root.ownerDocument;
		},

		get state(): ProjectorState {
			const projectorData = projectorDataMap.get(this);
			return projectorData && projectorData.state;
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
			if (options && options.autoAttach) {
				instance.attach(options && options.append);
			}
		},
		aspectAdvice: {
			after: {
				clear(): void {
					const projector: Projector = this;
					projector.invalidate();
				}
			}
		}
	})
	.mixin({
		mixin: createVNodeEvented,
		initialize(instance: Projector) {
			/* We have to stub out listeners for Maquette, otherwise it won't allow us to change them down the road */
			instance.on('touchend', function () {});
			instance.on('touchmove', function () {});
		}
	});

const defaultProjector = createProjector();

export default defaultProjector;
