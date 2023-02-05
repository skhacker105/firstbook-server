const USER_CONTROLLER = require('../controllers/user');
const BOOK_CONTROLLER = require('../controllers/book');
const CONTACT_CONTROLLER = require('../controllers/contact');
const PRODUCT_CONTROLLER = require('../controllers/product');
const PRODUCTSPECS_CONTROLLER = require('../controllers/product-spec');
const COMMENT_CONTROLLER = require('../controllers/comment');
const CART_CONTROLLER = require('../controllers/cart');
const CHATROOM_CONTROLLER = require('../controllers/chatroom');
const ERROR_CONTROLLER = require('../controllers/error');
const AUTH = require('./auth');

module.exports = (APP) => {
    // USER
    APP.post('/user/register', USER_CONTROLLER.register);
    APP.post('/user/login', USER_CONTROLLER.login);
    APP.get('/user/search', USER_CONTROLLER.search);
    APP.get('/user/profile/:username', AUTH.isAuth, USER_CONTROLLER.getProfile);
    APP.post('/user/profile/', AUTH.isAuth, USER_CONTROLLER.updateProfile);
    APP.get('/user/purchaseHistory', AUTH.isAuth, USER_CONTROLLER.getPurchaseHistory);
    APP.post('/user/changeAvatar', AUTH.isAuth, USER_CONTROLLER.changeAvatar);
    APP.post('/user/blockComments/:userId', AUTH.isInRole('Admin'), USER_CONTROLLER.blockComments);
    APP.post('/user/unlockComments/:userId', AUTH.isInRole('Admin'), USER_CONTROLLER.unblockComments);

    // CART
    APP.get('/cart/getSize', AUTH.isAuth, CART_CONTROLLER.getCartSize);
    APP.get('/user/cart', AUTH.isAuth, CART_CONTROLLER.getCart);
    APP.post('/user/cart/add/:bookId', AUTH.isAuth, CART_CONTROLLER.addToCart);
    APP.delete('/user/cart/delete/:bookId', AUTH.isAuth, CART_CONTROLLER.removeFromCart);
    APP.post('/user/cart/checkout', AUTH.isAuth, CART_CONTROLLER.checkout);

    // BOOK
    APP.get('/book/search', BOOK_CONTROLLER.search);
    APP.get('/book/details/:bookId', BOOK_CONTROLLER.getSingle);
    APP.post('/book/add', AUTH.isInRole('Admin'), BOOK_CONTROLLER.add);
    APP.put('/book/edit/:bookId', AUTH.isInRole('Admin'), BOOK_CONTROLLER.edit);
    APP.delete('/book/delete/:bookId', AUTH.isInRole('Admin'), BOOK_CONTROLLER.delete);
    APP.post('/book/rate/:bookId', AUTH.isAuth, BOOK_CONTROLLER.rate);
    APP.post('/book/addToFavorites/:bookId', AUTH.isAuth, BOOK_CONTROLLER.addToFavorites);

    // CONTACT
    APP.get('/contact/search', CONTACT_CONTROLLER.search);
    APP.get('/contact/details/:contactId', CONTACT_CONTROLLER.getSingle);
    APP.post('/contact/add', AUTH.isAuth, CONTACT_CONTROLLER.add);
    APP.put('/contact/edit/:contactId', AUTH.isAuth, CONTACT_CONTROLLER.edit);
    APP.delete('/contact/delete/:contactId', AUTH.isAuth, CONTACT_CONTROLLER.delete);
    APP.post('/contact/rate/:contactId', AUTH.isAuth, CONTACT_CONTROLLER.rate);
    APP.post('/contact/addToFavorites/:contactId', AUTH.isAuth, CONTACT_CONTROLLER.addToFavorites);

    // PRODUCT IMAGEs
    APP.post('/product/picture', AUTH.isAuth, PRODUCT_CONTROLLER.addMainPicture);
    APP.get('/picture/:pictureId', PRODUCT_CONTROLLER.getPicture);
    APP.delete('/product/picture/:productId', AUTH.isAuth, PRODUCT_CONTROLLER.deleteMainPicture);
    
    APP.post('/product/gallery', AUTH.isAuth, PRODUCT_CONTROLLER.addPictures);
    APP.delete('/product/gallery/:pictureId', PRODUCT_CONTROLLER.deletePictures);

    // PRODUCT COMMENTS
    APP.get('/product/comment/:productId/:skipCount', COMMENT_CONTROLLER.getComments);
    APP.post('/product/comment/add/:productId', AUTH.isAuth, PRODUCT_CONTROLLER.postComment);
    APP.put('/product/comment/edit/:commentId', AUTH.isAuth, PRODUCT_CONTROLLER.editComment);
    APP.delete('/product/comment/delete/:commentId', AUTH.isAuth, PRODUCT_CONTROLLER.deleteComment);
    
    // PRODUCT / INVENTORY
    APP.get('/userproducts', PRODUCT_CONTROLLER.userProducts);
    APP.get('/product/enable/:productId', AUTH.isAuth, PRODUCT_CONTROLLER.enable);
    APP.get('/product/disable/:productId', AUTH.isAuth, PRODUCT_CONTROLLER.disable);
    APP.get('/product/search', PRODUCT_CONTROLLER.search);
    APP.get('/product/details/:productId', PRODUCT_CONTROLLER.getSingle);
    APP.post('/product/add', AUTH.isAuth, PRODUCT_CONTROLLER.add);
    APP.put('/product/edit/:productId', AUTH.isAuth, PRODUCT_CONTROLLER.edit);
    APP.delete('/product/delete/:productId', AUTH.isAuth, PRODUCT_CONTROLLER.delete);
    APP.post('/product/rate/:productId', AUTH.isAuth, PRODUCT_CONTROLLER.rate);

    // PRODUCT SPECIFICATION
    APP.get('/specs/product/:productId', PRODUCTSPECS_CONTROLLER.getProductSpecs);
    APP.get('/specs/category/:category', PRODUCTSPECS_CONTROLLER.getCategoriesSpecs);
    APP.post('/specs/:productId', PRODUCTSPECS_CONTROLLER.add);
    APP.put('/specs/:productspecId', PRODUCTSPECS_CONTROLLER.edit);
    APP.delete('/specs/:productspecId', PRODUCTSPECS_CONTROLLER.delete);

    // COMMENTS
    APP.get('/comment/getLatestFiveByUser/:userId', AUTH.isAuth, COMMENT_CONTROLLER.getLatestFiveByUser);
    APP.get('/comment/:bookId/:skipCount', COMMENT_CONTROLLER.getComments);
    APP.post('/comment/add/:bookId', AUTH.isAuth, COMMENT_CONTROLLER.add);
    APP.put('/comment/edit/:commentId', AUTH.isAuth, COMMENT_CONTROLLER.edit);
    APP.delete('/comment/delete/:commentId', AUTH.isAuth, COMMENT_CONTROLLER.delete);

    // CHATROOM
    APP.get('/chat/getAlLinkedChatlRoom/:roomId', AUTH.isAuth, CHATROOM_CONTROLLER.getAlLinkedChatlRoom);
    APP.get('/chat/getSingle/:roomId', AUTH.isAuth, CHATROOM_CONTROLLER.getSingle);
    APP.get('/chat/getAll', AUTH.isAuth, CHATROOM_CONTROLLER.getAllUserRooms);
    APP.post('/chat/add', AUTH.isAuth, CHATROOM_CONTROLLER.add);
    APP.put('/chat/edit/:roomId', AUTH.isAuth, CHATROOM_CONTROLLER.edit);
    APP.delete('/chat/delete/:roomId', AUTH.isAuth, CHATROOM_CONTROLLER.delete);
    APP.delete('/chat/undelete/:roomId', AUTH.isAuth, CHATROOM_CONTROLLER.undelete);


    APP.all('*', ERROR_CONTROLLER.error);
};