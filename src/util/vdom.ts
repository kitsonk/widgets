import './has!dom-requestanimationframe?:maquette/maquette-polyfills.min'; /* IE9 does not support RequestAnimationFrame */
import { createProjector, VNode, Projector, h } from 'maquette/maquette';
import WeakMap from 'dojo-core/WeakMap';
import { Handle } from 'dojo-core/interfaces';
import compose from 'dojo-compose/compose';
import { Renderable } from '../mixins/createRenderable';
import { insertInArray, Position } from './lang';

/**
 * The state of the projector
 */
export const enum ProjectorState {
	Attached,
	Detached
}

interface ProjectorData {
	/**
	 * A set of renderable children
	 */
	children: Renderable[];

	/**
	 * The root element to merge with
	 */
	root: Element;

	/**
	 * The current state of the projector
	 */
	state: ProjectorState;

	/**
	 * The render function which returns the children VNodes
	 */
	render(): VNode;

	/**
	 * A destruction handle for the Projector
	 */
	handle?: Handle;
}

interface ProjectorDataOptions {
	root?: HTMLElement;
}

/**
 * A factory that creates the additional map of Projector data
 */
const createProjectorData = compose<ProjectorData, ProjectorDataOptions>({
	children: null,
	root: null,
	state: ProjectorState.Detached,
	render(): VNode {
		const projectorData: ProjectorData = this;
		return h('div', projectorData.children.map((child) => child.render()));
	}
}, (instance, options) => {
	instance.children = [];
});

/**
 * A weak map that stores additional information about the Proejctor
 */
const projectorDataWeakMap = new WeakMap<Projector, ProjectorData>();

/**
 * Return the Projector Data and create if necessary
 * @param projector The Projector to return the data from
 */
function getProjectorData(projector: Projector): ProjectorData {
	if (!projectorDataWeakMap.has(projector)) {
		projectorDataWeakMap.set(projector, createProjectorData());
	}
	return projectorDataWeakMap.get(projector);
}

/**
 * A noop destruction handle
 */
const noopHandle: Handle = { destroy() {} };

/**
 * The default projector which gets merged with the document.body
 */
const defaultProjector = createProjector({});

/**
 * Detech a projector from the DOM
 */
function detach(projector: Projector = defaultProjector) {
	const projectorData = getProjectorData(projector);
	projectorData.handle = noopHandle;
	projector.stop();
}

/**
 * Attach a projector to the DOM
 * @param projector Optional Projector to attach, default one implied
 */
export function attach(projector: Projector = defaultProjector): Handle {
	const projectorData = getProjectorData(projector);
	if (projectorData.state === ProjectorState.Attached) {
		return projectorData.handle;
	}
	projector.merge(projectorData.root, projectorData.render.bind(projectorData));
	projectorData.state = ProjectorState.Attached;
	return projectorData.handle = {
		destroy() {
			detach(projector);
		}
	};
}

/**
 * Utility function to get a handle that will remove a renderable from a projector
 */
function getRemoveFromProjectorHandle(projector: Projector, projectorData: ProjectorData, renderable: Renderable | Renderable[]): Handle {

	function getDestroyHandle(r: Renderable): Handle {
		let destroyed = false;
		return r.own({
			destroy() {
				if (destroyed) {
					return;
				}
				const idx = projectorData.children.indexOf(r);
				if (idx >= 0) {
					projectorData.children.splice(idx, 1);
				}
				destroyed = true;
				if (r.parent === projector) {
					r.parent === undefined;
				}
				scheduleRender(projector);
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
				destroyed = true;
			}
		};
	}
	else {
		return getDestroyHandle(renderable);
	}
}

/**
 * Append a renderable to a projector
 * @param renderable The renderable object(s) to append, either a Renderable or an array of Renderables
 * @param projector Optional Projector to append to, default one is implied
 */
export function append(renderable: Renderable | Renderable[], projector: Projector = defaultProjector): Handle {
	const renderables: Renderable[] = Array.isArray(renderable) ? renderable : [ renderable ];
	const projectorData = getProjectorData(projector);
	projectorData.children = projectorData.children.concat(renderables);
	renderables.forEach((renderable) => renderable.parent = projector);
	return getRemoveFromProjectorHandle(projector, projectorData, renderable);
}

/**
 * Insert a renderable into a projector
 * @param renderable The renderable object to insert
 * @param position The position where the renderable should be inserted, either an index
 *                 posistion or a string indicating the relative position
 * @param reference When using `before` or `after` positions, the renderable to use as
 *                  reference
 * @param projector Optional Projector to insert into, default one is implied
 */
export function insert(renderable: Renderable, position: Position, reference?: Renderable, projector: Projector = defaultProjector): Handle {
	const projectorData = getProjectorData(projector);
	insertInArray(projectorData.children, renderable, position, reference);
	renderable.parent = projector;
	return renderable.own(getRemoveFromProjectorHandle(projector, projectorData, renderable));
}

/**
 * Clear all the children from a projector
 * @param projector Optional Projector to attach, default one implied
 */
export function clear(projector: Projector = defaultProjector): void {
	const projectorData = getProjectorData(projector);
	projectorData.children = [];
	scheduleRender(projector);
}

/**
 * Set the root element of a projector
 * @param root The root element to set on the projector
 * @param projector An optional projector, default one implied
 */
export function setRoot(root: Element, projector: Projector = defaultProjector): void {
	const projectorData = getProjectorData(projector);
	if (projectorData.state === ProjectorState.Attached && projectorData.root !== root) {
		throw new Error('Projector already attached, cannot change root element');
	}
	projectorData.root = root;
}

/**
 * A type guard for Maquette Projectors
 * @param value The value to type guard against
 */
export function isProjector(value: any): value is Projector {
	return value && typeof value === 'object' && typeof value.scheduleRender === 'function';
}

/**
 * Schedule a render on a projector
 * @param projector An optional projector, default one implied
 */
export function scheduleRender(projector: Projector = defaultProjector): void {
	if (getProjectorData(projector).state === ProjectorState.Attached) {
		projector.scheduleRender();
	}
}

/**
 * An alias for the doc, done in a way to not throw when loading in a headless
 * environment
 */
const doc = typeof document !== 'undefined' ? document : null;

if (doc) {
	setRoot(doc.body, defaultProjector);
}
