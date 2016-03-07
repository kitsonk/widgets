import { ComposeFactory } from 'dojo-compose/compose';
import createWidget, { Widget, WidgetState, WidgetOptions } from './createWidget';
import createFormMixin, { FormMixin, FormMixinState, FormMixinOptions } from './mixins/createFormMixin';

export interface ButtonState extends WidgetState, FormMixinState<string> { }

export interface ButtonOptions extends WidgetOptions<ButtonState>, FormMixinOptions { }

export interface Button extends Widget<ButtonState>, FormMixin<string, ButtonState> { }

export interface ButtonFactory extends ComposeFactory<Button, ButtonOptions> { }

const createButton: ButtonFactory = createWidget
	.mixin({
		mixin: createFormMixin,
		initializer(instance) {
			instance.tagName = 'button';
			instance.type = 'button';
		}
	});

export default createButton;
