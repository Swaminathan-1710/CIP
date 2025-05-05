import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const registerForm = document.getElementById("registerForm");
const roleSelect = document.getElementById("role");
const extraField = document.getElementById("extraField");
const extraInput = document.getElementById("extraInput");
const extraLabel = document.getElementById("extraLabel");
const faceSection = document.getElementById("faceSection");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("captureBtn");
const errorMsg = document.getElementById("registerError");

let capturedImage = null;

// Handle role change
roleSelect.addEventListener("change", () => {
  const role = roleSelect.value;

  if (role === "student") {
    extraLabel.textContent = "Register Number (Student)";
    extraField.classList.remove("hidden");
    faceSection.classList.remove("hidden");
    startCamera();
  } else if (role === "teacher") {
    extraLabel.textContent = "Teacher ID (must contain $)";
    extraField.classList.remove("hidden");
    faceSection.classList.add("hidden");
    stopCamera();
  } else {
    extraField.classList.add("hidden");
    faceSection.classList.add("hidden");
    stopCamera();
  }
});

// Start webcam
function startCamera() {
  navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
    video.srcObject = stream;
  }).catch(console.error);
}

// Stop webcam
function stopCamera() {
  const stream = video.srcObject;
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
}

// Capture image
captureBtn.addEventListener("click", () => {
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  capturedImage = canvas.toDataURL("image/jpeg");
  canvas.classList.remove("hidden");
});

// Show error
function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.remove("hidden");
}

// Handle registration
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = roleSelect.value;
  const extra = extraInput.value.trim();

  const studentClass = document.getElementById("studentClass").value.trim();
  const studentDept = document.getElementById("studentDept").value;
  const studentYear = document.getElementById("studentYear").value;

  // Validations
  if (!email.endsWith("@kanchiuniv.ac.in")) {
    showError("Email must be in @kanchiuniv.ac.in domain");
    return;
  }

  if (role === "teacher" && !extra.includes("$")) {
    showError("Teacher ID must contain a '$'");
    return;
  }

  if (role === "student" && !capturedImage) {
    showError("Please capture your face");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Prepare user data
    const userData = {
      uid,
      name,
      email,
      role
    };

    if (role === "student") {
      userData.registerNumber = extra;
      userData.class = studentClass;
      userData.department = studentDept;
      userData.year = studentYear;
      userData.attendance = {};
    } else if (role === "teacher") {
      userData.teacherId = extra;
    }

    // Save to Firestore
    await setDoc(doc(db, "users", uid), userData);

    // Send face to Flask if student
    if (role === "student") {
      const response = await fetch("http://localhost:5000/register_face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: uid,
          face_image: capturedImage
        })
      });

      if (!response.ok) {
        showError("Face registration failed.");
        return;
      }
    }

    // Redirect to login
    window.location.href = "login.html";
  } catch (error) {
    showError(error.message);
  }
});