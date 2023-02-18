const AUTH = require('../config/auth');
const USER_CONTROLLER = require('../controllers/user');

module.exports = (APP) => {

    // USER
    APP.get('/user/search', USER_CONTROLLER.search);
    APP.get('/user/purchaseHistory', AUTH.isAuth, USER_CONTROLLER.getPurchaseHistory);
    APP.get('/user/profile/:username', AUTH.isAuth, USER_CONTROLLER.getProfile);
    APP.post('/user/register', USER_CONTROLLER.register);
    APP.post('/user/login', USER_CONTROLLER.login);
    APP.post('/user/profile/', AUTH.isAuth, USER_CONTROLLER.updateProfile);
    APP.post('/user/changeAvatar', AUTH.isAuth, USER_CONTROLLER.changeAvatar);
    APP.post('/user/blockComments/:userId', AUTH.isInRole('Admin'), USER_CONTROLLER.blockComments);
    APP.post('/user/unlockComments/:userId', AUTH.isInRole('Admin'), USER_CONTROLLER.unblockComments);
    APP.post('/user/verifyAndSendOTP', USER_CONTROLLER.verifyAndSendOTP);
    APP.post('/user/verifyOTP/:userId', USER_CONTROLLER.verifyOTP);
    APP.post('/user/resetPassword/:userId', USER_CONTROLLER.resetPassword);
}