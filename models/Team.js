const MONGOOSE = require('mongoose');

const STRING = MONGOOSE.Schema.Types.String;
const DATE = MONGOOSE.Schema.Types.Date;
const NUMBER = MONGOOSE.Schema.Types.Number;
const OBJECT_ID = MONGOOSE.Schema.Types.ObjectId;
const BOOLEAN = MONGOOSE.Schema.Types.Boolean;

const TEAM_SCHEMA = MONGOOSE.Schema({
    name: { type: STRING, required: true },
    members: [{
        user: { type: OBJECT_ID, ref: 'User' },
        role: { type: STRING, required: true, enum: ['employee', 'admin'], default: 'employee' },
    }],
});

const TEAM = MONGOOSE.model('Team', TEAM_SCHEMA);

module.exports = TEAM;