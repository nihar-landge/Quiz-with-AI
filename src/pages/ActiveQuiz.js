import React, { useState } from 'react';
import { Clock, ChevronRight } from 'lucide-react';

const mockQuizData = {
    id: 1,
    title: "Quantum Physics Fundamentals",
    accessCode: "QUANTUM25",
    questions: [
        { id: 1, text: "What is the smallest unit of energy called?", options: ["Photon", "Quark", "Quantum", "Electron"], answer: "Quantum" },
        { id: 2, text: "Which principle states that you cannot know both the position and momentum of a particle simultaneously?", options: ["Pauli Exclusion Principle", "Heisenberg Uncertainty Principle", "Aufbau Principle", "Hund's Rule"], answer: "Heisenberg Uncertainty Principle" },
    ]
};

const ActiveQuiz = ({ setView }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const currentQuestion = mockQuizData.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / mockQuizData.questions.length) * 100;

    const handleNext = () => {
        setSelectedOption(null);
        if (currentQuestionIndex < mockQuizData.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            setView('quizResults');
        }
    };

    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-3xl mx-auto">
                <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-xl animate-fade-in-up">
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <p className="font-bold text-black dark:text-white">Question {currentQuestionIndex + 1} of {mockQuizData.questions.length}</p>
                            <div className="flex items-center gap-2 text-black dark:text-white font-semibold"><Clock size={18} /> 09:15</div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2.5">
                            <div className="bg-black dark:bg-white h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s' }}></div>
                        </div>
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl md:text-3xl font-bold text-black dark:text-white mb-8">{currentQuestion.text}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQuestion.options.map((option, index) => (
                            <button key={index} onClick={() => setSelectedOption(option)} className={`p-4 rounded-lg text-left transition-all duration-200 border-2 ${selectedOption === option ? 'border-black dark:border-white bg-gray-100 dark:bg-gray-900' : 'border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900'}`}>
                                <span className="font-semibold text-black dark:text-white">{option}</span>
                            </button>
                        ))}
                    </div>
                    <div className="mt-8 text-right">
                        <button onClick={handleNext} disabled={!selectedOption} className="primary-button">
                            <span>{currentQuestionIndex === mockQuizData.questions.length - 1 ? 'Finish' : 'Next'}</span>
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActiveQuiz;