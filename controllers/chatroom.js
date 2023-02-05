const CHATROOM = require('mongoose').model('Chatroom');
const USER = require('mongoose').model('User');
const HTTP = require('../utilities/http');
const HELPER = require('../utilities/helper');


module.exports = {

    getSingle: (req, res) => {
        let roomId = req.params.roomId;
        // let userId = HELPER.getAuthUserId(req);

        CHATROOM.findById(roomId)
            .then(room => {
                if (!room) return HTTP.error(res, 'There is no chat room with the given id in our database.');

                HTTP.success(res, room);
            })
            .catch(err => HTTP.handleError(res, err));
    },

    add: (req, res) => {
        let room = req.body;

        // let validationResult = validateBookForm(book);

        // if (!validationResult.success) {
        //     return res.status(400).json({
        //         message: 'Book form validation failed!',
        //         errors: validationResult.errors
        //     });
        // }

        USER.findById(room.user)
            .then(user => {
                if (!user) return HTTP.error(res, 'Cannot find selected user to create chat room');

                CHATROOM.findOne({ roomKey: room.roomKey, user: room.user })
                    .then(roomFound => {
                        if (roomFound) {
                            roomFound.inactive = false;
                            roomFound.save();
                            return HTTP.success(res, roomFound);
                        }

                        CHATROOM.create(room).then((newRoom) => {
                            return HTTP.success(res, newRoom, 'Chat room created successfully!');

                        }).catch(err => HTTP.handleError(res, err));
                    })
                    .catch(err => HTTP.handleError(res, err));
            }).catch(err => HTTP.handleError(res, err));

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

    undelete: (req, res) => {
        let roomId = req.params.roomId;

        CHATROOM.findById(roomId).then((deletedRoom) => {
            if (!deletedRoom) return HTTP.error(res, 'There is no chat room with the given id in our database.');

            deletedRoom.inactive = false;
            deletedRoom.save();
            return HTTP.success(res, deletedRoom, 'Chat room deleted successfully.');
        }).catch(err => HTTP.handleError(res, err));
    },

    getAllUserRooms: (req, res) => {
        let userId = HELPER.getAuthUserId(req);

        CHATROOM.find({ user: userId })
            .then(rooms => {
                if (!rooms) return HTTP.success(res, []);

                return HTTP.success(res, rooms);
            })
            .catch(err => HTTP.handleError(res, err));
    },

    getAlLinkedChatlRoom: (req, res) => {
        let roomId = req.params.roomId;
        let userId = HELPER.getAuthUserId(req);

        CHATROOM.findById(roomId)
            .then(room => {
                if (!room) return HTTP.error(res, 'There is no chat room with the given id in our database.');

                CHATROOM.find({ roomKey: room.roomKey, user: { $ne: userId } })
                    .populate('user')
                    .then(roomUsers => {
                        if (!roomUsers) return HTTP.error(res, `No users found for chatroom ${room.name}`);

                        HTTP.success(res, roomUsers);
                    })
                    .catch(err => HTTP.handleError(res, err));
            })
            .catch(err => HTTP.handleError(res, err));
    }
}
