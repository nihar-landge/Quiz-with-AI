import React, { useState } from 'react';
import {
    FileDown, Bot, ShieldQuestion, Youtube, MessageCircle, ArrowLeft, XCircle,
    Edit, Trash2, PlusCircle, Settings, Link as LinkIcon, Folder, LayoutGrid, FolderPlus, Link2
} from 'lucide-react';
import MinimalistCard from '../components/common/MinimalistCard';
import AuthInput from '../components/common/AuthInput';

// Add this URL for your backend API call.
// For production, consider moving this to an environment variable (e.g., process.env.REACT_APP_BACKEND_URL)
const BACKEND_URL = 'https://generatequiz-410679029656.us-central1.run.app';


const iconMap = {
    FileDown: <FileDown size={32} />,
    Youtube: <Youtube size={32} />,
    ShieldQuestion: <ShieldQuestion size={32} />,
    Bot: <Bot size={32} />,
};
const iconKeys = Object.keys(iconMap);

const AdminPanel = ({ setView, features, setFeatures }) => {
    const [activeTab, setActiveTab] = useState('features');
    const [managingFeature, setManagingFeature] = useState(null);
    const [path, setPath] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [modalTarget, setModalTarget] = useState(null);
    const [modalInput, setModalInput] = useState({ title: '', desc: '', icon: 'FileDown', url: '', type: 'folder' });
    const [quizText, setQuizText] = useState('');
    const [numQuestions, setNumQuestions] = useState(5);
    const [generatedQuiz, setGeneratedQuiz] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const updateState = (currentItems, itemPath, newItemData) => {
        if (itemPath.length === 0) {
            return currentItems.map(item => item.id === newItemData.id ? { ...item, ...newItemData } : item);
        }
        const [nextId, ...restPath] = itemPath;
        return currentItems.map(item => {
            if (item.id === nextId) {
                return { ...item, content: updateState(item.content, restPath, newItemData) };
            }
            return item;
        });
    };
    
    const addState = (currentItems, itemPath, newItem) => {
        if (itemPath.length === 0) {
            return [...currentItems, newItem];
        }
        const [nextId, ...restPath] = itemPath;
        return currentItems.map(item => {
            if (item.id === nextId) {
                return { ...item, content: addState(item.content || [], restPath, newItem) };
            }
            return item;
        });
    };

    const deleteState = (currentItems, itemPath, targetId) => {
        if (itemPath.length === 0) {
            return currentItems.filter(item => item.id !== targetId);
        }
        const [nextId, ...restPath] = itemPath;
        return currentItems.map(item => {
            if (item.id === nextId) {
                 return { ...item, content: deleteState(item.content, restPath, targetId) };
            }
            return item;
        });
    }

    const openModal = (mode, target, type) => {
        setModalMode(mode);
        setModalTarget(target);
        if (mode === 'add') {
            setModalInput({ title: '', desc: '', icon: 'FileDown', url: '', type: type || 'folder' });
        } else if (target) {
            setModalInput({
                title: target.title || '',
                desc: target.desc || '',
                icon: target.icon || 'FileDown',
                url: target.url || '',
                type: target.type || 'folder'
            });
        }
        setIsModalOpen(true);
    };

    const handleModalSubmit = () => {
        if (modalMode === 'add') {
            const newItem = {
                id: `id_${Date.now()}`,
                title: modalInput.title,
                type: modalInput.type,
                ...(modalInput.type === 'folder' ? { content: [] } : { url: modalInput.url }),
                ...(managingFeature === null && { desc: modalInput.desc, icon: modalInput.icon, view: 'folderPage' })
            };
             if (managingFeature) {
                setManagingFeature(prev => addState([prev], path.map(p => p.id), newItem)[0]);
             } else {
                setFeatures(prev => [...prev, newItem]);
             }
        } else if (modalMode === 'edit') {
            const updatedItem = { ...modalTarget, ...modalInput };
             if (managingFeature) {
                setManagingFeature(prev => updateState([prev], path.map(p => p.id), updatedItem)[0]);
             } else {
                 setFeatures(prev => prev.map(f => f.id === updatedItem.id ? updatedItem : f));
             }
        } else if (modalMode === 'delete') {
             if (managingFeature) {
                setManagingFeature(prev => deleteState([prev], path.map(p => p.id), modalTarget.id)[0]);
             } else {
                 setFeatures(prev => prev.filter(f => f.id !== modalTarget.id));
             }
        }
        setIsModalOpen(false);
    };

    const handleSelectFeatureToManage = (feature) => {
        if (feature.type === 'folder') {
            setManagingFeature(JSON.parse(JSON.stringify(feature))); // Deep copy to avoid direct mutation
            setPath([]);
        } else {
            alert("Content management is only available for features of type 'folder'.");
        }
    };
    
    const handleSaveChanges = () => {
        setFeatures(features.map(f => f.id === managingFeature.id ? managingFeature : f));
        setManagingFeature(null);
        setPath([]);
    };

    const getCurrentContent = () => {
        if (!managingFeature) return { content: [] };
        let current = managingFeature;
        for (const folder of path) {
            current = current.content.find(item => item.id === folder.id);
        }
        return current;
    };
    
    const handleGenerateQuiz = async () => {
        if (!quizText.trim()) return;
        setIsGenerating(true);
        setGeneratedQuiz(null);
        
        try {
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: quizText,
                    num_questions: numQuestions,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setGeneratedQuiz(data);

        } catch (error) {
            console.error("Error generating quiz:", error);
            alert("Failed to generate quiz: " + error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    if (managingFeature) {
        const currentFolder = getCurrentContent();
        return (
             <div className="w-full max-w-5xl mx-auto animate-fade-in-up">
                <nav className="mb-4 text-lg font-semibold text-gray-500 dark:text-gray-400">
                     <span onClick={() => { setManagingFeature(null); setPath([]); }} className="cursor-pointer hover:text-black dark:hover:text-white">Admin Panel</span>
                     <span className="cursor-pointer hover:text-black dark:hover:text-white" onClick={() => setPath([])}> / {managingFeature.title}</span>
                      {path.map((folder, index) => (
                          <span key={folder.id} onClick={() => setPath(path.slice(0, index + 1))} className="cursor-pointer hover:text-black dark:hover:text-white"> / {folder.title}</span>
                      ))}
                </nav>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-3xl text-black dark:text-white">Managing: {currentFolder.title}</h3>
                    <div>
                        <button onClick={() => openModal('add', null, 'folder')} className="secondary-button mr-2"><FolderPlus size={16}/> Add Folder</button>
                        <button onClick={() => openModal('add', null, 'link')} className="secondary-button"><Link2 size={16}/> Add Link</button>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm space-y-2">
                    {(currentFolder.content || []).map(item => (
                        <div key={item.id} className="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900">
                             <div className="flex-shrink-0 mr-4">{item.type === 'folder' ? <Folder/> : <LinkIcon/>}</div>
                             <div className="flex-grow">
                                 <p className="font-bold text-black dark:text-white">{item.title}</p>
                                 {item.type === 'link' && <p className="text-sm text-gray-500">{item.url}</p>}
                             </div>
                             {item.type === 'folder' && <button onClick={() => setPath([...path, item])} className="secondary-button text-sm mr-2">Open</button>}
                             <button onClick={() => openModal('edit', item)} className="secondary-button text-sm mr-2"><Edit size={14}/></button>
                             <button onClick={() => openModal('delete', item)} className="secondary-button text-sm text-red-500"><Trash2 size={14}/></button>
                        </div>
                    ))}
                     {(!currentFolder.content || currentFolder.content.length === 0) && (
                         <p className="text-gray-500 dark:text-gray-400 text-center py-10">This folder is empty.</p>
                     )}
                </div>
                 <div className="mt-6 text-right">
                     <button onClick={handleSaveChanges} className="primary-button"><span>Save & Return</span></button>
                 </div>
             </div>
        )
    }

    return (
        <>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100]">
                    <div className="w-full max-w-lg bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-2xl relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black dark:hover:text-white"><XCircle size={20} /></button>
                        <h3 className="font-bold text-2xl text-black dark:text-white mb-6 capitalize">{modalMode} {modalInput.type}</h3>

                        {modalMode === 'delete' ? (
                            <p>Are you sure you want to delete "<b>{modalTarget?.title}</b>"? This action cannot be undone.</p>
                        ) : (
                            <div className="space-y-4">
                               <AuthInput icon={<Edit size={18}/>} type="text" placeholder="Title" value={modalInput.title} onChange={e => setModalInput({...modalInput, title: e.target.value})} />
                               {modalInput.type === 'feature' && <AuthInput icon={<MessageCircle size={18}/>} type="text" placeholder="Description" value={modalInput.desc} onChange={e => setModalInput({...modalInput, desc: e.target.value})} />}
                               {modalInput.type === 'link' && <AuthInput icon={<LinkIcon size={18}/>} type="text" placeholder="URL (e.g., https://...)" value={modalInput.url} onChange={e => setModalInput({...modalInput, url: e.target.value})} />}
                               {modalInput.type === 'feature' && (
                                   <div className="relative">
                                       <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><LayoutGrid size={18}/></span>
                                        <select value={modalInput.icon} onChange={e => setModalInput({...modalInput, icon: e.target.value})} className="w-full bg-gray-100 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-colors">
                                           {iconKeys.map(key => <option key={key} value={key}>{key}</option>)}
                                       </select>
                                   </div>
                               )}
                            </div>
                        )}
                        <div className="flex justify-end gap-4 mt-8">
                            <button onClick={() => setIsModalOpen(false)} className="secondary-button">Cancel</button>
                            <button onClick={handleModalSubmit} className={`${modalMode === 'delete' ? 'bg-red-600 text-white hover:bg-red-700' : ''} primary-button`}>
                                <span>{modalMode === 'delete' ? 'Delete' : 'Save'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full max-w-7xl mx-auto animate-fade-in-up">
                <div className="flex justify-between items-center mb-8">
                     <h2 className="font-bold text-4xl text-black dark:text-white">Admin Dashboard</h2>
                     <button onClick={() => setView('landing')} className="secondary-button">
                         <ArrowLeft size={16}/> Go Back to Site
                     </button>
                </div>

                <div className="border-b border-gray-200 dark:border-gray-800 mb-6">
                    <nav className="flex gap-6">
                        <button onClick={() => setActiveTab('features')} className={`py-4 px-1 font-semibold ${activeTab === 'features' ? 'text-black dark:text-white border-b-2 border-black dark:border-white' : 'text-gray-500'}`}>
                            Feature Management
                        </button>
                        <button onClick={() => setActiveTab('quiz')} className={`py-4 px-1 font-semibold ${activeTab === 'quiz' ? 'text-black dark:text-white border-b-2 border-black dark:border-white' : 'text-gray-500'}`}>
                            Quiz Generator
                        </button>
                    </nav>
                </div>

                {activeTab === 'features' && (
                    <div>
                         <div className="flex justify-between items-center mb-6">
                             <h3 className="font-bold text-2xl text-black dark:text-white">Landing Page Features</h3>
                             <button onClick={() => openModal('add', null, 'feature')} className="primary-button"><PlusCircle size={16}/> Add Feature</button>
                         </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                             {features.map(feature => (
                                <MinimalistCard key={feature.id}>
                                    <div className="flex flex-col h-full">
                                        <div className="flex items-center gap-4 mb-3">
                                            <span className="text-black dark:text-white">{iconMap[feature.icon]}</span>
                                            <h4 className="font-bold text-xl text-black dark:text-white">{feature.title}</h4>
                                        </div>
                                        <p className="text-gray-500 dark:text-gray-400 mb-4 flex-grow">{feature.desc}</p>
                                        <div className="flex gap-2 mt-auto">
                                            {feature.type === 'folder' && <button onClick={() => handleSelectFeatureToManage(feature)} className="w-full secondary-button">Manage Content</button>}
                                            <button onClick={() => openModal('edit', feature, 'feature')} className="secondary-button"><Edit size={16}/></button>
                                            <button onClick={() => openModal('delete', feature, 'feature')} className="secondary-button text-red-500"><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                </MinimalistCard>
                             ))}
                        </div>
                    </div>
                )}

                {activeTab === 'quiz' && (
                    <MinimalistCard>
                        <h3 className="font-bold text-2xl text-black dark:text-white mb-2">Gemini Quiz Generator</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Paste text below to generate a quiz using your secure Python backend.</p>
                        
                        <textarea
                            value={quizText}
                            onChange={(e) => setQuizText(e.target.value)}
                            className="w-full h-48 bg-gray-100 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-colors"
                            placeholder="Paste the source text for your quiz here..."
                        />
                        <div className="mt-4">
                            <label className="font-semibold text-black dark:text-white mr-4">Number of Questions:</label>
                            <input 
                            type="number"
                            value={numQuestions}
                            onChange={(e) => setNumQuestions(parseInt(e.target.value, 10))}
                            className="w-24 bg-gray-100 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-colors"
                            min="1"
                            max="20"
                            />
                        </div>
                        
                        <button onClick={handleGenerateQuiz} disabled={isGenerating} className="primary-button mt-4">
                            {isGenerating ? "Generating..." : "Generate Securely"}
                        </button>

                        {generatedQuiz && (
                             <div className="mt-8">
                                 <h4 className="font-bold text-xl text-black dark:text-white">Generated Quiz JSON</h4>
                                 <p className="text-gray-500 dark:text-gray-400 mb-4">Backend call was successful. You can now add a button to save this to Firestore.</p>
                                 <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg text-sm text-left overflow-x-auto">
                                     <code>
                                         {JSON.stringify(generatedQuiz, null, 2)}
                                     </code>
                                 </pre>
                             </div>
                        )}
                    </MinimalistCard>
                )}
            </div>
        </>
    );
};

export default AdminPanel;