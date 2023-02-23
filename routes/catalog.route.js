const AUTH = require('../config/auth');
const CATALOG_CONTROLLER = require('../controllers/catalog');

module.exports = (APP) => {

    // CATALOG
    APP.get('/catalog/downloadCatalAsExcel/:catalogId', AUTH.isAuth, CATALOG_CONTROLLER.downloadCatalAsExcel);
    APP.get('/catalog/downloadCatalAsPDF/:catalogId', AUTH.isAuth, CATALOG_CONTROLLER.downloadCatalAsPDF);
    APP.get('/catalog/downloadCatalAsPDF/:catalogId/:filterByClientId', AUTH.isAuth, CATALOG_CONTROLLER.downloadCatalAsPDF);
    APP.get('/catalog/usercatalogs', CATALOG_CONTROLLER.userCatalogs);
    APP.get('/catalog/getSingle/:catalogId', CATALOG_CONTROLLER.getSingle);
    APP.get('/catalog/search', CATALOG_CONTROLLER.search);
    APP.post('/catalog/add', AUTH.isAuth, CATALOG_CONTROLLER.add);
    APP.put('/catalog/edit/:catalogId', AUTH.isAuth, CATALOG_CONTROLLER.edit);
    APP.delete('/catalog/enable/:catalogId', AUTH.isAuth, CATALOG_CONTROLLER.enable);
    APP.delete('/catalog/disable/:catalogId', AUTH.isAuth, CATALOG_CONTROLLER.disable);
}