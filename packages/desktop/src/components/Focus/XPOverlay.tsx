import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Star } from 'lucide-react';
import { useState, createContext, useContext } from 'react';

interface XPEvent {
    id: string;
    xp: number;
    source: string;
    levelUp?: number;
}

const XPContext = createContext<{ addXP: (xp: number, source: string, levelUp?: number) => void } | null>(null);

export function XPProvider({ children }: { children: React.ReactNode }) {
    const [events, setEvents] = useState<XPEvent[]>([]);

    const addXP = (xp: number, source: string, levelUp?: number) => {
        const id = Math.random().toString(36).substr(2, 9);
        setEvents(prev => [...prev, { id, xp, source, levelUp }]);
        setTimeout(() => {
            setEvents(prev => prev.filter(e => e.id !== id));
        }, 3000);
    };

    return (
        <XPContext.Provider value={{ addXP }}>
            {children}
            <XPOverlay events={events} />
        </XPContext.Provider>
    );
}

export const useXP = () => {
    const context = useContext(XPContext);
    if (!context) throw new Error('useXP must be used within XPProvider');
    return context;
};

function XPOverlay({ events }: { events: XPEvent[] }) {
    return (
        <div className="fixed top-20 right-8 z-[100] pointer-events-none space-y-4">
            <AnimatePresence>
                {events.map((event) => (
                    <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: 50, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 0.5 }}
                        className="glass-panel p-4 rounded-2xl border border-indigo-500/30 bg-indigo-600/20 backdrop-blur-xl shadow-2xl flex items-center gap-4 min-w-[200px]"
                    >
                        <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/40">
                            {event.levelUp ? <Trophy className="text-white" size={20} /> : <Star className="text-white fill-white" size={20} />}
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-indigo-300 uppercase tracking-widest leading-none mb-1">
                                {event.levelUp ? 'Identity Level Up!' : event.source}
                            </div>
                            <div className="text-xl font-black text-white leading-none">
                                {event.levelUp ? `Level ${event.levelUp}` : `+${event.xp} XP`}
                            </div>
                        </div>
                        {event.levelUp && (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                className="ml-2"
                            >
                                <Sparkles className="text-yellow-400" size={16} />
                            </motion.div>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
