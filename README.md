# AI Quiz Platform

An AI-powered quiz generation platform built with Flask and Google Generative AI.

## Setup Instructions

### 1. Clone the repository
```bash
git clone <repository-url>
cd ai-quiz-platform
```

### 2. Create virtual environment
```bash
python3 -m venv ai-quiz-env
source ai-quiz-env/bin/activate  # On Windows: ai-quiz-env\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Environment Variables
Copy the template file and add your API keys:
```bash
cp .env.template .env
```

Edit `.env` file and add your Google API key:
```
GOOGLE_API_KEY=your-actual-google-api-key-here
SECRET_KEY=your-secret-key-here
```

### 5. Run the application
```bash
python server.py
```

The application will be available at `http://localhost:5000`

## Default Login Credentials

### Admin User
- Email: `admin@quiz.com`
- Password: `admin123`

### Student Users
Students need to register through the web interface. There are no default student accounts.

## Features

- AI-powered quiz generation using Google Generative AI
- Admin dashboard for creating and managing quizzes
- Student dashboard for taking quizzes
- Real-time leaderboard
- Responsive web design

## API Endpoints

- `POST /api/register` - User registration
- `POST /api/login` - User authentication
- `POST /api/generate-quiz` - Generate quiz from text content
- `GET /api/quizzes` - Get all available quizzes
- `GET /api/quiz/<id>` - Get specific quiz details
- `POST /api/submit-quiz` - Submit quiz answers
- `GET /api/leaderboard` - Get leaderboard data

## Security

- API keys are stored in environment variables
- Passwords are hashed using bcrypt
- CORS is enabled for cross-origin requests
- Database uses SQLite for development (can be changed to PostgreSQL/MySQL for production)
