import React from 'react';

const AnimatedBackground = () => (
    <div className="fixed top-0 left-0 w-full h-full -z-10 bg-black overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
            <div
                key={i}
                className="particle"
                style={{
                    '--x': `${Math.random() * 100}vw`,
                    '--y': `${Math.random() * 100}vh`,
                    '--d': `${Math.random() * 5 + 3}s`,
                    '--s': `${Math.random() * 1.5 + 1}px`,
                }}
            ></div>
        ))}
    </div>
);

export default AnimatedBackground;