import smtplib
from email.message import EmailMessage
import os
from dotenv import load_dotenv

load_dotenv()

def send_attendance_email(to_email, student_name, timestamp):
    msg = EmailMessage()
    msg['Subject'] = '📌 Attendance Marked'
    msg['From'] = os.environ.get('EMAIL_USER')
    msg['To'] = to_email
    msg.set_content(
        f"Hi {student_name},\n\nYour attendance was successfully marked on {timestamp}.\n\n- SnapCheck"
    )

    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
        smtp.login(os.environ.get('EMAIL_USER'), os.environ.get('EMAIL_PASS'))
        smtp.send_message(msg)
