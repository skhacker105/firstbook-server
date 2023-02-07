const EXPRESS = require('express');
const CORS = require('cors');
const LOGGER = require('../middleware/logger');
const PASSPORT = require('passport');
const PATH = require('path');
const MULTER = require('multer');
const UPLOAD = MULTER();
const REGISTER_STRATEGY = require('./passport').localRegister();
const LOGIN_STRATEGY = require('./passport').localLogin();

module.exports = (APP) => {
    APP.use(CORS());
    APP.use(LOGGER.log);
    // APP.use('/images', EXPRESS.static(PATH.join('images')));
    APP.use(EXPRESS.json());
    APP.use(UPLOAD.array()); 
    APP.use(EXPRESS.static('public'));
    APP.use(EXPRESS.urlencoded({ extended: true }));
    APP.use(PASSPORT.initialize());
    // APP.use((req, res, next) => {
    //     res.append('Access-Control-Allow-Origin' , 'http://localhost:4200');
    //     res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    //     res.append("Access-Control-Allow-Headers", "Origin, Accept,Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    //     res.append('Access-Control-Allow-Credentials', true);
    //     next();
    // });
    PASSPORT.use('local-register', REGISTER_STRATEGY);
    PASSPORT.use('local-login', LOGIN_STRATEGY);
};