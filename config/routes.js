const ERROR_CONTROLLER = require('../controllers/error');

module.exports = (APP) => {
    // Health Check
    APP.get('/', (req, res) => res.send('OK'));

    // Other module routes
    require('../routes/user.route')(APP);
    require('../routes/cart.route')(APP);
    require('../routes/book.route')(APP);
    require('../routes/contact.route')(APP);
    require('../routes/product.route')(APP);
    require('../routes/comment.route')(APP);
    require('../routes/catalog.route')(APP);
    require('../routes/cahtroom.route')(APP);


    APP.all('*', ERROR_CONTROLLER.error);
};