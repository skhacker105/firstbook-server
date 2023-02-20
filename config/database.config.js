const MONGOOSE = require('mongoose');

MONGOOSE.Promise = global.Promise;

module.exports = () => {
    MONGOOSE.connect(process.env.connectionString,
        { useNewUrlParser: true, useUnifiedTopology: true },
        () => {
            console.log('Connected to MongoDB');
        });

    let db = MONGOOSE.connection;

    db.on('open', (err) => {
        if (err) {
            throw err;
        }

        console.log('MongoDB is ready!');
    });

    require('../models/User');
    require('../models/Role').init();
    require('../models/Receipt');
    require('../models/Comment');
    require('../models/Image');
    require('../models/Contact');
    require('../models/Product');
    require('../models/Productspec');
    require('../models/ChatRoom');
    require('../models/ChatRoomMessage');
    require('../models/Catalog');
};