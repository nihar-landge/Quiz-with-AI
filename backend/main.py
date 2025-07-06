import os
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS

# --- Initialization ---
app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# --- Configure the Gemini API ---
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable not set.")
genai.configure(api_key=GEMINI_API_KEY)

# Define the single route for your function
@app.route('/', methods=['POST'])
def generate_quiz_http():
    # --- Main function logic ---
    request_json = request.get_json(silent=True)
    if not request_json or 'text' not in request_json:
        return jsonify({"error": "Invalid request: Missing 'text' in body."}), 400

    source_text = request_json['text']
    num_questions = request_json.get('num_questions', 5)

    prompt = f"""
    Based on the following text, generate a quiz with {num_questions} multiple-choice questions.
    The output must be a valid JSON object. Do not include any text or markdown formatting before or after the JSON object.
    The JSON object should have three keys: "title", "accessCode", and "questions".
    - "title" should be a creative title for the quiz.
    - "accessCode" should be a randomly generated 6-character alphanumeric code in uppercase.
    - "questions" should be an array of question objects.
    - Each question object must have four keys: "id" (an integer), "text" (the question), "options" (an array of 4 strings), and "answer" (the correct string from the options).

    Here is the source text:
    ---
    {source_text}
    ---
    """

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        cleaned_response = response.text.strip().replace('```json', '').replace('```', '')
        
        # The response from Gemini is already a JSON string, so we can return it directly.
        # We need to create a Flask Response object to set the content type correctly.
        flask_response = app.response_class(
            response=cleaned_response,
            status=200,
            mimetype='application/json'
        )
        return flask_response

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "Failed to generate quiz from Gemini API."}), 500

# This block is only for running locally with `python main.py` and is ignored on deployment
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)), debug=True)