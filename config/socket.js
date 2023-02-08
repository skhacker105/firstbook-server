const SOCKET = require('socket.io');
const CHATROOMMESSAGECONTROLLER = require('../controllers/chatroom-message');

module.exports = (SERVER) => {
    const io = SOCKET(SERVER, {
        cors: {
            origin: '*',
        }
    });

    io.sockets.on("connect_error", (err) => {
        console.log(`connect_error due to ${err.message}`);
    });

    io.sockets.on('connection', (socket) => {
        // JOIN
        socket.on('join', (roomKey) => {
            io.in(roomKey).emit('joined room', roomKey);
            socket.join(roomKey);
        });

        // Catch Message
        socket.on('message', (message) => {
            // insert message into DB
            CHATROOMMESSAGECONTROLLER.add(
                message,
                (newMessage) => {
                    io.in(message.roomKey).emit('new message', newMessage);
                },
                (error) => {
                    message.error = error;
                    io.in(message.roomKey).emit('error', message);
                }
            );
        });

        // Typing Event
        socket.on('typing', (message) => {
            console.log('typing = ', message);
            socket.broadcast.in(message.room).emit('typing', { message: message, isTyping: true });
        });
    });
}