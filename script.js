const socket = io('http://localhost:3000');
const messageContainer = document.getElementById('message-container');
const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');

const name = prompt('What is your name?');
appendMessage('You joined', 'system');
socket.emit('new-user', name);

socket.on('chat-history', history => {
  history.forEach(data => {
    const time = new Date(data.timestamp).toLocaleTimeString();
    appendMessage(`[${time}] ${data.name}: ${data.message}`, 'other');
  });
});

socket.on('chat-message', data => {
  const time = new Date().toLocaleTimeString();
  appendMessage(`[${time}] ${data.name}: ${data.message}`, 'other');
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
  const time = new Date().toLocaleTimeString();
  appendMessage(`[${time}] You: ${message}`, 'self');
  socket.emit('send-chat-message', message);
  messageInput.value = '';
});

function appendMessage(message, type = 'other') {
  const messageElement = document.createElement('div');
  messageElement.innerText = message;
  messageElement.classList.add('message');
  if (type === 'self') messageElement.classList.add('my-message');
  else if (type === 'system') messageElement.classList.add('system-message');
  messageContainer.append(messageElement);
  messageContainer.scrollTop = messageContainer.scrollHeight;
}
