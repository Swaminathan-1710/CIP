import firebase_admin
from firebase_admin import credentials, firestore, storage

def initialize_firebase():
    # Replace with the path to your service account key file
    cred = credentials.Certificate(r"C:\Users\SHREYA\Downloads\face-attendance-system-b5a5b-firebase-adminsdk-fbsvc-5ddfbab27e.json")
    
    # Initialize Firebase app only if not already initialized
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred, {
            'storageBucket': 'face-attendance-system-b5a5b.appspot.com'
        })

# Initialize the Firebase app
initialize_firebase()

# Firestore and Storage clients
db = firestore.client()
bucket = storage.bucket()

# Helper function to get user data by UID
def get_user_data(uid):
    try:
        user_doc = db.collection('users').document(uid).get()
        if user_doc.exists:
            return user_doc.to_dict()
        else:
            return None
    except Exception as e:
        print(f"Error fetching user data: {e}")
        return None
