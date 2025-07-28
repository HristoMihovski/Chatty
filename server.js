require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const messageSchema = new mongoose.Schema({
  name: String,
  message: String,
  room: String,
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

app.use(express.static(__dirname));

const users = {};

io.on('connection', socket => {
  socket.on('join-room', async ({ name, room }) => {
    socket.join(room);
    users[socket.id] = { name, room };

    const history = await Message.find({ room }).sort({ timestamp: 1 }).limit(50);
    socket.emit('chat-history', history);

    socket.to(room).emit('user-connected', name);

    socket.on('send-chat-message', async msg => {
      const user = users[socket.id];
      const newMessage = new Message({ name: user.name, message: msg, room: user.room });
      await newMessage.save();
      socket.to(user.room).emit('chat-message', { name: user.name, message: msg });
    });

    socket.on('disconnect', () => {
      const user = users[socket.id];
      if (user) {
        socket.to(user.room).emit('user-disconnected', user.name);
        delete users[socket.id];
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
