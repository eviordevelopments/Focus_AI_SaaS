import { motion } from 'framer-motion';
import { useGetPlantedTreesQuery } from '../../features/api/apiSlice';

export default function FocusIsland() {
    const { data: trees = [] } = useGetPlantedTreesQuery();

    return (
        <div className="relative w-full h-[400px] flex items-center justify-center overflow-hidden">
            {/* Soft background glow */}
            <div className="absolute inset-0 bg-radial-gradient from-indigo-500/10 to-transparent pointer-events-none" />

            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-[600px] h-[600px] flex items-center justify-center"
            >
                {/* Island Base */}
                <img
                    src="/assets/3d/island_base.png"
                    className="w-full h-full object-contain filter drop-shadow-2xl opacity-90"
                    alt="Focus Island"
                />

                {/* Trees Container - Positioned absolutely over the island */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                    {trees.map((tree: any, idx: number) => (
                        <PlantedTree
                            key={tree.id || idx}
                            type={tree.tree_type}
                            x={tree.position_x}
                            y={tree.position_y}
                            delay={idx * 0.1}
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

function PlantedTree({ type, x, y, delay }: { type: string, x: number, y: number, delay: number }) {
    // Determine Sprite based on type or just use the same asset for now
    // In a real app we'd have a sprite sheet or individual files
    // For this mockup we'll use a single tree asset and rotate it
    return (
        <motion.div
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1.2, opacity: 1, y: 0 }}
            whileHover={{ scale: 1.5, rotate: 5 }}
            transition={{ delay, type: 'spring', damping: 12 }}
            style={{ left: `${x}%`, top: `${y}%` }}
            className="absolute w-24 h-24 pointer-events-auto cursor-help transform -translate-x-1/2 -translate-y-1/2"
        >
            <img
                src="/assets/3d/tree_assets.png"
                className="w-full h-full object-contain filter drop-shadow-lg"
                style={{
                    // Manual cropping if possible or just use whole image for demo
                    clipPath: 'inset(0 50% 50% 0)' // Just a rough crop for variety
                }}
                alt="Tree"
            />
        </motion.div>
    );
}
