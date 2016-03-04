require('dotenv').config();
var Handlebars = require('handlebars');
var fs = require('fs');
var FormData = require('form-data');
var html5pdf = require("html5-to-pdf");
var twilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

var data = {
	order: require('./mocks/order-form.json'),
	membership: require('./mocks/membership.json'),
	supplier: require('./mocks/supplier.json')
};

data.supplier.orders_email = process.env.SUPPLIER_EMAIL;
data.supplier.orders_textsms = process.env.SUPPLIER_MOBILE;

Handlebars.registerHelper('currency', function(amount) {
	if (typeof amount === 'undefined') {
		return '£0.00';
	}
	return '£' + amount.toFixed(2);
});

Handlebars.registerHelper('date', function(datestring) {
	function zeroPrefix (number) {
		return (number < 10 ? '0' : '') + number;
	}

	var date = new Date(datestring);
	var year = date.getFullYear();
	var month = zeroPrefix(date.getMonth() + 1);
	var day = zeroPrefix(date.getDate());

	return day + '/' + month + '/' + year;
});

function orderUrl () {
	var url = 'http://orderable-onboarding.surge.sh';
	return url + '/orders/' + data.order.id + '/';
}

function sendSMS (to) {
	twilioClient.sendMessage({
		to: to,
		from: process.env.TWILIO_NUMBER,
		body: 'New purchase order from ' + data.order.billing_address.company + ' for details see ' + orderUrl()
	}, function(err, responseData) {
		if (err) {
			console.error(err);
			return;
		}

		console.log(responseData.from);
		console.log(responseData.body);
	});
}

function sendEmail (html, pdf) {
	var form = new FormData();
	form.append('html', html);
	form.append('files[purchase-order.pdf]', pdf);

	var path = '/api/mail.send.json';
	var params = {
		api_user: process.env.SENDGRID_API_USER,
		api_key: process.env.SENDGRID_API_KEY,
		to: data.supplier.orders_email || data.supplier.email,
		from: 'orders@bigwednesday.io',
		subject: 'Purchase Order ' + data.order.id,
		text: 'New purchase order from ' + data.order.billing_address.company
	};

	var requestPath = path + '?' + Object.keys(params).map(function(key) {
		return key + '=' + encodeURIComponent(params[key]);
	}).join('&');

	form.submit({
		protocol: 'https:',
		host: 'api.sendgrid.com',
		path: requestPath
	}, function(err, res) {
		console.log(res.statusCode + ' - ' +res.statusMessage);
		res.on('data', function (chunk) {
			console.log('BODY: ' + chunk);
		});
		res.resume();
	});
}

fs.readFile('template.html', 'utf-8', function(error, source) {
	var template = Handlebars.compile(source);
	var html = template(data);

	fs.writeFile('./build/purchase-order.html', html);

	html5pdf({
		cssPath: './pdf.css'
	}).from.string(html).to('./build/purchase-order.pdf', function () {
		console.log('PDF Created');

		var pdf = fs.createReadStream('./build/purchase-order.pdf');

		// Send Email
		sendEmail(html, pdf);

		// Send SMS
		if (data.supplier.orders_textsms) {
			sendSMS(data.supplier.orders_textsms);
		}
	});
});
