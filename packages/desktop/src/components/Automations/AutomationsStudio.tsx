import React, { useState } from 'react';
import { Sun, Cpu, Flame, Mail, ClipboardList, FileText, Clock, FileSymlink } from 'lucide-react';

interface AutomationCard {
    id: string;
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    title: string;
    description: string;
    schedule: string;
}

interface Category {
    title: string;
    items: AutomationCard[];
}

const automationsData: Category[] = [
    {
        title: 'News',
        items: [
            {
                id: '1',
                icon: <Sun size={18} />,
                iconBg: 'bg-blue-500',
                iconColor: 'text-gray-900 dark:text-white',
                title: 'Morning Brief',
                description: 'Start the day with headlines, market moves, and your weather.',
                schedule: 'Daily at 7:30 AM'
            },
            {
                id: '2',
                icon: <Cpu size={18} />,
                iconBg: 'bg-blue-400',
                iconColor: 'text-gray-900 dark:text-white',
                title: 'AI News Digest',
                description: 'Model releases, research, and funding that actually matter.',
                schedule: 'Daily at 8:00 AM'
            },
            {
                id: '3',
                icon: <Flame size={18} />,
                iconBg: 'bg-blue-600',
                iconColor: 'text-gray-900 dark:text-white',
                title: 'X Trends Digest',
                description: 'The five most interesting conversations on X right now.',
                schedule: 'Daily at 12:00 PM'
            }
        ]
    },
    {
        title: 'Productivity',
        items: [
            {
                id: '4',
                icon: <Mail size={18} />,
                iconBg: 'bg-pink-500',
                iconColor: 'text-gray-900 dark:text-white',
                title: 'Email Auto-Responder',
                description: 'Draft concise replies for important email threads each morning.',
                schedule: 'Daily at 9:00 AM'
            },
            {
                id: '5',
                icon: <ClipboardList size={18} />,
                iconBg: 'bg-pink-500',
                iconColor: 'text-gray-900 dark:text-white',
                title: 'Weekly Review',
                description: 'Wrap the week: what you did, loose ends, and next priorities.',
                schedule: 'Fridays at 4:00 PM'
            },
            {
                id: '6',
                icon: <FileSymlink size={18} />,
                iconBg: 'bg-pink-500',
                iconColor: 'text-gray-900 dark:text-white',
                title: 'Task Extractor',
                description: 'Extract action items from recent messages and summarize next steps.',
                schedule: 'Daily at 5:00 PM'
            },
            {
                id: '7',
                icon: <FileText size={18} />,
                iconBg: 'bg-pink-500',
                iconColor: 'text-gray-900 dark:text-white',
                title: 'Daily Planner',
                description: 'A realistic plan for today with focus blocks and quick wins.',
                schedule: 'Daily at 8:30 AM'
            }
        ]
    }
];

export const AutomationsStudio: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'automations' | 'runs'>('automations');

    return (
        <div className="flex flex-col h-full w-full font-sans relative z-10 animate-in fade-in duration-500 bg-transparent">
            {/* Header */}
            <div className="flex items-center justify-between p-8 shrink-0 max-w-7xl mx-auto w-full">
                <div className="flex bg-black/5 dark:bg-white/5 backdrop-blur-md rounded-full p-1 border border-black/10 dark:border-white/10 shadow-lg">
                    <button 
                        onClick={() => setActiveTab('automations')}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'automations' ? 'bg-black/10 dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'text-black/50 dark:text-white/50 hover:text-gray-900 dark:text-white hover:bg-black/5 dark:bg-white/5'}`}
                    >
                        Automations
                    </button>
                    <button 
                        onClick={() => setActiveTab('runs')}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'runs' ? 'bg-black/10 dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'text-black/50 dark:text-white/50 hover:text-gray-900 dark:text-white hover:bg-black/5 dark:bg-white/5'}`}
                    >
                        Runs
                    </button>
                </div>
                
                <button className="px-5 py-2.5 bg-white hover:bg-gray-100 text-black font-semibold rounded-full transition-all text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95">
                    New Automation
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-8 pb-12 custom-scrollbar">
                <div className="max-w-7xl mx-auto space-y-12">
                    
                    {activeTab === 'automations' ? (
                        automationsData.map((category, idx) => (
                            <section key={idx} className="space-y-4">
                                <h2 className="text-[15px] font-bold text-black/90 dark:text-white/90">{category.title}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {category.items.map(item => (
                                        <div key={item.id} className="bg-black/5 dark:bg-white/5 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-2xl p-5 flex flex-col h-[200px] hover:bg-black/10 dark:bg-white/10 hover:border-indigo-500/30 transition-all cursor-pointer group shadow-xl shadow-black/20 hover:-translate-y-1">
                                            
                                            <div className="flex justify-between items-start mb-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.iconBg} ${item.iconColor}`}>
                                                    {item.icon}
                                                </div>
                                                <button className="px-3 py-1 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 text-black/80 dark:text-white/80 rounded-full text-xs font-medium transition-colors">
                                                    Add
                                                </button>
                                            </div>

                                            <h3 className="text-[15px] font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                                            <p className="text-[13px] text-black/50 dark:text-white/50 leading-relaxed line-clamp-3 mb-auto">
                                                {item.description}
                                            </p>
                                            
                                            <div className="flex items-center gap-2 text-black/40 dark:text-white/40 mt-4 text-[12px] font-medium">
                                                <Clock size={14} />
                                                {item.schedule}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-black/40 dark:text-white/40">
                            <Clock size={48} className="mb-4 opacity-20" />
                            <p>No recent automation runs.</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
