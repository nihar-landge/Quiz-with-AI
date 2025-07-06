import React from 'react';
import { FileDown, Bot, ShieldQuestion, Youtube, Link as LinkIcon, Folder, Target } from 'lucide-react';
import useTypewriter from '../hooks/useTypewriter';
import MinimalistCard from '../components/common/MinimalistCard';

// The iconMap is defined here because it's specific to this page's rendering logic.
const iconMap = {
    FileDown: <FileDown size={32} />,
    Youtube: <Youtube size={32} />,
    ShieldQuestion: <ShieldQuestion size={32} />,
    Bot: <Bot size={32} />,
    Link: <LinkIcon size={32} />,
    Folder: <Folder size={32} />,
    Target: <Target size={32} />,
};

const LandingPage = ({ loggedIn, setView, features, setActiveFeature }) => {
    const heroTitle = useTypewriter("Unlock Your Academic Edge");

    const handleFeatureClick = (feature) => {
        if (!loggedIn) {
            setView('auth');
            return;
        }
        if (feature.type === 'redirect') {
            window.open(feature.url, '_blank');
        } else if (feature.view) {
            setActiveFeature(feature);
            setView(feature.view);
        }
    };

    return (
        <div className="w-full min-h-screen flex flex-col items-center p-4 sm:p-8">
            <main className="flex-grow flex flex-col justify-center items-center text-center max-w-7xl mx-auto">
                <h2 className="text-5xl sm:text-7xl md:text-8xl font-black mb-4 text-black dark:text-white animate-fade-in-up">
                    {heroTitle}<span className="cursor-blink">|</span>
                </h2>
                <p className="max-w-2xl text-gray-600 dark:text-gray-400 text-lg sm:text-xl mb-10 leading-relaxed animate-fade-in-up animation-delay-300">
                    A next-generation learning platform designed for the ambitious student. Dive into a world of curated content and AI-powered tools.
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full mb-20 animate-fade-in-up animation-delay-500">
                    {features.map(res => (
                        <div key={res.id} className="relative col-span-1" onClick={() => handleFeatureClick(res)}>
                            <MinimalistCard className="cursor-pointer">
                                <div className="flex flex-col items-center text-center">
                                    <div className="text-black dark:text-white mb-4">{iconMap[res.icon]}</div>
                                    <h3 className="font-bold text-lg text-black dark:text-white mb-2">{res.title}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{res.desc}</p>
                                </div>
                            </MinimalistCard>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default LandingPage;