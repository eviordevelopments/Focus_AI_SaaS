import { useState, useRef, useEffect } from 'react';
import { useSendMessageMutation } from '../../features/api/apiSlice';
import { Send, Loader2, Sparkles, Brain, Zap, Target, Search, X } from 'lucide-react';
import logo from '../../assets/logo.png';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

const SUGGESTED_PROMPTS = [
    { icon: <Brain className="text-blue-400" size={18} />, label: "Analyze my focus yesterday", prompt: "How was my focus quality yesterday based on my sessions?" },
    { icon: <Zap className="text-amber-400" size={18} />, label: "Suggest a deep work schedule", prompt: "Look at my tasks for today and suggest the best time for a 90-minute deep work session." },
    { icon: <Target className="text-emerald-400" size={18} />, label: "Prevent burnout check-in", prompt: "Analyze my recent sleep and health data. Am I at risk of burnout this week?" },
    { icon: <Sparkles className="text-purple-400" size={18} />, label: "Summarize my learning", prompt: "What are the key concepts I've been learning in my flashcard decks lately?" },
    { icon: <Target className="text-blue-400" size={18} />, label: "Help me prioritize my tasks", prompt: "Help me prioritize my tasks for today." },
    { icon: <Zap className="text-red-400" size={18} />, label: "I'm feeling burnt out", prompt: "I'm feeling burnt out, what should I do?" },
    { icon: <Brain className="text-indigo-400" size={18} />, label: "Plan my deep work session", prompt: "Plan my deep work session for today." },
    { icon: <Sparkles className="text-amber-400" size={18} />, label: "Explain Pomodoro technique", prompt: "Explain the Pomodoro technique for me." }
];

export function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [sendMessage, { isLoading }] = useSendMessageMutation();
    const endRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
            setShowSuggestions(false);
        }
    }, [messages]);

    const handleSend = async (textOverride?: string) => {
        const text = textOverride || input;
        if (!text.trim() || isLoading) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setShowSuggestions(false);

        try {
            const data = await sendMessage({ message: text }).unwrap();
            const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: data.reply };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            const errorMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: "Sorry, I encountered an error connecting to my brain." };
            setMessages(prev => [...prev, errorMsg]);
        }
    };

    return (
        <div className="flex flex-col h-full relative overflow-hidden bg-transparent">
            {/* Background Gradient Blobs */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Initial Hero State */}
            {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-500">
                    <div className="mb-8 relative w-24 h-24 flex items-center justify-center">
                        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse" />
                        <img
                            src={logo}
                            alt="Deepmind"
                            className="max-w-full max-h-full object-contain relative z-10"
                        />
                    </div>

                    <h1 className="text-4xl font-bold text-white mb-2 text-center tracking-tight">
                        How can I help you today?
                    </h1>
                    <p className="text-gray-400 text-center mb-12 max-w-md">
                        Ask about your productivity, health, learning metrics or schedule a deep work session.
                    </p>

                    {/* Desktop Search Bar (Initial) */}
                    <div className="w-full max-w-2xl relative group mb-8">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/30 to-cyan-500/30 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                        <div className="relative flex items-center bg-gray-900/80 backdrop-blur-3xl border border-white/10 rounded-2xl p-2 shadow-2xl">
                            <div className="pl-4 text-gray-500">
                                <Search size={20} />
                            </div>
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask, search, or make anything..."
                                className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-white px-4 py-3 placeholder-white/20 text-lg"
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={isLoading || !input.trim()}
                                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-blue-500/20"
                            >
                                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                Send
                            </button>
                        </div>
                    </div>

                    {/* Suggestions (Compact list under the search bar) */}
                    {showSuggestions && (
                        <div className="w-full max-w-2xl space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Suggested Prompts</h3>
                                <button onClick={() => setShowSuggestions(false)} className="text-gray-600 hover:text-white transition-colors">
                                    <X size={12} />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {SUGGESTED_PROMPTS.map((item, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(item.prompt)}
                                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-white/20 transition-all group active:scale-[0.98] text-left whitespace-nowrap shadow-lg shadow-black/20"
                                    >
                                        <div className="shrink-0 group-hover:scale-110 transition-transform">
                                            {item.icon}
                                        </div>
                                        <span className="text-[11px] font-medium text-gray-300 group-hover:text-white transition-colors">
                                            {item.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* Chat History Mode */
                <div className="flex-1 flex flex-col h-full bg-black/10 backdrop-blur-sm">
                    {/* Header */}
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                        <div className="flex items-center gap-3">
                            <img src={logo} alt="Deepmind" className="w-8 h-8 rounded-lg shadow-lg object-contain" />
                            <div>
                                <h3 className="text-sm font-bold text-white leading-none">Deepmind</h3>
                                <p className="text-[10px] text-blue-400 font-medium">Artificial Intelligence</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setMessages([])}
                            className="text-xs text-gray-500 hover:text-white transition-colors"
                        >
                            Reset Conversation
                        </button>
                    </div>

                    {/* Messages Scroll Area */}
                    <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${msg.role === 'user'
                                    ? 'bg-blue-600 border-blue-400 text-white'
                                    : 'bg-white/5 border-white/10 text-cyan-400 shadow-inner shadow-cyan-500/10'
                                    }`}>
                                    {msg.role === 'user' ? <Brain size={16} /> : <Sparkles size={16} />}
                                </div>
                                <div className={`px-5 py-4 rounded-3xl text-sm leading-relaxed max-w-[85%] lg:max-w-[70%] border ${msg.role === 'user'
                                    ? 'bg-blue-600/90 text-white rounded-tr-none shadow-xl shadow-blue-500/20 border-blue-400/30'
                                    : 'bg-white/5 backdrop-blur-xl text-gray-200 rounded-tl-none border-white/10 shadow-lg'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-4 animate-pulse">
                                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500">
                                    <Loader2 size={16} className="animate-spin" />
                                </div>
                                <div className="px-5 py-4 rounded-3xl rounded-tl-none bg-white/5 border border-white/5 w-24">
                                    <div className="flex gap-1 h-2 items-center">
                                        <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={endRef} />
                    </div>

                    {/* Compact Bottom Input */}
                    <div className="p-4 border-t border-white/5 bg-white/5">
                        <div className="max-w-4xl mx-auto relative group">
                            <div className="absolute -inset-0.5 bg-blue-600/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                            <div className="relative flex items-center gap-2 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-2xl p-1.5 pr-3 shadow-2xl">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type your message..."
                                    className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-white px-4 py-2 text-sm placeholder-white/20"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={isLoading || !input.trim()}
                                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-2 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
