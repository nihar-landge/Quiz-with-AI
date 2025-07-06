import React from 'react';
import { Sun, Moon, CircleUserRound, Settings } from 'lucide-react';

const Header = ({ loggedIn, setLoggedIn, theme, setTheme, setView, isAuthPage = false }) => {
    const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

    return (
        <header className="w-full max-w-7xl mx-auto flex items-center py-6 animate-fade-in-down absolute top-0 left-1/2 -translate-x-1/2 px-4 sm:px-8 z-50">
            <div className="flex-1 flex justify-start">
                {loggedIn && (
                    <button onClick={() => setView('adminPanel')} className="secondary-button text-sm">
                        <Settings size={16} /> Admin Panel
                    </button>
                )}
            </div>
            <div className="flex-shrink-0">
                <h1 onClick={() => setView('landing')} className="text-2xl font-black tracking-wide text-black dark:text-white cursor-pointer">
                    ACADEMY-X
                </h1>
            </div>
            <div className="flex-1 flex items-center justify-end gap-4">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                {!isAuthPage &&
                    (loggedIn ? (
                        <button
                            onClick={() => {
                                setLoggedIn(false);
                                setView('landing');
                            }}
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
                        >
                            <CircleUserRound /> Logout
                        </button>
                    ) : (
                        <button onClick={() => setView('auth')} className="primary-button">
                            <span>Student Login</span>
                        </button>
                    ))}
            </div>
        </header>
    );
};

export default Header;