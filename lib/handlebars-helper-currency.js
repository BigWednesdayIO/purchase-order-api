'use strict';

module.exports = Handlebars => {
	Handlebars.registerHelper('currency', function(amount) {
		if (typeof amount === 'undefined') {
			return '£0.00';
		}
		return '£' + amount.toFixed(2);
	});
};
