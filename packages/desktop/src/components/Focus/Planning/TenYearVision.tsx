import React, { useState, useEffect } from 'react';
import { Anchor, Sparkles, Save, Maximize2 } from 'lucide-react';
import { useGetFutureVisionQuery, useUpdateFutureVisionMutation } from '../../../features/api/apiSlice';
import { motion, AnimatePresence } from 'framer-motion';

export function TenYearVision() {
    const { data: vision, isLoading } = useGetFutureVisionQuery();
    const [updateVision, { isLoading: isSaving }] = useUpdateFutureVisionMutation();
    const [text, setText] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (vision?.description) {
            setText(vision.description);
        }
    }, [vision]);

    const handleSave = async () => {
        await updateVision({
            description: text,
            target_year: new Date().getFullYear() + 10
        });
        setIsFocused(false);
    };

    return (
        <motion.section
            layout
            className={`glass-panel rounded-[40px] border border-white/10 relative overflow-hidden transition-all duration-500 ${isFocused ? 'bg-black/40 ring-1 ring-cyan-500/30' : 'hover:bg-white/5'}`}
        >
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                <Anchor size={120} />
            </div>

            <div className="relative z-10 p-10">
                <div className="flex justify-between items-start mb-6">
                    <label className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                        <Sparkles size={14} /> The 10-Year Vision
                    </label>
                    <AnimatePresence>
                        {isFocused && (text !== vision?.description) && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 bg-cyan-500/10 text-cyan-400 px-4 py-2 rounded-full text-xs font-bold hover:bg-cyan-500/20 transition-colors"
                            >
                                <Save size={14} /> {isSaving ? 'Saving...' : 'Save Vision'}
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                <h3 className="text-2xl font-bold text-white mb-6">Where are you in 10 years?</h3>

                <textarea
                    className="w-full bg-transparent border-none text-white text-lg focus:outline-none focus:ring-0 min-h-[150px] resize-none leading-relaxed placeholder-white/20"
                    placeholder="Describe your life, health, and status in 10 years. Be vivid."
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => !text && setIsFocused(false)} // Keep focused if has text? No, standard blur.
                />

                <p className="text-xs text-gray-500 mt-4 italic flex items-center gap-1">
                    This is your 'North Star' for all quarterly decisions.
                </p>
            </div>
        </motion.section>
    );
}
