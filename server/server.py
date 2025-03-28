# server.py
import base64
import io

from flask import Flask, request, jsonify
from PIL import Image

# Gemini import
from google import genai
from google.genai import types

app = Flask(__name__)

# Replace with your actual Gemini API key
GEMINI_API_KEY = "AIzaSyBbhzBUldYy7jUhOsIf4uZU8VIgDBCiEFY"

# Create a single Gemini client
client = genai.Client(api_key=GEMINI_API_KEY)

@app.route('/analyze-image', methods=['POST'])
def analyze_image():
    try:
        data = request.get_json()
        image_b64 = data.get('imageBase64')
        if not image_b64:
            return jsonify({"error": "No image data provided"}), 400

        # Decode base64 string to bytes
        image_bytes = base64.b64decode(image_b64)
        # Convert bytes to a PIL image
        pil_image = Image.open(io.BytesIO(image_bytes))

        # Make a prompt to check if user is "sleepy"
        # For demonstration, we ask a question to Gemini about the image
        # In practice, you'll tailor the prompt to your needs
        prompt = "Based solely on the visual cues in this image, is the person appearing 'sleepy' or 'alert'? Please respond with only one word: 'sleepy' or 'alert'."

        # Make the Gemini call
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[prompt, pil_image]
        )

        # Gemini's response is text-based. For example:
        # "It appears the person's eyes are closed, so they might be sleepy."
        # You can parse or analyze the text to get a final "sleepy"/"not sleepy" label.
        gemini_text = response.text

        return jsonify({
            "geminiAnalysis": gemini_text
        }), 200

    except Exception as e:
        print("Error analyzing image:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9000, debug=True)
