import { VNodeProperties } from 'maquette/maquette';
import { ComposeFactory } from 'dojo-compose/compose';
import createStateful, { Stateful, State, StatefulOptions } from './createStateful';
import createCachedRenderMixin, { CachedRenderMixin } from './createCachedRenderMixin';

export interface FormFieldMixinOptions {
	type?: string;
}

export interface FormFieldMixinState<V> extends State {
	/**
	 * The form widget's name
	 */
	name?: string;

	/**
	 * The current value
	 */
	value?: V;

	/**
	 * Whether the field is currently disabled or not
	 */
	disabled?: boolean;
}

export interface FormFieldMixin<V, S extends FormFieldMixinState<V>> extends Stateful<S>, CachedRenderMixin<S> {
	/**
	 * The HTML type for this widget
	 */
	type?: string;

	/**
	 * The string value of this form widget, which is read from the widget state
	 */
	value?: string;
}

export interface FormMixinFactory extends ComposeFactory<FormFieldMixin<any, FormFieldMixinState<any>>, FormFieldMixinOptions> {
	<V, S extends FormFieldMixinState<V>>(options?: StatefulOptions<S>): FormFieldMixin<V, S>;
}

const createFormMixin: FormMixinFactory = createStateful
	.mixin(createCachedRenderMixin)
	.mixin({
		mixin: {
			get value(): string {
				return this.state.value;
			},

			set value(value: string) {
				if (value !== this.state.value) {
					this.setState({ value });
				}
			}
		},
		initializer(instance: FormFieldMixin<any, FormFieldMixinState<any>>, options: FormFieldMixinOptions) {
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
					if (this.state.disabled !== 'undefined') {
						overrides['disabled'] = this.state.disabled;
					}

					args[0] = overrides;
					return args;
				}
			}
		}
	});

export default createFormMixin;
