const AUTH = require('../config/auth');
const COMMENT_CONTROLLER = require('../controllers/comment');

module.exports = (APP) => {

    // COMMENTS
    APP.get('/comment/getLatestFiveByUser/:userId', AUTH.isAuth, COMMENT_CONTROLLER.getLatestFiveByUser);
    APP.get('/comment/:bookId/:skipCount', COMMENT_CONTROLLER.getComments);
    APP.post('/comment/add/:bookId', AUTH.isAuth, COMMENT_CONTROLLER.add);
    APP.put('/comment/edit/:commentId', AUTH.isAuth, COMMENT_CONTROLLER.edit);
    APP.delete('/comment/delete/:commentId', AUTH.isAuth, COMMENT_CONTROLLER.delete);
}