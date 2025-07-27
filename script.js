const socket = io('http://localhost:3000');
const messageContainer = document.getElementById('message-container');
const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');

const name = prompt('What is your name?');
appendMessage('You joined', 'system');
socket.emit('new-user', name);

socket.on('chat-message', data => {
  appendMessage(`${data.name}: ${data.message}`, 'other');
});

socket.on('user-connected', name => {
  appendMessage(`${name} connected`, 'system');
});

socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`, 'system');
});

messageForm.addEventListener('submit', e => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (message === '') return;
  appendMessage(`You: ${message}`, 'self');
  socket.emit('send-chat-message', message);
  messageInput.value = '';
});

// Enhanced function to support different styles
function appendMessage(message, type = 'other') {
  const messageElement = document.createElement('div');
  messageElement.innerText = message;
  messageElement.classList.add('message');

  if (type === 'self') {
    messageElement.classList.add('my-message');
  } else if (type === 'system') {
    messageElement.classList.add('system-message');
  }

  messageContainer.append(messageElement);
  messageContainer.scrollTop = messageContainer.scrollHeight;
}
