const AUTH = require('../config/auth');
const CATALOG_CONTROLLER = require('../controllers/catalog');

module.exports = (APP) => {

    // CATALOG
    APP.get('/catalog/usercatalogs', CATALOG_CONTROLLER.userCatalogs);
    APP.get('/catalog/getSingle/:catalogId', CATALOG_CONTROLLER.getSingle);
    APP.get('/catalog/search', CATALOG_CONTROLLER.search);
    APP.post('/catalog/add', AUTH.isAuth, CATALOG_CONTROLLER.add);
    APP.put('/catalog/edit/:catalogId', AUTH.isAuth, CATALOG_CONTROLLER.edit);
    APP.delete('/catalog/delete/:catalogId', AUTH.isAuth, CATALOG_CONTROLLER.delete);
}