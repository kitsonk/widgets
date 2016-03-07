import compose, { ComposeFactory } from 'dojo-compose/compose';
import WeakMap from 'dojo-core/WeakMap';
import { deepAssign } from 'dojo-core/lang';
import { EventObject, Handle } from 'dojo-core/interfaces';
import createEvented, { Evented, EventedOptions, EventedCallback } from './createEvented';

const stateWeakMap = new WeakMap<Stateful<any>, any>();

export interface State {
	[id: string]: any;
}

export interface StatefulOptions<S extends State> extends EventedOptions {
	state?: S;
}

export interface StateChangeEvent<S extends State> extends EventObject {
	type: string;
	state: S;
}

export interface Stateful<S extends State> extends Evented {
	/**
	 * A readonly version of the state
	 */
	state: S;

	/**
	 * Set the state on the instance.
	 * Set state takes partial values, therefore if a key is omitted, it will not get set.
	 * If you wish to "clear" a value, you should pass it as undefined.
	 * @param value The partial state to be set
	 */
	setState(value: S): S;

	/**
	 * Add a listener for the event
	 * @param type     The event to listener for
	 * @param listener The event listener
	 */
	on(type: 'statechange', listener: EventedCallback<StateChangeEvent<S>>): Handle;
	on(type: string, listener: EventedCallback<EventObject>): Handle;
}

export interface StatefulFactory extends ComposeFactory<Stateful<State>, StatefulOptions<State>> {
	<S extends State>(options?: StatefulOptions<S>): Stateful<S>;
}

const createStateful: StatefulFactory = compose({
		get state(): any {
			return stateWeakMap.get(this);
		},

		setState(value: State): State {
			const state = deepAssign(stateWeakMap.get(this), value);
			this.emit({
				type: 'statechange',
				state
			});
			return state;
		}
	}, (instance: Stateful<State>, options: StatefulOptions<State>) => {
		const state = {};
		stateWeakMap.set(instance, state);
		if (options && options.state) {
			instance.setState(options.state);
		}
	})
	.mixin(createEvented);

export default createStateful;
