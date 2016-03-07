'use strict';

require('dotenv').config();
const fs = require('fs');
const Handlebars = require('handlebars');
const html5pdf = require("html5-to-pdf");

// Handlebars helpers

require('./handlebars-helper-currency.js')(Handlebars);
require('./handlebars-helper-date.js')(Handlebars);

let cachedTemplate;
const getTemplate = () => {
	return new Promise((resolve, reject) => {
		if (cachedTemplate) {
			return resolve(cachedTemplate);
		}

		fs.readFile('./template.html', 'utf-8', (err, templateHtml) => {
			if (err) {
				return reject(err);
			}
			cachedTemplate = Handlebars.compile(templateHtml);
			return resolve(cachedTemplate);
		});
	});
};

const buildHtml = data => {
	return getTemplate()
		.then(template => {
			return template(data);
		});
};

const buildPdf = html => {
	return new Promise((resolve, reject) => {
		html5pdf({
			cssPath: './pdf.css'
		}).from.string(html).to.buffer(pdf => {
			console.log('PDF Created');
			return resolve(pdf);
		});
	});
};

module.exports = {
	buildHtml,
	buildPdf
};
