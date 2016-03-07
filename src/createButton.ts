import { VNodeProperties } from 'maquette/maquette';
import createWidget, { WidgetState, WidgetFactory, WidgetOptions, Widget } from './createWidget';

/* should create a helper function that creates a mixin form descriptor */

export interface ButtonState extends WidgetState {
	name?: string;
}

export interface ButtonFactory extends WidgetFactory {
	<S extends ButtonState>(options?: WidgetOptions<S>): Widget<S>;
}

const createButton: ButtonFactory = createWidget.
	mixin({
		initializer(instance) {
			instance.tagName = 'button';
		},
		aspectAdvice: {
			before: {
				getNodeAttributes(...args: any[]) {
					let overrides: VNodeProperties = args[0];
					if (!overrides) {
						overrides = {};
					}
					overrides['type'] = 'button';
					/* this should be folded into a form factory */
					if (this.state.name) {
						overrides.name = this.state.name;
					}
					args[0] = overrides;
					return args;
				}
			}
		}
	});

export default createButton;
