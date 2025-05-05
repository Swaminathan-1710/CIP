from firebase_config import db

def add_user_to_firestore(name, email, role):
    """
    Add a user to Firestore with the given role (student/teacher).
    """
    user_ref = db.collection('users').document(email)  # Using email as user ID
    user_ref.set({
        'name': name,
        'email': email,
        'role': role,
        'attendance': {}  # Initialize empty attendance data
    })
    return email  # Return the user ID (email in this case)

def update_attendance(user_id, date, status):
    """
    Update the attendance record for a user on a specific date.
    """
    user_ref = db.collection('users').document(user_id)
    attendance = user_ref.get().to_dict()['attendance']
    attendance[date] = status
    user_ref.update({'attendance': attendance})
    return True
