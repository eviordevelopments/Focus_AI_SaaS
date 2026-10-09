import React, { useState } from 'react';
import { useGetReferencesQuery, useCreateReferenceMutation, useUpdateReferenceMutation, useDeleteReferenceMutation, useGetProjectsQuery, useGetAreasQuery, Area } from '../../features/api/apiSlice';
import GlassCard from '../ui/GlassCard';
import GlassModal from '../ui/GlassModal';
import { Search, Plus, Link as LinkIcon, FileText, File, MoreVertical, ExternalLink, Folder, BookOpen, GraduationCap, Briefcase, Heart, Palette, X, Save } from 'lucide-react';

const getAreaIcon = (name: string) => {
    switch (name?.toLowerCase()) {
        case 'academics': return <GraduationCap size={18} />;
        case 'entrepreneurship': return <Briefcase size={18} />;
        case 'health': return <Heart size={18} />;
        case 'creative': return <Palette size={18} />;
        default: return <BookOpen size={18} />;
    }
};

export const ReferencesView = () => {
    const [selectedArea, setSelectedArea] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingReference, setEditingReference] = useState<any>(null);
    const [deletingReference, setDeletingReference] = useState<any>(null);

    const { data: areas = [] } = useGetAreasQuery();
    const { data: references = [], isLoading } = useGetReferencesQuery({ lifeAreaId: selectedArea === 'all' ? undefined : selectedArea });
    const { data: projects = [] } = useGetProjectsQuery({});
    const [createReference] = useCreateReferenceMutation();
    const [updateReference] = useUpdateReferenceMutation();
    const [deleteReference] = useDeleteReferenceMutation();

    const filteredReferences = references.filter(ref =>
        ref.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ref.tags && JSON.parse(ref.tags).some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase())))
    );

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const url = e.dataTransfer.getData('text/uri-list');
        const text = e.dataTransfer.getData('text/plain');

        if (url || text) {
            await createReference({
                title: text.split('\n')[0].substring(0, 50) || 'Dropped Resource',
                type: url ? 'link' : 'note',
                url: url || null,
                content: text || null,
                life_area_id: selectedArea === 'all' ? null : selectedArea,
                tags: ['dropped']
            });
        }
    };

    const confirmDelete = async () => {
        if (deletingReference) {
            await deleteReference(deletingReference.id);
            setDeletingReference(null);
        }
    };

    return (
        <div
            className="space-y-8 animate-in fade-in duration-700"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter">Resources</h1>
                    <p className="text-white/50 mt-2 text-lg">Personal knowledge base & resource library</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white/90 transition-colors z-10 pointer-events-none" size={18} />
                        <input
                            type="text"
                            placeholder="Find resources by name or tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-4 w-64 md:w-80 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20 backdrop-blur-xl transition-all"
                        />
                    </div>
                    <button
                        onClick={() => {
                            setEditingReference(null);
                            setIsAddModalOpen(true);
                        }}
                        className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white shadow-xl backdrop-blur-md transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus size={24} />
                    </button>
                </div>
            </header>

            {/* Area Navigation */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
                <AreaTab active={selectedArea === 'all'} label="Global Library" icon={<BookOpen size={18} />} onClick={() => setSelectedArea('all')} />
                {areas.map((area: Area) => (
                    <AreaTab
                        key={area.id}
                        active={selectedArea === area.id}
                        label={area.name}
                        icon={getAreaIcon(area.name)}
                        onClick={() => setSelectedArea(area.id)}
                    />
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-12 gap-8">
                {/* References List */}
                <div className="col-span-12 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {isLoading ? (
                            <div className="col-span-full py-20 text-center text-gray-500 uppercase tracking-widest text-xs">Accessing index...</div>
                        ) : filteredReferences.length === 0 ? (
                            <div className="col-span-full py-20 text-center">
                                <BookOpen size={48} className="mx-auto text-gray-800 mb-4" />
                                <div className="text-gray-500 uppercase tracking-widest text-xs">No references found in this sector</div>
                            </div>
                        ) : (
                            filteredReferences.map((ref: any) => (
                                <ReferenceCard 
                                    key={ref.id} 
                                    reference={ref} 
                                    onEdit={() => {
                                        setEditingReference(ref);
                                        setIsAddModalOpen(true);
                                    }}
                                    onDelete={() => setDeletingReference(ref)}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {isAddModalOpen && (
                <AddReferenceModal
                    initialData={editingReference}
                    onClose={() => {
                        setIsAddModalOpen(false);
                        setEditingReference(null);
                    }}
                    onSave={async (data: any) => {
                        if (editingReference) {
                            await updateReference({ id: editingReference.id, updates: { ...data, life_area_id: selectedArea === 'all' ? null : selectedArea } });
                        } else {
                            await createReference({ ...data, life_area_id: selectedArea === 'all' ? null : selectedArea });
                        }
                        setIsAddModalOpen(false);
                        setEditingReference(null);
                    }}
                />
            )}

            {deletingReference && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="relative w-full max-w-sm bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-2">Delete Resource</h3>
                        <p className="text-sm text-white/60 mb-6">Are you sure you want to delete <span className="text-white font-semibold">"{deletingReference.title}"</span>? This action cannot be undone.</p>
                        
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setDeletingReference(null)}
                                className="px-5 py-2 rounded-full border border-white/10 text-white hover:bg-white/5 transition-colors text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-5 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors text-sm font-medium"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const AddReferenceModal = ({ onClose, onSave, initialData }: any) => {
    const [formData, setFormData] = useState(initialData || { title: '', type: 'link', url: '', description: '', tags: [] });

    return (
        <GlassModal isOpen={true} maxWidth="lg" padding="p-8">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold text-white tracking-tighter">Add Resource</h3>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Asset Title</label>
                        <input
                            autoFocus
                            type="text"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-all"
                            placeholder="Resource name..."
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {['link', 'file', 'note'].map(t => (
                            <button
                                key={t}
                                onClick={() => setFormData({ ...formData, type: t })}
                                className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${formData.type === t ? 'bg-white/20 border-white/30 text-white shadow-lg' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    {formData.type === 'link' && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/50">URL / Destination</label>
                            <input
                                type="text"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-all"
                                placeholder="https://..."
                                value={formData.url}
                                onChange={e => setFormData({ ...formData, url: e.target.value })}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Brief Intelligence</label>
                        <textarea
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder-white/30 h-24 resize-none focus:outline-none focus:border-white/20 transition-all custom-scrollbar"
                            placeholder="Index description..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-8">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-full border border-white/10 text-white hover:bg-white/5 transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onSave(formData)}
                            className="px-6 py-2.5 rounded-full bg-gray-400 hover:bg-gray-300 text-black transition-colors text-sm font-medium"
                        >
                            Save
                        </button>
                    </div>
                </div>

        </GlassModal>
    );
};

const AreaTab = ({ active, label, icon, onClick, color = 'text-blue-400' }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 px-6 py-4 rounded-3xl border transition-all duration-500 whitespace-nowrap ${active ? 'bg-white/10 border-white/20 text-white shadow-xl backdrop-blur-2xl' : 'bg-white/[0.02] border-white/5 text-gray-500 hover:bg-white/5 hover:text-white'}`}
    >
        <span className={`${active ? color : 'text-gray-500'}`}>{icon}</span>
        <span className="text-xs font-black uppercase tracking-widest">{label}</span>
    </button>
);

const ReferenceCard = ({ reference, onEdit, onDelete }: any) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const tags = reference.tags && typeof reference.tags === 'string' ? JSON.parse(reference.tags) : reference.tags || [];

    return (
        <GlassCard padding="p-6" className="group hover:-translate-y-2 transition-all duration-500 border-white/5 hover:border-blue-500/30 relative">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-500 
                    ${reference.type === 'link' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white' :
                        reference.type === 'file' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white' :
                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white'}`}>
                    {reference.type === 'link' ? <LinkIcon size={18} /> : reference.type === 'file' ? <FileText size={18} /> : <File size={18} />}
                </div>
                
                <div className="relative">
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)} 
                        className="p-1 rounded-md text-white/50 hover:bg-white/10 hover:text-white transition-all"
                    >
                        <MoreVertical size={16} />
                    </button>
                    
                    {isMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                            <div className="absolute right-0 mt-2 w-32 bg-[#1a1a24]/90 backdrop-blur-3xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <button 
                                    onClick={() => { setIsMenuOpen(false); onEdit?.(); }} 
                                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                                >
                                    Edit
                                </button>
                                <button 
                                    onClick={() => { setIsMenuOpen(false); onDelete?.(); }} 
                                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="space-y-1 flex-1">
                <h4 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-blue-400 transition-colors uppercase truncate">{reference.title}</h4>
                <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{reference.description || 'No description provided for this resource.'}</p>
            </div>

            <div className="mt-8 flex flex-wrap gap-1.5 mb-6">
                {tags.map((tag: string) => (
                    <span key={tag} className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-600 bg-white/5 px-2 py-0.5 rounded border border-white/5">#{tag}</span>
                ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{new Date(reference.created_at).toLocaleDateString()}</span>
                <a
                    href={reference.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-[9px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors"
                >
                    Access Link
                    <ExternalLink size={10} />
                </a>
            </div>
        </GlassCard>
    );
}
