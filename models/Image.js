const MONGOOSE = require('mongoose');

const STRING = MONGOOSE.Schema.Types.String;
const DATE = MONGOOSE.Schema.Types.Date;
const OBJECT_ID = MONGOOSE.Schema.Types.ObjectId;

const IMAGE_SCHEMA = MONGOOSE.Schema({
    resourceType: { type: STRING, required: true },
    resourceId: { type: OBJECT_ID, ref: 'Product' },
    imagePath: { type: STRING, default: '' },
    createdBy: { type: OBJECT_ID, ref: 'User' },
    creationDate: { type: DATE, default: Date.now }
});

IMAGE_SCHEMA.index({
    resourceType: 'text',
    resourceId: 1
});
IMAGE_SCHEMA.index({
    createdBy: 1
});

const IMAGE = MONGOOSE.model('Image', IMAGE_SCHEMA);

module.exports = IMAGE;