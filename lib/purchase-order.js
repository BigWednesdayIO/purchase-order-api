'use strict';

require('dotenv').config();

const sendSMS = require('./send-sms.js');
const sendEmail = require('./send-email.js');
const purchaseOrderBuilder = require('./purchase-order-builder.js');

module.exports = data => {
	let actions = [];

	let sendingEmail = purchaseOrderBuilder
		.buildHtml(data)
		.then(html => {
			return purchaseOrderBuilder
				.buildPdf(html)
				.then(pdf => {
					return sendEmail(data, html, pdf);
				});
		});

	actions.push(sendingEmail);

	if (data.supplier.orders_textsms) {
		let sendingSMS = sendSMS(data.order, data.supplier.orders_textsms);
		actions.push(sendingSMS);
	}

	return Promise.all(actions)
		.catch(err => {
			 throw new Error(err);
		});
};
