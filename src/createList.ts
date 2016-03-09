import { ComposeFactory } from 'dojo-compose/compose';
import createWidget, { Widget, WidgetState, WidgetOptions } from './createWidget';
import createListMixin, { ListMixin, ListMixinState } from './mixins/createListMixin';

export interface ListState extends WidgetState, ListMixinState { }

export interface List<S extends ListState> extends Widget<S>, ListMixin<S> { }

export interface ListFactory extends ComposeFactory<List<ListState>, WidgetOptions<ListState>> {
	<S extends ListState>(options?: WidgetOptions<S>): List<S>;
}

const createList: ListFactory = createWidget
	.mixin(createListMixin);

export default createList;
