const VALIDATOR = require('validator');
const PASSPORT = require('passport');
const HTTP = require('../utilities/http')
const USER = require('mongoose').model('User');
const RECEIPT = require('mongoose').model('Receipt');

const PAGE_LIMIT = 15;

function validateRegisterForm(payload) {
    let errors = {};
    let isFormValid = true;

    if (!payload || typeof payload.email !== 'string' || !VALIDATOR.isEmail(payload.email)) {
        isFormValid = false;
        errors.email = 'Please provide a correct email address.';
    }

    if (!payload || typeof payload.password !== 'string' || payload.password.trim().length < 3) {
        isFormValid = false;
        errors.password = 'Password must have at least 3 characters.';
    }

    if (!payload || payload.password !== payload.confirmPassword) {
        isFormValid = false;
        errors.passwordsDontMatch = 'Passwords do not match!';
    }

    if (!payload || typeof payload.username !== 'string' || payload.username.trim().length === 0) {
        isFormValid = false;
        errors.name = 'Please provide your name.';
    }

    if (payload.avatar && payload.avatar.trim().length !== 0) {
        if (!VALIDATOR.isURL(payload.avatar)) {
            isFormValid = false;
            errors.avatar = 'Please provide a valid link to your avatar image or leave the field empty.';
        }
    } else {
        if (payload.hasOwnProperty('avatar')) {
            delete payload['avatar'];
        }
    }

    return {
        success: isFormValid,
        errors
    };
}

function validateLoginForm(payload) {
    let errors = {};
    let isFormValid = true;

    if (!payload || typeof payload.password !== 'string' || payload.password.trim().length === 0) {
        isFormValid = false;
        errors.password = 'Please provide your password.';
    }

    if (!payload || typeof payload.username !== 'string' || payload.username.trim().length === 0) {
        isFormValid = false;
        errors.name = 'Please provide your name.';
    }

    return {
        success: isFormValid,
        errors
    };
}

function validateAvatarForm(payload) {
    let errors = {};
    let isFormValid = true;

    if (!payload || !VALIDATOR.isURL(payload.avatar)) {
        isFormValid = false;
        errors.avatar = 'Please provide a valid link to your avatar image.';
    }

    return {
        success: isFormValid,
        errors
    };
}

module.exports = {
    register: (req, res) => {

        let validationResult = validateRegisterForm(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                message: 'Register form validation failed!',
                errors: validationResult.errors
            });
        }

        PASSPORT.authenticate('local-register', (err, token) => {
            if (err || !token) {
                return res.status(400).json({
                    message: 'Registration failed!',
                    errors: { 'taken': 'Username or email already taken' }
                });
            }

            return res.status(200).json({
                message: 'Registration successful!',
                data: token
            });
        })(req, res);
    },

    login: (req, res) => {
        let validationResult = validateLoginForm(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                message: 'Login form validation failed!',
                errors: validationResult.errors
            });
        }

        PASSPORT.authenticate('local-login', (err, token) => {
            if (err || !token) {
                return res.status(400).json({
                    message: 'Invalid Credentials!'
                });
            }

            return res.status(200).json({
                message: 'Login successful!',
                data: token
            });
        })(req, res);
    },

    getProfile: (req, res) => {
        let username = req.params.username;

        USER.findOne({ username: username })
            .populate('favoriteBooks')
            .populate('favoriteContacts')
            .then((user) => {
                if (!user) {
                    return res.status(400).json({
                        message: `User ${username} not found in our database`
                    });
                }

                let userToSend = {
                    id: user.id,
                    isAdmin: user.isAdmin,
                    username: user.username,
                    avatar: user.avatar,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    contact1: user.contact1,
                    contact2: user.contact2,
                    address: user.address,
                    commentsCount: user.commentsCount,
                    favoriteBooks: user.favoriteBooks,
                    favoriteContacts: user.favoriteContacts,
                    isCommentsBlocked: user.isCommentsBlocked
                };

                return res.status(200).json({
                    message: '',
                    data: userToSend
                });
            })
            .catch((err) => {
                console.log(err);
                return res.status(400).json({
                    message: 'Something went wrong, please try again.'
                });
            });
    },

    getPurchaseHistory: (req, res) => {
        let userId = req.user.id;
        RECEIPT
            .find({ user: userId })
            .sort({ creationDate: -1 })
            .then((receipts) => {
                res.status(200).json({
                    message: '',
                    data: receipts
                });
            });
    },

    updateProfile: (req, res) => {
        let requesterId = req.user.id;
        let requesterIsAdmin = req.user.isAdmin;
        let userToChange = req.body.id;

        if (requesterId !== userToChange && !requesterIsAdmin) {
            return res.status(401).json({
                message: 'You\'re not allowed to change other user avatar!'
            });
        }

        USER.findById(userToChange).then((user) => {
            if (!user) return HTTP.error(res, `User not found in our database`);

            user.firstName = req.body.firstName;
            user.lastName = req.body.lastName;
            user.contact1 = req.body.contact1;
            user.contact2 = req.body.contact2;
            user.address = req.body.address;
            user.save();
            HTTP.success(res, user, 'User information updated successfully')
        });
    },

    changeAvatar: (req, res) => {
        let requesterId = req.user.id;
        let requesterIsAdmin = req.user.isAdmin;
        let userToChange = req.body.id;
        let newAvatar = req.body.avatar;

        let validationResult = validateAvatarForm(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                message: 'Avatar form validation failed!',
                errors: validationResult.errors
            });
        }

        if (requesterId !== userToChange && !requesterIsAdmin) {
            return res.status(401).json({
                message: 'You\'re not allowed to change other user avatar!'
            });
        }

        USER
            .update({ _id: userToChange }, { $set: { avatar: newAvatar } })
            .then(() => {
                return res.status(200).json({
                    message: 'Avatar changed successfully!'
                });
            })
            .catch((err) => {
                console.log(err);
                return res.status(400).json({
                    message: 'Something went wrong, please try again.'
                });
            });
    },

    blockComments: (req, res) => {
        let userId = req.params.userId;
        let requesterIsAdmin = req.user.isAdmin;
        if (!requesterIsAdmin) return HTTP.error(res, 'You are not authorized to perform this action')

        USER.findById(userId).then((user) => {
            if (!user) {
                return res.status(400).json({
                    message: `User ${user.username} not found in our database`
                });
            }

            user.isCommentsBlocked = true;
            user.save();

            res.status(200).json({
                message: `User ${user.username} blocked from posting comments!`
            });
        }).catch((err) => {
            console.log(err);
            return res.status(400).json({
                message: 'Something went wrong, please try again.'
            });
        });
    },

    unblockComments: (req, res) => {
        let userId = req.params.userId;
        let requesterIsAdmin = req.user.isAdmin;
        if (!requesterIsAdmin) return HTTP.error(res, 'You are not authorized to perform this action')

        USER.findById(userId).then((user) => {
            if (!user) {
                return res.status(400).json({
                    message: `User ${user.username} not found in our database`
                });
            }

            user.isCommentsBlocked = false;
            user.save();

            res.status(200).json({
                message: `User ${user.username} can now post comments!`
            });
        }).catch((err) => {
            console.log(err);
            return res.status(400).json({
                message: 'Something went wrong, please try again.'
            });
        });
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
            searchParams.query = { $text: { $search: `\"${query['searchTerm']}\"`, $language: 'en' } };
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

        USER
            .find(searchParams.query)
            .count()
            .then((count) => {
                USER
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