# app/utils.py
import google.generativeai as genai
import os
import json
import re

def parse_quiz_from_text(text: str):
    """
    Parses a pre-formatted quiz text into a structured JSON format.
    Returns a dictionary or None if parsing fails.
    """
    try:
        # Split the text into questions based on a number followed by a period.
        # e.g., "1.", "2.", etc.
        question_blocks = re.split(r'\n(?=\d+\.\s)', text.strip())
        
        questions = []
        for block in question_blocks:
            if not block.strip():
                continue

            lines = block.strip().split('\n')
            question_text = re.sub(r'^\d+\.\s*', '', lines[0]).strip()
            
            options = []
            # Regex to find options like "a)", "b)", "c)", "d)"
            option_pattern = re.compile(r'^\s*[a-d]\)\s*(.*)', re.IGNORECASE)
            
            for line in lines[1:]:
                match = option_pattern.match(line)
                if match:
                    options.append(match.group(1).strip())

            # A simple heuristic: if we don't find at least 2 options, this block is invalid.
            if len(options) < 2:
                continue

            # For this simple parser, we'll assume the first option is correct by default.
            # A more advanced version could look for an answer key or markers like '*'.
            # For now, this makes the data structure consistent.
            questions.append({
                "question_text": question_text,
                "options": options,
                "correct_answer": 0 # Defaulting to the first option
            })

        if questions:
            return {"questions": questions}
        return None
    except Exception as e:
        print(f"Error parsing pre-formatted quiz: {e}")
        return None


def generate_quiz_from_ai(text: str):
    """
    Generates a multiple-choice quiz from raw text using the Gemini API.
    """
    try:
        genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
        model = genai.GenerativeModel('gemini-pro')

        prompt = f"""
        Analyze the following text and generate a 5-question multiple-choice quiz.
        Return the output as a single, valid JSON object. Do not include any text before or after the JSON object.
        The JSON object should have a single key "questions", which is an array of question objects.
        Each question object must have three keys:
        1. "question_text": A string containing the question.
        2. "options": An array of 4 strings representing the choices.
        3. "correct_answer": An integer (from 0 to 3) representing the index of the correct answer in the "options" array.

        Here is the text to analyze:
        ---
        {text}
        ---
        """
        
        response = model.generate_content(prompt)
        json_response = response.text.strip().replace("```json", "").replace("```", "")
        quiz_data = json.loads(json_response)
        return quiz_data

    except Exception as e:
        print(f"An error occurred during AI quiz generation: {e}")
        return None

def process_quiz_content(text: str, is_preformatted: bool):
    """
    Processes the input text either by parsing it as a pre-formatted quiz
    or by sending it to an AI for generation.
    """
    if is_preformatted:
        print("Attempting to parse text as a pre-formatted quiz.")
        return parse_quiz_from_text(text)
    else:
        print("Sending text to AI for quiz generation.")
        return generate_quiz_from_ai(text)
