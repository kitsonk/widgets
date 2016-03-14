/// <reference path="../node_modules/dojo-core/typings/dojo-core/dojo-core-2.0.0-pre.d.ts" />
/// <reference path="../node_modules/dojo-core/typings/symbol-shim/symbol-shim.d.ts" />
/// <reference path="../node_modules/dojo-compose/typings/dojo-compose/dojo-compose-2.0.0-pre.d.ts" />
/// <reference path="../node_modules/dojo-loader/typings/dojo-loader/dojo-loader-2.0.0-beta.1.d.ts" />
/// <reference path="../node_modules/reflect-metadata/reflect-metadata.d.ts" />
/// <reference path="../node_modules/@reactivex/rxjs/typings/es6-shim/es6-shim.d.ts" />
/// <reference path="../tests/typings/node/node.d.ts" />
/// <reference path="../node_modules/immutable/dist/immutable.d.ts" />

declare module 'immutable/immutable' {
	export = Immutable;
}

declare module 'maquette/maquette' {
	import * as maquette from 'node_modules/maquette/dist/maquette';
	export = maquette;
}

declare module 'rxjs/Rx' {
	import * as Rx from 'node_modules/@reactivex/rxjs/dist/cjs/Rx';
	export = Rx;
}
