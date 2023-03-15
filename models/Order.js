const MONGOOSE = require('mongoose');

const STRING = MONGOOSE.Schema.Types.String;
const DATE = MONGOOSE.Schema.Types.Date;
const NUMBER = MONGOOSE.Schema.Types.Number;
const OBJECT_ID = MONGOOSE.Schema.Types.ObjectId;
const BOOLEAN = MONGOOSE.Schema.Types.Boolean;

const ORDER_ADDRESS_SCHEMA = MONGOOSE.Schema({
    address: { type: STRING, required: true },
    contact: { type: STRING, required: true },
    name: { type: STRING, required: true }
});

const ORDER_STATUS_SCHEMA = MONGOOSE.Schema({
    status: { type: STRING, reqired: true },
    createdBy: { type: STRING },
    creationDate: { type: DATE, default: Date.now }
});

const ORDER_PAYMENT_STATUS_SCHEMA = MONGOOSE.Schema({
    status: { type: STRING, reqired: true },
    createdBy: { type: STRING },
    creationDate: { type: DATE, default: Date.now }
});

const ORDER_SCHEMA = MONGOOSE.Schema({
    totalPrice: { type: STRING, reqired: true },
    products: [{ type: OBJECT_ID, ref: 'OrderProduct' }],
    billingAddress: { type: ORDER_ADDRESS_SCHEMA },
    shippingAddress: { type: ORDER_ADDRESS_SCHEMA },
    paymentInformation: {type: OBJECT_ID, ref: 'Payment'},
    currentStatus: { type: ORDER_STATUS_SCHEMA, reqired: true },
    statusHistory: [{ type: ORDER_STATUS_SCHEMA }],
    currentPaymentStatus: { type: ORDER_PAYMENT_STATUS_SCHEMA, reqired: true },
    paymentStatusHistory: [{ type: ORDER_PAYMENT_STATUS_SCHEMA }],
    createdBy: { type: STRING },
    creationDate: { type: DATE, default: Date.now }
});

ORDER_SCHEMA.index({
    createdBy: 1
});

const ORDER = MONGOOSE.model('Order', ORDER_SCHEMA);

module.exports = ORDER;