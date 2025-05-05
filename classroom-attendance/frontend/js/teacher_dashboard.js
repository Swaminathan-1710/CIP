import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
// ✅ Firebase config (replace if different)
const firebaseConfig = {
  apiKey: "AIzaSyCDXcADOtCyyCeG1pIzj95l65KeJg79yWs",
  authDomain: "face-attendance-system-b5a5b.firebaseapp.com",
  projectId: "face-attendance-system-b5a5b",
  storageBucket: "face-attendance-system-b5a5b.appspot.com",
  messagingSenderId: "204947835687",
  appId: "1:204947835687:web:0cb6f094a2ca62e0703702"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const teacherNameEl = document.getElementById("teacherName");
const attendanceTable = document.getElementById("attendanceBody");
const dateInput = document.getElementById("attendanceDate");

const periods = [
  { period: 1, time: "9:10 – 10:00" },
  { period: 2, time: "10:00 – 10:50" },
  { period: 3, time: "10:50 – 11:40" },
  { period: 4, time: "11:50 – 12:40" },
  { period: 5, time: "12:40 – 1:30" },
  { period: 6, time: "2:20 – 3:10" },
  { period: 7, time: "3:10 – 4:00" }
];

dateInput.value = new Date().toISOString().split("T")[0];
dateInput.addEventListener("change", loadAttendance);

onAuthStateChanged(auth, async (user) => {
  if (user) {
    teacherNameEl.textContent = user.displayName || user.email;
    loadAttendance();
  } else {
    window.location.href = "login.html";
  }
});

async function loadAttendance() {
  attendanceTable.innerHTML = "";
  const selectedDate = dateInput.value;

  const usersSnapshot = await getDocs(collection(db, "users"));
  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();
    if ((userData.role || "").toLowerCase().trim() === "teacher") continue;


    for (const p of periods) {
      const key = `${selectedDate}_Period ${p.period}`;
      const status = userData.attendance?.[key] === "Present" ? "Present" : "Absent";

      attendanceTable.innerHTML += `
        <tr>
          <td class="border p-2">${userData.name}</td>
          <td class="border p-2">${userData.registerNumber || "-"}</td>
          <td class="border p-2">${p.period} (${p.time})</td>
          <td class="border p-2 ${status === "Present" ? "text-green-600" : "text-red-600"}">${status}</td>
          <td class="border p-2">
            <button class="bg-green-500 text-white px-2 py-1 rounded text-sm" onclick="markAttendance('${userDoc.id}', '${key}', 'Present')">Present</button>
            <button class="bg-red-500 text-white px-2 py-1 rounded text-sm ml-2" onclick="markAttendance('${userDoc.id}', '${key}', 'Absent')">Absent</button>
          </td>
        </tr>`;
    }
  }
}



window.markAttendance = async function (uid, key, status) {
  const userRef = doc(db, "users", uid);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    const data = userDoc.data();
    const newAttendance = { ...(data.attendance || {}), [key]: status };
    await updateDoc(userRef, { attendance: newAttendance });
    loadAttendance();
  }
};
document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      console.log("🚪 User signed out.");
      window.location.href = "login.html"; // Redirect to login page or homepage
    })
    .catch((error) => {
      console.error("❌ Error signing out:", error);
    });
});