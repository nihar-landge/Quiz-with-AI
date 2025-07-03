// /static/app.js

document.addEventListener('DOMContentLoaded', initializeApp);

// Application State
let currentUser = null;
let currentQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = {}; // Store answers as {questionId: optionIndex}
let quizTimer = null;

// DOM Elements
const elements = {
  landing: document.getElementById('landing'),
  adminDashboard: document.getElementById('adminDashboard'),
  studentDashboard: document.getElementById('studentDashboard'),
  loginModal: document.getElementById('loginModal'),
  registerModal: document.getElementById('registerModal'),
  navLogin: document.querySelector('.nav-login'),
  navRegister: document.querySelector('.nav-register'),
  navUserMenu: document.querySelector('.nav-user-menu'),
  userName: document.querySelector('.user-name'),
  toastContainer: document.getElementById('toastContainer'),
};

function initializeApp() {
  setupEventListeners();
  checkAuthStatus();
  showSection('landing');
}

function setupEventListeners() {
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('registerForm').addEventListener('submit', handleRegister);
  document.querySelectorAll('.modal-close').forEach(btn => btn.addEventListener('click', () => btn.closest('.modal').classList.remove('active')));
  document.querySelector('.nav-brand').addEventListener('click', () => {
    if (currentUser?.role === 'admin') showSection('admin');
    else if (currentUser?.role === 'student') showSection('student');
    else showSection('landing');
  });
}

function checkAuthStatus() {
  const user = sessionStorage.getItem('currentUser');
  if (user) {
    currentUser = JSON.parse(user);
    loginUserView();
    showSection(currentUser.role);
  }
}

function showSection(sectionName) {
  document.querySelectorAll('.landing-section, .dashboard-section').forEach(section => section.classList.add('hidden'));
  switch (sectionName) {
    case 'landing': elements.landing.classList.remove('hidden'); break;
    case 'admin': elements.adminDashboard.classList.remove('hidden'); showAdminSection('create'); break;
    case 'student': elements.studentDashboard.classList.remove('hidden'); showStudentSection('quizzes'); break;
  }
}

// --- User Authentication ---
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    currentUser = data.user;
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    loginUserView();
    hideLogin();
    showSection(currentUser.role);
    showToast('Login successful!', 'success');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const role = document.getElementById('registerRole').value;

  try {
    const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    
    showToast('Registration successful! Please log in.', 'success');
    hideRegister();
    showLogin();
  } catch(error) {
    showToast(error.message, 'error');
  }
}

function loginUserView() {
  elements.navLogin.classList.add('hidden');
  elements.navRegister.classList.add('hidden');
  elements.navUserMenu.classList.remove('hidden');
  elements.userName.textContent = currentUser.name;
}

function logout() {
  currentUser = null;
  sessionStorage.removeItem('currentUser');
  elements.navLogin.classList.remove('hidden');
  elements.navRegister.classList.remove('hidden');
  elements.navUserMenu.classList.add('hidden');
  showSection('landing');
  showToast('Logged out successfully', 'info');
}

// --- Admin Functions ---
function showAdminSection(section) {
  document.querySelectorAll('.admin-section').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.dashboard-nav .btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`${section}QuizSection`)?.classList.add('active');
  document.querySelector(`[onclick="showAdminSection('${section}')"]`)?.classList.add('active');
}

async function generateQuestions() {
  const content = document.getElementById('contentText').value;
  if (content.length < 50) return showToast('Content must be at least 50 characters.', 'error');
  
  document.getElementById('aiLoading').classList.add('active');
  try {
    const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    currentQuiz = data; // Store the full quiz data returned from the backend
    displayGeneratedQuestions(data.questions);
    showToast('Quiz generated and saved!', 'success');
  } catch(error) {
    showToast(error.message, 'error');
  } finally {
    document.getElementById('aiLoading').classList.remove('active');
  }
}

function displayGeneratedQuestions(questions) {
  const container = document.getElementById('questionsContainer');
  container.innerHTML = '';
  questions.forEach((q, index) => {
      const questionDiv = document.createElement('div');
      questionDiv.className = 'question-item';
      questionDiv.innerHTML = `
        <h4>Question ${index + 1}</h4>
        <p><strong>${q.question}</strong></p>
        <div class="question-options">
          ${q.options.map((opt, optIndex) => `
            <div class="option-item ${optIndex === q.correct ? 'correct' : ''}">
              <label>${opt}</label>
            </div>
          `).join('')}
        </div>
        <p><small>Points: ${q.points}</small></p>`;
      container.appendChild(questionDiv);
  });
  document.getElementById('questionsPreview').classList.add('active');
}


// --- Student Functions ---
function showStudentSection(section) {
  document.querySelectorAll('.student-section').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('#studentDashboard .dashboard-nav .btn').forEach(btn => btn.classList.remove('active'));
  const sectionId = { quizzes: 'availableQuizzesSection', results: 'resultsSection', leaderboard: 'leaderboardSection' }[section];
  document.getElementById(sectionId).classList.add('active');
  document.querySelector(`#studentDashboard [onclick="showStudentSection('${section}')"]`).classList.add('active');

  if (section === 'quizzes') loadAvailableQuizzes();
  if (section === 'leaderboard') loadLeaderboard();
}

async function loadAvailableQuizzes() {
  const container = document.getElementById('quizzesGrid');
  container.innerHTML = '<h3>Loading quizzes...</h3>';
  try {
    const response = await fetch('/api/quizzes');
    const quizzes = await response.json();
    container.innerHTML = quizzes.map(quiz => `
      <div class="quiz-card" onclick="startQuiz(${quiz.id})">
        <h3>${quiz.title}</h3>
        <p>${quiz.description}</p>
        <div class="quiz-stats">
          <span><i class="fas fa-question-circle"></i> ${quiz.questions} Questions</span>
          <span><i class="fas fa-star"></i> ${quiz.totalPoints} pts</span>
        </div>
      </div>`).join('');
  } catch (error) {
    container.innerHTML = '<h3>Could not load quizzes.</h3>';
  }
}

async function startQuiz(quizId) {
    try {
        const response = await fetch(`/api/quiz/${quizId}`);
        currentQuiz = await response.json();
        currentQuestionIndex = 0;
        userAnswers = {};

        showStudentSection('quizTaking'); // A new section for taking the quiz
        document.getElementById('availableQuizzesSection').classList.remove('active');
        document.getElementById('quizTakingSection').classList.add('active'); // You need to add this section in HTML

        loadQuestion();
    } catch (error) {
        showToast('Failed to load the quiz.', 'error');
    }
}

function loadQuestion() {
    const question = currentQuiz.questions[currentQuestionIndex];
    document.getElementById('currentQuestion').textContent = question.question;
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = question.options.map((option, index) => `
        <button class="option-button" data-question-id="${question.id}" data-option-index="${index}" onclick="selectAnswer(${question.id}, ${index})">
            <div class="option-letter">${String.fromCharCode(65 + index)}</div>
            <span>${option}</span>
        </button>
    `).join('');
    // Highlight previous answer if it exists
    if(userAnswers[question.id] !== undefined){
        document.querySelector(`.option-button[data-option-index='${userAnswers[question.id]}']`).classList.add('selected');
    }
    document.getElementById('nextBtn').textContent = currentQuestionIndex === currentQuiz.questions.length - 1 ? 'Finish Quiz' : 'Next';
}

function selectAnswer(questionId, optionIndex) {
    userAnswers[questionId] = optionIndex;
    document.querySelectorAll(`.option-button[data-question-id='${questionId}']`).forEach(btn => btn.classList.remove('selected'));
    document.querySelector(`.option-button[data-option-index='${optionIndex}']`).classList.add('selected');
}

function nextQuestion() {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
    } else {
        finishQuiz();
    }
}

async function finishQuiz() {
    try {
        const response = await fetch('/api/submit-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser.id,
                quizId: currentQuiz.id,
                answers: userAnswers
            }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        
        showQuizResults(result.score, result.totalPoints);
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function showQuizResults(score, totalPoints) {
    document.getElementById('quizTakingSection').classList.remove('active');
    document.getElementById('resultsSection').classList.add('active');
    document.getElementById('finalScore').textContent = score;
    document.getElementById('maxScore').textContent = totalPoints;
    const percentage = Math.round((score / totalPoints) * 100);
    document.getElementById('resultsMessage').textContent = percentage >= 80 ? 'Outstanding performance!' : 'Good effort, keep practicing!';
}

async function loadLeaderboard() {
  const container = document.getElementById('leaderboardTable');
  container.innerHTML = '<tbody><tr><td colspan="4">Loading...</td></tr></tbody>';
  try {
    const response = await fetch('/api/leaderboard');
    const leaderboard = await response.json();
    container.innerHTML = `
        <thead><tr><th>Rank</th><th>Student</th><th>Quiz</th><th>Score</th></tr></thead>
        <tbody>
            ${leaderboard.map((entry, index) => `
                <tr>
                    <td class="leaderboard-rank">#${index + 1}</td>
                    <td>${entry.studentName}</td>
                    <td>${entry.quizTitle}</td>
                    <td class="leaderboard-score">${entry.score}/${entry.maxScore}</td>
                </tr>
            `).join('')}
        </tbody>`;
  } catch (error) {
    container.innerHTML = '<tbody><tr><td colspan="4">Could not load leaderboard.</td></tr></tbody>';
  }
}

// --- UI Helpers ---
function showLogin() { elements.loginModal.classList.add('active'); }
function hideLogin() { elements.loginModal.classList.remove('active'); }
function showRegister() { elements.registerModal.classList.add('active'); }
function hideRegister() { elements.registerModal.classList.remove('active'); }

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type} show`;
  toast.textContent = message;
  elements.toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}