import React, { useState } from 'react';
import { X, Settings, Sliders, Cpu, MessageSquare, Wrench } from 'lucide-react';

export interface AgentConfig {
    systemPrompt: string;
    role: string;
    agentName: string;
    temperature: number;
    topP: number;
    maxTokens: number;
    tone: string;
    toolsEnabled: string[];
    mcpModes: string[];
}

export const defaultAgentConfig: AgentConfig = {
    systemPrompt: '',
    role: 'Productivity Coach & Second Brain',
    agentName: 'Focus AI',
    temperature: 0.7,
    topP: 1.0,
    maxTokens: 2000,
    tone: 'Professional and encouraging',
    toolsEnabled: ['web_search', 'local_vault'],
    mcpModes: ['none']
};

interface AgentConfigPanelProps {
    isOpen: boolean;
    onClose: () => void;
    config: AgentConfig;
    setConfig: (config: AgentConfig) => void;
}

export const AgentConfigPanel: React.FC<AgentConfigPanelProps> = ({ isOpen, onClose, config, setConfig }) => {
    if (!isOpen) return null;

    const handleChange = (field: keyof AgentConfig, value: any) => {
        setConfig({ ...config, [field]: value });
    };

    const handleCheckbox = (field: 'toolsEnabled' | 'mcpModes', item: string) => {
        const list = config[field];
        if (list.includes(item)) {
            handleChange(field, list.filter(i => i !== item));
        } else {
            handleChange(field, [...list, item]);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-[500px] max-h-[85vh] bg-[#0a0a0c]/40 backdrop-blur-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] rounded-2xl flex flex-col animate-in zoom-in-95 duration-300">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                            <Settings size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Agent Configuration</h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    
                    {/* Identity Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider flex items-center gap-2">
                            <Cpu size={14} /> Identity
                        </h3>
                        
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-white/70 mb-1">Agent Name</label>
                                <input 
                                    type="text"
                                    value={config.agentName}
                                    onChange={(e) => handleChange('agentName', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    placeholder="e.g. Jarvis"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-white/70 mb-1">Role</label>
                                <input 
                                    type="text"
                                    value={config.role}
                                    onChange={(e) => handleChange('role', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                    placeholder="e.g. Expert Software Engineer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Behavior Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider flex items-center gap-2">
                            <MessageSquare size={14} /> Behavior
                        </h3>
                        
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-white/70 mb-1">Custom System Prompt</label>
                                <textarea 
                                    value={config.systemPrompt}
                                    onChange={(e) => handleChange('systemPrompt', e.target.value)}
                                    rows={4}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                                    placeholder="Add custom instructions to override the default system prompt..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-white/70 mb-1">Tone of Language</label>
                                <select 
                                    value={config.tone}
                                    onChange={(e) => handleChange('tone', e.target.value)}
                                    className="w-full bg-[#18181b] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                >
                                    <option value="Professional and encouraging">Professional & Encouraging</option>
                                    <option value="Academic and formal">Academic & Formal</option>
                                    <option value="Direct and concise">Direct & Concise</option>
                                    <option value="Sarcastic and witty">Sarcastic & Witty</option>
                                    <option value="Friendly and casual">Friendly & Casual</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Model Parameters */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider flex items-center gap-2">
                            <Sliders size={14} /> Model Parameters
                        </h3>
                        
                        <div className="space-y-5">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-medium text-white/70">Temperature</label>
                                    <span className="text-xs text-indigo-400 font-mono bg-indigo-500/10 px-1.5 py-0.5 rounded">{config.temperature.toFixed(2)}</span>
                                </div>
                                <input 
                                    type="range"
                                    min="0" max="2" step="0.05"
                                    value={config.temperature}
                                    onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                                    className="w-full accent-indigo-500"
                                />
                                <div className="flex justify-between text-[10px] text-white/40 mt-1">
                                    <span>Precise</span>
                                    <span>Creative</span>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-medium text-white/70">Top P</label>
                                    <span className="text-xs text-indigo-400 font-mono bg-indigo-500/10 px-1.5 py-0.5 rounded">{config.topP.toFixed(2)}</span>
                                </div>
                                <input 
                                    type="range"
                                    min="0" max="1" step="0.05"
                                    value={config.topP}
                                    onChange={(e) => handleChange('topP', parseFloat(e.target.value))}
                                    className="w-full accent-indigo-500"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-xs font-medium text-white/70">Max Output Tokens</label>
                                </div>
                                <input 
                                    type="number"
                                    min="100" max="8000" step="100"
                                    value={config.maxTokens}
                                    onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tools & Integrations */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider flex items-center gap-2">
                            <Wrench size={14} /> Tools & MCP
                        </h3>
                        
                        <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/10">
                            <div>
                                <label className="block text-xs font-medium text-white/70 mb-2">Available Tools</label>
                                <div className="space-y-2">
                                    {['web_search', 'local_vault', 'code_interpreter'].map(tool => (
                                        <label key={tool} className="flex items-center gap-2 cursor-pointer group">
                                            <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${config.toolsEnabled.includes(tool) ? 'bg-indigo-500 border-indigo-500' : 'border-white/20 group-hover:border-white/40'}`}>
                                                {config.toolsEnabled.includes(tool) && <div className="w-2 h-2 bg-white rounded-sm" />}
                                            </div>
                                            <span className="text-sm text-white/80 group-hover:text-white capitalize">{tool.replace('_', ' ')}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-white/10">
                                <label className="block text-xs font-medium text-white/70 mb-2">MCP Access (Projects/Apps)</label>
                                <div className="space-y-2">
                                    {['github_integration', 'notion_sync', 'figma_reader'].map(mcp => (
                                        <label key={mcp} className="flex items-center gap-2 cursor-pointer group">
                                            <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${config.mcpModes.includes(mcp) ? 'bg-emerald-500 border-emerald-500' : 'border-white/20 group-hover:border-white/40'}`}>
                                                {config.mcpModes.includes(mcp) && <div className="w-2 h-2 bg-white rounded-sm" />}
                                            </div>
                                            <span className="text-sm text-white/80 group-hover:text-white capitalize">{mcp.replace('_', ' ')}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
