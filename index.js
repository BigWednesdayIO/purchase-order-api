var Handlebars = require('handlebars');
var fs = require('fs');
var FormData = require('form-data');
var html5pdf = require("html5-to-pdf");

var data = {
	order: require('./mocks/order-form.json'),
	membership: require('./mocks/membership.json')
};

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

function sendEmail (html, pdf) {
	var form = new FormData();
	form.append('html', html);
	form.append('files[purchase-order.pdf]', pdf);

	var path = '/api/mail.send.json';
	var params = {
		api_user: 'bigwednesday_testing',
		api_key: 'sv_penguin666',
		to: 'michael@mstrutt.co.uk',
		from: 'michael@bigwednesday.io',
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
	});
});
