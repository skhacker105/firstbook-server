const EXPRESS = require('express');

const CONFIG = require('./config/config');

const PORT = 8000;
let env = 'production';

const APP = EXPRESS();

require('./config/database.config')(CONFIG[env]);
require('./config/express')(APP);
require('./config/routes')(APP);

const SERVER = APP.listen(PORT);
console.log(`Server is listening on port ${PORT}`);