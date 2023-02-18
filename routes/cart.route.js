const AUTH = require('../config/auth');
const CART_CONTROLLER = require('../controllers/cart');

module.exports = (APP) => {

    // CART
    APP.get('/cart/getSize', AUTH.isAuth, CART_CONTROLLER.getCartSize);
    APP.get('/user/cart', AUTH.isAuth, CART_CONTROLLER.getCart);
    APP.post('/user/cart/checkout', AUTH.isAuth, CART_CONTROLLER.checkout);
    APP.post('/user/cart/add/:bookId', AUTH.isAuth, CART_CONTROLLER.addToCart);
    APP.delete('/user/cart/delete/:bookId', AUTH.isAuth, CART_CONTROLLER.removeFromCart);
}