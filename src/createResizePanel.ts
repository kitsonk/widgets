import { VNode, h, VNodeProperties } from 'maquette/maquette';
import { ComposeFactory } from 'dojo-compose/compose';
import { Handle } from 'dojo-core/interfaces';
import { on } from 'dojo-core/aspect';
import WeakMap from 'dojo-core/WeakMap';
import createWidget, { Widget, WidgetState, WidgetOptions } from './createWidget';
import createContainerMixin, { ContainerMixin, ContainerMixinState, ContainerMixinOptions } from './mixins/createContainerMixin';
import createDestroyable from './mixins/createDestroyable';
import { Renderable } from './mixins/createRenderable';
import { Projector } from './projector';

export interface ResizePanelState extends WidgetState, ContainerMixinState {
	width?: string;
}

export interface ResizePanelOptions extends WidgetOptions<ResizePanelState>, ContainerMixinOptions<Renderable, ResizePanelState> { }

export interface ResizePanel extends Widget<ResizePanelState>, ContainerMixin<Renderable, ResizePanelState> {
	tagNames: {
		handle: string;
	};
	width: string;
}

export interface ResizePanelFactory extends ComposeFactory<ResizePanel, ResizePanelOptions> { }

const resizeNodePropertiesMap = new WeakMap<ResizePanel, VNodeProperties>();
const resizingMap = new WeakMap<ResizePanel, { width: string, clientX: number }>();

function getProjector(resizePanel: ResizePanel): Projector {
	let child: any = resizePanel;
	while (child.parent) {
		child = child.parent;
	}
	return <Projector> child;
}

function setResizeListeners(resizePanel: ResizePanel): Handle {

	let onmouseupHandle: Handle;
	let onmousemoveHandle: Handle;

	function onmouseupListener(evt: MouseEvent): boolean {
		if (resizingMap.get(resizePanel)) {
			evt.preventDefault();
			resizingMap.delete(resizePanel);
			onmousemoveHandle.destroy();
			onmouseupHandle.destroy();
			resizePanel.invalidate();
			return true;
		}
	}

	function onmousemoveListener(evt: MouseEvent): boolean {
		const originalWidth = resizingMap.get(resizePanel);
		if (originalWidth) {
			evt.preventDefault();
			resizePanel.width = String(parseInt(originalWidth.width, 10) + evt.clientX - originalWidth.clientX) + 'px';
			return true;
		}
	}

	function onmousedownListener(evt: MouseEvent): boolean {
		if (!resizingMap.get(resizePanel)) {
			evt.preventDefault();
			const projector = getProjector(resizePanel);
			resizingMap.set(resizePanel, { width: resizePanel.width, clientX: evt.clientX });
			if (projector.document) {
				onmouseupHandle = on(projector.document, 'onmouseup', onmouseupListener);
				onmousemoveHandle = on(projector.document, 'onmousemove', onmousemoveListener);
			}
			resizePanel.invalidate();
			return true;
		}
	}

	const resizeNodeProperties = resizeNodePropertiesMap.get(resizePanel);
	const onmousedownHandle = on(resizeNodeProperties, 'onmousedown', onmousedownListener);
	return {
		destroy() {
			onmousedownHandle && onmousedownHandle.destroy();
			onmouseupHandle && onmouseupHandle.destroy();
			onmousemoveHandle && onmousemoveHandle.destroy();
		}
	};
}

const createResizePanel: ResizePanelFactory = createWidget
	.mixin(createContainerMixin)
	.mixin({
		mixin: {
			tagName: 'dojo-panel-resize',
			tagNames: {
				handle: 'dojo-resize-handle'
			},
			get width(): string {
				const resizePanel: ResizePanel = this;
				return resizePanel.state && resizePanel.state && resizePanel.state.width;
			},
			set width(value: string) {
				const resizePanel: ResizePanel = this;
				resizePanel.setState({ width: value });
			}
		},
		aspectAdvice: {
			after: {
				getChildrenNodes(result: (VNode | string)[]): (VNode | string)[] {
					const resizePanel: ResizePanel = this;
					result.push(h(resizePanel.tagNames.handle, resizeNodePropertiesMap.get(resizePanel)));
					return result;
				},
				getNodeAttributes(result: VNodeProperties) {
					const resizePanel: ResizePanel = this;
					result = result || {};
					result.styles = result.styles || {};
					result.styles['width'] = resizePanel.width || '200px';
					return result;
				}
			}
		}
	})
	.mixin({
		mixin: createDestroyable,
		initialize(instance) {
			resizeNodePropertiesMap.set(instance, {});
			instance.own(setResizeListeners(instance));
		}
	});

export default createResizePanel;
