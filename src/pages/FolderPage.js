import React, { useState } from 'react';
import { Folder, Link as LinkIcon } from 'lucide-react';
import MinimalistCard from '../components/common/MinimalistCard';

const FolderPage = ({ feature, setView }) => {
    const [path, setPath] = useState([]);

    const getCurrentContent = () => {
        let current = feature;
        for (const folder of path) {
            current = current.content.find(item => item.id === folder.id);
        }
        return current;
    };

    const currentFolder = getCurrentContent();

    const handleItemClick = (item) => {
        if (item.type === 'folder') {
            setPath([...path, item]);
        } else if (item.type === 'link') {
            window.open(item.url, '_blank');
        }
    };

    const handleBreadcrumbClick = (index) => {
        setPath(path.slice(0, index));
    };

    return (
        <div className="w-full min-h-screen flex flex-col items-center p-4 sm:p-8">
            <main className="w-full max-w-5xl mx-auto animate-fade-in-up">
                <nav className="mb-6 text-lg font-semibold text-gray-500 dark:text-gray-400">
                    <span onClick={() => setView('landing')} className="cursor-pointer hover:text-black dark:hover:text-white">Home</span>
                    <span onClick={() => setPath([])} className="cursor-pointer hover:text-black dark:hover:text-white"> / {feature.title}</span>
                    {path.map((folder, index) => (
                        <span key={folder.id} onClick={() => handleBreadcrumbClick(index + 1)} className="cursor-pointer hover:text-black dark:hover:text-white"> / {folder.title}</span>
                    ))}
                </nav>
                <h2 className="font-bold text-4xl text-black dark:text-white mb-8">{currentFolder.title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(currentFolder.content || []).map(item => (
                        <MinimalistCard key={item.id} className="cursor-pointer" onClick={() => handleItemClick(item)}>
                            <div className="flex items-center gap-4">
                                {item.type === 'folder' ? <Folder size={24} /> : <LinkIcon size={24} />}
                                <h3 className="font-bold text-xl">{item.title}</h3>
                            </div>
                        </MinimalistCard>
                    ))}
                    {(!currentFolder.content || currentFolder.content.length === 0) && (
                        <p className="text-gray-500 dark:text-gray-400 col-span-full text-center py-10">This folder is empty.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default FolderPage;