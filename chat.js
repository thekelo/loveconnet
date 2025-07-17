import { auth, db, onAuthStateChanged, signOut, doc, getDoc, collection, addDoc, query, orderBy, onSnapshot } from './firebase.js';

let currentUser;
let currentChatUserId = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  currentUser = user;
  loadChatUsers();
});

async function loadChatUsers() {
  const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
  const matches = userDoc.data().matches || [];

  const chatUsersContainer = document.getElementById('chatUsers');
  chatUsersContainer.innerHTML = '<h3>Your Matches</h3>';

  for (const matchId of matches) {
    const matchDoc = await getDoc(doc(db, 'users', matchId));
    if (matchDoc.exists()) {
      const userData = matchDoc.data();
      const button = document.createElement('button');
      button.textContent = userData.fullName;
      button.onclick = () => loadChat(matchId, userData.fullName);
      chatUsersContainer.appendChild(button);
    }
  }
}

function loadChat(userId, userName) {
  currentChatUserId = userId;
  document.getElementById('chatMessages').innerHTML = `<p><strong>Chat with ${userName}</strong></p>`;

  const chatRef = collection(db, 'chats');
  const q = query(chatRef, orderBy('timestamp'));

  onSnapshot(q, (snapshot) => {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = `<p><strong>Chat with ${userName}</strong></p>`;
    snapshot.forEach((doc) => {
      const msg = doc.data();
      if (
        (msg.sender === currentUser.uid && msg.receiver === currentChatUserId) ||
        (msg.sender === currentChatUserId && msg.receiver === currentUser.uid)
      ) {
        const div = document.createElement('div');
        div.className = msg.sender === currentUser.uid ? 'sent' : 'received';
        div.textContent = msg.text;
        chatMessages.appendChild(div);
      }
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}

window.sendMessage = async function () {
  const text = document.getElementById('messageInput').value.trim();
  if (!text || !currentChatUserId) return;

  await addDoc(collection(db, 'chats'), {
    sender: currentUser.uid,
    receiver: currentChatUserId,
    text,
    timestamp: new Date()
  });

  document.getElementById('messageInput').value = '';
};

window.logout = async function () {
  await signOut(auth);
  window.location.href = 'login.html';
};
