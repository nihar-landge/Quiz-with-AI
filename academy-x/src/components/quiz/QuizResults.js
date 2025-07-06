import React from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import MinimalistCard from '../components/common/MinimalistCard';

const QuizResults = ({ setView }) => {
    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-3xl mx-auto text-center animate-fade-in-up">
                <MinimalistCard>
                    <h2 className="text-4xl font-bold text-black dark:text-white">Quiz Completed!</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2 mb-6">Great job! Here's your performance summary.</p>
                    <div className="w-48 h-48 mx-auto my-8">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle className="text-gray-200 dark:text-gray-800" strokeWidth="10" cx="50" cy="50" r="45" fill="transparent"></circle>
                            <circle className="text-black dark:text-white progress-ring" strokeWidth="10" strokeLinecap="round" cx="50" cy="50" r="45" fill="transparent" strokeDasharray="283" strokeDashoffset="56.6"></circle>
                            <text x="50" y="52" className="font-black text-4xl text-black dark:text-white" textAnchor="middle">80%</text>
                        </svg>
                    </div>
                    <div className="flex justify-center gap-8 text-black dark:text-white">
                        <div className="flex items-center gap-2 font-semibold"><CheckCircle className="text-green-500" /> 2 Correct</div>
                        <div className="flex items-center gap-2 font-semibold"><XCircle className="text-red-500" /> 0 Incorrect</div>
                        <div className="flex items-center gap-2 font-semibold"><Clock className="text-blue-500" /> 05:32 mins</div>
                    </div>
                    <div className="mt-10 flex justify-center gap-4">
                        <button onClick={() => setView('quizLobby')} className="secondary-button">Back to Lobby</button>
                        <button onClick={() => setView('quizLobby')} className="primary-button"><span>Try Again</span></button>
                    </div>
                </MinimalistCard>
            </div>
        </div>
    );
};

export default QuizResults;