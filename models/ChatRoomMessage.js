const MONGOOSE = require('mongoose');

const STRING = MONGOOSE.Schema.Types.String;
const OBJECT_ID = MONGOOSE.Schema.Types.ObjectId;
const DATE = MONGOOSE.Schema.Types.Date;
const BOOLEAN = MONGOOSE.Schema.Types.Boolean;

const CHATROOMMESSAGE_SCHEMA = MONGOOSE.Schema({
    room: { type: OBJECT_ID, ref: 'Chatroom', required: true },
    roomKey: { type: STRING, required: true },
    message: { type: STRING, required: true },
    type: { type: STRING, required: true },
    creationDate: { type: DATE, default: Date.now },
    replyOf: [{ type: OBJECT_ID, ref: 'ChatroomMessage' }],
    isDeleted: { type: BOOLEAN }
});

CHATROOMMESSAGE_SCHEMA.index({
    message: 'text',
    roomKey: 'text'
});

CHATROOMMESSAGE_SCHEMA.index({
    room: 1
});

const CHATROOMMESSAGE = MONGOOSE.model('ChatroomMessage', CHATROOMMESSAGE_SCHEMA);

module.exports = CHATROOMMESSAGE;