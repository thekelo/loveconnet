// Import Firebase modules
import { db, auth } from './firebase.js';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';

// Elements
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const messagesContainer = document.getElementById("messages");

// 🔄 Replace with the UID of the person the current user is chatting with
let chatPartnerUID = "RECEIVER_USER_UID";

// ✅ Send message function
async function sendMessage(senderId, receiverId, text) {
  if (!text.trim()) return;

  try {
    await addDoc(collection(db, "messages"), {
      sender: senderId,
      receiver: receiverId,
      text: text,
      timestamp: serverTimestamp()
    });

    messageInput.value = ""; // Clear input after sending
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

// 🎯 Display messages between current user and partner
function loadChatMessages(currentUserId, chatPartnerUID) {
  const messagesRef = collection(db, "messages");

  const q = query(
    messagesRef,
    where("sender", "in", [currentUserId, chatPartnerUID]),
    where("receiver", "in", [currentUserId, chatPartnerUID]),
    orderBy("timestamp", "asc")
  );

  onSnapshot(q, (snapshot) => {
    messagesContainer.innerHTML = ""; // Clear messages first
    snapshot.forEach((doc) => {
      const msg = doc.data();
      const isOwnMessage = msg.sender === currentUserId;

      const messageEl = document.createElement("div");
      messageEl.className = isOwnMessage ? "my-message" : "their-message";
      messageEl.textContent = msg.text;
      messagesContainer.appendChild(messageEl);
    });

    // Scroll to latest message
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  });
}

// 🔐 Wait for Firebase auth to load current user
auth.onAuthStateChanged((user) => {
  if (user) {
    loadChatMessages(user.uid, chatPartnerUID);

    sendBtn.addEventListener("click", () => {
      sendMessage(user.uid, chatPartnerUID, messageInput.value);
    });
  }
});
