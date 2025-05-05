import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

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

const periods = ["Period 1", "Period 2", "Period 3", "Period 4", "Period 5", "Period 6", "Period 7"];
const startDate = new Date("2025-04-20");
const endDate = new Date("2025-05-10");
const excludedDates = ["2025-04-26", "2025-04-27", "2025-05-03", "2025-05-04"];

function getValidDates() {
  const validDates = [];
  const temp = new Date(startDate);
  while (temp <= endDate) {
    const day = temp.getDay();
    const iso = temp.toISOString().split("T")[0];
    if (day !== 0 && day !== 6 && !excludedDates.includes(iso)) {
      validDates.push(iso);
    }
    temp.setDate(temp.getDate() + 1);
  }
  return validDates;
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("✅ Logged in User:", user.email, "UID:", user.uid);
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log("📦 Firestore User Data:", userData);
      document.getElementById("studentEmail").textContent = user.email;
      document.getElementById("studentName").textContent = userData.name || "N/A";
      document.getElementById("registerNumber").textContent = userData.registerNumber || "N/A";
      await generateAttendanceTable(userData.attendance || {});
    } else {
      console.error("❌ User document not found for UID:", user.uid);
    }
  } else {
    console.warn("⚠️ No user is logged in.");
  }
});

async function generateAttendanceTable(attendanceData) {
  const dates = getValidDates();
  let presentCount = 0;
  let totalCount = 0;
  const tbody = document.getElementById("attendanceBody");
  tbody.innerHTML = "";

  const today = new Date().toISOString().split("T")[0];

  for (const date of dates) {
    const row = document.createElement("tr");
    row.innerHTML = `<td class="border p-2 font-medium">${date}</td>`;

    for (const period of periods) {
      const key = `${date}_${period}`;
      let statusCell = "";

      if (attendanceData[key] === "Present") {
        statusCell = `<span class="text-green-600 font-semibold">Present</span>`;
        presentCount++;
        totalCount++;
      } else if (attendanceData[key] === "Absent") {
        statusCell = `<span class="text-red-600 font-semibold">Absent</span>`;
        totalCount++;
      } else {
        const checkDate = new Date(date);
        const todayDate = new Date();
        checkDate.setHours(0, 0, 0, 0);
        todayDate.setHours(0, 0, 0, 0);

        if (checkDate.getTime() === todayDate.getTime()) {
          // Today's date, not marked yet
          statusCell = `<span class="text-gray-400">-</span>`;
          // Do NOT count in percentage
        } else if (checkDate > todayDate) {
          // Future date
          statusCell = `<span class="text-gray-400">-</span>`;
          // Do NOT count in percentage
        } else {
          // Past date but no data = Absent
          statusCell = `<span class="text-red-600 font-semibold">Absent</span>`;
          totalCount++;
        }
      }

      row.innerHTML += `<td class="border p-2 text-center">${statusCell}</td>`;
    }

    tbody.appendChild(row);
  }

  const percent = totalCount === 0 ? 0 : ((presentCount / totalCount) * 100).toFixed(1);
  document.getElementById("attendancePercent").textContent = `${percent}%`;
  drawOverallPieChart(presentCount, totalCount - presentCount);
}


function drawOverallPieChart(present, absent) {
  const ctx = document.getElementById("overallChart").getContext("2d");
  if (window.overallChart instanceof Chart) {
    window.overallChart.destroy();
  }
  window.overallChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Present", "Absent"],
      datasets: [{
        data: [present, absent],
        backgroundColor: ["#4ade80", "#f87171"]
      }]
    },
    options: {
      responsive: true,
      cutout: "70%",
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}

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
