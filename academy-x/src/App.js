import React, { useState, useEffect } from 'react';

// Firebase services
import { auth, db } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';

// Layout & Helpers
import Header from './components/layout/Header';
import AnimatedBackground from './components/common/AnimatedBackground';

// Page Components
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import FolderPage from './pages/FolderPage';
import AdminPanel from './pages/AdminPanel';
import QuizLobby from './pages/QuizLobby';
import ActiveQuiz from './pages/ActiveQuiz';
import QuizResults from './pages/QuizResults';

// FontLoader component remains the same
const FontLoader = () => {
    useEffect(() => {
        const link = document.createElement('link');
        link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap";
        link.rel = "stylesheet";
        document.head.appendChild(link);

        return () => {
            document.head.removeChild(link);
        }
    }, []);
    return null;
};

export default function App() {
    // --- GLOBAL STATE MANAGEMENT ---
    const [loggedIn, setLoggedIn] = useState(false);
    const [user, setUser] = useState(null); // To store user details
    const [isLoading, setIsLoading] = useState(true); // To handle initial auth check
    const [theme, setTheme] = useState('dark');
    const [view, setView] = useState('landing');
    const [features, setFeatures] = useState([]); // Start with an empty array
    const [activeFeature, setActiveFeature] = useState(null);

    // --- EFFECT HOOKS ---
    useEffect(() => {
        // Fetch features from Firestore when the component mounts
        const fetchFeatures = async () => {
            try {
                const featuresCollection = collection(db, 'features');
                const featuresSnapshot = await getDocs(featuresCollection);
                const featuresList = featuresSnapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id }));
                setFeatures(featuresList);
            } catch (error) {
                console.error("Error fetching features: ", error);
                // Handle error (e.g., show a notification)
            }
        };

        fetchFeatures();
    }, []);

    useEffect(() => {
        // Listen for authentication state changes
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                // User is signed in
                setUser(currentUser);
                setLoggedIn(true);
                setView('landing');
            } else {
                // User is signed out
                setUser(null);
                setLoggedIn(false);
            }
            setIsLoading(false); // Auth check is complete
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    // --- VIEW RENDERING LOGIC ---
    const renderView = () => {
        if (isLoading) {
            // You can replace this with a beautiful loading spinner component
            return <div className="text-white text-center p-10">Loading...</div>;
        }

        if (view === 'folderPage' && activeFeature) {
            return <FolderPage feature={activeFeature} setView={setView} />;
        }
        
        switch (view) {
            case 'auth':
                return <AuthPage setView={setView} />;
            case 'adminPanel':
                return <AdminPanel setView={setView} features={features} setFeatures={setFeatures} />;
            case 'quizLobby':
                return <QuizLobby setView={setView} />;
            case 'quizActive':
                return <ActiveQuiz setView={setView} />;
            case 'quizResults':
                return <QuizResults setView={setView} />;
            case 'landing':
            default:
                return (
                    <LandingPage
                        loggedIn={loggedIn}
                        setView={setView}
                        features={features}
                        setActiveFeature={setActiveFeature}
                    />
                );
        }
    };

    return (
        <>
            <FontLoader />
            {theme === 'dark' && <AnimatedBackground />}
            <div className="relative z-10 bg-transparent transition-colors duration-500">
                 <div className="relative pt-24">
                    <Header
                        loggedIn={loggedIn}
                        setLoggedIn={setLoggedIn}
                        theme={theme}
                        setTheme={setTheme}
                        setView={setView}
                        isAuthPage={view === 'auth'}
                    />
                    {renderView()}
                </div>
            </div>
        </>
    );
}