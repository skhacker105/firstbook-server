require('dotenv').config();
const EXPRESS = require('express');
const APP = EXPRESS();
const PORT = 8000;

require('./config/database.config')();
require('./config/express')(APP);
require('./config/routes')(APP);

const SERVER = APP.listen(PORT);
console.log(`Server is listening on port ${PORT}`);