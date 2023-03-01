const EXPRESS = require('express');
const CORS = require('cors');
const LOGGER = require('../middleware/logger');
const PASSPORT = require('passport');
const PATH = require('path');
const MULTER = require('multer');
const REGISTER_STRATEGY = require('./passport').localRegister();
const LOGIN_STRATEGY = require('./passport').localLogin();
const fileSizeLimit = '50mb';
const UPLOAD = MULTER({limits: { fieldSize: 25 * 1024 * 1024 }});

module.exports = (APP) => {
    APP.use(CORS());
    APP.use(LOGGER.log);
    APP.use(EXPRESS.json());
    APP.use(UPLOAD.array()); 
    APP.use(EXPRESS.static('public'));
    APP.use(EXPRESS.json({limit: fileSizeLimit}));
    APP.use(EXPRESS.urlencoded({ extended: true, limit: fileSizeLimit }));
    APP.use(EXPRESS.static(__dirname+'/public'));
    APP.use(PASSPORT.initialize());
    PASSPORT.use('local-register', REGISTER_STRATEGY);
    PASSPORT.use('local-login', LOGIN_STRATEGY);
};