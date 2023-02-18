const AUTH = require('../config/auth');
const CATALOG_CONTROLLER = require('../controllers/catalog');

module.exports = (APP) => {

    // CATALOG
    APP.get('/product/catalog/getSingle/:catalogId', CATALOG_CONTROLLER.getSingle);
    APP.get('/product/catalog/search', CATALOG_CONTROLLER.search);
    APP.post('/product/catalog/add', AUTH.isAuth, CATALOG_CONTROLLER.add);
    APP.put('/product/catalog/edit/:catalogId', AUTH.isAuth, CATALOG_CONTROLLER.edit);
    APP.delete('/product/catalog/delete/:catalogId', AUTH.isAuth, CATALOG_CONTROLLER.delete);
}