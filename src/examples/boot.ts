declare var require: DojoLoader.RootRequire;

require.config({
	baseUrl: '../../..',
	packages: [
		{ name: 'src', location: '_build/src' },
		{ name: 'tests', location: '_build/tests' },
		{ name: 'node_modules', location: '_build/node_modules' },
		{ name: 'dojo', location: 'node_modules/intern/node_modules/dojo' },
		{ name: 'dojo-compose', location: 'node_modules/dojo-compose' },
		{ name: 'dojo-core', location: 'node_modules/dojo-core' },
		{ name: 'immutable', location: 'node_modules/immutable/dist' },
		{ name: 'maquette', location: 'node_modules/maquette/dist' },
		{ name: 'rxjs', location: 'node_modules/@reactivex/rxjs/dist/amd' }
	],
	map: {
		'*': {
			'maquette/maquette': 'maquette/maquette.min',
			'immutable/immutable': 'immutable/immutable.min'
		}
	}
});

/* Requiring in the main module */
require([ 'src/examples/index' ], function () {});