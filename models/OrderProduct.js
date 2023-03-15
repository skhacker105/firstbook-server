const MONGOOSE = require('mongoose');

const STRING = MONGOOSE.Schema.Types.String;
const DATE = MONGOOSE.Schema.Types.Date;
const NUMBER = MONGOOSE.Schema.Types.Number;
const OBJECT_ID = MONGOOSE.Schema.Types.ObjectId;
const BOOLEAN = MONGOOSE.Schema.Types.Boolean;


const ORDERPRODUCT_SCHEMA = MONGOOSE.Schema({
    product: { type: OBJECT_ID, ref: 'Product', required: true },
    order: { type: OBJECT_ID, ref: 'Order'},
    cost: { type: NUMBER, required: true },
    count: { type: NUMBER, required: true },
    createdBy: { type: OBJECT_ID, ref: 'User' },
    creationDate: { type: DATE, default: Date.now }
});

ORDERPRODUCT_SCHEMA.index({
    createdBy: 1
});

const ORDERPRODUCT = MONGOOSE.model('OrderProduct', ORDERPRODUCT_SCHEMA);

module.exports = ORDERPRODUCT;