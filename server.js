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
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

app.use(express.static(__dirname));

const users = {};

io.on('connection', async socket => {
  const history = await Message.find().sort({ timestamp: 1 }).limit(50);
  socket.emit('chat-history', history);

  socket.on('new-user', name => {
    users[socket.id] = name;
    socket.broadcast.emit('user-connected', name);
  });

  socket.on('send-chat-message', async msg => {
    const name = users[socket.id];
    const newMessage = new Message({ name, message: msg });
    await newMessage.save();
    socket.broadcast.emit('chat-message', { name, message: msg });
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', users[socket.id]);
    delete users[socket.id];
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT);
