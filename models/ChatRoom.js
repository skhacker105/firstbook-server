const MONGOOSE = require('mongoose');

const STRING = MONGOOSE.Schema.Types.String;
const OBJECT_ID = MONGOOSE.Schema.Types.ObjectId;
const BOOLEAN = MONGOOSE.Schema.Types.Boolean;

const CHATROOM_SCHEMA = MONGOOSE.Schema({
    name: { type: STRING, required: true },
    user: { type: OBJECT_ID, ref: 'User' },
    roomKey: { type: STRING, required: true },
    inactive: { type: BOOLEAN }
});

CHATROOM_SCHEMA.index({
    name: 'text'
});

CHATROOM_SCHEMA.index({
    user: 1
});

const CHATROOM = MONGOOSE.model('Chatroom', CHATROOM_SCHEMA);

module.exports = CHATROOM;