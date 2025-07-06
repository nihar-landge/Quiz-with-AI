import React from 'react';

const MinimalistCard = ({ children, className = '', ...props }) => (
    <div
        className={`h-full bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm transition-all duration-300 ${className}`}
        {...props}
    >
        {children}
    </div>
);

export default MinimalistCard;