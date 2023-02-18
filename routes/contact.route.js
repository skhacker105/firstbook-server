const AUTH = require('../config/auth');
const CONTACT_CONTROLLER = require('../controllers/contact');

module.exports = (APP) => {

    // CONTACT
    APP.get('/contact/search', CONTACT_CONTROLLER.search);
    APP.get('/contact/details/:contactId', CONTACT_CONTROLLER.getSingle);
    APP.post('/contact/add', AUTH.isAuth, CONTACT_CONTROLLER.add);
    APP.post('/contact/saveNotes/:contactId', AUTH.isAuth, CONTACT_CONTROLLER.saveNotes);
    APP.post('/contact/rate/:contactId', AUTH.isAuth, CONTACT_CONTROLLER.rate);
    APP.post('/contact/addToFavorites/:contactId', AUTH.isAuth, CONTACT_CONTROLLER.addToFavorites);
    APP.put('/contact/edit/:contactId', AUTH.isAuth, CONTACT_CONTROLLER.edit);
    APP.delete('/contact/delete/:contactId', AUTH.isAuth, CONTACT_CONTROLLER.delete);
}