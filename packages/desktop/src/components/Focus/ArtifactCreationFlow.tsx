import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Book, StickyNote, X, CheckCircle2,
    Hash, User, BookOpen
} from 'lucide-react';
import { useCreateArtifactMutation, Area } from '../../features/api/apiSlice';

interface ArtifactCreationFlowProps {
    type: 'books' | 'notes';
    lifeAreaId: string;
    onClose: () => void;
    areas: Area[];
}

export function ArtifactCreationFlow({ type, lifeAreaId, onClose, areas }: ArtifactCreationFlowProps) {
    const [createArtifact] = useCreateArtifactMutation();
    const area = areas.find(a => a.id === lifeAreaId);

    const [bookForm, setBookForm] = useState({
        title: '',
        author: '',
        total_pages: 0,
        status: 'reading',
        life_area_id: lifeAreaId
    });

    const [noteForm, setNoteForm] = useState({
        title: '',
        content: '',
        tags: '',
        life_area_id: lifeAreaId
    });

    const handleSubmit = async () => {
        try {
            const body = type === 'books' ? bookForm : noteForm;
            await createArtifact({ type, body }).unwrap();
            onClose();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 backdrop-blur-sm bg-black/20"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-xl glass-panel p-10 rounded-[3.5rem] border border-white/10 bg-[#0c0c0e] shadow-2xl overflow-hidden"
            >
                <div className="space-y-8">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <div className={`inline-flex p-3 rounded-2xl mb-2 ${type === 'books' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                {type === 'books' ? <Book size={24} /> : <StickyNote size={24} />}
                            </div>
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase">
                                {type === 'books' ? 'Catalog Book' : 'Capture Note'}
                            </h2>
                            <p className="text-gray-500 text-[10px] font-black tracking-[0.3em] uppercase italic">
                                Knowledge Unit for {area?.name || 'General'}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {type === 'books' ? (
                            <>
                                <div className="space-y-3">
                                    <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-2">
                                        <BookOpen size={12} className="text-amber-500" />
                                        Book Title
                                    </label>
                                    <input
                                        value={bookForm.title}
                                        onChange={e => setBookForm({ ...bookForm, title: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-black text-xl focus:ring-2 focus:ring-amber-500/50 outline-none transition-all placeholder:text-gray-800"
                                        placeholder="e.g. ATOMIC HABITS"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-2">
                                            <User size={12} className="text-amber-500" />
                                            Author
                                        </label>
                                        <input
                                            value={bookForm.author}
                                            onChange={e => setBookForm({ ...bookForm, author: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none"
                                            placeholder="James Clear"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-2">
                                            <Hash size={12} className="text-amber-500" />
                                            Total Pages
                                        </label>
                                        <input
                                            type="number"
                                            value={bookForm.total_pages}
                                            onChange={e => setBookForm({ ...bookForm, total_pages: parseInt(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none"
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-3">
                                    <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-2">
                                        <StickyNote size={12} className="text-rose-500" />
                                        Note Title
                                    </label>
                                    <input
                                        value={noteForm.title}
                                        onChange={e => setNoteForm({ ...noteForm, title: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-black text-xl focus:ring-2 focus:ring-rose-500/50 outline-none transition-all placeholder:text-gray-800"
                                        placeholder="e.g. CORE VALUES"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-2">
                                        <Hash size={12} className="text-rose-500" />
                                        Tags (Comma separated)
                                    </label>
                                    <input
                                        value={noteForm.tags}
                                        onChange={e => setNoteForm({ ...noteForm, tags: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none"
                                        placeholder="manifesto, philosophy, q1"
                                    />
                                </div>
                                <textarea
                                    value={noteForm.content}
                                    onChange={e => setNoteForm({ ...noteForm, content: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-sm h-32 resize-none focus:ring-2 focus:ring-rose-500/50 outline-none"
                                    placeholder="Start writing..."
                                />
                            </>
                        )}
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={onClose}
                            className="px-8 bg-white/5 text-gray-400 font-black uppercase tracking-widest py-5 rounded-3xl hover:bg-white/10 transition-all text-xs"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={type === 'books' ? !bookForm.title : !noteForm.title}
                            className={`flex-1 text-white font-black uppercase tracking-[0.2em] py-5 rounded-3xl shadow-xl transition-all text-xs flex items-center justify-center gap-2 active:scale-95 disabled:opacity-30 ${type === 'books' ? 'bg-gradient-to-r from-amber-600 to-orange-700 shadow-amber-900/40' : 'bg-gradient-to-r from-rose-600 to-pink-700 shadow-rose-900/40'
                                }`}
                        >
                            {type === 'books' ? 'Catalog Book' : 'Capture Note'}
                            <CheckCircle2 size={16} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
