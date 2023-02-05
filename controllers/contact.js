const VALIDATOR = require('validator');
const CONTACT = require('mongoose').model('Contact');
const USER = require('mongoose').model('User');
const HELPER = require('../utilities/helper');
const HTTP = require('../utilities/http');

const PAGE_LIMIT = 15;

function validateRatingForm(payload) {
    let errors = {};
    let isFormValid = true;

    if (
        !payload
        || isNaN(Number(payload.rating))
        || !VALIDATOR.isInt(payload.rating.toString())
        || Number(payload.rating) < 1
        || Number(payload.rating) > 5
    ) {
        isFormValid = false;
        errors.price = 'Rating must be a integer number between 1 and 5.';
    }

    return {
        success: isFormValid,
        errors
    };
}

module.exports = {

    getSingle: (req, res) => {
        let contactId = req.params.contactId;

        CONTACT.findById(contactId)
            .populate('appUserId')
            .then((contact) => {
                if (!contact) return HTTP.error(res, 'There is no contact with the given id in our database.');

                return HTTP.success(res, contact);
            })
            .catch(err => HTTP.handleError(res, err));
    },

    add: (req, res) => {
        let contact = req.body;
        contact['createdBy'] = HELPER.getAuthUserId(req);

        // let validationResult = validateBookForm(book);

        // if (!validationResult.success) {
        //     return res.status(400).json({
        //         message: 'Book form validation failed!',
        //         errors: validationResult.errors
        //     });
        // }

        CONTACT.create(contact).then((newContact) => {
            return HTTP.success(res, newContact, 'Contact created successfully!');
        }).catch(err => HTTP.handleError(res, err));
    },

    edit: (req, res) => {
        let contactId = req.params.contactId;
        let editedContact = req.body;

        // let validationResult = validateBookForm(editedBook);

        // if (!validationResult.success) {
        //     return res.status(400).json({
        //         message: 'Book form validation failed!',
        //         errors: validationResult.errors
        //     });
        // }

        CONTACT.findById(contactId).then((contact) => {
            if (!contact) return HTTP.error(res, 'There is no contact with the given id in our database.');

            editedContact.appUserId ? contact.appUserId = editedContact.appUserId : delete contact.appUserId;
            contact.title = editedContact.title;
            contact.firstName = editedContact.firstName;
            contact.lastName = editedContact.lastName;
            contact.type = editedContact.type;
            contact.contact1 = editedContact.contact1;
            contact.contact2 = editedContact.contact2;
            contact.address = editedContact.address;
            contact.save();

            return HTTP.success(res, contact, 'Contact edited successfully!');
        }).catch(err => HTTP.handleError(res, err));
    },

    delete: (req, res) => {
        let contactId = req.params.contactId;

        CONTACT.findByIdAndRemove(contactId).then((deletedContact) => {
            if (!deletedContact) return HTTP.error(res, 'There is no contact with the given id in our database.');

            return HTTP.success(res, deletedContact, 'Contact deleted successfully!');
        }).catch(err => HTTP.handleError(res, err));
    },

    rate: (req, res) => {
        let contactId = req.params.contactId;
        let rating = req.body.rating;
        let userId = req.user.id;

        let validationResult = validateRatingForm(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                message: 'Rating form validation failed!',
                errors: validationResult.errors
            });
        }

        CONTACT.findById(contactId).then((contact) => {
            if (!contact) return HTTP.error(res, 'There is no contact with the given id in our database.');

            let ratedByIds = contact.ratedBy.map((id) => id.toString());
            if (ratedByIds.indexOf(userId) !== -1) {
                return HTTP.error(res, 'You already rated this contact');
            }

            contact.ratedBy.push(userId);
            contact.ratingPoints += rating;
            contact.ratedCount += 1;
            contact.currentRating = contact.ratingPoints / contact.ratedCount;
            contact.save();

            return HTTP.success(res, contact, 'You rated the contact successfully.');
        }).catch(err => HTTP.handleError(res, err));
    },

    addToFavorites: (req, res) => {
        let contactId = req.params.contactId;

        CONTACT.findById(contactId).then((contact) => {
            if (!contact) return HTTP.error(res, 'There is no contact with the given id in our database.');

            USER.findById(req.user.id).then((user) => {

                let contactsIds = user.favoriteContacts.map((b) => b.toString());
                if (contactsIds.indexOf(contactId) !== -1) {
                    return HTTP.error(res, 'You already have this contact in your favorites list');
                }

                user.favoriteContacts.push(contact._id);
                user.save();

                return HTTP.success(res, null, 'Successfully added the contact to your favorites list.');
            });
        }).catch(err => HTTP.handleError(res, err));
    },

    search: (req, res) => {
        let params = req.query;
        let searchParams = {
            query: {},
            sort: { creationDate: -1 },
            skip: null,
            limit: PAGE_LIMIT,
        };

        if (params.query || typeof params.query === 'string') {
            let query = JSON.parse(params.query);
            searchParams.query = { $text: { $search: query['searchTerm'], $language: 'en' } };
        }

        if (params.sort) {
            searchParams.sort = JSON.parse(params.sort);
        }

        if (params.skip) {
            searchParams.skip = JSON.parse(params.skip);
        }

        if (params.limit) {
            searchParams.limit = JSON.parse(params.limit);
        }
        searchParams.query['createdBy'] = HELPER.getAuthUserId(req);

        CONTACT
            .find(searchParams.query)
            .count()
            .then((count) => {
                CONTACT
                    .find(searchParams.query)
                    .sort(searchParams.sort)
                    .skip(searchParams.skip)
                    .limit(searchParams.limit)
                    .then((result) => {
                        return res.status(200).json({
                            message: '',
                            data: result,
                            query: searchParams,
                            itemsCount: count
                        });
                    })
                    .catch(() => {
                        return HTTP.error(res, 'Bad Request!');
                    });
            });
    }

};