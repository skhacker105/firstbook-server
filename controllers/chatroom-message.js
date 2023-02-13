const CHATROOM = require('mongoose').model('Chatroom');
const CHATROOMMESSAGE = require('mongoose').model('ChatroomMessage');
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
                            .populate('room')
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
        let roomId = req.params.roomId;

        CHATROOM.findById(roomId).then((deletedRoom) => {
            if (!deletedRoom) return HTTP.error(res, 'There is no chat room with the given id in our database.');

            deletedRoom.inactive = true;
            deletedRoom.save();
            return HTTP.success(res, deletedRoom, 'Chat room deleted successfully.');
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
                    .populate('replyOf')
                    .populate({
                        path: 'replyOf',
                        populate: {
                            path: 'room',
                            populate: {
                                path: 'user'
                            }
                        }
                    })
                    .populate('room')
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
}