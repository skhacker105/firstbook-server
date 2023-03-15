const MONGOOSE = require('mongoose');

const STRING = MONGOOSE.Schema.Types.String;
const DATE = MONGOOSE.Schema.Types.Date;
const NUMBER = MONGOOSE.Schema.Types.Number;
const OBJECT_ID = MONGOOSE.Schema.Types.ObjectId;
const BOOLEAN = MONGOOSE.Schema.Types.Boolean;

const PAYMENT_SCHEMA = MONGOOSE.Schema({
    mode: { type: STRING, required: true },
    displayText: { type: STRING, required: true },
    intent: { type: STRING, required: true },
    cost: { type: NUMBER, required: true },
    order: { type: OBJECT_ID, ref: 'Order'},
    createdBy: { type: OBJECT_ID, ref: 'User' },
    creationDate: { type: DATE, default: DATE.now }
});

PAYMENT_SCHEMA.index({
    mode: 'text',
    displayText: 'text',
    intent: 'text'
});

PAYMENT_SCHEMA.index({
    createdBy: 1
});


const PAYMENT = MONGOOSE.model('Payment', PAYMENT_SCHEMA);

module.exports = PAYMENT;