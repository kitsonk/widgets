export * from 'dojo-core/has';
import has, { add } from 'dojo-core/has';
import global from 'dojo-core/global';

add('dom-requestanimationframe', 'requestAnimationFrame' in global);

add('dom-classlist', 'document' in global && 'classList' in document.documentElement);

export function load(resourceId: string, require: DojoLoader.Require, load: (value?: any) => void, config?: Object): void {
	if (resourceId) {
		require([ resourceId ], load);
	}
	else {
		load();
	}
}

export function normalize(moduleId: string, normalize: (moduleId: string) => string): string {
	const tokens = moduleId.match(/[\?:]|[^:\?]*/g);
	let i = 0;

	function get(skip?: boolean): string {
		const term = tokens[i++];
		if (term === ':') {
			return '';
		}
		else {
			if (tokens[i++] === '?') {
				if (!skip && has(term)) {
					return get();
				}
				else {
					get(true);
					return get(skip);
				}
			}
			return term || '';
		}
	}
	moduleId = get();
	return moduleId && normalize(moduleId);
}

export default has;
