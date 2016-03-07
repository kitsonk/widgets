import { VNodeProperties } from 'maquette/maquette';
import { ComposeFactory } from 'dojo-compose/compose';
import createStateful, { Stateful, State, StatefulOptions } from './createStateful';
import createCachedRenderMixin, { CachedRenderMixin } from './createCachedRenderMixin';

export interface FormMixinOptions {
	type?: string;
}

export interface FormMixinState<V> extends State {
	/**
	 * The form widget's name
	 */
	name?: string;

	/**
	 * The current value
	 */
	value?: V;
}

export interface FormMixin<V, S extends FormMixinState<V>> extends Stateful<S>, CachedRenderMixin<S> {
	/**
	 * The HTML type for this widget
	 */
	type?: string;

	/**
	 * The value of this form widget, which is read from the widget state
	 */
	value?: string;
}

export interface FormMixinFactory extends ComposeFactory<FormMixin<any, FormMixinState<any>>, FormMixinOptions> {
	<V, S extends FormMixinState<V>>(options?: StatefulOptions<S>): FormMixin<V, S>;
}

const createFormMixin: FormMixinFactory = createStateful
	.mixin(createCachedRenderMixin)
	.mixin({
		mixin: {
			get value(): string {
				return this.state.value;
			},

			set value(value: string) {
				this.setState({ value });
			}
		},
		initializer(instance: FormMixin<any, FormMixinState<any>>, options: FormMixinOptions) {
			if (options && options.type) {
				instance.type = options.type;
			}
		},
		aspectAdvice: {
			before: {
				getNodeAttributes(...args: any[]) {
					let overrides: VNodeProperties = args[0];

					if (!overrides) {
						overrides = {};
					}

					if (this.type) {
						overrides['type'] = this.type;
					}
					if (this.value) {
						overrides.value = this.value;
					}
					if (this.state.name) {
						overrides.name = this.state.name;
					}

					args[0] = overrides;
					return args;
				}
			}
		}
	});

export default createFormMixin;
