from flask import Flask, request, jsonify
from flask_cors import CORS
from firebase_config import initialize_firebase
from face_recognition import register_face, recognize_face
from utils.firebase_utils import add_user_to_firestore, update_attendance

app = Flask(__name__)

# Initialize Firebase
firebase_app = initialize_firebase()

# Enable CORS for the app
CORS(app, origins="http://127.0.0.1:5500")

@app.route('/register_face', methods=['POST'])
def register_face_endpoint():
    """
    Endpoint to register the face of a student during registration.
    The face image should be sent in the request body as base64.
    """
    data = request.json
    user_id = data['user_id']
    face_image = data['face_image']  # base64 encoded image string
    
    success = register_face(user_id, face_image)
    
    if success:
        return jsonify({"message": "Face registered successfully."}), 200
    else:
        return jsonify({"message": "Face registration failed."}), 500

@app.route('/recognize_face', methods=['POST'])
def recognize_face_endpoint():
    """
    Endpoint to recognize a face during the attendance marking process.
    """
    face_image = request.json['face_image']  # Captured face image in base64
    
    recognized_user_id = recognize_face(face_image)
    
    if recognized_user_id:
        return jsonify({"user_id": recognized_user_id, "message": "Attendance marked."}), 200
    else:
        return jsonify({"message": "Face not recognized."}), 400

@app.route('/mark_attendance', methods=['POST'])
def mark_attendance():
    """
    Endpoint to mark attendance for a student and send a confirmation email.
    """
    from utils.email_utils import send_attendance_email  # Import here to avoid circular import

    data = request.json
    user_id = data['user_id']
    date = data['date']
    status = data['status']  # 'Present' or 'Absent'

    success = update_attendance(user_id, date, status)

    if success:
        # Fetch user data for email
        from firebase_admin import firestore
        db = firestore.client()

        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()

        if user_doc.exists:
            user_data = user_doc.to_dict()
            if 'email' in user_data and 'name' in user_data:
                try:
                    send_attendance_email(
                        to_email=user_data['email'],
                        student_name=user_data['name'],
                        timestamp=f"{date} ({status})"
                    )
                except Exception as e:
                    print(f"Failed to send attendance email: {e}")
        
        return jsonify({"message": "Attendance marked successfully."}), 200
    else:
        return jsonify({"message": "Failed to mark attendance."}), 500


@app.route('/register_user', methods=['POST'])
def register_user():
    """
    Endpoint to register a student or teacher in Firestore.
    """
    data = request.json
    name = data['name']
    email = data['email']
    role = data['role']  # 'student' or 'teacher'
    
    user_id = add_user_to_firestore(name, email, role)
    
    if user_id:
        return jsonify({"message": "User registered successfully.", "user_id": user_id}), 200
    else:
        return jsonify({"message": "Failed to register user."}), 500

if __name__ == '__main__':
    app.run(debug=True)