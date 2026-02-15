import { motion } from 'framer-motion';
import { Target, Circle, CheckCircle2 } from 'lucide-react';

interface IdentityBoardProps {
    year: number;
    identities: any[];
    onSelectQuarter: (quarter: string) => void;
}

export function IdentityBoard({ year, identities, onSelectQuarter }: IdentityBoardProps) {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quarters.map((q, idx) => {
                const shift = identities.find(i => i.quarter === q && i.year === year);
                const outcomes = shift?.outcomes?.slice(0, 3) || [];
                const progress = shift?.outcomes?.length > 0
                    ? Math.round((shift.outcomes.filter((o: any) => o.status === 'completed').length / shift.outcomes.length) * 100)
                    : 0;

                return (
                    <motion.div
                        key={q}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => onSelectQuarter(q)}
                        className={`group relative glass-panel p-6 rounded-[32px] border border-white/10 cursor-pointer overflow-hidden transition-all hover:bg-white/10 hover:border-white/20 active:scale-95 ${shift ? 'min-h-[380px]' : 'min-h-[200px] flex items-center justify-center'}`}
                    >
                        {shift && (
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                        )}

                        <div className="flex flex-col h-full w-full">
                            <div className="flex justify-between items-center mb-6">
                                <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${shift ? 'text-indigo-400' : 'text-gray-600'}`}>{q} Plan</span>
                                {shift && <span className="text-[10px] font-bold text-gray-500">{progress}%</span>}
                            </div>

                            {shift ? (
                                <>
                                    <div className="mb-4">
                                        <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest block mb-2">Primary Identity</label>
                                        <h3 className="text-xl font-bold text-white tracking-tight leading-tight group-hover:text-indigo-400 transition-colors">
                                            {shift.primary_identity || "Identity Undefined"}
                                        </h3>
                                    </div>

                                    <div className="mb-6">
                                        <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest block mb-2">Quarter's Objective</label>
                                        <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed italic">
                                            "{shift.vision_statement || "No objective defined."}"
                                        </p>
                                    </div>

                                    <div className="mt-auto space-y-3">
                                        <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest block">Top 3 Outcomes</label>
                                        <div className="space-y-2">
                                            {outcomes.map((o: any, i: number) => (
                                                <div key={i} className="flex items-center gap-2 group/item">
                                                    {o.status === 'completed' ? (
                                                        <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                                                    ) : (
                                                        <Circle size={12} className="text-gray-700 shrink-0" />
                                                    )}
                                                    <span className={`text-[10px] truncate ${o.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                                                        {o.title}
                                                    </span>
                                                </div>
                                            ))}
                                            {outcomes.length === 0 && (
                                                <p className="text-[10px] text-gray-700 italic">No outcomes added.</p>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center space-y-2">
                                    <Target className="mx-auto text-gray-800" size={32} />
                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Initialize Quarter</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
