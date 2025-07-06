import React from 'react';

const AuthInput = ({ icon, ...props }) => (
    <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            {icon}
        </span>
        <input
            {...props}
            className="w-full bg-gray-100 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-colors"
        />
    </div>
);

export default AuthInput;