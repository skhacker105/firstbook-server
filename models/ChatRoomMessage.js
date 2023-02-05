const MONGOOSE = require('mongoose');

const STRING = MONGOOSE.Schema.Types.String;
const OBJECT_ID = MONGOOSE.Schema.Types.ObjectId;

const CHATROOMMESSAGE_SCHEMA = MONGOOSE.Schema({
    message: { type: STRING, required: true },
    room: { type: OBJECT_ID, ref: 'Chatroom' }
});

CHATROOMMESSAGE_SCHEMA.index({
    message: 'text'
});

CHATROOMMESSAGE_SCHEMA.index({
    room: 1
});

const CHATROOMMESSAGE = MONGOOSE.model('ChatroomMessage', CHATROOMMESSAGE_SCHEMA);

module.exports = CHATROOMMESSAGE;