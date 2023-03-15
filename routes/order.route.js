const AUTH = require('../config/auth');
const ORDER_CONTROLLER = require('../controllers/order');

module.exports = (APP) => {

    APP.get('/order/getOrders', AUTH.isAuth, ORDER_CONTROLLER.getOrders);
    APP.post('/order/placeOrder', AUTH.isAuth, ORDER_CONTROLLER.placeOrder);
    APP.post('/order/savePaymentInformation/:orderId', AUTH.isAuth, ORDER_CONTROLLER.savePaymentInformation);
    
}