const AUTH = require('../config/auth');
const CHATROOM_CONTROLLER = require('../controllers/chatroom');
const CHATROOMMESSAGE_CONTROLLER = require('../controllers/chatroom-message');

module.exports = (APP) => {

    // CHATROOM
    APP.get('/chat/getAlLinkedChatlRoom/:roomId', AUTH.isAuth, CHATROOM_CONTROLLER.getAlLinkedChatlRoom);
    APP.get('/chat/getSingle/:roomId', AUTH.isAuth, CHATROOM_CONTROLLER.getSingle);
    APP.get('/chat/getAll', AUTH.isAuth, CHATROOM_CONTROLLER.getAllUserRooms);
    APP.get('/chat/message', CHATROOMMESSAGE_CONTROLLER.getAllRoomMessages);
    APP.get('/chat/userChatRoom/:userId', AUTH.isAuth, CHATROOMMESSAGE_CONTROLLER.userChatRoom);
    APP.post('/chat/add', AUTH.isAuth, CHATROOM_CONTROLLER.add);
    APP.post('/chat/shareProductWithUser/:userId', AUTH.isAuth, CHATROOMMESSAGE_CONTROLLER.shareProductWithUser);
    APP.put('/chat/edit/:roomId', AUTH.isAuth, CHATROOM_CONTROLLER.edit);
    APP.delete('/chat/delete/:roomId', AUTH.isAuth, CHATROOM_CONTROLLER.delete);
    APP.delete('/chat/undelete/:roomId', AUTH.isAuth, CHATROOM_CONTROLLER.undelete);
    APP.delete('/message/:messageId', CHATROOMMESSAGE_CONTROLLER.delete);
}