import { Handle, EventObject } from 'dojo-core/interfaces';
import { on } from 'dojo-core/aspect';
import WeakMap from 'dojo-core/WeakMap';
import compose, { ComposeFactory } from 'dojo-compose/compose';
import createDestroyable, { Destroyable } from './createDestroyable';

/**
 * A map of hashes of listeners for event types
 */
const listenersMap = new WeakMap<Evented, { [ type: string ]: EventedCallback<EventObject>}>();

export interface EventedOptions {
	listeners?: {
		[event: string]: EventedCallback<EventObject>;
	};
}

export interface EventedCallback<T extends EventObject> {
	(event: T): void;
}

export interface Evented extends Destroyable {
	/**
	 * Emit an event
	 * @param event The event object to emit
	 */
	emit<T extends EventObject>(event: T): void;

	/* you can extend evented and use object literals to type the listener event */

	/**
	 * Attach a listener to an event and return a handle that allows the removal of
	 * the listener.
	 * @param type The name of the event
	 */
	on(type: string, listener: EventedCallback<EventObject>): Handle;
}

export interface EventedFactory extends ComposeFactory<Evented, EventedOptions> { }

const createEvented: EventedFactory = compose<any, EventedOptions>({
		emit<T extends EventObject>(event: T): void {
			const method = listenersMap.get(this)[event.type];
			if (method) {
				method.call(this, event);
			}
		},
		on(type: string, listener: EventedCallback<EventObject>): Handle {
			return on(listenersMap.get(this), type, listener);
		}
	})
	.mixin({
		mixin: createDestroyable,
		initialize(instance: Evented, options: EventedOptions) {
			listenersMap.set(instance, {});
			if (options && 'listeners' in options) {
				for (let eventType in options.listeners) {
					instance.own(instance.on(eventType, options.listeners[eventType]));
				}
			}
		}
	});

export default createEvented;
