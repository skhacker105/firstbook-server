const MONGOOSE = require('mongoose');

const STRING = MONGOOSE.Schema.Types.String;
const DATE = MONGOOSE.Schema.Types.Date;
const NUMBER = MONGOOSE.Schema.Types.Number;
const OBJECT_ID = MONGOOSE.Schema.Types.ObjectId;
const BOOLEAN = MONGOOSE.Schema.Types.Boolean;

const PRODUCTSPEC_SCHEMA = MONGOOSE.Schema({
    productId: { type: OBJECT_ID, ref: 'Products' },
    category: { type: STRING, required: true },
    name: { type: STRING, required: true },
    value: { type: STRING, default: '' },
    isImportant: { type: BOOLEAN},
    createdBy: { type: OBJECT_ID, ref: 'User' },
    creationDate: { type: DATE, default: Date.now }
});

PRODUCTSPEC_SCHEMA.index({
    category: 'text',
    name: 'text'
});
PRODUCTSPEC_SCHEMA.index({
    createdBy: 1
});
PRODUCTSPEC_SCHEMA.index({
    productId: 1
});

const PRODUCTSPEC = MONGOOSE.model('Productspec', PRODUCTSPEC_SCHEMA);

module.exports = PRODUCTSPEC;