# /ai_quiz_app/server.py

from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS  # Import CORS
import google.generativeai as genai
import json
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- App, DB, and AI Initialization ---
app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app)  # Enable CORS for all routes
bcrypt = Bcrypt(app)

# Database Config
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///quiz_app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# AI Config - Load from environment variables
GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY')
if not GOOGLE_API_KEY:
    print("Warning: GOOGLE_API_KEY not found in environment variables")
    
try:
    genai.configure(api_key=GOOGLE_API_KEY)
except Exception as e:
    print(f"Error configuring Google AI: {e}")

# --- Database Models ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='student')

class Quiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    total_points = db.Column(db.Integer, nullable=False)
    questions = db.relationship('Question', backref='quiz', cascade="all, delete-orphan", lazy=True)

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question_text = db.Column(db.String(500), nullable=False)
    options = db.Column(db.String(500), nullable=False)
    correct_option = db.Column(db.Integer, nullable=False)
    points = db.Column(db.Integer, nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)

class Submission(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    score = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
    user = db.relationship('User', backref='submissions')
    quiz = db.relationship('Quiz', backref='submissions')


def create_default_admin():
    """Create a default admin user if none exists"""
    admin_email = "admin@quiz.com"
    admin_password = "admin123"
    
    # Check if admin already exists
    existing_admin = User.query.filter_by(email=admin_email).first()
    if not existing_admin:
        hashed_password = bcrypt.generate_password_hash(admin_password).decode('utf-8')
        admin_user = User(
            name="Admin User",
            email=admin_email,
            password=hashed_password,
            role='admin'
        )
        db.session.add(admin_user)
        db.session.commit()
        print(f"Default admin created - Email: {admin_email}, Password: {admin_password}")
    else:
        print("Admin user already exists")


# --- API Endpoints ---

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    # Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 409
        
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(name=data['name'], email=data['email'], password=hashed_password, role=data['role'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully!'})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if user and bcrypt.check_password_hash(user.password, data['password']):
        return jsonify({'message': 'Login successful!', 'user': {'id': user.id, 'name': user.name, 'role': user.role}})
    return jsonify({'error': 'Invalid credentials'}), 401


def generate_quiz_with_ai(text_content):
    model = genai.GenerativeModel('gemini-1.5-flash-latest')
    prompt = f"""
    You are an expert quiz creation assistant. Analyze the following text which contains questions and answers.
    Your task is to extract the questions, the multiple-choice options, and identify the correct answer.
    Format the output as a single, clean JSON object with a "title" and a list of "questions".
    Each question object must have: "question" (string), "options" (list of 4 strings), "correct" (the 0-based index of the correct option), and "points" (integer, assign 5 points).
    Do not include any text or markdown formatting like ```json before or after the JSON object.

    Text to analyze:
    ---
    {text_content}
    ---
    """
    try:
        response = model.generate_content(prompt)
        # Assuming the response is clean JSON as per the prompt
        return response.text
    except Exception as e:
        print(f"An error occurred with the AI API: {e}")
        return json.dumps({"error": "Failed to generate quiz from AI."})

@app.route('/api/generate-quiz', methods=['POST'])
def handle_quiz_generation():
    text_from_admin = request.json.get('text')
    if not text_from_admin:
        return jsonify({"error": "No text provided"}), 400

    ai_response_str = generate_quiz_with_ai(text_from_admin)
    try:
        quiz_data = json.loads(ai_response_str)
    except json.JSONDecodeError:
        return jsonify({"error": "Failed to parse AI response. The AI may have returned an invalid format."}), 500

    total_points = sum(q.get('points', 0) for q in quiz_data.get('questions', []))
    new_quiz = Quiz(title=quiz_data.get('title', 'AI Generated Quiz'), total_points=total_points)
    
    for q_data in quiz_data.get('questions', []):
        new_question = Question(
            question_text=q_data['question'],
            options=json.dumps(q_data['options']),
            correct_option=q_data['correct'],
            points=q_data['points'],
            quiz=new_quiz
        )
        db.session.add(new_question)
        
    db.session.add(new_quiz)
    db.session.commit()
    
    return jsonify(quiz_data)

@app.route('/api/quizzes', methods=['GET'])
def get_quizzes():
    quizzes = Quiz.query.all()
    output = [{'id': q.id, 'title': q.title, 'description': f"{len(q.questions)} questions", 'totalPoints': q.total_points, 'questions': len(q.questions), 'duration': 300, 'difficulty': "Intermediate"} for q in quizzes]
    return jsonify(output)


@app.route('/api/quiz/<int:quiz_id>', methods=['GET'])
def get_quiz(quiz_id):
    quiz = Quiz.query.get_or_404(quiz_id)
    questions_list = [{'id': q.id, 'question': q.question_text, 'options': json.loads(q.options), 'correct': q.correct_option, 'points': q.points} for q in quiz.questions]
    return jsonify({'id': quiz.id, 'title': quiz.title, 'totalPoints': quiz.total_points, 'duration': 300, 'questions': questions_list})

@app.route('/api/submit-quiz', methods=['POST'])
def submit_quiz():
    data = request.get_json()
    user_id = data.get('userId')
    quiz_id = data.get('quizId')
    answers = data.get('answers')
    
    if not all([user_id, quiz_id, answers]):
        return jsonify({'error': 'Missing data'}), 400
        
    total_score = 0
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({'error': 'Quiz not found'}), 404
        
    for q in quiz.questions:
        user_answer_index = answers.get(str(q.id))
        if user_answer_index is not None and int(user_answer_index) == q.correct_option:
            total_score += q.points
            
    new_submission = Submission(score=total_score, user_id=user_id, quiz_id=quiz_id)
    db.session.add(new_submission)
    db.session.commit()
    
    return jsonify({'message': 'Submission successful!', 'score': total_score, 'totalPoints': quiz.total_points})

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    submissions = Submission.query.order_by(Submission.score.desc()).limit(10).all()
    leaderboard = [{'studentName': s.user.name, 'quizTitle': s.quiz.title, 'score': s.score, 'maxScore': s.quiz.total_points} for s in submissions]
    return jsonify(leaderboard)

# Route to serve the frontend
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        create_default_admin()  # Ensure there's always an admin user
    app.run(debug=True, port=5000)