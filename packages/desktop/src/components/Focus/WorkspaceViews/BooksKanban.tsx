import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Plus } from 'lucide-react';
import { ResourceUploadModal } from '../Resources/ResourceUploadModal';

interface BooksKanbanProps {
    books: any[];
    areaId: string;
    projects: any[];
}

const STATUSES = [
    { id: 'want_to_read', label: 'Up Next', color: 'text-gray-400', bg: 'bg-gray-400/10' },
    { id: 'reading', label: 'Currently Digesting', color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { id: 'completed', label: 'Fully Synthesized', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
];

export function BooksKanban({ books, areaId, projects }: BooksKanbanProps) {
    const [showUploadModal, setShowUploadModal] = useState(false);
    return (
        <div className="flex gap-8 min-h-full pb-8 overflow-x-auto custom-scrollbar">
            {STATUSES.map(status => {
                const statusBooks = books.filter(b => b.status === status.id || (status.id === 'want_to_read' && !b.status));

                return (
                    <div key={status.id} className="w-80 flex-shrink-0 flex flex-col gap-6">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <span className={`w-2 h-2 rounded-full ${status.bg.replace('/10', '')}`} />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{status.label}</h3>
                                <span className="text-[10px] font-black text-gray-700">{statusBooks.length}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {statusBooks.map(book => (
                                <BookCard key={book.id} book={book} />
                            ))}

                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="w-full py-4 rounded-[2rem] border-2 border-dashed border-white/5 hover:border-white/10 hover:bg-white/[0.02] text-[10px] font-black text-gray-700 hover:text-gray-500 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                                <Plus size={14} /> Add Title
                            </button>
                        </div>
                    </div>
                );
            })}

            <AnimatePresence>
                {showUploadModal && (
                    <ResourceUploadModal
                        onClose={() => setShowUploadModal(false)}
                        lifeAreaId={areaId}
                        projects={projects}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function BookCard({ book }: { book: any }) {
    const progress = book.total_pages ? (book.pages_read / book.total_pages) : 0;

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="group glass-panel rounded-[2.5rem] border border-white/5 bg-white/[0.03] overflow-hidden shadow-2xl cursor-pointer"
        >
            {/* Mock Cover Placeholder */}
            <div className="h-40 bg-white/[0.02] flex items-center justify-center border-b border-white/5 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <Book size={32} className="text-white/10 group-hover:text-white/20 transition-colors" />
                {book.cover_url && <img src={book.cover_url} className="absolute inset-0 w-full h-full object-cover" alt="" />}
            </div>

            <div className="p-6 space-y-4">
                <div className="space-y-1">
                    <h4 className="text-sm font-black text-white leading-tight line-clamp-2 uppercase italic">{book.title}</h4>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{book.author || 'Unknown Author'}</p>
                </div>

                {book.status === 'reading' && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-[8px] font-black text-white/40 uppercase tracking-widest">
                            <span>Knowledge Depth</span>
                            <span>{Math.round(progress * 100)}%</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress * 100}%` }}
                                className="h-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                            />
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
