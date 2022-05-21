const PORT = process.env.PORT || 5000;
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./util/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
} = require('./util/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Run when client connects
io.on('connection', socket => {

  console.log("Web Socket Connection");
  // send message to clinet (when user open) c.
  socket.emit('messageForRun','open Bidirectional Connection');
  // Broadcast when a user connects.
  socket.broadcast.emit('messageForRun', 'A user has joined the chat');
  // Runs when client disconnects.
  socket.on('disconnect', ()=>{
    io.emit('messageForRun', 'A use has left the chat');
  })

  // Listen for joinRoom
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    // Welcome current user
    socket.emit('message', formatMessage('Chatting App', `Welcome on ${user.room}`));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit('message',formatMessage(`"${user.username}"`, `joined the chat`));
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {

    ///console.log(msg);
    //io.emit('messageForRun', msg);

    const user = getCurrentUser(socket.id);
    //io.emit('messageForRun', user);
    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(`${user.username}`,  `left the chat`)
      );
    }
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
