import createWidget from './createWidget';
import createFormFieldMixin from './mixins/createFormFieldMixin';

/* I suspect this needs to go somewhere else */
export interface TypedTargetEvent<T extends EventTarget> extends Event {
	target: T;
}

const createTextInput = createWidget
	.mixin({
		mixin: createFormFieldMixin,
		initializer(instance) {
			instance.on('input', (event: TypedTargetEvent<HTMLInputElement>) => {
				instance.value = event.target.value;
			});
		}
	})
	.extend({
		type: 'text',
		tagName: 'input'
	});

export default createTextInput;
