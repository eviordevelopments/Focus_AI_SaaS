import { motion } from 'framer-motion';
import { Trophy, ChevronRight, Share2, Rocket } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setShowPostSession } from '../features/timer/timerSlice';

export default function SessionBlockingOverlay() {
    const { showPostSession, plannedMinutes } = useSelector((state: RootState) => state.timer);
    const dispatch = useDispatch();

    if (!showPostSession) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[200] bg-[#050505]/95 backdrop-blur-3xl flex items-center justify-center p-8"
        >
            <div className="w-full max-w-2xl text-center space-y-12">
                {/* 3D Reward Animation */}
                <div className="relative inline-block">
                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', damping: 10, stiffness: 60 }}
                        className="w-64 h-64 bg-indigo-600/10 rounded-full flex items-center justify-center relative shadow-[0_0_100px_rgba(99,102,241,0.2)]"
                    >
                        <img
                            src="/assets/3d/tree_assets.png"
                            className="w-48 h-48 object-contain filter drop-shadow-2xl animate-float"
                            alt="New Tree Earned"
                            style={{ clipPath: 'inset(0 50% 50% 0)' }}
                        />

                        {/* Orbiting particles */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-[-20px] border border-dashed border-indigo-500/20 rounded-full"
                        />
                    </motion.div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-center gap-2 mb-4">
                        <Trophy className="text-amber-400" size={32} />
                        <Rocket className="text-indigo-400" size={32} />
                    </div>
                    <h2 className="text-5xl font-black text-white italic uppercase tracking-tight">Focus Secured</h2>
                    <p className="text-xl text-gray-500 max-w-sm mx-auto font-medium">
                        You've earned a <span className="text-white">Ancient Evergreen</span> for completing a {plannedMinutes}m session.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="py-6 bg-white/5 hover:bg-white/10 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] transition-all border border-white/5 flex items-center justify-center gap-2">
                        <Share2 size={16} />
                        Share Proof
                    </button>
                    <button
                        onClick={() => dispatch(setShowPostSession(false))}
                        className="py-6 bg-white text-black rounded-3xl font-black uppercase tracking-widest text-[10px] transition-all shadow-2xl hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                        Collect & Plant
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
