import React, { useState } from 'react';
import { Lock, KeyRound, XCircle } from 'lucide-react';
import AuthInput from '../common/AuthInput';

const QuizCodeModal = ({ quiz, setView, setShowModal }) => {
    const [inputCode, setInputCode] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (inputCode === quiz.accessCode) {
            setView('quizActive');
        } else {
            setError('Invalid code. Please try again.');
            setInputCode('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] animate-fade-in-up">
            <div className="w-full max-w-sm">
                <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-2xl relative">
                    <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black dark:hover:text-white">
                        <XCircle size={20} />
                    </button>
                    <div className="text-center">
                        <Lock className="mx-auto text-black dark:text-white mb-4" size={32} />
                        <h3 className="font-bold text-2xl text-black dark:text-white">Enter Access Code</h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-2 mb-6">
                            A code is required to start the quiz: <br />
                            <span className="font-bold text-black dark:text-white">{quiz.title}</span>
                        </p>
                        <AuthInput
                            icon={<KeyRound size={18} />}
                            type="text"
                            placeholder="Quiz Code"
                            value={inputCode}
                            onChange={(e) => {
                                setInputCode(e.target.value.toUpperCase());
                                setError('');
                            }}
                        />
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        <button onClick={handleSubmit} className="w-full mt-6 primary-button">
                            <span>Unlock & Start</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizCodeModal;