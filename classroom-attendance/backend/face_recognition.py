import base64
import numpy as np
from deepface import DeepFace
from io import BytesIO
from PIL import Image
from firebase_admin import firestore
import re
import cv2
import firebase_admin

if not firebase_admin._apps:
    firebase_admin.initialize_app()
db = firestore.client()

def clean_base64_image(base64_str):
    match = re.match(r'data:image/\w+;base64,(.*)', base64_str)
    return match.group(1) if match else base64_str

def register_face(user_id, face_image):
    try:
        cleaned_image = clean_base64_image(face_image)
        decoded = base64.b64decode(cleaned_image)
        Image.open(BytesIO(decoded))  # Validate image

        user_ref = db.collection('users').document(user_id)
        user_ref.set({
            'face_image': cleaned_image
        }, merge=True)

        return True
    except Exception as e:
        print(f"Error in registering face: {e}")
        return False

def is_valid_base64_image(base64_str):
    try:
        decoded = base64.b64decode(base64_str)
        Image.open(BytesIO(decoded))
        return True
    except:
        return False

def decode_base64_image(base64_str):
    match = re.match(r'data:image/\w+;base64,(.*)', base64_str)
    if match:
        base64_str = match.group(1)
    try:
        return base64.b64decode(base64_str)
    except Exception as e:
        print(f"Invalid base64 image string: {e}")
        return None

def recognize_face(face_image):
    try:
        captured_image_data = decode_base64_image(face_image)
        if not captured_image_data:
            return None

        try:
            captured_image = Image.open(BytesIO(captured_image_data))
        except Exception as e:
            print(f"Error in decoding the captured face image: {e}")
            return None

        users_ref = db.collection('users')
        users = users_ref.stream()

        for user in users:
            user_data = user.to_dict()
            stored_face_base64 = user_data.get('face_image')

            if not stored_face_base64 or not is_valid_base64_image(stored_face_base64):
                print(f"Invalid or missing face image for user: {user.id}")
                continue

            try:
                stored_image_data = base64.b64decode(stored_face_base64)
                stored_image = Image.open(BytesIO(stored_image_data))

                captured_image_np = cv2.cvtColor(np.array(captured_image), cv2.COLOR_RGB2BGR)
                stored_image_np = cv2.cvtColor(np.array(stored_image), cv2.COLOR_RGB2BGR)

                result = DeepFace.verify(captured_image_np, stored_image_np)

                if result.get("verified"):
                    return user.id
            except Exception as e:
                print(f"Error with user {user.id} face image comparison: {e}")
                continue

        return None
    except Exception as e:
        print(f"Error in recognizing face: {e}")
        return None