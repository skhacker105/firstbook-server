const AUTH = require('../config/auth');
const COMMENT_CONTROLLER = require('../controllers/comment');

module.exports = (APP) => {

    // COMMENTS
    APP.get('/comment/getLatestFiveByUser/:userId', AUTH.isAuth, COMMENT_CONTROLLER.getLatestFiveByUser);
}