import cv2
import base64
import requests
import datetime
import time

API_URL = "http://localhost:5000"

def get_current_period():
    now = datetime.datetime.now().time()
    schedule = [
        ("09:10", "10:00", "Period 1"),
        ("10:00", "10:50", "Period 2"),
        ("10:50", "11:40", "Period 3"),
        ("11:50", "12:40", "Period 4"),
        ("12:40", "13:30", "Period 5"),
        ("14:20", "15:10", "Period 6"),
        ("15:10", "16:00", "Period 7")
    ]

    for start, end, label in schedule:
        if datetime.time.fromisoformat(start) <= now <= datetime.time.fromisoformat(end):
            return label
    return None

def capture_image_as_base64():
    cap = cv2.VideoCapture(0)
    ret, frame = cap.read()
    cap.release()

    _, buffer = cv2.imencode('.jpg', frame)
    jpg_as_text = base64.b64encode(buffer).decode('utf-8')
    return jpg_as_text

def automatic_attendance_loop():
    print("Starting automatic attendance...")

    while True:
        period = get_current_period()

        if period:
            print(f"Marking attendance for: {period}")

            image_base64 = capture_image_as_base64()

            # Recognize face
            response = requests.post(f"{API_URL}/recognize_face", json={"face_image": image_base64})

            if response.status_code == 200:
                user_id = response.json()['user_id']
                print(f"Attendance marked for {user_id}")

                # Mark attendance
                date = datetime.date.today().isoformat()
                status = "Present"
                requests.post(f"{API_URL}/mark_attendance", json={
                    "user_id": user_id,
                    "date": f"{date}_{period}",
                    "status": status
                })

            else:
                print("Face not recognized")

            time.sleep(3)  # wait before next detection
        else:
            print("No active period. Waiting...")
            time.sleep(60)

if __name__ == "__main__":
    automatic_attendance_loop()