const CHATROOM = require('mongoose').model('Chatroom');
const CHATROOMMESSAGE = require('mongoose').model('ChatroomMessage');
const USER = require('mongoose').model('User');
const ENCRYPTION = require('../utilities/encryption');
const HTTP = require('../utilities/http');
const HELPER = require('../utilities/helper');

const PAGE_LIMIT = 15;

module.exports = {
    add: (message, success_callback, error_callback) => {
        let roomId = message.roomId;

        // let validationResult = validateBookForm(book);

        // if (!validationResult.success) {
        //     return res.status(400).json({
        //         message: 'Book form validation failed!',
        //         errors: validationResult.errors
        //     });
        // }

        CHATROOM.findById(roomId)
            .then(roomFound => {
                if (!roomFound) {
                    if (error_callback) error_callback('There is no chat room with the given id in our database.');
                    else success_callback(null);
                }

                CHATROOMMESSAGE.create(message)
                    .then((newMessage) => {
                        if (!newMessage) {
                            if (error_callback) error_callback('Message save error.')
                            else success_callback(null);
                        }

                        CHATROOMMESSAGE.findById(newMessage._id)
                            .populate({
                                path: 'replyOf',
                                populate: {
                                    path: 'room',
                                    populate: {
                                        path: 'user'
                                    }
                                }
                            })
                            .populate({
                                path: 'room',
                                populate: {
                                    path: 'user'
                                }
                            })
                            .then(dbMessage => {
                                success_callback(dbMessage);
                            })
                    }).catch(err => error_callback(err));
            })
            .catch(err => error_callback(err));

    },

    edit: (req, res) => {
        let roomId = req.params.roomId;
        let editedRoom = req.body;

        // let validationResult = validateBookForm(editedBook);

        // if (!validationResult.success) {
        //     return res.status(400).json({
        //         message: 'Book form validation failed!',
        //         errors: validationResult.errors
        //     });
        // }

        CHATROOM.findById(roomId).then((room) => {
            if (!room) return HTTP.error(res, 'There is no chat room with the given id in our database.');
            let filter = { roomKey: room.roomKey };
            let query = { name: editedRoom.name };

            CHATROOM.updateMany(filter, { $set: query })
                .then(updatedRooms => {
                    if (!updatedRooms) return HTTP.error(res, 'Updating room information failed.')

                    return HTTP.success(res, updatedRooms, 'Chat Room edited successfully!');
                })
                .catch(err => HTTP.handleError(res, err));
        }).catch(err => HTTP.handleError(res, err));
    },

    delete: (req, res) => {
        let messageId = req.params.messageId;

        CHATROOMMESSAGE.findById(messageId).then((deletedMessage) => {
            if (!deletedMessage) return HTTP.error(res, 'There is no message with the given id in our database.');

            deletedMessage.isDeleted = true;
            deletedMessage.save();
            return HTTP.success(res, deletedMessage, 'Message deleted successfully.');
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

        CHATROOMMESSAGE
            .find(searchParams.query)
            .count()
            .then((count) => {
                CHATROOMMESSAGE
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
    },

    getAllRoomMessages: (req, res) => {
        let params = req.query;
        let searchParams = {
            query: {},
            sort: { creationDate: -1 },
            skip: null,
            limit: PAGE_LIMIT,
        };

        if (params.query) {
            let query = JSON.parse(params.query);
            searchParams.query = { roomKey: query['searchTerm'] };
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


        CHATROOMMESSAGE
            .find(searchParams.query)
            .count()
            .then((count) => {
                CHATROOMMESSAGE
                    .find(searchParams.query)
                    .sort(searchParams.sort)
                    .skip(searchParams.skip)
                    .limit(searchParams.limit)
                    .populate({
                        path: 'replyOf',
                        populate: {
                            path: 'room',
                            populate: {
                                path: 'user'
                            }
                        }
                    })
                    .populate({
                        path: 'room',
                        populate: {
                            path: 'user'
                        }
                    })
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
    },

    shareProductWithUser: (req, res) => {
        let loggedInUserId = HELPER.getAuthUserId(req);
        let userId = req.params.userId;
        let productId = req.body.productId;
        let message = req.body.message;

        if (!loggedInUserId) return HTTP.error(res, 'No loggedin user session detected.')

        USER.findById(userId)
            .then(user => {
                if (!user) return HTTP.error(res, 'Cannot find the user selected to share with.');

                CHATROOM.find({ $or: [{ user: userId }, { user: loggedInUserId }] })
                    .then(rooms => {

                        if (!rooms || rooms.length === 0)
                            return addRoomAndSendMessage(userId, loggedInUserId, productId, message)
                                .then(newMessage => HTTP.success(res, newMessage))
                                .catch(err => HTTP.handleError(res, err));

                        let commonRooms = findCommonRooms(rooms, loggedInUserId, userId);
                        if (!commonRooms || commonRooms.length === 0)
                            return addRoomAndSendMessage(userId, loggedInUserId, productId, message)
                                .then(newMessage => HTTP.success(res, newMessage))
                                .catch(err => HTTP.handleError(res, err));

                        let query = commonRoomFilterQuery(commonRooms);
                        CHATROOM.aggregate([query])
                            .then(allCommonRoomUsers => {

                                const allCommonRoomUsersByRoomKey = allCommonRoomUsers
                                    .reduce((roomArr, room) => {
                                        if (!roomArr[room.roomKey]) roomArr[room.roomKey] = [];
                                        roomArr[room.roomKey].push(room);
                                        return roomArr;
                                    }, {});
                                const allCommonRoomUsersByRoomKeyArr = Object.keys(allCommonRoomUsersByRoomKey).map(roomkey => allCommonRoomUsersByRoomKey[roomkey]);
                                const personalRoom = allCommonRoomUsersByRoomKeyArr.find(x => x.length === 2)?.find(r => r.user.equals(loggedInUserId));
                                // console.log('personalRoom = ', personalRoom)
                                if (!personalRoom)
                                    return addRoomAndSendMessage(userId, loggedInUserId, productId, message)
                                        .then(newMessage => HTTP.success(res, newMessage))
                                        .catch(err => HTTP.handleError(res, err));

                                postProductMessage(personalRoom, productId, message)
                                    .then(newMessage => HTTP.success(res, newMessage))
                                    .catch(err => HTTP.handleError(res, err));
                            })
                            .catch(err => HTTP.handleError(res, err));
                    })
                    .catch(err => HTTP.handleError(res, err));
            })
            .catch(err => HTTP.handleError(res, err));
    },

    userChatRoom: (req, res) => {
        let loggedInUserId = HELPER.getAuthUserId(req);
        let userId = req.params.userId;

        USER.findById(userId)
            .then(user => {
                if (!user) return HTTP.error(res, 'Cannot find the user selected to share with.');

                CHATROOM.find({ $or: [{ user: userId }, { user: loggedInUserId }] })
                    .then(rooms => {

                        if (!rooms || rooms.length === 0)
                            return addNewChatRoom(userId, loggedInUserId)
                                .then(newRoom => HTTP.success(res, newRoom))
                                .catch(err => HTTP.handleError(res, err));

                        let commonRooms = findCommonRooms(rooms, loggedInUserId, userId);
                        if (!commonRooms || commonRooms.length === 0)
                            return aaddNewChatRoom(userId, loggedInUserId)
                                .then(newRoom => HTTP.success(res, newRoom))
                                .catch(err => HTTP.handleError(res, err));

                        let query = commonRoomFilterQuery(commonRooms);
                        CHATROOM.aggregate([query])
                            .then(allCommonRoomUsers => {

                                const allCommonRoomUsersByRoomKey = allCommonRoomUsers
                                    .reduce((roomArr, room) => {
                                        if (!roomArr[room.roomKey]) roomArr[room.roomKey] = [];
                                        roomArr[room.roomKey].push(room);
                                        return roomArr;
                                    }, {});
                                const allCommonRoomUsersByRoomKeyArr = Object.keys(allCommonRoomUsersByRoomKey).map(roomkey => allCommonRoomUsersByRoomKey[roomkey]);
                                const personalRoom = allCommonRoomUsersByRoomKeyArr.find(x => x.length === 2)?.find(r => r.user.equals(loggedInUserId));

                                if (!personalRoom)
                                    return addNewChatRoom(userId, loggedInUserId)
                                        .then(newRoom => HTTP.success(res, newRoom))
                                        .catch(err => HTTP.handleError(res, err));

                                    return HTTP.success(res, personalRoom);
                            })
                            .catch(err => HTTP.handleError(res, err));
                    })
                    .catch(err => HTTP.handleError(res, err));
            })
            .catch(err => HTTP.handleError(res, err));

    }
}

function commonRoomFilterQuery(commonRooms) {
    let r = commonRooms.map(room => {
        return { roomKey: room.roomKey }
    });
    return { $match: { $or: r && r.length > 0 ? r : [{ roomKey: 'NA' }] } };
}

function findCommonRooms(rooms, userId1, userId2) {
    let user1Rooms = rooms.filter(r => r.user.equals(userId1));
    let user2Rooms = rooms.filter(r => r.user.equals(userId2));
    return user1Rooms.filter(r => user2Rooms.some(ur => ur.roomKey === r.roomKey));
}

function addRoomAndSendMessage(userId1, loggedInUserId, productId, message) {
    return new Promise((resolve, reject) => {
        addNewChatRoom(userId1, loggedInUserId)
            .then(room => {
                postProductMessage(room, productId, message)
                    .then(newMessage => {
                        resolve(newMessage)
                    })
                    .catch(err => reject(err));
            })
            .catch(err => reject(err));
    })
}

function addNewChatRoom(userId1, loggedInUserId) {
    const hashName = ENCRYPTION.generateHashedPassword(userId1, loggedInUserId);
    let newChatroom1 = {
        name: hashName,
        user: userId1,
        roomKey: hashName
    };
    let newChatroomloggedInUser = {
        name: hashName,
        user: loggedInUserId,
        roomKey: hashName
    };
    return new Promise((resolve, reject) => {
        CHATROOM.create(newChatroom1)
            .then((newRoom1) => {
                CHATROOM.create(newChatroomloggedInUser)
                    .then((newRoomloggedInUser) => {
                        resolve(newRoomloggedInUser);
                    })
                    .catch(err => reject(err));
            })
            .catch(err => reject(err));
    });
}

function postProductMessage(room, productId, message) {
    let msgPayload = {
        room: room._id,
        roomKey: room.roomKey,
        message: message,
        product: productId,
        type: HELPER.messageType.internalProduct
    }
    return new Promise((resolve, reject) => {
        CHATROOMMESSAGE.create(msgPayload)
            .then(newMessage => {
                if (!newMessage) return reject('Sharing product failed.');

                return resolve(newMessage);
            })
            .catch(err => reject(err));
    });
}