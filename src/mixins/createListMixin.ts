import { h, VNode } from 'maquette/maquette';
import createCachedRenderMixin, { CachedRenderMixin, CachedRenderState } from './createCachedRenderMixin';

export interface ListStateItem {
	[property: string]: any;
	id: string | number;
	label: string;
}

export interface ListMixinState extends CachedRenderState {
	items?: ListStateItem[];
}

export interface TagNames {
	list: string;
	item: string;
}

export interface ListMixin extends CachedRenderMixin<ListMixinState> {
	getChildrenNodes(): VNode[];
	tagName: string;
	tagNames: TagNames;
}

const createListMixin = createCachedRenderMixin
	.mixin({
		mixin: {
			getChildrenNodes(): VNode[] {
				if (this.state && this.state.items) {
					const items: { id: any; label: string; }[] = this.state.items;
					return [ h(this.tagNames.list, items.map((item) => {
						return h(this.tagNames.item, {
							key: item
						}, [ item.label ]);
					})) ];
				}
				return [];
			},

			tagName: 'dojo-list',
			tagNames: {
				list: 'ul',
				item: 'li'
			}
		}
	});

export default createListMixin;
