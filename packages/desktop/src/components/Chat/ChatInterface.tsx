import { useState, useRef, useEffect, useMemo } from 'react';
// import { useSendMessageMutation } from '../../features/api/apiSlice';
import { Send, Loader2, Plus, Mic, AudioLines, ChevronDown, Clock, ThumbsUp, ThumbsDown, RefreshCw, Copy, Flag, Globe, X, Edit3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { InteractiveQuiz } from '../Study/InteractiveQuiz';
import { FlashcardDeck } from '../Study/FlashcardDeck';
import { Mermaid } from '../Study/Mermaid';
import { InteractiveChart } from '../Study/InteractiveChart';
import { AgentConfigPanel, defaultAgentConfig, AgentConfig } from './AgentConfigPanel';
import { AudioVisualizer } from './AudioVisualizer';
import logo from '../../assets/logo.png';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { addNote } from '../../features/notes/notesSlice';
import { Bot as BotIcon, Cpu, Database, Network, Zap, Lock } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    images?: string[];
    files?: { name: string; content: string }[];
    isSearching?: boolean;
    sources?: { title: string; url: string; source: string }[];
}

interface Attachment {
    file: File;
    base64: string;
    type: 'image' | 'text';
    content?: string;
}

const SUGGESTED_PROMPTS = [
    { label: "Analyze my focus yesterday", prompt: "How was my focus quality yesterday based on my sessions?" },
    { label: "Suggest a deep work schedule", prompt: "Look at my tasks for today and suggest the best time for a 90-minute deep work session." },
    { label: "Prevent burnout check-in", prompt: "Analyze my recent sleep and health data. Am I at risk of burnout this week?" },
    { label: "Summarize my learning", prompt: "What are the key concepts I've been learning in my flashcard decks lately?" }
];

const OPENROUTER_MODELS = [
    { id: 'openrouter/auto', name: 'Auto (Best Free Model)', provider: 'OpenRouter' },
    { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1 8B (Free)', provider: 'Meta' },
    { id: 'google/gemma-2-9b-it:free', name: 'Gemma 2 9B (Free)', provider: 'Google' },
    { id: 'anthropic/claude-3.5-sonnet', name: 'Sonnet 3.5 (Pro)', provider: 'Anthropic' },
    { id: 'openai/gpt-4o', name: 'GPT-4o (Pro)', provider: 'OpenAI' }
];

const LOADING_STATES = ["Thinking...", "Analyzing...", "Reasoning...", "Connecting..."];

const parseLLMJSON = (str: string) => {
    const sanitized = str.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    return JSON.parse(sanitized);
};

export const ChatInterface = ({ onActionClick }: { onActionClick?: (action: string) => void }) => {
    const dispatch = useDispatch();
    const [messages, setMessages] = useState<Message[]>([]);
    
    // Text Selection State
    const [selection, setSelection] = useState<{text: string, x: number, y: number} | null>(null);

    useEffect(() => {
        const handleMouseUp = () => {
            const activeSelection = window.getSelection();
            if (activeSelection && activeSelection.toString().trim().length > 0) {
                const range = activeSelection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                setSelection({
                    text: activeSelection.toString().trim(),
                    x: rect.left + (rect.width / 2),
                    y: rect.top - 10
                });
            } else {
                setSelection(null);
            }
        };
        
        document.addEventListener('mouseup', handleMouseUp);
        return () => document.removeEventListener('mouseup', handleMouseUp);
    }, []);
    const [input, setInput] = useState('');
    const [selectedModel, setSelectedModel] = useState(OPENROUTER_MODELS[0]);
    const [showModelDropdown, setShowModelDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [loadingText, setLoadingText] = useState(LOADING_STATES[0]);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [showPlusDropdown, setShowPlusDropdown] = useState(false);
    const [selectedMode, setSelectedMode] = useState<'normal' | 'study' | 'research' | 'math'>('normal');
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
    const [showAgentDropdown, setShowAgentDropdown] = useState(false);
    const agents = useSelector((state: RootState) => state.ui.agents);
    const selectedAgent = agents.find(a => a.id === selectedAgentId);
    const [activeWidget, setActiveWidget] = useState<{ type: 'quiz' | 'flashcards' | 'mermaid' | 'chart', data: any } | null>(null);
    const [agentConfig, setAgentConfig] = useState<AgentConfig>(defaultAgentConfig);
    const [showAgentConfig, setShowAgentConfig] = useState(false);
    
    // Voice to Text State
    const [isRecording, setIsRecording] = useState(false);
    const audioStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const pcmDataRef = useRef<Float32Array[]>([]);
    const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

    const endRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const plusDropdownRef = useRef<HTMLDivElement>(null);
    const modelDropdownRef = useRef<HTMLDivElement>(null);
    const agentDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (plusDropdownRef.current && !plusDropdownRef.current.contains(event.target as Node)) {
                setShowPlusDropdown(false);
            }
            if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
                setShowModelDropdown(false);
            }
            if (agentDropdownRef.current && !agentDropdownRef.current.contains(event.target as Node)) {
                setShowAgentDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const scrollToBottom = () => {
        endRef.current?.scrollIntoView({ behavior: isStreaming ? 'auto' : 'smooth' });
    };

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages]);

    useEffect(() => {
        if (!isLoading) {
            setLoadingText(LOADING_STATES[0]);
            return;
        }
        const interval = setInterval(() => {
            setLoadingText(prev => {
                const currentIndex = LOADING_STATES.indexOf(prev);
                return LOADING_STATES[(currentIndex + 1) % LOADING_STATES.length];
            });
        }, 1200);
        return () => clearInterval(interval);
    }, [isLoading]);
    const toggleRecording = async () => {
        if (isRecording) {
            setIsRecording(false);

            if (audioContextRef.current && pcmDataRef.current.length > 0) {
                // Flatten the PCM chunks into a single Float32Array
                const totalLength = pcmDataRef.current.reduce((acc, chunk) => acc + chunk.length, 0);
                const float32Array = new Float32Array(totalLength);
                let offset = 0;
                for (const chunk of pcmDataRef.current) {
                    float32Array.set(chunk, offset);
                    offset += chunk.length;
                }

                try {
                    const formData = new FormData();
                    const floatBlob = new Blob([float32Array.buffer], { type: 'application/octet-stream' });
                    formData.append('audio', floatBlob, 'audio.raw');

                    // Note: We use the backend API to transcribe
                    const response = await fetch('http://localhost:4000/api/agent/transcribe', {
                        method: 'POST',
                        body: formData
                    });
                    const data = await response.json();
                    if (data.text) {
                        setInput(prev => prev + data.text + ' ');
                    }
                } catch (err) {
                    console.error('Transcription error:', err);
                    alert('Hubo un error al transcribir el audio.');
                }
            }
            
            // Cleanup audio resources
            if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }
            if (audioStreamRef.current) {
                audioStreamRef.current.getTracks().forEach(track => track.stop());
                audioStreamRef.current = null;
            }
            setAudioStream(null);

            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setAudioStream(stream);
            audioStreamRef.current = stream;
            
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            audioContextRef.current = audioContext;
            
            const source = audioContext.createMediaStreamSource(stream);
            const processor = audioContext.createScriptProcessor(4096, 1, 1);
            
            pcmDataRef.current = [];
            
            processor.onaudioprocess = (e) => {
                // Only collect data if we are recording
                const inputData = e.inputBuffer.getChannelData(0);
                pcmDataRef.current.push(new Float32Array(inputData));
            };
            
            // Connect source to processor, and processor to destination (muted) to start the stream
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 0; // Mute it so we don't hear feedback
            
            source.connect(processor);
            processor.connect(gainNode);
            gainNode.connect(audioContext.destination);

            setIsRecording(true);
        } catch (err) {
            console.error('Microphone access denied:', err);
            alert('No se pudo acceder al micrófono. Por favor, revisa tus permisos.');
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        
        for (const file of files) {
            if (file.name.toLowerCase().endsWith('.pdf') || file.name.toLowerCase().endsWith('.docx')) {
                alert(`El archivo ${file.name} no es compatible todavía. El soporte para PDFs y documentos complejos llegará muy pronto en la actualización "Local Vault" (RAG). Por favor sube imágenes, o archivos de texto plano (.txt, .md, .csv).`);
                continue;
            }

            const isImage = file.type.startsWith('image/');
            const reader = new FileReader();
            
            reader.onload = (event) => {
                const result = event.target?.result as string;
                if (isImage) {
                    setAttachments(prev => [...prev, { file, base64: result, type: 'image' }]);
                } else {
                    setAttachments(prev => [...prev, { file, base64: '', type: 'text', content: result }]);
                }
            };
            
            if (isImage) {
                reader.readAsDataURL(file);
            } else {
                reader.readAsText(file);
            }
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSend = async (textOverride?: string) => {
        const text = textOverride || input;
        if (!text.trim() && attachments.length === 0) return;
        if (isLoading) return;

        const images = attachments.filter(a => a.type === 'image').map(a => a.base64);
        const files = attachments.filter(a => a.type === 'text').map(a => ({ name: a.file.name, content: a.content || '' }));

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, images, files };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setAttachments([]);
        setIsLoading(true);

        const aiMsgId = (Date.now() + 1).toString();
        // Add empty message placeholder
        setMessages(prev => [...prev, { id: aiMsgId, role: 'assistant', content: '' }]);

        try {
            const response = await fetch('/api/agent/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // If using auth
                },
                body: JSON.stringify({ 
                    messages: [...messages, userMsg].map(m => {
                        if (m.role === 'assistant') return { role: 'assistant', content: m.content };
                        
                        const textContent = m.content + (m.files && m.files.length > 0 ? '\n\n' + m.files.map(f => `[File: ${f.name}]\n${f.content}`).join('\n\n') : '');
                        
                        if (m.images && m.images.length > 0) {
                            return {
                                role: 'user',
                                content: [
                                    { type: "text", text: textContent },
                                    ...m.images.map(img => ({ type: "image_url", image_url: { url: img } }))
                                ]
                            };
                        } else {
                            return { role: 'user', content: textContent };
                        }
                    }), 
                    model: selectedModel.id,
                    mode: selectedMode,
                    agentConfig: selectedAgent ? {
                        name: selectedAgent.name,
                        role: selectedAgent.area || 'Assistant',
                        systemPrompt: selectedAgent.systemPrompt,
                        temperature: agentConfig.temperature,
                        topP: agentConfig.topP,
                        maxTokens: agentConfig.maxTokens,
                        toolsEnabled: selectedAgent.apps,
                        mcpModes: selectedAgent.plugins
                    } : agentConfig
                })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let buffer = '';

            if (reader) {
                setIsLoading(false); // Stop typing indicator, start showing text
                setIsStreaming(true);
                while (!done) {
                    const { value, done: doneReading } = await reader.read();
                    done = doneReading;
                    if (value) {
                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split('\n');
                        buffer = lines.pop() || ''; // Keep incomplete line in buffer
                        
                        for (const line of lines) {
                            if (line.trim().startsWith('data: ')) {
                                const dataStr = line.trim().substring(6);
                                if (dataStr === '[DONE]') {
                                    done = true;
                                    break;
                                }
                                try {
                                    const parsed = JSON.parse(dataStr);
                                    if (parsed.status === 'searching') {
                                        setMessages(prev => prev.map(msg => 
                                            msg.id === aiMsgId ? { ...msg, isSearching: true } : msg
                                        ));
                                        setLoadingText("Searching Google...");
                                    } else if (parsed.status === 'search_failed') {
                                        setMessages(prev => prev.map(msg => 
                                            msg.id === aiMsgId ? { ...msg, isSearching: false } : msg
                                        ));
                                    } else if (parsed.sources) {
                                        setMessages(prev => prev.map(msg => 
                                            msg.id === aiMsgId ? { ...msg, isSearching: false, sources: parsed.sources } : msg
                                        ));
                                        setLoadingText("Reading results...");
                                    } else if (parsed.text) {
                                        setMessages(prev => prev.map(msg => {
                                            if (msg.id === aiMsgId) {
                                                const newContent = msg.content + parsed.text;
                                                // Auto-open widgets if a full JSON block has been streamed
                                                if (newContent.endsWith('```') && (newContent.includes('```quiz\n') || newContent.includes('```flashcards\n') || newContent.includes('```mermaid\n'))) {
                                                    const quizMatch = newContent.match(/```quiz\n([\s\S]*?)\n```/);
                                                    if (quizMatch) {
                                                        try { setActiveWidget({ type: 'quiz', data: parseLLMJSON(quizMatch[1]) }); } catch (e) {}
                                                    }
                                                    const mermaidMatch = newContent.match(/```mermaid\n([\s\S]*?)\n```/);
                                                    if (mermaidMatch) {
                                                        try { setActiveWidget({ type: 'mermaid', data: { chart: mermaidMatch[1] } }); } catch (e) {}
                                                    }
                                                    const flashcardMatch = newContent.match(/```flashcards\n([\s\S]*?)\n```/);
                                                    if (flashcardMatch) {
                                                        try { setActiveWidget({ type: 'flashcards', data: parseLLMJSON(flashcardMatch[1]) }); } catch (e) {}
                                                    }
                                                }
                                                return { ...msg, content: newContent };
                                            }
                                            return msg;
                                        }));
                                    }
                                } catch (e) {
                                    // ignore parse errors for partial JSON
                                }
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => prev.map(msg => 
                msg.id === aiMsgId ? { ...msg, content: "Sorry, I encountered an error connecting to my brain." } : msg
            ));
        } finally {
            setIsLoading(false);
            setIsStreaming(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Auto-resize textarea
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

    const isInitial = messages.length === 0;

    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden w-full relative bg-transparent font-sans">
            {/* Top Header */}
            <header className="absolute top-0 left-0 right-0 h-16 px-6 flex items-center justify-between z-20 pointer-events-auto">
                <div className="flex items-center gap-3">
                    {/* Brand or title placeholder */}
                </div>
                {/* Top Right Controls */}
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowAgentConfig(true)}
                        className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        title="Agent Configuration"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    </button>
                </div>
            </header>

            {/* Agent Config Modal */}
            <AgentConfigPanel 
                isOpen={showAgentConfig} 
                onClose={() => setShowAgentConfig(false)}
                config={agentConfig}
                setConfig={setAgentConfig}
            />

            {/* Top Bar Fade */}
            {!isInitial && (
                <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/50 to-transparent z-10 pointer-events-none" />
            )}
            
            {/* Messages Area */}
            <div className={`flex-1 min-h-0 overflow-y-auto w-full flex flex-col ${isInitial ? 'justify-center items-center' : 'justify-start items-center pt-8'} custom-scrollbar`}>
                {isInitial ? (
                    <div className="w-full max-w-5xl px-4 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-1000 mb-12">
                        <h1 className="text-3xl md:text-4xl font-semibold text-white/90 mb-10 text-center tracking-tight">
                            What should we explore?
                        </h1>
                        
                        <div className="w-full relative group">
                            <div className="animated-border-box bg-white/5 backdrop-blur-3xl rounded-2xl p-3 flex flex-col shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all focus-within:shadow-[0_0_30px_rgba(59,130,246,0.25)] focus-within:bg-white/10">
                                {/* Attachments Preview */}
                                {attachments.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {attachments.map((att, idx) => (
                                            <div key={idx} className="relative group">
                                                {att.type === 'image' ? (
                                                    <img src={att.base64} alt={att.file.name} className="h-16 w-16 object-cover rounded-lg border border-white/10" />
                                                ) : (
                                                    <div className="h-16 w-16 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center text-[10px] text-white/50 text-center p-1 break-all">
                                                        {att.file.name}
                                                    </div>
                                                )}
                                                <button 
                                                    onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                >
                                                    <Plus size={12} className="rotate-45" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {/* Empty state - Agent Badge / Mode Badge */}
                                {selectedMode !== 'normal' && (
                                    <div className="flex justify-start mb-3">
                                        <div className={`px-3 py-1.5 rounded-full text-[13px] font-medium flex items-center gap-2 animate-in slide-in-from-bottom-2 border ${
                                            selectedMode === 'study' 
                                                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                                                : selectedMode === 'research'
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                        }`}>
                                            {selectedMode === 'study' ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                                            ) : selectedMode === 'research' ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M12 12v9"></path><path d="m8 17 4 4 4-4"></path></svg>
                                            )}
                                            {selectedMode === 'study' ? 'Study Mode' : selectedMode === 'research' ? 'Research Mode' : 'Math Mode'}
                                        </div>
                                    </div>
                                )}
                                {selectedAgent && selectedMode === 'normal' && (
                                    <div className="flex justify-start mb-3">
                                        <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1.5 rounded-full text-[13px] font-medium flex items-center gap-2 animate-in slide-in-from-bottom-2">
                                            <BotIcon size={16} />
                                            Active Agent: {selectedAgent.name}
                                        </div>
                                    </div>
                                )}
                                
                                <div className="relative w-full">
                                    <textarea
                                        ref={textareaRef}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Ask anything..."
                                        className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-white/90 text-[15px] resize-none placeholder-white/30 py-1 max-h-[200px] leading-relaxed"
                                        rows={1}
                                        disabled={isLoading}
                                    />
                                    {isRecording && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-md rounded-md border border-white/10 shadow-lg overflow-hidden">
                                            <AudioVisualizer stream={audioStream} isRecording={isRecording} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <div className="flex items-center gap-2 relative" ref={plusDropdownRef}>
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            onChange={handleFileSelect} 
                                            className="hidden" 
                                            multiple 
                                            accept="image/*,.txt,.md,.csv" 
                                        />
                                        <button 
                                            onClick={() => setShowPlusDropdown(!showPlusDropdown)}
                                            className="p-1.5 rounded-full text-white/40 hover:bg-white/10 hover:text-white/80 transition-colors relative"
                                        >
                                            <Plus size={18} />
                                        </button>
                                        
                                        {showPlusDropdown && (
                                            <div className="absolute bottom-full left-0 mb-2 w-48 bg-[#0a0a0c] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                                <button
                                                    onClick={() => { setSelectedMode('study'); setShowPlusDropdown(false); }}
                                                    className="w-full text-left px-4 py-3 text-[13px] text-white/70 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-3 border-b border-white/5"
                                                >
                                                    <div className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                                                    </div>
                                                    <span className="font-medium">Study Mode</span>
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedMode('research'); setShowPlusDropdown(false); }}
                                                    className="w-full text-left px-4 py-3 text-[13px] text-white/70 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-3 border-b border-white/5"
                                                >
                                                    <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                                                    </div>
                                                    <span className="font-medium">Research Mode</span>
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedMode('math'); setShowPlusDropdown(false); }}
                                                    className="w-full text-left px-4 py-3 text-[13px] text-white/70 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-3 border-b border-white/5"
                                                >
                                                    <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M12 12v9"></path><path d="m8 17 4 4 4-4"></path></svg>
                                                    </div>
                                                    <span className="font-medium">Math Mode</span>
                                                </button>
                                                <button
                                                    onClick={() => { setShowPlusDropdown(false); fileInputRef.current?.click(); }}
                                                    className="w-full text-left px-4 py-3 text-[13px] text-white/70 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-3"
                                                >
                                                    <div className="w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                                                    </div>
                                                    <span className="font-medium">Upload Files</span>
                                                </button>
                                            </div>
                                        )}
                                        <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/5">
                                            <button onClick={() => setSelectedAgentId(null)} className={`px-3 py-1 rounded-full text-[13px] font-medium transition-colors ${!selectedAgentId ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/80'}`}>Chat</button>
                                            <div className="relative" ref={agentDropdownRef}>
                                                <button onClick={() => setShowAgentDropdown(!showAgentDropdown)} className={`px-3 py-1 rounded-full text-[13px] font-medium transition-colors flex items-center gap-1 ${selectedAgentId ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/80'}`}>
                                                    {selectedAgentId ? selectedAgent?.name : 'Agent'}
                                                    <ChevronDown size={12} className={selectedAgentId ? 'text-white' : 'text-white/40'} />
                                                </button>
                                                {showAgentDropdown && (
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-[#0a0a0c] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                                        {agents.map(a => (
                                                            <button key={a.id} onClick={() => { setSelectedAgentId(a.id); setShowAgentDropdown(false); }} className="w-full text-left px-4 py-2.5 hover:bg-white/5 text-[13px] text-white/80 flex items-center gap-2 border-b border-white/5">
                                                                <BotIcon size={14} className="text-indigo-400" />
                                                                <span className="truncate">{a.name}</span>
                                                            </button>
                                                        ))}
                                                        {agents.length === 0 && (
                                                            <div className="px-4 py-3 text-[12px] text-white/40 text-center">No agents found.</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-3">
                                        <div className="relative" ref={modelDropdownRef}>
                                            <div 
                                                className="hidden sm:flex items-center gap-1 text-white/40 hover:text-white/80 cursor-pointer transition-colors text-[13px] font-medium mr-2"
                                                onClick={() => setShowModelDropdown(!showModelDropdown)}
                                            >
                                                {selectedModel.name} <span className="text-white/30">{selectedModel.provider}</span>
                                            </div>
                                            {showModelDropdown && (
                                                <div className="absolute bottom-full right-0 mb-2 w-48 bg-[#0a0a0c] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                                                    {OPENROUTER_MODELS.map(m => (
                                                        <button
                                                            key={m.id}
                                                            onClick={() => { setSelectedModel(m); setShowModelDropdown(false); }}
                                                            className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-white/5 transition-colors ${selectedModel.id === m.id ? 'text-indigo-400 bg-indigo-500/10' : 'text-white/70'}`}
                                                        >
                                                            <div className="font-medium">{m.name}</div>
                                                            <div className="text-[11px] opacity-50">{m.provider}</div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <button 
                                            onClick={toggleRecording}
                                            className={`p-1.5 transition-colors ${isRecording ? 'text-red-400 bg-red-500/20 rounded-full animate-pulse' : 'text-white/40 hover:text-white/80'}`}
                                        >
                                            <Mic size={18} />
                                        </button>
                                        <button className="p-1.5 flex items-center gap-1 text-white/40 hover:text-white/80 transition-colors mr-2">
                                            <AudioLines size={18} />
                                            <ChevronDown size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleSend()}
                                            disabled={isLoading || !input.trim()}
                                            className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 transition-all flex items-center justify-center w-8 h-8 shadow-lg shadow-black/20"
                                        >
                                            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Suggestions */}
                        <div className="mt-8 flex flex-wrap gap-3 justify-center max-w-2xl opacity-70 hover:opacity-100 transition-opacity duration-500">
                            {SUGGESTED_PROMPTS.map((item, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(item.prompt)}
                                    className="px-4 py-2.5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-white/10 transition-all text-[13px] text-white/70 tracking-wide font-medium shadow-sm backdrop-blur-sm"
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className={`w-full flex-1 flex flex-col lg:flex-row transition-all duration-500 overflow-hidden ${activeWidget ? 'max-w-[100vw]' : 'max-w-5xl mx-auto'}`}>
                        {/* Left Panel: Study Board (Only visible if activeWidget) */}
                        {activeWidget && (
                            <div className="hidden lg:flex w-[60%] border-r border-white/5 p-6 h-full overflow-y-auto flex-col items-center justify-center animate-in slide-in-from-left duration-500 bg-transparent relative">
                                <button 
                                    onClick={() => setActiveWidget(null)}
                                    className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-full transition-colors z-10"
                                    title="Close Study Board"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                                {activeWidget.type === 'quiz' && (
                                    <InteractiveQuiz title={activeWidget.data.title} questions={activeWidget.data.questions} />
                                )}
                                {activeWidget.type === 'flashcards' && (
                                    <FlashcardDeck title={activeWidget.data.title} cards={activeWidget.data.cards} />
                                )}
                                {activeWidget.type === 'mermaid' && (
                                    <div className="w-full max-w-4xl max-h-full overflow-auto p-4 flex flex-col items-center justify-center">
                                        <h3 className="text-xl font-bold text-white mb-6">Visual Diagram</h3>
                                        <Mermaid chart={activeWidget.data.chart} />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Right Panel: Chat */}
                        <div className={`flex-1 h-full overflow-y-auto px-4 pt-10 pb-4 space-y-10 ${activeWidget ? 'lg:w-[40%]' : ''}`}>
                            {messages.map((msg) => (
                            <div key={msg.id} className={`flex gap-4 w-full animate-in fade-in slide-in-from-bottom-2 duration-500 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'assistant' && (
                                    <div className="shrink-0 mt-1">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-black/50 backdrop-blur-md border border-white/10 shadow-lg p-1.5">
                                            <img src={logo} alt="Focus AI" className="w-full h-full object-contain" />
                                        </div>
                                    </div>
                                )}
                                <div className={`flex flex-col min-w-0 max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    {msg.role === 'user' ? (
                                        <div className="bg-white/10 text-white/90 text-[16px] md:text-[17px] leading-relaxed px-5 py-3 rounded-3xl rounded-tr-sm shadow-sm flex flex-col gap-2">
                                            {msg.images && msg.images.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-1 justify-end">
                                                    {msg.images.map((img, idx) => (
                                                        <img key={idx} src={img} alt="Uploaded" className="h-20 w-auto rounded-lg border border-white/10" />
                                                    ))}
                                                </div>
                                            )}
                                            {msg.files && msg.files.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-1 justify-end">
                                                    {msg.files.map((f, idx) => (
                                                        <div key={idx} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[12px] text-white/60 flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                                            {f.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {msg.content && <div>{msg.content}</div>}
                                        </div>
                                    ) : (
                                        <>
                                            {msg.isSearching && (
                                                <div className="flex items-center gap-2 text-cyan-400 text-[13px] animate-pulse mb-3 bg-cyan-900/10 w-fit px-3 py-1.5 rounded-full border border-cyan-500/20">
                                                    <Globe size={14} className="animate-[spin_3s_linear_infinite]" />
                                                    Searching Google...
                                                </div>
                                            )}
                                            {msg.content === '' && !msg.isSearching && (
                                                <div className="text-[16px] font-semibold text-gray-400 drop-shadow-[0_0_12px_rgba(59,130,246,0.9)] animate-pulse tracking-wide flex items-center gap-2 pt-1 pb-1">
                                                    {loadingText}
                                                </div>
                                            )}
                                            {msg.content !== '' && (
                                                <div className="text-white/90 text-[16px] md:text-[17px] leading-relaxed prose prose-invert prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 max-w-none pt-1 prose-table:border prose-table:border-white/10 prose-th:bg-white/5 prose-th:p-2 prose-td:p-2 prose-td:border-t prose-td:border-white/10 prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl prose-pre:p-4">
                                                    <ReactMarkdown 
                                                        remarkPlugins={[remarkGfm, remarkMath]}
                                                        rehypePlugins={[rehypeKatex]}
                                                        components={{
                                                            code({node, inline, className, children, ...props}: any) {
                                                                const match = /language-(\w+)/.exec(className || '');
                                                                if (!inline && match && match[1] === 'chart') {
                                                                    try {
                                                                        const chartConfig = parseLLMJSON(String(children).replace(/\n$/, ''));
                                                                        return <InteractiveChart config={chartConfig} />;
                                                                    } catch (e: any) {
                                                                        return (
                                                                            <pre className="text-red-400 bg-red-400/10 p-4 rounded text-xs whitespace-pre-wrap">
                                                                                Error parsing chart data: {e?.message}
                                                                                {"\n\nRaw Data:\n"}
                                                                                {String(children)}
                                                                            </pre>
                                                                        );
                                                                    }
                                                                } else if (!inline && match && match[1] === 'quiz') {
                                                                    try {
                                                                        const quizConfig = parseLLMJSON(String(children).replace(/\n$/, ''));
                                                                        return (
                                                                            <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20 flex items-center justify-between my-4 font-sans">
                                                                                <div>
                                                                                    <h4 className="text-[15px] font-bold text-indigo-300 mb-0.5 tracking-tight">Interactive Quiz</h4>
                                                                                    <p className="text-[12px] text-indigo-400/70 line-clamp-1">{quizConfig.title}</p>
                                                                                </div>
                                                                                <button 
                                                                                    onClick={() => setActiveWidget({ type: 'quiz', data: quizConfig })}
                                                                                    className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-[13px] font-semibold text-white shadow-lg transition-colors flex items-center gap-2"
                                                                                >
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                                                                    Open Quiz
                                                                                </button>
                                                                            </div>
                                                                        );
                                                                    } catch (e) {
                                                                        return <pre className="text-red-400 bg-red-400/10 p-4 rounded text-xs font-sans">Error parsing quiz data</pre>;
                                                                    }
                                                                } else if (!inline && match && match[1] === 'flashcards') {
                                                                    try {
                                                                        const flashcardsConfig = parseLLMJSON(String(children).replace(/\n$/, ''));
                                                                        return (
                                                                            <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 flex items-center justify-between my-4 font-sans">
                                                                                <div>
                                                                                    <h4 className="text-[15px] font-bold text-emerald-300 mb-0.5 tracking-tight">Study Flashcards</h4>
                                                                                    <p className="text-[12px] text-emerald-400/70 line-clamp-1">{flashcardsConfig.title}</p>
                                                                                </div>
                                                                                <button 
                                                                                    onClick={() => setActiveWidget({ type: 'flashcards', data: flashcardsConfig })}
                                                                                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-[13px] font-semibold text-white shadow-lg transition-colors flex items-center gap-2"
                                                                                >
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                                                                    Study Now
                                                                                </button>
                                                                            </div>
                                                                        );
                                                                    } catch (e) {
                                                                        return <pre className="text-red-400 bg-red-400/10 p-4 rounded text-xs">Error parsing flashcards data</pre>;
                                                                    }
                                                                } else if (!inline && match && match[1] === 'mermaid') {
                                                                    const chartContent = String(children).replace(/\n$/, '');
                                                                    return (
                                                                        <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 flex items-center justify-between my-4 font-sans">
                                                                            <div>
                                                                                <h4 className="text-[15px] font-bold text-blue-300 mb-0.5 tracking-tight">Visual Mind Map</h4>
                                                                                <p className="text-[12px] text-blue-400/70 line-clamp-1">Generated diagram</p>
                                                                            </div>
                                                                            <button 
                                                                                onClick={() => setActiveWidget({ type: 'mermaid', data: { chart: chartContent } })}
                                                                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-[13px] font-semibold text-white shadow-lg transition-colors flex items-center gap-2"
                                                                            >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>
                                                                                Open Map
                                                                            </button>
                                                                        </div>
                                                                    );
                                                                }
                                                                return <code className={className} {...props}>{children}</code>;
                                                            }
                                                        }}
                                                    >
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                </div>
                                            )}
                                            {/* Action Icons (Hidden during stream for the last message) */}
                                            {!(msg.id === messages[messages.length - 1]?.id && (isLoading || isStreaming)) && msg.content !== '' && (
                                                <div className="flex items-center gap-2 mt-4 text-white/30">
                                                    <div className="flex items-center gap-1 text-[11px] font-medium mr-2">
                                                        <Clock size={12} />
                                                        <span>2.4s</span>
                                                    </div>
                                                    <div className="flex items-center gap-0.5">
                                                        <button className="p-1.5 hover:text-white/80 transition-colors rounded-md hover:bg-white/5"><ThumbsUp size={14} /></button>
                                                        <button className="p-1.5 hover:text-white/80 transition-colors rounded-md hover:bg-white/5"><ThumbsDown size={14} /></button>
                                                    </div>
                                                    <button className="p-1.5 hover:text-white/80 transition-colors rounded-md hover:bg-white/5" title="Regenerate"><RefreshCw size={14} /></button>
                                                    <button className="p-1.5 hover:text-white/80 transition-colors rounded-md hover:bg-white/5" title="Copy"><Copy size={14} /></button>
                                                    <button 
                                                        className="p-1.5 hover:text-indigo-400 transition-colors rounded-md hover:bg-white/5" 
                                                        title="Save to Notes"
                                                        onClick={() => {
                                                            dispatch(addNote({
                                                                title: 'AI Insight',
                                                                content: msg.content,
                                                                referenceContext: selectedAgent?.name || 'Chat AI'
                                                            }));
                                                        }}
                                                    >
                                                        <Edit3 size={14} />
                                                    </button>
                                                    <button className="p-1.5 hover:text-white/80 transition-colors rounded-md hover:bg-white/5" title="Report"><Flag size={14} /></button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                                
                                {/* Sources Lateral Panel */}
                                {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                                    <div className="hidden lg:flex flex-col gap-2 ml-4 w-56 shrink-0 pt-1 border-l border-white/5 pl-4 animate-in fade-in slide-in-from-right-4 duration-500">
                                        <div className="text-[10px] uppercase tracking-wider text-white/30 font-semibold mb-1 flex items-center gap-1.5">
                                            <Globe size={10} /> Reference Links
                                        </div>
                                        {msg.sources.map((src, idx) => (
                                            <a 
                                                key={idx} 
                                                href={src.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-start gap-2 p-2.5 bg-white/5 border border-white/5 hover:bg-white/10 transition-all rounded-lg text-[11px] text-white/70 group shadow-sm hover:shadow-md"
                                            >
                                                <div className="mt-0.5 opacity-40 group-hover:opacity-100 transition-opacity group-hover:text-cyan-400">
                                                    <Globe size={12} />
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="line-clamp-2 leading-snug font-medium text-white/90 group-hover:text-cyan-400 transition-colors">{src.title}</span>
                                                    <span className="text-[9px] text-white/30 truncate max-w-[130px]">{src.source}</span>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        <div ref={endRef} />
                        </div>
                    </div>
                )}
            </div>

            {/* Fixed Input Area (Only show when messages exist) */}
            {!isInitial && (
                <div className="w-full flex justify-center p-4 pb-6 bg-transparent z-20 shrink-0">
                    <div className="w-full max-w-5xl relative">
                        <div className="animated-border-box bg-white/5 backdrop-blur-3xl rounded-2xl p-3 flex flex-col shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all focus-within:shadow-[0_0_30px_rgba(59,130,246,0.25)] focus-within:bg-white/10">
                            {/* Attachments Preview */}
                            {attachments.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {attachments.map((att, idx) => (
                                        <div key={idx} className="relative group">
                                            {att.type === 'image' ? (
                                                <img src={att.base64} alt={att.file.name} className="h-16 w-16 object-cover rounded-lg border border-white/10" />
                                            ) : (
                                                <div className="h-16 w-16 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center text-[10px] text-white/50 text-center p-1 break-all">
                                                    {att.file.name}
                                                </div>
                                            )}
                                            <button 
                                                onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                            >
                                                <Plus size={12} className="rotate-45" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {/* Mode / Agent Banner */}
                            {selectedMode !== 'normal' && (
                                <div className="flex items-center gap-2 mb-2 px-1">
                                    <div className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 border ${
                                        selectedMode === 'study' 
                                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                                            : selectedMode === 'research'
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    }`}>
                                        {selectedMode === 'study' ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                                        ) : selectedMode === 'research' ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M12 12v9"></path><path d="m8 17 4 4 4-4"></path></svg>
                                        )}
                                        {selectedMode === 'study' ? 'Study Mode' : selectedMode === 'research' ? 'Research Mode' : 'Math Mode'}
                                        <button 
                                            onClick={() => setSelectedMode('normal')}
                                            className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                    </div>
                                </div>
                            )}
                            {selectedAgent && selectedMode === 'normal' && (
                                <div className="flex items-center gap-2 mb-2 px-1">
                                    <div className="px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                                        <BotIcon size={12} />
                                        {selectedAgent.name}
                                        <button 
                                            onClick={() => setSelectedAgentId(null)}
                                            className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                </div>
                            )}
                            <div className="relative w-full">
                                <textarea
                                    ref={textareaRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask anything..."
                                    className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-white/90 text-[15px] resize-none placeholder-white/30 py-1 max-h-[200px] leading-relaxed"
                                    rows={1}
                                    disabled={isLoading}
                                />
                                {isRecording && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-md rounded-md border border-white/10 shadow-lg overflow-hidden">
                                        <AudioVisualizer stream={audioStream} isRecording={isRecording} />
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <div className="flex items-center gap-2 relative" ref={plusDropdownRef}>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleFileSelect} 
                                        className="hidden" 
                                        multiple 
                                        accept="image/*,.txt,.md,.csv" 
                                    />
                                    <button 
                                        onClick={() => setShowPlusDropdown(!showPlusDropdown)}
                                        className="p-1.5 rounded-full text-white/40 hover:bg-white/10 hover:text-white/80 transition-colors relative"
                                    >
                                        <Plus size={18} />
                                    </button>
                                    
                                    {showPlusDropdown && (
                                        <div className="absolute bottom-full left-0 mb-2 w-48 bg-[#0a0a0c] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                            <button
                                                onClick={() => { setSelectedMode('study'); setShowPlusDropdown(false); }}
                                                className="w-full text-left px-4 py-3 text-[13px] text-white/70 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-3 border-b border-white/5"
                                            >
                                                <div className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                                                </div>
                                                <span className="font-medium">Study Mode</span>
                                            </button>
                                            <button
                                                onClick={() => { setSelectedMode('research'); setShowPlusDropdown(false); }}
                                                className="w-full text-left px-4 py-3 text-[13px] text-white/70 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-3 border-b border-white/5"
                                            >
                                                <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                                                </div>
                                                <span className="font-medium">Research Mode</span>
                                            </button>
                                            <button
                                                onClick={() => { setSelectedMode('math'); setShowPlusDropdown(false); }}
                                                className="w-full text-left px-4 py-3 text-[13px] text-white/70 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-3 border-b border-white/5"
                                            >
                                                <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M12 12v9"></path><path d="m8 17 4 4 4-4"></path></svg>
                                                </div>
                                                <span className="font-medium">Math Mode</span>
                                            </button>
                                            
                                            <button
                                                onClick={() => { setShowPlusDropdown(false); fileInputRef.current?.click(); }}
                                                className="w-full text-left px-4 py-3 text-[13px] text-white/70 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-3"
                                            >
                                                <div className="w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                                                </div>
                                                <span className="font-medium">Upload Files</span>
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/5">
                                        <button onClick={() => setSelectedAgentId(null)} className={`px-3 py-1 rounded-full text-[12px] font-medium transition-colors ${!selectedAgentId ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/80'}`}>Chat</button>
                                        <div className="relative" ref={agentDropdownRef}>
                                            <button onClick={() => setShowAgentDropdown(!showAgentDropdown)} className={`px-3 py-1 rounded-full text-[12px] font-medium transition-colors flex items-center gap-1 ${selectedAgentId ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/80'}`}>
                                                {selectedAgentId ? selectedAgent?.name : 'Agent'}
                                                <ChevronDown size={12} className={selectedAgentId ? 'text-white' : 'text-white/40'} />
                                            </button>
                                            {showAgentDropdown && (
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-[#0a0a0c] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                                    {agents.map(a => (
                                                        <button key={a.id} onClick={() => { setSelectedAgentId(a.id); setShowAgentDropdown(false); }} className="w-full text-left px-4 py-2.5 hover:bg-white/5 text-[13px] text-white/80 flex items-center gap-2 border-b border-white/5">
                                                            <BotIcon size={14} className="text-indigo-400" />
                                                            <span className="truncate">{a.name}</span>
                                                        </button>
                                                    ))}
                                                    {agents.length === 0 && (
                                                        <div className="px-4 py-3 text-[12px] text-white/40 text-center">No agents found.</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <div className="relative" ref={modelDropdownRef}>
                                        <div 
                                            className="hidden sm:flex items-center gap-1 text-white/40 hover:text-white/80 cursor-pointer transition-colors text-[12px] font-medium mr-1"
                                            onClick={() => setShowModelDropdown(!showModelDropdown)}
                                        >
                                            {selectedModel.name} <span className="text-white/30">{selectedModel.provider}</span>
                                        </div>
                                        {showModelDropdown && (
                                            <div className="absolute bottom-full right-0 mb-2 w-48 bg-[#0a0a0c] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                                                {OPENROUTER_MODELS.map(m => (
                                                    <button
                                                        key={m.id}
                                                        onClick={() => { setSelectedModel(m); setShowModelDropdown(false); }}
                                                        className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-white/5 transition-colors ${selectedModel.id === m.id ? 'text-indigo-400 bg-indigo-500/10' : 'text-white/70'}`}
                                                    >
                                                        <div className="font-medium">{m.name}</div>
                                                        <div className="text-[11px] opacity-50">{m.provider}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <button 
                                        onClick={toggleRecording}
                                        className={`p-1.5 transition-colors ${isRecording ? 'text-red-400 bg-red-500/20 rounded-full animate-pulse' : 'text-white/40 hover:text-white/80'}`}
                                    >
                                        <Mic size={16} />
                                    </button>
                                    <button className="p-1.5 flex items-center gap-1 text-white/40 hover:text-white/80 transition-colors mr-1">
                                        <AudioLines size={16} />
                                        <ChevronDown size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleSend()}
                                        disabled={isLoading || !input.trim()}
                                        className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 transition-all flex items-center justify-center w-7 h-7 shadow-lg shadow-black/20"
                                    >
                                        {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="text-center mt-3 text-[11px] text-white/30 font-medium tracking-wide">
                            Focus AI can make mistakes. Consider verifying important information.
                        </div>
                    </div>
                </div>
            )}
            {/* Floating Selection Toolbar */}
            {selection && (
                <div 
                    className="fixed z-[100] flex items-center gap-1 bg-[#1a1a24]/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-xl p-1 animate-in fade-in zoom-in duration-200"
                    style={{ 
                        left: `${selection.x}px`, 
                        top: `${selection.y}px`,
                        transform: 'translate(-50%, -100%)'
                    }}
                >
                    <button 
                        onClick={() => {
                            navigator.clipboard.writeText(selection.text);
                            setSelection(null);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-lg text-white/90 text-[13px] font-medium transition-colors"
                    >
                        <Copy size={14} /> Copy
                    </button>
                    <div className="w-px h-4 bg-white/20 mx-1" />
                    <button 
                        onClick={() => {
                            dispatch(addNote({
                                title: 'Saved Highlight',
                                content: `"${selection.text}"`,
                                referenceContext: selectedAgent?.name || 'Chat AI'
                            }));
                            setSelection(null);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-indigo-500/20 text-indigo-400 text-[13px] font-medium rounded-lg transition-colors"
                    >
                        <Edit3 size={14} /> Save to Notes
                    </button>
                </div>
            )}
        </div>
    );
};
