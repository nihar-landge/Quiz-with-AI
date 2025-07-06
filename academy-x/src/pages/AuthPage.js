import React, { useState } from 'react';
import { User, Mail, KeyRound, AlertCircle } from 'lucide-react';
import { auth } from '../firebase/config'; // Import auth from your Firebase config
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword 
} from "firebase/auth";

import MinimalistCard from '../components/common/MinimalistCard';
import AuthInput from '../components/common/AuthInput';

const AuthPage = ({ setView }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const title = isLogin ? "Welcome Back" : "Create Account";

    const handleAuthAction = async () => {
        if (!email || !password) {
            setError("Please enter both email and password.");
            return;
        }
        setIsLoading(true);
        setError('');

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            // The onAuthStateChanged listener in App.js will handle setting loggedIn and changing the view.
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md animate-fade-in-up">
                <MinimalistCard>
                    <div className="text-center p-6">
                        <h2 className="text-3xl font-bold text-black dark:text-white mb-2">{title}</h2>
                        <div className="space-y-4 text-left mt-8">
                            {/* In a real app, you might want a 'name' field for registration */}
                            {/* {!isLogin && <AuthInput icon={<User size={18} />} type="text" placeholder="Full Name" />} */}
                            <AuthInput 
                                icon={<Mail size={18} />} 
                                type="email" 
                                placeholder="Email Address" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)}
                            />
                            <AuthInput 
                                icon={<KeyRound size={18} />} 
                                type="password" 
                                placeholder="Password" 
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg flex items-center gap-2">
                                <AlertCircle size={18} />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        <button onClick={handleAuthAction} disabled={isLoading} className="w-full mt-8 primary-button">
                            <span>{isLoading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}</span>
                        </button>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-6">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button onClick={() => { setIsLogin(!isLogin); setError('')}} className="font-bold text-black dark:text-white hover:underline ml-2">
                                {isLogin ? "Sign Up" : "Log In"}
                            </button>
                        </p>
                    </div>
                </MinimalistCard>
            </div>
        </div>
    );
};

export default AuthPage;