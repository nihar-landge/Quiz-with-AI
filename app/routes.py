# app/routes.py
# Add the 'json' import at the top of the file
import json
from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_user, current_user, logout_user, login_required
from app import db
from app.models import User, Quiz, Question, Option, Result
from app.forms import RegistrationForm, LoginForm, QuizTextForm
from app.utils import process_quiz_content

main = Blueprint('main', __name__)

# ... (all other routes like home, register, login, etc. remain the same) ...
# --- PASTE THE UNCHANGED ROUTES HERE ---
@main.route('/')
def home():
    if current_user.is_authenticated:
        if current_user.role == 'admin':
            return redirect(url_for('main.admin_dashboard'))
        else:
            return redirect(url_for('main.student_dashboard'))
    return render_template('auth/login.html', form=LoginForm())

@main.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('main.home'))
    form = RegistrationForm()
    if form.validate_on_submit():
        user = User(username=form.username.data, password=form.password.data)
        if User.query.count() == 0:
            user.role = 'admin'
        db.session.add(user)
        db.session.commit()
        flash('Your account has been created! You are now able to log in.', 'success')
        return redirect(url_for('main.login'))
    return render_template('auth/register.html', form=form)

@main.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.home'))
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user and user.verify_password(form.password.data):
            login_user(user, remember=form.remember.data)
            next_page = request.args.get('next')
            return redirect(next_page) if next_page else redirect(url_for('main.home'))
        else:
            flash('Login Unsuccessful. Please check username and password.', 'danger')
    return render_template('auth/login.html', form=form)

@main.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('main.login'))

@main.route('/admin/dashboard')
@login_required
def admin_dashboard():
    if current_user.role != 'admin':
        return redirect(url_for('main.student_dashboard'))
    quizzes = Quiz.query.filter_by(author_id=current_user.id).all()
    return render_template('admin/admin_dashboard.html', quizzes=quizzes)

@main.route('/admin/create', methods=['GET', 'POST'])
@login_required
def create_quiz():
    if current_user.role != 'admin':
        return redirect(url_for('main.home'))
    form = QuizTextForm()
    if form.validate_on_submit():
        is_preformatted = form.is_preformatted.data
        quiz_data = process_quiz_content(form.content.data, is_preformatted)
        if quiz_data and 'questions' in quiz_data:
            new_quiz = Quiz(title=form.title.data, author_id=current_user.id)
            db.session.add(new_quiz)
            db.session.flush()
            for q_data in quiz_data['questions']:
                if 'question_text' not in q_data or 'options' not in q_data:
                    continue
                question = Question(question_text=q_data['question_text'], quiz_id=new_quiz.id)
                db.session.add(question)
                db.session.flush()
                correct_index = q_data.get('correct_answer', 0)
                for i, opt_text in enumerate(q_data['options']):
                    is_correct = (i == correct_index)
                    option = Option(option_text=opt_text, is_correct=is_correct, question_id=question.id)
                    db.session.add(option)
            db.session.commit()
            flash('Quiz created successfully!', 'success')
            return redirect(url_for('main.admin_dashboard'))
        else:
            flash('Could not generate or parse quiz from the provided text. Please check the format or try again.', 'danger')
    return render_template('admin/create_quiz.html', form=form)

@main.route('/student/dashboard')
@login_required
def student_dashboard():
    if current_user.role != 'student':
        return redirect(url_for('main.admin_dashboard'))
    xp_for_next_level = (current_user.level) * 100
    progress_percentage = (current_user.xp % 100)
    return render_template('student/student_dashboard.html', 
                           xp_for_next_level=xp_for_next_level, 
                           progress_percentage=progress_percentage)

@main.route('/student/missions')
@login_required
def missions():
    quizzes = Quiz.query.all()
    return render_template('student/missions.html', quizzes=quizzes)

# --- MODIFIED ROUTE ---
@main.route('/student/mission/<int:quiz_id>')
@login_required
def take_quiz(quiz_id):
    quiz = Quiz.query.get_or_404(quiz_id)
    
    print(f"Quiz found: {quiz.title}")
    print(f"Number of questions: {len(quiz.questions)}")
    
    # Prepare the data structure in Python
    quiz_data = {
        'id': quiz.id,
        'title': quiz.title,
        'questions': [
            {
                'id': q.id,
                'text': q.question_text,
                'options': [{'id': o.id, 'text': o.option_text} for o in q.options]
            } for q in quiz.questions
        ]
    }
    
    print(f"Quiz data structure: {quiz_data}")
    
    # Convert the Python dictionary to a JSON string
    quiz_json = json.dumps(quiz_data)
    
    print(f"Quiz JSON: {quiz_json}")
    
    # Pass both the original quiz object and the new JSON string to the template
    return render_template('student/take_quiz.html', quiz=quiz, quiz_json=quiz_json)


@main.route('/submit_mission/<int:quiz_id>', methods=['POST'])
@login_required
def submit_quiz(quiz_id):
    data = request.get_json()
    answers = data.get('answers')
    score = 0
    total_questions = 0
    for question_id, option_id in answers.items():
        total_questions += 1
        option = Option.query.get(int(option_id))
        if option and option.is_correct:
            score += 1
    xp_earned = score * 10
    current_user.xp += xp_earned
    current_user.level = 1 + (current_user.xp // 100)
    result = Result(user_id=current_user.id, quiz_id=quiz_id, score=score)
    db.session.add(result)
    db.session.commit()
    return jsonify({
        'score': score,
        'total': total_questions,
        'xp_earned': xp_earned,
        'new_xp': current_user.xp,
        'new_level': current_user.level
    })

@main.route('/leaderboard')
@login_required
def leaderboard():
    top_users = User.query.filter_by(role='student').order_by(User.xp.desc()).limit(10).all()
    return render_template('student/leaderboard.html', users=top_users)
