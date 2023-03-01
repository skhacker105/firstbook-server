const MONGOOSE = require('mongoose');

const STRING = MONGOOSE.Schema.Types.String;
const DATE = MONGOOSE.Schema.Types.Date;
const NUMBER = MONGOOSE.Schema.Types.Number;
const OBJECT_ID = MONGOOSE.Schema.Types.ObjectId;
const BOOLEAN = MONGOOSE.Schema.Types.Boolean;

const CATALOGCONFIG_SCHEMA = MONGOOSE.Schema({
    useBanner: { type: BOOLEAN },
    useTitleBar: { type: BOOLEAN },
    banner: { type: OBJECT_ID, ref: 'Image' },
    address: { type: STRING },
    contact: { type: STRING },
    email: { type: STRING },
});

const CATALOGPRODUCT_SCHEMA = MONGOOSE.Schema({
    product: { type: OBJECT_ID, required: true, ref: 'Product' },
    name: { type: STRING, required: true },
    cost: { type: NUMBER, required: true }
});

const CATALOG_SCHEMA = MONGOOSE.Schema({
    name: { type: STRING, required: true },
    products: [{ type: CATALOGPRODUCT_SCHEMA, required: true }],
    createdDate: { type: DATE, default: Date.now },
    createdBy: { type: OBJECT_ID, required: true, ref: 'User' },
    isDeleted: { type: BOOLEAN },
    config: { type: CATALOGCONFIG_SCHEMA }
});


CATALOG_SCHEMA.index({
    name: 'text'
});
CATALOG_SCHEMA.index({
    createdBy: 1
});

const CATALOG = MONGOOSE.model('Catalog', CATALOG_SCHEMA);

module.exports = CATALOG;