import h5py

file_path = 'C:/Users/SHREYA/Desktop/New folder/classroom-attendance/backend/models/facenet_keras.h5'

with h5py.File(file_path, 'r') as f:
    print(list(f.keys()))
