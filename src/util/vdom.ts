import './has!dom-requestanimationframe?:maquette/maquette-polyfills.min';
import { createProjector, VNode, Projector, h } from 'maquette/maquette';
import { List } from 'immutable/immutable';
import WeakMap from 'dojo-core/WeakMap';
import { Handle } from 'dojo-core/interfaces';
import compose from 'dojo-compose/compose';
import { Renderable } from '../mixins/createRenderable';

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
	children: List<Renderable>;

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
 * Utility function to map a Set of renderables to an array of
 * VNodes.
 * @param set The set of renderables to map
 */
function renderableListToVNodeArray(list: List<Renderable>): VNode[] {
	return list.map((value) => {
			return value.render();
		}).toArray();
}

/**
 * A factory that creates the additional map of Projector data
 */
const createProjectorData = compose<ProjectorData, ProjectorDataOptions>({
	children: null,
	root: null,
	state: ProjectorState.Detached,
	render(): VNode {
		return h('div', renderableListToVNodeArray(this.children));
	}
}, (instance, options) => {
	instance.children = List<Renderable>();
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
 * Append a renderable to a projector
 * @param renderable The renderable object to append
 * @param projector Optional Projector to append to, default one is implied
 */
export function append(renderable: Renderable, projector: Projector = defaultProjector): Handle {
	let destroyed = false;
	const projectorData = getProjectorData(projector);
	projectorData.children = projectorData.children.push(renderable);
	renderable.projector = projector;
	return {
		destroy() {
			if (destroyed) {
				return;
			}
			const idx = projectorData.children.indexOf(renderable);
			if (idx >= 0) {
				projectorData.children = projectorData.children.delete(idx);
			}
			destroyed = true;
			renderable.projector = undefined;
			scheduleRender(projector);
		}
	};
}

function isNumber(value: any): value is number {
	return typeof value === 'number';
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
export function insert(renderable: Renderable, position: number | 'first' | 'last' | 'before' | 'after', reference?: Renderable, projector: Projector = defaultProjector): Handle {
	let destroyed = false;
	const projectorData = getProjectorData(projector);

	let idx: number;
	if (isNumber(position)) {
		idx = position;
	}
	else {
		switch (position) {
		case 'first':
			idx = 0;
			break;
		case 'last':
			idx = projectorData.children.size;
			break;
		case 'before':
			idx = projectorData.children.indexOf(reference);
			if (idx === -1) {
				throw new Error('reference not a child of projector');
			}
			break;
		case 'after':
			idx = projectorData.children.indexOf(reference) + 1;
			if (idx === 0) {
				throw new Error('reference not a child of projector');
			}
			break;
		default:
			throw Error(`Invalid position "${position}"`);
		}
	}
	projectorData.children = projectorData.children.insert(idx, renderable);
	return {
		destroy() {
			if (destroyed) {
				return;
			}
			const idx = projectorData.children.indexOf(renderable);
			if (idx > 0) {
				projectorData.children = projectorData.children.delete(idx);
			}
			destroyed = true;
			renderable.projector = undefined;
			scheduleRender(projector);
		}
	};
}

/**
 * Clear all the children from a projector
 * @param projector Optional Projector to attach, default one implied
 */
export function clear(projector: Projector = defaultProjector): void {
	const projectorData = getProjectorData(projector);
	projectorData.children = projectorData.children.clear();
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
