import React, { useState } from 'react';
import { useGetReferencesQuery, useCreateReferenceMutation, useGetProjectsQuery, useGetAreasQuery, Area } from '../../features/api/apiSlice';
import GlassCard from '../ui/GlassCard';
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

    const { data: areas = [] } = useGetAreasQuery();
    const { data: references = [], isLoading } = useGetReferencesQuery({ lifeAreaId: selectedArea === 'all' ? undefined : selectedArea });
    const { data: projects = [] } = useGetProjectsQuery({});
    const [createReference] = useCreateReferenceMutation();

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

    return (
        <div
            className="space-y-8 animate-in fade-in duration-700"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">References</h1>
                    <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Personal knowledge base & resource library</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Find resources by name or tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 w-64 md:w-80 text-sm focus:outline-none focus:border-blue-500/50 backdrop-blur-xl transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="h-12 w-12 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 transition-all active:scale-95"
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
                <div className="col-span-12 xl:col-span-9 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                        {isLoading ? (
                            <div className="col-span-full py-20 text-center text-gray-500 uppercase tracking-widest text-xs">Accessing index...</div>
                        ) : filteredReferences.length === 0 ? (
                            <div className="col-span-full py-20 text-center">
                                <BookOpen size={48} className="mx-auto text-gray-800 mb-4" />
                                <div className="text-gray-500 uppercase tracking-widest text-xs italic">No references found in this sector</div>
                            </div>
                        ) : (
                            filteredReferences.map((ref: any) => (
                                <ReferenceCard key={ref.id} reference={ref} />
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar Filter/Stats */}
                <div className="col-span-12 xl:col-span-3 space-y-6">
                    <GlassCard className="h-auto">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6">Linked Projects</h3>
                        <div className="space-y-4">
                            {projects.map((p: any) => (
                                <div key={p.id} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                                            <Folder size={14} />
                                        </div>
                                        <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">{p.name}</span>
                                    </div>
                                    <span className="text-[9px] font-black text-gray-600 bg-white/5 px-2 py-1 rounded">12</span>
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                    <GlassCard className="h-auto">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6">Popular Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {['Research', 'Inspiration', 'Manuals', 'Assets', 'Scripts', 'Courses', 'Articles'].map(tag => (
                                <span key={tag} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white cursor-pointer transition-all">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>

            {isAddModalOpen && (
                <AddReferenceModal
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={async (data: any) => {
                        await createReference({ ...data, life_area_id: selectedArea === 'all' ? null : selectedArea });
                        setIsAddModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

const AddReferenceModal = ({ onClose, onSave }: any) => {
    const [formData, setFormData] = useState({ title: '', type: 'link', url: '', description: '', tags: [] });

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-lg bg-[#0a0a0c] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden p-8">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Index New Resource</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Asset Title</label>
                        <input
                            autoFocus
                            type="text"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-blue-500/50"
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
                                className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${formData.type === t ? 'bg-blue-600 border-blue-400 text-white' : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    {formData.type === 'link' && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">URL / Destination</label>
                            <input
                                type="text"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-blue-500/50"
                                placeholder="https://..."
                                value={formData.url}
                                onChange={e => setFormData({ ...formData, url: e.target.value })}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Brief Intelligence</label>
                        <textarea
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-blue-500/50 resize-none"
                            placeholder="Index description..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <button
                        onClick={() => onSave(formData)}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 mt-4"
                    >
                        <Save size={16} />
                        Record Reference
                    </button>
                </div>
            </div>
        </div>
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

const ReferenceCard = ({ reference }: any) => {
    const tags = reference.tags ? JSON.parse(reference.tags) : [];

    return (
        <GlassCard padding="p-6" className="group hover:-translate-y-2 transition-all duration-500 border-white/5 hover:border-blue-500/30">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-500 
                    ${reference.type === 'link' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white' :
                        reference.type === 'file' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white' :
                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white'}`}>
                    {reference.type === 'link' ? <LinkIcon size={18} /> : reference.type === 'file' ? <FileText size={18} /> : <File size={18} />}
                </div>
                <button className="text-gray-600 hover:text-white transition-colors">
                    <MoreVertical size={16} />
                </button>
            </div>

            <div className="space-y-1 flex-1">
                <h4 className="text-sm font-black text-white italic uppercase tracking-tight group-hover:text-blue-400 transition-colors uppercase truncate">{reference.title}</h4>
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
