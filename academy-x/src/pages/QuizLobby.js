import React, { useState } from 'react';
import { ShieldQuestion, Clock } from 'lucide-react';
import MinimalistCard from '../components/common/MinimalistCard';
import QuizCodeModal from '../components/quiz/QuizCodeModal';

// Mock Data for demonstration
const availableQuizzes = [
    { id: 1, title: "Quantum Physics Fundamentals", questions: 5, time: 10, accessCode: "QUANTUM25" },
    { id: 2, title: "Calculus: Derivatives", questions: 15, time: 20, accessCode: "CALC101" },
];
const completedQuizzes = [
    { id: 3, title: "Organic Chemistry Basics", score: "87%", date: "2025-07-01" },
];

const QuizLobby = ({ setView }) => {
    const [showModal, setShowModal] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState(null);

    const handleStartQuiz = (quiz) => {
        setSelectedQuiz(quiz);
        setShowModal(true);
    };

    return (
        <>
            {showModal && <QuizCodeModal quiz={selectedQuiz} setView={setView} setShowModal={setShowModal} />}
            <div className="w-full min-h-screen flex flex-col items-center p-4 sm:p-8">
                <main className="w-full max-w-5xl mx-auto animate-fade-in-up">
                    <h2 className="font-bold text-4xl text-black dark:text-white mb-8 text-center">Challenge Zone</h2>
                    <section>
                        <h3 className="font-bold text-2xl text-black dark:text-white mb-4">Available Quizzes</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {availableQuizzes.map(quiz => (
                                <MinimalistCard key={quiz.id}>
                                    <div className="flex flex-col h-full">
                                        <h4 className="font-bold text-xl text-black dark:text-white">{quiz.title}</h4>
                                        <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 my-4">
                                            <div className="flex items-center gap-2"><ShieldQuestion size={16} /> {quiz.questions} Questions</div>
                                            <div className="flex items-center gap-2"><Clock size={16} /> {quiz.time} min</div>
                                        </div>
                                        <button onClick={() => handleStartQuiz(quiz)} className="mt-auto w-full primary-button">
                                            <span>Start Quiz</span>
                                        </button>
                                    </div>
                                </MinimalistCard>
                            ))}
                        </div>
                    </section>
                    <section className="mt-12">
                        <h3 className="font-bold text-2xl text-black dark:text-white mb-4">Completed Quizzes</h3>
                        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
                            {completedQuizzes.map(quiz => (
                                <div key={quiz.id} className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 last:border-b-0">
                                    <div>
                                        <p className="font-bold text-black dark:text-white">{quiz.title}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Completed on: {quiz.date}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-2xl text-black dark:text-white">{quiz.score}</p>
                                        <button className="text-sm font-semibold text-black dark:text-white hover:underline">Review</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
};

export default QuizLobby;