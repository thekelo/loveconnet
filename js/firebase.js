// Initialize Firebase using compat SDK
firebase.initializeApp({
  apiKey: "AIzaSyCyR7m47iJY_9TLgR93pKzNdPV9VFWeVak",
  authDomain: "findlove-dating-app-5765d.firebaseapp.com",
  projectId: "findlove-dating-app-5765d",
  storageBucket: "findlove-dating-app-5765d.appspot.com",
  messagingSenderId: "109134771821",
  appId: "1:109134771821:web:a2e75e5c426c8046ecf164"
});

// Assign Firebase services to global variables
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
