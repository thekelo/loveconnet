// Initialize Firebase imports (already in firebase-config.js)
const db = firebase.firestore();
const auth = firebase.auth();

const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const messagesContainer = document.getElementById("messages");

// This should be dynamically set based on who you chat with.
// For demo, replace this with the UID of the chat partner.
let chatPartnerUID = "REPLACE_WITH_CHAT_PARTNER_UID";

function addMessageElement(text, isMyMessage) {
  const messageEl = document.createElement("div");
  messageEl.className = isMyMessage ? "my-message" : "their-message";
  messageEl.textContent = text;
  messagesContainer.appendChild(messageEl);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function loadChatMessages(currentUserId, chatPartnerUID) {
  const messagesRef = db.collection("messages")
    .orderBy("timestamp", "asc");

  messagesRef.onSnapshot((snapshot) => {
    messagesContainer.innerHTML = ""; // Clear messages first
    snapshot.forEach((doc) => {
      const msg = doc.data();
      const isBetweenUsers =
        (msg.sender === currentUserId && msg.receiver === chatPartnerUID) ||
        (msg.sender === chatPartnerUID && msg.receiver === currentUserId);

      if (isBetweenUsers) {
        addMessageElement(msg.text, msg.sender === currentUserId);
      }
    });
  });
}

function sendMessage(senderId, receiverId, text) {
  if (!text.trim()) return;

  db.collection("messages").add({
    sender: senderId,
    receiver: receiverId,
    text: text,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    messageInput.value = "";
  }).catch((error) => {
    console.error("Error sending message:", error);
  });
}

auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // Start listening to chat messages
  loadChatMessages(user.uid, chatPartnerUID);

  sendBtn.onclick = () => {
    sendMessage(user.uid, chatPartnerUID, messageInput.value);
  };
});
