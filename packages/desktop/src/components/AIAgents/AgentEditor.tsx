import React, { useState } from 'react';
import { X, Bot, Save, Check, Plus, Database, Cpu, Network, Zap, Lock, Blocks } from 'lucide-react';
import { AgentData } from '../../features/ui/uiSlice';

interface AgentEditorProps {
    agent: AgentData;
    onClose: () => void;
    onSave: (agent: AgentData) => void;
}

const ICONS = ['Bot', 'Cpu', 'Database', 'Network', 'Zap', 'Lock'];
const AREAS = ['Business', 'Health', 'Learning', 'Personal', 'Finance'];
const APPS = ['Google Drive', 'Notion', 'Github', 'Figma', 'Slack', 'Linear', 'MCP Local Vault'];

export const AgentEditor: React.FC<AgentEditorProps> = ({ agent: initialAgent, onClose, onSave }) => {
    const [agent, setAgent] = useState<AgentData>(initialAgent);
    const [newSkill, setNewSkill] = useState('');
    const [showIconToggle, setShowIconToggle] = useState(false);

    const toggleArrayItem = (field: 'apps' | 'plugins' | 'skills' | 'workflows', item: string) => {
        setAgent(prev => {
            const list = prev[field];
            if (list.includes(item)) return { ...prev, [field]: list.filter(i => i !== item) };
            return { ...prev, [field]: [...list, item] };
        });
    };

    const addSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && newSkill.trim()) {
            if (!agent.skills.includes(newSkill.trim())) {
                setAgent(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
            }
            setNewSkill('');
        }
    };

    const removeSkill = (skill: string) => {
        setAgent(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
    };

    const renderIcon = (iconName: string, size = 24) => {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-[800px] h-[90vh] bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl rounded-3xl flex flex-col animate-in zoom-in-95 duration-300 relative">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
                            <Blocks size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">Agent Configuration</h2>
                            <p className="text-sm text-white/50">Define identity, integrations, and logic for {agent.name || 'new agent'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => onSave(agent)}
                            className="p-2.5 bg-white/5 backdrop-blur-md border border-white/10 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-500/30 rounded-xl transition-all shadow-sm"
                            title="Save Agent"
                        >
                            <Check size={18} />
                        </button>
                        <button 
                            onClick={onClose}
                            className="p-2.5 bg-white/5 backdrop-blur-md border border-white/10 text-white/50 hover:text-white hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 rounded-xl transition-all shadow-sm"
                            title="Close"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-2 gap-10">
                        
                        {/* Column 1: Identity & Cognitive */}
                        <div className="space-y-8">
                            <section>
                                <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">Identity</h3>
                                <div className="space-y-4">

                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-1">Name</label>
                                        <input 
                                            type="text" 
                                            value={agent.name}
                                            onChange={e => setAgent({...agent, name: e.target.value})}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                            placeholder="Agent Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-1">Capabilities (Description)</label>
                                        <textarea 
                                            value={agent.capabilities}
                                            onChange={e => setAgent({...agent, capabilities: e.target.value})}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none h-20"
                                            placeholder="What can this agent do?"
                                        />
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">Cognition</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-1">System Prompt</label>
                                        <textarea 
                                            value={agent.systemPrompt} onChange={e => setAgent({...agent, systemPrompt: e.target.value})}
                                            rows={5}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white/90 focus:border-indigo-500 outline-none resize-none custom-scrollbar font-mono leading-relaxed"
                                            placeholder="You are an expert in..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-2">Skills</label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {agent.skills.map(skill => (
                                                <span key={skill} className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded flex items-center gap-1 border border-indigo-500/20">
                                                    {skill}
                                                    <button onClick={() => removeSkill(skill)}><X size={12} className="hover:text-white" /></button>
                                                </span>
                                            ))}
                                        </div>
                                        <input 
                                            type="text" 
                                            value={newSkill}
                                            onChange={e => setNewSkill(e.target.value)}
                                            onKeyDown={addSkill}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                            placeholder="Type a skill and press Enter..."
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Column 2: Context & Integrations */}
                        <div className="space-y-8">
                            <section>
                                <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">Context</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-white/70 mb-1">Life Area</label>
                                            <select 
                                                value={agent.area}
                                                onChange={e => setAgent({...agent, area: e.target.value})}
                                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500/50 transition-all appearance-none"
                                            >
                                                <option value="">No Area</option>
                                                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-white/70 mb-1">Project</label>
                                            <input 
                                                type="text" 
                                                value={agent.project}
                                                onChange={e => setAgent({...agent, project: e.target.value})}
                                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all"
                                                placeholder="Project Name"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">Integrations & MCP</h3>
                                <div className="space-y-2">
                                    {APPS.map(app => (
                                        <label key={app} className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                                            <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${agent.apps.includes(app) ? 'bg-indigo-500 border-indigo-500' : 'border-white/20'}`}>
                                                {agent.apps.includes(app) && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                                            </div>
                                            <span className="text-sm text-white/80">{app}</span>
                                        </label>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">Workflows</h3>
                                <button className="w-full p-4 rounded-xl border border-dashed border-white/20 text-white/40 hover:text-white hover:bg-white/5 transition-all flex flex-col items-center gap-2 group">
                                    <Plus size={20} />
                                    <span className="text-sm font-medium">Add Automated Workflow</span>
                                </button>
                                {agent.workflows.map((wf, idx) => (
                                    <div key={idx} className="mt-2 p-3 bg-white/5 border border-white/10 rounded-lg text-sm text-indigo-300">
                                        {wf}
                                    </div>
                                ))}
                            </section>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
