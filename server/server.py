from flask import Flask, request, jsonify
import base64
import numpy as np
import cv2
from keras.models import load_model
from keras.preprocessing.image import img_to_array

app = Flask(__name__)

# Load model and Haar cascades
model = load_model("drowiness_new7.h5")
face_cascade = cv2.CascadeClassifier("data/haarcascade_frontalface_default.xml")
left_eye_cascade = cv2.CascadeClassifier("data/haarcascade_lefteye_2splits.xml")
right_eye_cascade = cv2.CascadeClassifier("data/haarcascade_righteye_2splits.xml")

classes = ['Closed', 'Open']

@app.route("/")
def home():
    return jsonify({"message": "Drowsiness detection API is running"})

@app.route("/predict", methods=["POST"])
def predict():
    # Expecting a JSON payload with key 'imageBase64'
    data = request.get_json()
    if data is None or 'imageBase64' not in data:
        return jsonify({"error": "No image provided"}), 400

    try:
        image_base64 = data['imageBase64']
        image_bytes = base64.b64decode(image_base64)
        image_np = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(image_np, cv2.IMREAD_COLOR)

        # Convert frame to grayscale and process
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        status1 = -1
        status2 = -1

        faces = face_cascade.detectMultiScale(gray, 1.3, 5)
        for (x, y, w, h) in faces:
            roi_gray = gray[y:y+h, x:x+w]
            roi_color = frame[y:y+h, x:x+w]

            left_eye = left_eye_cascade.detectMultiScale(roi_gray)
            right_eye = right_eye_cascade.detectMultiScale(roi_gray)

            for (x1, y1, w1, h1) in left_eye:
                eye1 = roi_color[y1:y1+h1, x1:x1+w1]
                eye1 = cv2.resize(eye1, (145, 145))
                eye1 = eye1.astype('float') / 255.0
                eye1 = img_to_array(eye1)
                eye1 = np.expand_dims(eye1, axis=0)
                pred1 = model.predict(eye1)
                status1 = np.argmax(pred1)
                break

            for (x2, y2, w2, h2) in right_eye:
                eye2 = roi_color[y2:y2+h2, x2:x2+w2]
                eye2 = cv2.resize(eye2, (145, 145))
                eye2 = eye2.astype('float') / 255.0
                eye2 = img_to_array(eye2)
                eye2 = np.expand_dims(eye2, axis=0)
                pred2 = model.predict(eye2)
                status2 = np.argmax(pred2)
                break

            # Process only the first detected face
            break

        # Use the same condition as your original code:
        # Both eyes closed if the predicted index equals 2
        if status1 == 2 and status2 == 2:
            return jsonify({"prediction": "Drowsy"})
        elif status1 == -1 or status2 == -1:
            return jsonify({"error": "Eyes not detected"}), 400
        else:
            return jsonify({"prediction": "Not Drowsy"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3500)