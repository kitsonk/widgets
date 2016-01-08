import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import widgetFactory from 'src/widgetFactory';

registerSuite({
	name: 'widgetFactory',
	'basic'() {
		assert(widgetFactory);
	}
});
