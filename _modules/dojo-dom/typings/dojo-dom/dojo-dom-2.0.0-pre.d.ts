declare module 'dojo-dom/addCssRule' {
	import { Handle } from 'dojo-core/interfaces';
	/**
	 * A handle that can be used to update or remove a rule added by addCssRule.
	 */
	export interface CssRuleHandle extends Handle {
	    get(property: string): string;
	    remove(property: string): void;
	    set(property: string, value: string): void;
	    set(properties: {
	        [property: string]: string;
	    }): void;
	}
	/**
	 * Dynamically adds a CSS rule to the document.
	 *
	 * @param selector a CSS selector
	 * @param css a CSS rule string
	 * @return an object that can be used to update and remove the rule
	 *
	 * @example
	 * let handle = addCssRule('div.alert', 'background: red; color: white;');
	 */
	export default function addCssRule(selector: string, css: string): CssRuleHandle;

}
declare module 'dojo-dom/has' {
	export { cache, add, default } from 'dojo-core/has';

}
declare module 'dojo-dom/delegate' {
	import { Handle } from 'dojo-core/interfaces';
	/**
	 * Provides a normalized mechanism for using a single event handler to listen
	 * to delegated events from DOM nodes.
	 *
	 * @param target The Element to which to attach a single event handler
	 * @param selector A CSS selector used to determine whether the event handler is called
	 * @param type Event type(s) to listen for; may be strings or extension events
	 * @param listener Callback to handle the event when it fires
	 * @return A handle which will remove the listener when destroy is called
	 *
	 * @example
	 * dom.delegate(document.body, 'li', 'click', function () {
	 *     // ...
	 * });
	 *
	 * @example
	 * dom.delegate(document.body, 'li', ['click', 'mouseover'], function () {
	 *     // ...
	 * });
	 */
	export default function delegate(target: HTMLElement, selector: string, type: string, listener: (event: UIEvent) => void): Handle;
	export default function delegate(target: HTMLElement, selector: string, type: string[], listener: (event: UIEvent) => void): Handle;

}
declare module 'dojo-dom/interfaces' {
	export interface CreateArgs {
		[key: string]: string | { [key: string]: string };
		attributes?: { [key: string]: string };
	}

	export interface CreateFunction {
		// These signatures are largely based on dom.generated.d.ts, minus obsolete tags.
		(tagName: 'a', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLAnchorElement;
		(tagName: 'abbr', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
		(tagName: 'acronym', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
		(tagName: 'address', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLBlockElement;
		(tagName: 'area', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLAreaElement;
		(tagName: 'audio', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLAudioElement;
		(tagName: 'b', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
		(tagName: 'base', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLBaseElement;
		(tagName: 'bdo', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
		(tagName: 'big', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
		(tagName: 'blockquote', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLBlockElement;
		(tagName: 'body', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLBodyElement;
		(tagName: 'br', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLBRElement;
		(tagName: 'button', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLButtonElement;
		(tagName: 'canvas', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLCanvasElement;
		(tagName: 'caption', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLTableCaptionElement;
		(tagName: 'center', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLBlockElement;
		(tagName: 'cite', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
		(tagName: 'code', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
		(tagName: 'col', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLTableColElement;
		(tagName: 'colgroup', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLTableColElement;
		(tagName: 'datalist', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLDataListElement;
		(tagName: 'dd', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLDDElement;
		(tagName: 'del', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLModElement;
		(tagName: 'dfn', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
		(tagName: 'div', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLDivElement;
		(tagName: 'dl', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLDListElement;
		(tagName: 'dt', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLDTElement;
		(tagName: 'em', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
		(tagName: 'embed', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLEmbedElement;
		(tagName: 'fieldset', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLFieldSetElement;
		(tagName: 'font', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLFontElement;
		(tagName: 'form', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLFormElement;
		(tagName: 'h1', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLHeadingElement;
		(tagName: 'h2', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLHeadingElement;
		(tagName: 'h3', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLHeadingElement;
		(tagName: 'h4', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLHeadingElement;
		(tagName: 'h5', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLHeadingElement;
		(tagName: 'h6', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLHeadingElement;
		(tagName: 'head', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLHeadElement;
		(tagName: 'hr', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLHRElement;
		(tagName: 'i', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
		(tagName: 'iframe', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLIFrameElement;
		(tagName: 'img', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLImageElement;
		(tagName: 'input', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLInputElement;
		(tagName: 'ins', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLModElement;
		(tagName: 'isindex', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLIsIndexElement;
		(tagName: 'kbd', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
		(tagName: 'keygen', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLBlockElement;
		(tagName: 'label', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLLabelElement;
		(tagName: 'legend', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLLegendElement;
		(tagName: 'li', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLLIElement;
		(tagName: 'link', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLLinkElement;
		(tagName: 'map', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLMapElement;
		(tagName: 'menu', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLMenuElement;
		(tagName: 'meta', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLMetaElement;
		(tagName: 'nobr', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
		(tagName: 'object', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLObjectElement;
		(tagName: 'ol', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLOListElement;
		(tagName: 'optgroup', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLOptGroupElement;
		(tagName: 'option', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLOptionElement;
		(tagName: 'p', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLParagraphElement;
		(tagName: 'param', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLParamElement;
		(tagName: 'pre', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPreElement;
		(tagName: 'progress', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLProgressElement;
		(tagName: 'q', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLQuoteElement;
		(tagName: 'rt', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
		(tagName: 'ruby', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
		(tagName: 's', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
		(tagName: 'samp', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
		(tagName: 'script', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLScriptElement;
		(tagName: 'select', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLSelectElement;
		(tagName: 'small', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
		(tagName: 'source', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLSourceElement;
		(tagName: 'span', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLSpanElement;
		(tagName: 'strong', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
		(tagName: 'style', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLStyleElement;
		(tagName: 'sub', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
		(tagName: 'sup', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
		(tagName: 'table', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLTableElement;
		(tagName: 'tbody', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLTableSectionElement;
		(tagName: 'td', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLTableDataCellElement;
		(tagName: 'textarea', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLTextAreaElement;
		(tagName: 'tfoot', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLTableSectionElement;
		(tagName: 'th', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLTableHeaderCellElement;
		(tagName: 'thead', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLTableSectionElement;
		(tagName: 'title', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLTitleElement;
		(tagName: 'tr', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLTableRowElement;
		(tagName: 'track', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLTrackElement;
		(tagName: 'tt', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
		(tagName: 'u', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
		(tagName: 'ul', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLUListElement;
		(tagName: 'var', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLPhraseElement;
		(tagName: 'video', kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLVideoElement;
		(tagName: string, kwArgs?: CreateArgs, children?: (Node | string)[]): HTMLElement;
	}

}
declare module 'dojo-dom/dom' {
	import { CreateFunction } from 'dojo-dom/interfaces';
	/**
	 * Adds one or more CSS class names to an HTMLElement, without duplication.
	 *
	 * @param element The Element to which to add CSS classes
	 * @param classes One or more CSS class strings to add to the Element
	 *
	 * @example
	 * dom.addClass(document.body, 'loaded');
	 *
	 * @example
	 * dom.addClass(document.body, 'loaded', 'ready');
	 */
	export function addClass(element: HTMLElement, ...classes: string[]): void;
	/**
	 * Applies CSS classes to the root element if the specified has features have truthy values.
	 *
	 * @param features One or more features to test and potentially apply CSS classes based on
	 */
	export function applyFeatureClass(...features: string[]): void;
	/**
	 * Retrieves an element from the document by its ID attribute.
	 *
	 * @param id ID to match in the DOM
	 * @return the element with a matching ID attribute if found, otherwise null
	 *
	 * @example
	 * var element = dom.byId('anElement');
	 */
	export function byId(id: string): HTMLElement;
	/**
	 * Indicates whether the given parent contains the given node.
	 * @param parent The parent node to check within
	 * @param node The node to test whether parent is its ancestor
	 * @return `true` if parent contains node, `false` otherwise
	 */
	export function contains(parent: Element, node: Node): boolean;
	export let create: CreateFunction;
	/**
	 * Determines whether an HTMLElement has a given CSS class name.
	 *
	 * @param element The Element to check for a CSS class
	 * @param className The CSS class name to check for
	 *
	 * @example
	 * var hasLoaded = dom.containsClass(document.body, 'loaded');
	 */
	export function containsClass(element: HTMLElement, className: string): boolean;
	/**
	 * Creates a DocumentFragment from a string.
	 *
	 * @param html string representation of nodes to create
	 * @return DocumentFragment containing childNodes based on html string
	 *
	 * @example
	 * var fragment = dom.fromString('<div></div>');
	 *
	 * @example
	 * var fragment = dom.fromString('<div></div><span></span>');
	 *
	 * @example
	 * var fragment = dom.fromString('<tr>');
	 */
	export function fromString(html: string): DocumentFragment;
	export enum Position {
	    After = 0,
	    Before = 1,
	    FirstIn = 2,
	    LastIn = 3,
	    Replace = 4,
	}
	/**
	 * Places a node in the DOM relative to another node.
	 *
	 * @param node The node to place in the DOM
	 * @param position The position to place the node, relative to relativeElement
	 * @param relativeElement The node to use as a reference when placing
	 *
	 * @example
	 * dom.place(node, dom.Position.After, anotherNode);
	 */
	export function place(node: Node, position: Position, relativeElement: Element): void;
	/**
	 * Removes a node from the DOM.
	 *
	 * @param node The node to remove
	 */
	export function remove(node: Node): void;
	/**
	 * Removes all instances of one ore more CSS class names from an HTMLElement.
	 *
	 * @param element The Element from which to remove CSS classes
	 * @param classes An array of string CSS classes to remove from the Element
	 *
	 * @example
	 * dom.removeClass(document.body, 'loading');
	 *
	 * @example
	 * dom.removeClass(document.body, 'loading', 'pending');
	 */
	export function removeClass(element: HTMLElement, ...classes: string[]): void;
	/**
	 * Toggles the presence of a CSS class name on an HTMLElement. An optional
	 * second parameter can be used to force class addition or removal.
	 *
	 * @param element The Element to add or remove classes to or from
	 * @param className The CSS class name add or remove
	 * @param force Forces either class addition if true or class removal if false
	 *
	 * @example
	 * dom.toggleClass(button, 'active');
	 *
	 * @example
	 * dom.toggleClass(button, 'active', isActive);
	 */
	export function toggleClass(element: HTMLElement, className: string, force?: boolean): boolean;

}
declare module 'dojo-dom/form' {
	export type FormValue = {
	    [key: string]: any;
	};
	/**
	 * Fills in a DOM form using values from a JavaScript object.
	 * Note that fields not specified in the value object will be cleared.
	 *
	 * @param form The DOM form to set values in
	 * @param object An object containing values for each field in the form
	 *
	 * @example
	 * let formNode = document.getElementById('aForm');
	 * form.fromObject(formNode, { firstName: 'foo', lastName: 'bar' });
	 */
	export function fromObject(form: HTMLFormElement, object: FormValue): void;
	/**
	 * Serializes the values of a DOM form into a JavaScript object.
	 *
	 * @param form The DOM form to get values from
	 * @returns An object mapping the name of each form field to its value(s)
	 *
	 * @example
	 * let formNode = document.getElementById('aForm');
	 * let values = form.toObject(formNode);
	 * console.log(values.firstName); // 'foo'
	 */
	export function toObject(form: HTMLFormElement): FormValue;

}
declare module 'dojo-dom/main' {
	export function main(): {};

}
declare module 'dojo-dom/schedule' {
	import { Handle } from 'dojo-core/interfaces';
	/**
	 * Schedules a read operation.
	 *
	 * @param callback A function containing read operations to schedule
	 * @return A handle that can be used to cancel the operation
	 */
	export function read(callback: (...args: any[]) => void): Handle;
	/**
	 * Schedules a write operation. Scheduled write operations will run after any scheduled read operations.
	 *
	 * @param callback A function containing write operations to schedule
	 * @return A handle that can be used to cancel the operation
	 */
	export function write(callback: (...args: any[]) => void): Handle;

}
