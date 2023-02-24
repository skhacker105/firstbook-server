const AUTH = require('../config/auth');
const PRODUCT_CONTROLLER = require('../controllers/product');
const PRODUCTSPECS_CONTROLLER = require('../controllers/product-spec');

module.exports = (APP) => {

    // PRODUCT IMAGEs
    APP.get('/picture/:pictureId', PRODUCT_CONTROLLER.getPicture);
    APP.post('/product/picture', AUTH.isAuth, PRODUCT_CONTROLLER.addMainPicture);
    APP.post('/product/gallery', AUTH.isAuth, PRODUCT_CONTROLLER.addPictures);
    APP.delete('/product/picture/:productId', AUTH.isAuth, PRODUCT_CONTROLLER.deleteMainPicture);
    APP.delete('/product/gallery/:pictureId', PRODUCT_CONTROLLER.deletePictures);

    // PRODUCT COMMENTS
    APP.get('/product/comment/:productId/:skipCount', PRODUCT_CONTROLLER.getComments);
    APP.post('/product/comment/add/:productId', AUTH.isAuth, PRODUCT_CONTROLLER.postComment);
    APP.put('/product/comment/edit/:commentId', AUTH.isAuth, PRODUCT_CONTROLLER.editComment);
    APP.delete('/product/comment/delete/:commentId', AUTH.isAuth, PRODUCT_CONTROLLER.deleteComment);

    // PRODUCT / INVENTORY
    APP.get('/product/userproducts', PRODUCT_CONTROLLER.userProducts);
    APP.get('/product/enable/:productId', AUTH.isAuth, PRODUCT_CONTROLLER.enable);
    APP.get('/product/disable/:productId', AUTH.isAuth, PRODUCT_CONTROLLER.disable);
    APP.get('/product/search', PRODUCT_CONTROLLER.search);
    APP.get('/product/search/getIds', PRODUCT_CONTROLLER.search);
    APP.get('/product/details/:productId', PRODUCT_CONTROLLER.getSingle);
    APP.post('/product/add', AUTH.isAuth, PRODUCT_CONTROLLER.add);
    APP.post('/product/rate/:productId', AUTH.isAuth, PRODUCT_CONTROLLER.rate);
    APP.post('/product/addClientCost/:productId', PRODUCT_CONTROLLER.addClientCost);
    APP.put('/product/edit/:productId', AUTH.isAuth, PRODUCT_CONTROLLER.edit);
    APP.delete('/product/delete/:productId', AUTH.isAuth, PRODUCT_CONTROLLER.delete);

    // PRODUCT SPECIFICATION
    APP.get('/specs/product/:productId', PRODUCTSPECS_CONTROLLER.getProductSpecs);
    APP.post('/specs/:productId', PRODUCTSPECS_CONTROLLER.add);
    APP.put('/specs/:productspecId', PRODUCTSPECS_CONTROLLER.edit);
    APP.delete('/specs/:productspecId', PRODUCTSPECS_CONTROLLER.delete);
}