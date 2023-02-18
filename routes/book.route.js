const AUTH = require('../config/auth');
const BOOK_CONTROLLER = require('../controllers/book');

module.exports = (APP) => {

    // BOOK
    APP.get('/book/search', BOOK_CONTROLLER.search);
    APP.get('/book/details/:bookId', BOOK_CONTROLLER.getSingle);
    APP.post('/book/add', AUTH.isInRole('Admin'), BOOK_CONTROLLER.add);
    APP.post('/book/rate/:bookId', AUTH.isAuth, BOOK_CONTROLLER.rate);
    APP.post('/book/addToFavorites/:bookId', AUTH.isAuth, BOOK_CONTROLLER.addToFavorites);
    APP.put('/book/edit/:bookId', AUTH.isInRole('Admin'), BOOK_CONTROLLER.edit);
    APP.delete('/book/delete/:bookId', AUTH.isInRole('Admin'), BOOK_CONTROLLER.delete);
}