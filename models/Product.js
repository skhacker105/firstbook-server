const MONGOOSE = require('mongoose');

const STRING = MONGOOSE.Schema.Types.String;
const DATE = MONGOOSE.Schema.Types.Date;
const NUMBER = MONGOOSE.Schema.Types.Number;
const OBJECT_ID = MONGOOSE.Schema.Types.ObjectId;
const BOOLEAN = MONGOOSE.Schema.Types.Boolean;

const PRODUCTCLIENTCOST_SCHEMA = MONGOOSE.Schema({
    client: { type: OBJECT_ID, ref: 'Contact', required: true },
    cost: { type: NUMBER, required: true }
});

const PRODUCT_SCHEMA = MONGOOSE.Schema({
    name: { type: STRING, required: true },
    description: { type: STRING, default: '' },
    images: [{ type: STRING }],
    defaultImage: { type: STRING },
    disabled: { type: BOOLEAN, default: false },
    specifications: [{ type: OBJECT_ID, ref: 'Productspec' }],
    createdBy: { type: OBJECT_ID, ref: 'User' },
    creationDate: { type: DATE, default: Date.now },
    currentRating: { type: NUMBER, default: 0 },
    ratingPoints: { type: NUMBER, default: 0 },
    ratedCount: { type: NUMBER, default: 0 },
    ratedBy: [{ type: OBJECT_ID, ref: 'User' }],
    comments: [{ type: OBJECT_ID, ref: 'Comment' }],
    purchaseCost: { type: STRING },
    sellingCost: { type: STRING },
    clientCosts: [{ type: PRODUCTCLIENTCOST_SCHEMA }]
});

PRODUCT_SCHEMA.index({
    category: 'text',
    name: 'text',
    description: 'text'
});
PRODUCT_SCHEMA.index({
    createdBy: 1
});

const PRODUCT = MONGOOSE.model('Product', PRODUCT_SCHEMA);

module.exports = PRODUCT;