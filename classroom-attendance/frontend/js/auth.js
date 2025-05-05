// js/auth.js

import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorDisplay = document.getElementById("loginError");

  errorDisplay.textContent = '';
  errorDisplay.classList.add("hidden");

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      if (userData.role === "student") {
        window.location.href = "student_dashboard.html";
      } else if (userData.role === "teacher") {
        window.location.href = "teacher_dashboard.html";
      } else {
        errorDisplay.textContent = "User role not defined.";
        errorDisplay.classList.remove("hidden");
      }
    } else {
      errorDisplay.textContent = "No user data found.";
      errorDisplay.classList.remove("hidden");
    }
  } catch (error) {
    errorDisplay.textContent = "Error: " + error.message;
    errorDisplay.classList.remove("hidden");
  }
});
