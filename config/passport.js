const JWT = require('jsonwebtoken');
const LOCAL_STRATEGY = require('passport-local').Strategy;

const ENCRYPTION = require('../utilities/encryption');
const ROLE = require('mongoose').model('Role');
const USER = require('mongoose').model('User');

const SECRET = '5b362e2a094b97392c3d7bba';

function generateToken(userInfo) {
    const USER = {
        id: userInfo.id,
        username: userInfo.username,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        avatar: userInfo.avatar,
        isCommentsBlocked: userInfo.isCommentsBlocked,
        isAdmin: userInfo.isAdmin,
        roles: userInfo.roles,
        address: userInfo.address,
        contact1: userInfo.contact1,
        contact2: userInfo.contact2
    };
    const PAYLOAD = { sub: USER };

    return JWT.sign(PAYLOAD, SECRET, { expiresIn: +process.env.sessionExpiry });
}

module.exports = {
    localRegister: () => {
        return new LOCAL_STRATEGY({
            usernameField: 'username',
            passwordField: 'password',
            session: false,
            passReqToCallback: true
        }, (req, username, password, done) => {
            let user = {
                username: req.body.username,
                avatar: req.body.avatar,
                email: req.body.email,
                password: req.body.password
            };

            let salt = ENCRYPTION.generateSalt();
            let hashedPassword = ENCRYPTION.generateHashedPassword(salt, password);

            user.salt = salt;
            user.password = hashedPassword;

            ROLE.findOne({ name: 'User' }).then((role) => {
                user.roles = [role._id];

                USER.create(user).then((newUser) => {
                    role.users.push(newUser._id);
                    role.save();

                    let token = generateToken(newUser);
                    return done(null, token);
                    
                }).catch(() => {
                    return done(null, false);
                });
            });
        }
        );
    },

    localLogin: () => {
        return new LOCAL_STRATEGY({
            usernameField: 'username',
            passwordField: 'password',
            session: false
        }, (username, password, done) => {
            USER.findOne({ $or: [{ username: { $regex: new RegExp(username, 'i')} }, { email: { $regex: new RegExp(username, 'i')} }] })
            .then((user) => {
                if (!user) {
                    return done(null, false);
                }

                if (!user.authenticate(password)) {
                    return done(null, false);
                }

                let token = generateToken(user);

                return done(null, token);
            });
        }
        );
    }
};