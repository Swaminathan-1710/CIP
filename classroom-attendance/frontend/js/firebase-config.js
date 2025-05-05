// firebase-config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCDXcADOtCyyCeG1pIzj95l65KeJg79yWs",
  authDomain: "face-attendance-system-b5a5b.firebaseapp.com",
  projectId: "face-attendance-system-b5a5b",
  storageBucket: "face-attendance-system-b5a5b.firebasestorage.app",
  messagingSenderId: "204947835687",
  appId: "1:204947835687:web:0cb6f094a2ca62e0703702"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
