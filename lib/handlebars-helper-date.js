'use strict';

module.exports = Handlebars => {
	Handlebars.registerHelper('date', datestring => {
		const zeroPrefix = number => (number < 10 ? '0' : '') + number;

		let date = new Date(datestring);
		let year = date.getFullYear();
		let month = zeroPrefix(date.getMonth() + 1);
		let day = zeroPrefix(date.getDate());

		return day + '/' + month + '/' + year;
	});	
};
