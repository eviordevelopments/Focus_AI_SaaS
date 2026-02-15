import { motion, AnimatePresence } from 'framer-motion';
import {
    X, AlertTriangle, Zap, Activity, Brain,
    Heart, CheckCircle2, Circle, TrendingUp, Info, Plus, Trash2, Save, Edit3
} from 'lucide-react';
import {
    useGetMonthlyRoadmapQuery,
    useSaveRoadmapConfigMutation
} from '../../../features/api/apiSlice';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { useState, useEffect } from 'react';

interface MonthlyDetailModalProps {
    month: number;
    year: number;
    onClose: () => void;
}

const MONTH_NAMES = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export function MonthlyDetailModal({ month, year, onClose }: MonthlyDetailModalProps) {
    const { data: detail, isLoading } = useGetMonthlyRoadmapQuery({ year, month });
    const [saveConfig] = useSaveRoadmapConfigMutation();

    const [isEditing, setIsEditing] = useState(false);
    const [editedRequirements, setEditedRequirements] = useState<string[]>([]);
    const [newReq, setNewReq] = useState('');

    useEffect(() => {
        if (detail?.config?.checklist_requirements) {
            try {
                const reqs = typeof detail.config.checklist_requirements === 'string'
                    ? JSON.parse(detail.config.checklist_requirements)
                    : detail.config.checklist_requirements;
                setEditedRequirements(reqs || []);
            } catch (e) {
                setEditedRequirements([]);
            }
        } else {
            setEditedRequirements([
                'Adherence > 80% on primary systems',
                'Minimum 5 hours avg sleep achieved',
                'Zero critical bottlenecks detected',
                'Completed 20+ deep work protocols'
            ]);
        }
    }, [detail]);

    if (isLoading) return null;

    const habitData = detail?.habitStats || [];
    const avgHealth = detail?.avgHealth || { mood: 0, sleep: 0, stress: 0 };

    // Data-driven MVL Status based on thresholds
    const avgCompletion = habitData.length > 0
        ? habitData.reduce((acc: number, h: any) => acc + h.completion, 0) / habitData.length
        : 0;

    let mvlStatus = 'Minimum';
    let mvlColor = '#ef4444';
    if (avgCompletion >= 85) {
        mvlStatus = 'Growth';
        mvlColor = '#10b981';
    } else if (avgCompletion >= 60) {
        mvlStatus = 'Median';
        mvlColor = '#f59e0b';
    }

    const handleSaveRequirements = async () => {
        await saveConfig({
            year,
            month,
            checklist_requirements: JSON.stringify(editedRequirements)
        });
        setIsEditing(false);
    };

    const addRequirement = () => {
        if (newReq.trim()) {
            setEditedRequirements([...editedRequirements, newReq.trim()]);
            setNewReq('');
        }
    };

    const removeRequirement = (index: number) => {
        setEditedRequirements(editedRequirements.filter((_, i) => i !== index));
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="relative w-full max-w-5xl max-h-[90vh] bg-[#0a0a0c] border border-white/10 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-md">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                Monthly Architecture Review
                            </span>
                            <span className="text-gray-600 text-[10px] font-black uppercase tracking-widest">{year}</span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">{MONTH_NAMES[month]} Level Detail</h2>
                    </div>
                    <button onClick={onClose} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-500 hover:text-white transition-all">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
                    {/* Top Grid: Main Analytics */}
                    <div className="grid grid-cols-12 gap-8">
                        {/* Habit Performance Chart - REAL DATA */}
                        <div className="col-span-12 lg:col-span-8 space-y-4">
                            <div className="flex justify-between items-end px-2">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Habit Mastery Profile</h3>
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Accuracy: High</div>
                            </div>
                            <div className="h-80 w-full bg-white/[0.02] border border-white/5 rounded-3xl p-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={habitData}>
                                        <CartesianGrid strokeDasharray="10 10" stroke="#ffffff05" vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 800 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 800 }}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                            contentStyle={{ backgroundColor: '#0a0a0c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                                        />
                                        <Bar dataKey="completion" radius={[8, 8, 0, 0]} barSize={40}>
                                            {habitData.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.completion >= 85 ? '#10b981' : entry.completion >= 60 ? '#f59e0b' : '#ef4444'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* MVL & Status Card - REAL DATA */}
                        <div className="col-span-12 lg:col-span-4 space-y-6">
                            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                    <TrendingUp size={80} />
                                </div>
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Lifestyle Tier Status</h4>
                                <div className="text-5xl font-black text-white tracking-tighter italic uppercase mb-2" style={{ color: mvlColor }}>
                                    {mvlStatus}
                                </div>
                                <p className="text-gray-400 text-xs font-medium leading-relaxed mb-6">
                                    Current architecture mastery: <span className="text-white font-bold">{Math.round(avgCompletion)}%</span>.
                                    {mvlStatus === 'Growth' ? ' Biological expansion is optimal.' : mvlStatus === 'Median' ? ' Stability achieved. Optimization required.' : ' Structural risk detected.'}
                                </p>

                                <div className="space-y-3">
                                    {['Growth Tier (>85%)', 'Median Tier (>60%)', 'Minimum Tier (>30%)'].map((tier, i) => {
                                        const thresholds = [85, 60, 30];
                                        const isActive = avgCompletion >= thresholds[i] && (i === 0 || avgCompletion < thresholds[i - 1]);
                                        return (
                                            <div key={tier} className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white shadow-[0_0_10px_white]' : 'bg-white/10'}`} />
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-gray-600'}`}>
                                                    {tier}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/5 rounded-3xl p-6 flex items-center justify-between">
                                <div>
                                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">XP Potential</div>
                                    <div className="text-2xl font-black text-white">+{Math.round(avgCompletion * 24)} XP</div>
                                </div>
                                <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                                    <Zap size={20} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottlenecks & Biological Impact */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <section className="space-y-4">
                            <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <AlertTriangle size={14} className="text-amber-500" />
                                Bottleneck Detection
                            </h4>
                            <div className="space-y-3">
                                {habitData.filter((h: any) => h.completion < 60).map((h: any) => (
                                    <div key={h.name} className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex items-center justify-between group hover:bg-rose-500/10 transition-colors">
                                        <div>
                                            <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">{h.completion < 30 ? 'Critical Deficit' : 'Efficiency Gap'}</div>
                                            <div className="text-sm font-bold text-white uppercase tracking-tighter">{h.name}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-black text-rose-500 italic">{Math.round(h.completion)}%</div>
                                        </div>
                                    </div>
                                ))}
                                {habitData.filter((h: any) => h.completion < 60).length === 0 && (
                                    <div className="p-6 text-center border border-dashed border-white/10 rounded-2xl">
                                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">No structural bottlenecks found</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Activity size={14} className="text-indigo-400" />
                                Biological Sync
                            </h4>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-5 bg-white/5 rounded-[2rem] border border-white/5 flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                        <Brain size={24} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Avg Mood Rating</div>
                                        <div className="text-xl font-black text-white italic">{(avgHealth.mood || 0).toFixed(1)} / 10</div>
                                    </div>
                                </div>
                                <div className="p-5 bg-white/5 rounded-[2rem] border border-white/5 flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                                        <Heart size={24} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Avg Stress Sync</div>
                                        <div className="text-xl font-black text-white italic">{(avgHealth.stress || 0).toFixed(1)} / 10</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Zap size={14} className="text-amber-500" />
                                Repercussion Analysis
                            </h4>
                            <div className="bg-amber-500/5 border border-amber-500/10 rounded-[2rem] p-6">
                                <div className="flex items-start gap-4">
                                    <Info size={16} className="text-amber-400 mt-1 flex-shrink-0" />
                                    <p className="text-xs text-gray-400 font-medium leading-relaxed">
                                        <span className="text-amber-400 font-black uppercase">Identity Risk:</span><br />
                                        Continuity of current {mvlStatus} levels suggests a {mvlStatus === 'Minimum' ? '65%' : mvlStatus === 'Median' ? '15%' : '2%'} risk of architectural collapse next month.
                                        {habitData.length > 0 && ` Adjust ${habitData[0].name} to restore baseline equilibrium.`}
                                    </p>
                                </div>
                                <button className="w-full mt-6 py-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-xl text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] transition-all">
                                    GENERATE ADJUSTMENT PROTOCOL
                                </button>
                            </div>
                        </section>
                    </div>

                    {/* Mission Requirements - EDITABLE */}
                    <section className="space-y-6 pt-6">
                        <div className="flex justify-between items-center">
                            <h4 className="text-xs font-black text-white uppercase tracking-[0.3em]">Phase Requirements Checklist</h4>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isEditing ? 'bg-rose-500/10 text-rose-400' : 'bg-indigo-500/10 text-indigo-400 hover:text-indigo-300'}`}
                            >
                                <Edit3 size={14} />
                                {isEditing ? 'Cancel Edit' : 'Edit Architecture'}
                            </button>
                        </div>

                        <AnimatePresence mode="wait">
                            {isEditing ? (
                                <motion.div
                                    key="edit-reqs"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {editedRequirements.map((req, i) => (
                                            <div key={i} className="flex gap-2 group">
                                                <input
                                                    value={req}
                                                    onChange={(e) => {
                                                        const newReqs = [...editedRequirements];
                                                        newReqs[i] = e.target.value;
                                                        setEditedRequirements(newReqs);
                                                    }}
                                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                                                />
                                                <button onClick={() => removeRequirement(i)} className="p-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-3">
                                        <input
                                            placeholder="Define structural requirement..."
                                            value={newReq}
                                            onChange={(e) => setNewReq(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addRequirement()}
                                            className="flex-1 bg-white/[0.05] border border-dashed border-white/20 rounded-xl px-6 py-4 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 transition-all"
                                        />
                                        <button onClick={addRequirement} className="px-6 bg-indigo-500/10 text-indigo-400 rounded-xl hover:bg-indigo-500/20 transition-all">
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleSaveRequirements}
                                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 shadow-xl text-white text-[11px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                                    >
                                        <Save size={16} /> Finalize Mission Config
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="view-reqs"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                >
                                    {editedRequirements.map((req, i) => {
                                        const isMet = (req.toLowerCase().includes('80%') && avgCompletion > 80) ||
                                            (req.toLowerCase().includes('sleep') && avgHealth.sleep > 5) ||
                                            (req.toLowerCase().includes('bottleneck') && habitData.filter((h: any) => h.completion < 30).length === 0) ||
                                            (req.toLowerCase().includes('deep work') && detail?.logCount > 20);

                                        return (
                                            <div key={i} className={`p-6 rounded-[2rem] border transition-all duration-500 flex items-center justify-between ${isMet ? 'bg-indigo-500/5 border-indigo-500/20 group' : 'bg-white/[0.02] border-white/5 opacity-60'}`}>
                                                <div className="flex items-center gap-5">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isMet ? 'bg-indigo-500/10 text-indigo-400' : 'bg-white/5 text-gray-700'}`}>
                                                        {isMet ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                                    </div>
                                                    <span className={`text-[13px] font-bold uppercase tracking-tight ${isMet ? 'text-white' : 'text-gray-500'}`}>{req}</span>
                                                </div>
                                                {isMet && (
                                                    <span className="text-[9px] font-black text-indigo-400/50 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">
                                                        SYNCED
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </section>
                </div>

                {/* Footer Action */}
                <div className="p-8 bg-white/5 border-t border-white/5 flex justify-end gap-4 backdrop-blur-md">
                    <button onClick={onClose} className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[11px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-all">
                        Archive State
                    </button>
                    <button
                        onClick={onClose}
                        className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_30px_rgba(79,70,229,0.3)] rounded-2xl text-[11px] font-black text-white uppercase tracking-widest transition-all active:scale-95"
                    >
                        Initialize Evolution
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
