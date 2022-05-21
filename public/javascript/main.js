const chatForm = document.querySelector('#chat-form');
const chatMessages = document.querySelector('.chat-messages');
const messageChat =document.querySelector('#msg');

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
/*const username = location.search.split("?")[1].split("&")[0].split("=")[1];
const room = location.search.split("?")[1].split("&")[1].split("=")[1];
console.log(username,room);*/


const socket = io();

//1) Join chatroom
socket.emit('joinRoom', { username, room });

//2) Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;
  console.log(msg);

  //if enter space
  msg = msg.trim();
  if (!msg) {
    return false;
  }

  // Emit message to server => to show
  socket.emit('chatMessage', msg);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

//3) Get Message from server.
socket.on('messageForRun', message=>{
  console.log(message);
})
// Message from server
socket.on('message', (message) => {
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  if (leaveRoom) {
    window.location = '../index.html';
  } else {
  }
});
