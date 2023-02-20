const AUTH = require('../config/auth');
const CART_CONTROLLER = require('../controllers/cart');

module.exports = (APP) => {

    // CART
    APP.post('/user/cart/checkout', AUTH.isAuth, CART_CONTROLLER.checkout);
}