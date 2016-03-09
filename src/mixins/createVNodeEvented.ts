import { Handle, EventObject } from 'dojo-core/interfaces';
import { on } from 'dojo-core/aspect';
import { ComposeFactory } from 'dojo-compose/compose';
import createEvented, { Evented, EventedOptions, EventedCallback } from './createEvented';

export interface VNodeListeners {
	ontouchcancel?(ev?: TouchEvent): boolean | void;
	ontouchend?(ev?: TouchEvent): boolean | void;
	ontouchmove?(ev?: TouchEvent): boolean | void;
	ontouchstart?(ev?: TouchEvent): boolean | void;
	onblur?(ev?: FocusEvent): boolean | void;
	onchange?(ev?: Event): boolean | void;
	onclick?(ev?: MouseEvent): boolean | void;
	ondblclick?(ev?: MouseEvent): boolean | void;
	onfocus?(ev?: FocusEvent): boolean | void;
	oninput?(ev?: Event): boolean | void;
	onkeydown?(ev?: KeyboardEvent): boolean | void;
	onkeypress?(ev?: KeyboardEvent): boolean | void;
	onkeyup?(ev?: KeyboardEvent): boolean | void;
	onload?(ev?: Event): boolean | void;
	onmousedown?(ev?: MouseEvent): boolean | void;
	onmouseenter?(ev?: MouseEvent): boolean | void;
	onmouseleave?(ev?: MouseEvent): boolean | void;
	onmousemove?(ev?: MouseEvent): boolean | void;
	onmouseout?(ev?: MouseEvent): boolean | void;
	onmouseover?(ev?: MouseEvent): boolean | void;
	onmouseup?(ev?: MouseEvent): boolean | void;
	onmousewheel?(ev?: MouseWheelEvent): boolean | void;
	onscroll?(ev?: UIEvent): boolean | void;
	onsubmit?(ev?: Event): boolean | void;
}

const vnodeEvents = [
	'touchcancel',
	'touchend',
	'touchmove',
	'touchstart',
	'blur',
	'change',
	'click',
	'dblclick',
	'focus',
	'input',
	'keydown',
	'keypress',
	'keyup',
	'load',
	'mousedown',
	'mouseneter',
	'mouseleave',
	'mousemove',
	'mouseout',
	'mouseover',
	'mouseup',
	'mousewheel',
	'scroll',
	'submit'
];

export interface VNodeEvented extends Evented {
	listeners: VNodeListeners;
	on(type: 'touchcancel', listener: EventedCallback<TouchEvent>): Handle;
	on(type: string, listener: EventedCallback<EventObject>): Handle;
}

export interface VNodeEventedFactory extends ComposeFactory<VNodeEvented, EventedOptions> { }

const createVNodeEvented: VNodeEventedFactory = createEvented.mixin({
	mixin: {
		listeners: <VNodeListeners> null
	},
	initializer(instance) {
		instance.listeners = {};
	},
	aspectAdvice: {
		around: {
			on(origFn): (type: string, listener: EventedCallback<EventObject>) => Handle {
				return function (type: string, listener: EventedCallback<EventObject>): Handle {
					if (vnodeEvents.indexOf(type) > -1) {
						type = 'on' + type;
						return on(this.listeners, type, listener);
					}
					else {
						return origFn.call(this, type, listener);
					}
				};
			},

			emit(origFn): <T extends EventObject>(event: T) => void {
				return function <T extends EventObject>(event: T): void {
					if (vnodeEvents.indexOf(event.type) > -1) {
						const method = this.listeners['on' + event.type];
						if (method) {
							method.call(this, event);
						}
					}
					else {
						origFn.call(this, event);
					}
				};
			}
		}
	}
});

export default createVNodeEvented;
