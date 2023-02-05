const MONGOOSE = require('mongoose');

const STRING = MONGOOSE.Schema.Types.String;
const DATE = MONGOOSE.Schema.Types.Date;
const NUMBER = MONGOOSE.Schema.Types.Number;
const OBJECT_ID = MONGOOSE.Schema.Types.ObjectId;

const CONTACT_SCHEMA = MONGOOSE.Schema({
    title: { type: STRING },
    firstName: { type: STRING, required: true },
    lastName: { type: STRING, default: '' },
    type: { type: STRING, required: true },
    contact1: { type: STRING, default: '' },
    contact2: { type: STRING, default: '' },
    address: { type: STRING, default: '' },
    appUserId: { type: OBJECT_ID, ref: 'User' },
    createdBy: { type: OBJECT_ID, ref: 'User' },
    creationDate: { type: DATE, default: Date.now },
    currentRating: { type: NUMBER, default: 0 },
    ratingPoints: { type: NUMBER, default: 0 },
    ratedCount: { type: NUMBER, default: 0 },
    ratedBy: [{ type: OBJECT_ID, ref: 'User' }],
    comments: [{ type: OBJECT_ID, ref: 'Comment' }]
});

CONTACT_SCHEMA.index({
    firstName: 'text',
    lastName: 'text',
    type: 'text'
});
CONTACT_SCHEMA.index({
    createdBy: 1
});

const CONTACT = MONGOOSE.model('Contact', CONTACT_SCHEMA);

module.exports = CONTACT;