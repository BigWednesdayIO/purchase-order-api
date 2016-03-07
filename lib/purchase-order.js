'use strict';

require('dotenv').config();
const Handlebars = require('handlebars');
const fs = require('fs');
const html5pdf = require("html5-to-pdf");

const sendSMS = require('./send-sms.js');
const sendEmail = require('./send-email.js');

// Handlebars helpers

require('./handlebars-helper-currency.js')(Handlebars);
require('./handlebars-helper-date.js')(Handlebars);

const templateHtml = fs.readFileSync('./template.html', 'utf-8');
const template = Handlebars.compile(templateHtml);

module.exports = data => {
	const html = template(data);

	fs.writeFile('./build/purchase-order.html', html);

	html5pdf({
		cssPath: './pdf.css'
	}).from.string(html).to('./build/purchase-order.pdf', function () {
		console.log('PDF Created');

		const pdf = fs.createReadStream('./build/purchase-order.pdf');

		// Send Email
		sendEmail(data, html, pdf);

		// Send SMS
		if (data.supplier.orders_textsms) {
			sendSMS(data.order, data.supplier.orders_textsms);
		}
	});
};
