import React, { useState } from 'react';
import { Bot, Plus, Cpu, Database, Network, Zap, Lock, MoreVertical, Edit2, Copy, Trash2, AlertTriangle, Check, X } from 'lucide-react';
import { AgentEditor } from './AgentEditor';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { AgentData, saveAgent, deleteAgent, duplicateAgent } from '../../features/ui/uiSlice';

export const AIAgentsStudio: React.FC = () => {
    const agents = useSelector((state: RootState) => state.ui.agents);
    const dispatch = useDispatch();
    const [editingAgent, setEditingAgent] = useState<AgentData | null>(null);
    const [activeIconDropdown, setActiveIconDropdown] = useState<string | null>(null);
    const [activeMenuDropdown, setActiveMenuDropdown] = useState<string | null>(null);
    const [agentToDelete, setAgentToDelete] = useState<string | null>(null);

    const ICONS = ['Bot', 'Cpu', 'Database', 'Network', 'Zap', 'Lock'];

    const handleCreateNew = () => {
        const newAgent: AgentData = {
            id: Date.now().toString(),
            name: '',
            icon: 'Bot',
            capabilities: '',
            systemPrompt: '',
            area: '',
            project: '',
            apps: [],
            plugins: [],
            skills: [],
            workflows: []
        };
        setEditingAgent(newAgent);
    };

    const handleSave = (savedAgent: AgentData) => {
        dispatch(saveAgent(savedAgent));
        setEditingAgent(null);
    };

    const renderIcon = (iconName: string, size = 32) => {
        switch (iconName) {
            case 'Bot': return <Bot size={size} />;
            case 'Cpu': return <Cpu size={size} />;
            case 'Database': return <Database size={size} />;
            case 'Network': return <Network size={size} />;
            case 'Zap': return <Zap size={size} />;
            case 'Lock': return <Lock size={size} />;
            default: return <Bot size={size} />;
        }
    };

    return (
        <div className="flex flex-col h-full w-full font-sans relative z-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between p-8 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Cpu className="text-indigo-400" size={32} />
                        AI Agents Studio
                    </h1>
                    <p className="text-white/50 mt-2">Build, customize, and manage your autonomous AI agents.</p>
                </div>
                <button 
                    onClick={handleCreateNew}
                    className="px-4 py-2.5 bg-white/5 backdrop-blur-md border border-white/10 text-white/80 hover:text-white hover:bg-white/10 hover:border-white/20 rounded-xl transition-all shadow-sm flex items-center gap-2 text-sm font-medium group"
                >
                    <Plus size={16} className="text-white/50 group-hover:text-white transition-colors" /> New Agent
                </button>
            </div>

            {/* Content Grid */}
            <div className="flex-1 overflow-y-auto p-8 pt-0 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {agents.map(agent => (
                        <div 
                            key={agent.id} 
                            onClick={() => setEditingAgent(agent)}
                            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 hover:bg-white/10 hover:border-indigo-500/30 transition-all cursor-pointer group flex flex-col min-h-[16rem] h-auto shadow-xl shadow-black/20"
                        >
                            <div className={`flex justify-between items-start mb-4 relative ${activeIconDropdown === agent.id || activeMenuDropdown === agent.id ? 'z-50' : 'z-10'}`}>
                                <div 
                                    className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl hover:scale-110 hover:bg-indigo-500/20 transition-all cursor-pointer z-10"
                                    onClick={(e) => { e.stopPropagation(); setActiveIconDropdown(activeIconDropdown === agent.id ? null : agent.id); }}
                                >
                                    {renderIcon(agent.icon)}
                                </div>
                                
                                {activeIconDropdown === agent.id && (
                                    <div 
                                        className="absolute top-14 left-0 p-2 bg-[#0a0a0c]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex gap-1 z-50 animate-in fade-in zoom-in-95"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {ICONS.map(icon => (
                                            <button 
                                                key={icon}
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    dispatch(saveAgent({...agent, icon})); 
                                                    setActiveIconDropdown(null); 
                                                }}
                                                className={`p-2.5 rounded-xl transition-all ${agent.icon === icon ? 'bg-indigo-500/30 text-indigo-300 shadow-inner' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
                                            >
                                                {renderIcon(icon, 20)}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {activeMenuDropdown === agent.id && (
                                    <div 
                                        className="absolute top-10 right-0 p-1 bg-[#0a0a0c]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl flex flex-col w-36 z-50 animate-in fade-in zoom-in-95"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setEditingAgent(agent); setActiveMenuDropdown(null); }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
                                        >
                                            <Edit2 size={14} /> Edit
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); dispatch(duplicateAgent(agent.id)); setActiveMenuDropdown(null); }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
                                        >
                                            <Copy size={14} /> Duplicate
                                        </button>
                                        <div className="h-px bg-white/10 my-1"></div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setAgentToDelete(agent.id); setActiveMenuDropdown(null); }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                                        >
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    </div>
                                )}

                                <button 
                                    className="text-white/30 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors z-20" 
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        setActiveMenuDropdown(activeMenuDropdown === agent.id ? null : agent.id); 
                                        setActiveIconDropdown(null);
                                    }}
                                >
                                    <MoreVertical size={16} />
                                </button>
                            </div>
                            
                            <h3 className="text-lg font-bold text-white mb-2">{agent.name || 'Unnamed Agent'}</h3>
                            <p className="text-sm text-white/50 mb-auto leading-relaxed">{agent.capabilities || 'No description provided.'}</p>
                            
                            <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-xs text-white/40 font-medium">
                                    <span className="px-2 py-0.5 rounded-full bg-white/10">{agent.area || 'General'}</span>
                                    {agent.project && <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 truncate">{agent.project}</span>}
                                </div>
                                <div className="flex gap-1">
                                    {agent.apps.slice(0,3).map(app => (
                                        <div key={app} className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white/70" title={app}>
                                            {app[0]}
                                        </div>
                                    ))}
                                    {agent.apps.length > 3 && <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[10px] text-white/40">+{agent.apps.length - 3}</div>}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Delete Confirmation Modal */}
                    {agentToDelete && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in" onClick={() => setAgentToDelete(null)}>
                            <div className="bg-[#0a0a0c] border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center gap-3 text-red-400 mb-4">
                                    <AlertTriangle size={24} />
                                    <h3 className="text-lg font-semibold">Delete Agent</h3>
                                </div>
                                <p className="text-white/70 text-sm mb-6">
                                    Are you sure you want to delete this agent? This action cannot be undone.
                                </p>
                                <div className="flex justify-end gap-3">
                                    <button 
                                        onClick={() => setAgentToDelete(null)}
                                        className="px-4 py-2 text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={() => {
                                            dispatch(deleteAgent(agentToDelete));
                                            setAgentToDelete(null);
                                        }}
                                        className="px-4 py-2 text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors border border-red-500/20"
                                    >
                                        Confirm Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Create New Card */}
                    <div 
                        onClick={handleCreateNew}
                        className="bg-transparent border border-dashed border-white/20 rounded-3xl p-6 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-pointer flex flex-col items-center justify-center h-64 text-white/40 hover:text-indigo-300 group"
                    >
                        <Plus size={48} />
                        <span className="font-semibold">Create Agent</span>
                    </div>
                </div>
            </div>

            {editingAgent && (
                <AgentEditor 
                    agent={editingAgent} 
                    onClose={() => setEditingAgent(null)}
                    onSave={handleSave} 
                />
            )}
        </div>
    );
};
