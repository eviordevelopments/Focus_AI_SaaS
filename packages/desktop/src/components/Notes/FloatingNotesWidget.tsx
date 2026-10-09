import React, { useState } from 'react';
import { PenTool, X, Save, Trash2, Edit3, MessageSquare, Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { toggleNotesWidget, addNote, updateNote, deleteNote, Note } from '../../features/notes/notesSlice';

export const FloatingNotesWidget: React.FC = () => {
    const dispatch = useDispatch();
    const { isWidgetOpen, notes } = useSelector((state: RootState) => state.notes);
    const [draftTitle, setDraftTitle] = useState('');
    const [draftContent, setDraftContent] = useState('');
    const [selectedProject, setSelectedProject] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [size, setSize] = useState({ width: 384, height: 500 }); // Default size

    const handleResizeStart = (e: React.MouseEvent) => {
        e.preventDefault();
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = size.width;
        const startHeight = size.height;

        const onMouseMove = (e: MouseEvent) => {
            // Dragging left/up increases size because anchor is bottom-right
            const deltaX = startX - e.clientX;
            const deltaY = startY - e.clientY;
            
            setSize({
                width: Math.min(Math.max(320, startWidth + deltaX), window.innerWidth * 0.8),
                height: Math.min(Math.max(300, startHeight + deltaY), window.innerHeight * 0.8)
            });
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const handleSaveNote = () => {
        if (!draftContent.trim() && !draftTitle.trim()) return;

        if (editingId) {
            const existing = notes.find(n => n.id === editingId);
            if (existing) {
                dispatch(updateNote({
                    ...existing,
                    title: draftTitle,
                    content: draftContent,
                    projectId: selectedProject
                }));
            }
            setEditingId(null);
        } else {
            dispatch(addNote({
                title: draftTitle || 'Untitled Note',
                content: draftContent,
                projectId: selectedProject,
            }));
        }
        setDraftTitle('');
        setDraftContent('');
        setSelectedProject('');
    };

    const handleEdit = (note: Note) => {
        setEditingId(note.id);
        setDraftTitle(note.title);
        setDraftContent(note.content);
        setSelectedProject(note.projectId || '');
    };

    const handleCancel = () => {
        setEditingId(null);
        setDraftTitle('');
        setDraftContent('');
        setSelectedProject('');
    };

    const projects = ['Focus AI SaaS', 'Thesis 2026', 'Personal Life', 'Learning'];

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
            
            {/* Widget Panel */}
            {isWidgetOpen && (
                <div 
                    className="mb-4 flex flex-col bg-[#0a0a0c]/80 backdrop-blur-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300 origin-bottom-right relative" 
                    style={{ width: size.width, height: size.height }}
                >
                    {/* Top Left Resize Handle */}
                    <div 
                        className="absolute top-0 left-0 w-8 h-8 cursor-nwse-resize z-50 flex items-start justify-start p-2 group"
                        onMouseDown={handleResizeStart}
                    >
                        <div className="w-2.5 h-2.5 border-t-2 border-l-2 border-white/40 rounded-tl-sm group-hover:border-white/80 transition-colors" />
                    </div>

                    {/* Header */}
                    <div className="flex items-center justify-between p-4 shrink-0">
                        <div className="flex items-center gap-2">
                            <PenTool size={18} className="text-indigo-400" />
                            <h3 className="font-semibold text-white">Quick Notes</h3>
                        </div>
                        <button 
                            onClick={() => dispatch(toggleNotesWidget())}
                            className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
                        
                        {/* Editor */}
                        <div className="flex flex-col gap-3 bg-white/5 border border-white/10 rounded-xl p-3 flex-1 min-h-[150px]">
                            <input 
                                type="text"
                                value={draftTitle}
                                onChange={(e) => setDraftTitle(e.target.value)}
                                placeholder="Note title..."
                                className="w-full bg-transparent border-none text-white font-bold focus:outline-none focus:ring-0 placeholder-white/30 text-lg"
                            />
                            <textarea 
                                value={draftContent}
                                onChange={(e) => setDraftContent(e.target.value)}
                                placeholder="Write something..."
                                className="w-full bg-transparent border-none text-white/80 focus:outline-none focus:ring-0 placeholder-white/30 text-sm resize-none flex-1"
                            />
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                                <select 
                                    value={selectedProject}
                                    onChange={(e) => setSelectedProject(e.target.value)}
                                    className="bg-black/40 border border-white/10 text-white/70 text-xs rounded-lg px-2 py-1 focus:outline-none"
                                >
                                    <option value="">No Project</option>
                                    {projects.map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                                <div className="flex gap-2">
                                    {editingId && (
                                        <button 
                                            onClick={handleCancel}
                                            className="px-3 py-1.5 text-xs font-medium text-white/60 hover:text-white transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    <button 
                                        onClick={handleSaveNote}
                                        disabled={!draftContent.trim() && !draftTitle.trim()}
                                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                                    >
                                        <Save size={14} />
                                        {editingId ? 'Update' : 'Save'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex flex-col gap-3 mt-2">
                            <div className="text-xs font-semibold text-white/40 uppercase tracking-wider">Recent Notes</div>
                            {notes.length === 0 ? (
                                <div className="text-center py-6 text-white/30 text-sm italic">
                                    No notes yet.
                                </div>
                            ) : (
                                notes.map(note => (
                                    <div key={note.id} className="group flex flex-col gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl transition-all">
                                        <div className="flex items-start justify-between">
                                            <h4 className="text-sm font-semibold text-white/90 truncate pr-2">{note.title}</h4>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleEdit(note)}
                                                    className="p-1 text-white/40 hover:text-white hover:bg-white/10 rounded"
                                                >
                                                    <Edit3 size={12} />
                                                </button>
                                                <button 
                                                    onClick={() => dispatch(deleteNote(note.id))}
                                                    className="p-1 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-xs text-white/60 line-clamp-3">{note.content}</p>
                                        
                                        {(note.projectId || note.referenceContext) && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {note.projectId && (
                                                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-[10px] border border-indigo-500/20">
                                                        {note.projectId}
                                                    </span>
                                                )}
                                                {note.referenceContext && (
                                                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/20 flex items-center gap-1">
                                                        <MessageSquare size={10} /> Ref: {note.referenceContext}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => dispatch(toggleNotesWidget())}
                className={`p-4 rounded-full shadow-2xl border transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95 ${
                    isWidgetOpen 
                        ? 'bg-white/10 backdrop-blur-xl border-white/20 text-white'
                        : 'bg-white/5 backdrop-blur-xl border-white/10 text-white/80 hover:bg-white/10 hover:text-white shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
                }`}
            >
                {isWidgetOpen ? <X size={24} /> : <PenTool size={24} />}
            </button>
        </div>
    );
};
