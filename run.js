'use strict';

require('dotenv').config();
const purchaseOrder = require('./lib/purchase-order.js');

let data = {
	order: require('./mocks/order-form.json'),
	membership: require('./mocks/membership.json'),
	supplier: require('./mocks/supplier.json')
};

const SUPPLIER_EMAIL = process.env.SUPPLIER_EMAIL;
const SUPPLIER_MOBILE = process.env.SUPPLIER_MOBILE;

if (SUPPLIER_EMAIL) {
	data.supplier.orders_email = process.env.SUPPLIER_EMAIL;
}

if (SUPPLIER_MOBILE) {
	data.supplier.orders_textsms = process.env.SUPPLIER_MOBILE;
}

purchaseOrder(data);
