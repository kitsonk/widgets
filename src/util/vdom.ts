import './has!dom-requestanimationframe?:maquette/maquette-polyfills.min';
import { createProjector, VNode, Projector, h } from 'maquette/maquette';
import Set from 'dojo-core/Set';
import WeakMap from 'dojo-core/WeakMap';
import { Handle } from 'dojo-core/interfaces';
import { forOf } from 'dojo-core/iterator';
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
	children: Set<Renderable>;

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
function renderableSetToVNodeArray(set: Set<Renderable>): VNode[] {
	const results: VNode[] = [];
	forOf(set, (renderable) => {
		/* just in case a render function has disappeared at runtime, not good throwing here,
		 * we will just skip */
		if (renderable.render) {
			results.push(renderable.render());
		}
	});
	return results;
}

/**
 * A factory that creates the additional map of Projector data
 */
const createProjectorData = compose<ProjectorData, ProjectorDataOptions>({
	children: null,
	root: null,
	state: ProjectorState.Detached,
	render(): VNode {
		return h('div', renderableSetToVNodeArray(this.children));
	}
}, (instance, options) => {
	instance.children = new Set<Renderable>();
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
 * Add a renderable to a projector
 * @param renderable The renderable object to attach
 * @param projector Optional Projector to attach, default one implied
 */
export function add(renderable: Renderable, projector: Projector = defaultProjector): Handle {
	const projectorData = getProjectorData(projector);
	projectorData.children.add(renderable);
	renderable.projector = projector;
	return {
		destroy() {
			projectorData.children.delete(renderable);
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
	projectorData.children.clear();
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
