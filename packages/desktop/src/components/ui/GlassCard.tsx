import { ReactNode } from 'react';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}

export function GlassCard({ children, className = '', onClick }: GlassCardProps) {
    return (
        <div
            onClick={onClick}
            className={`glass-panel p-6 rounded-2xl border border-white/10 shadow-xl backdrop-blur-md bg-white/5 ${onClick ? 'cursor-pointer hover:bg-white/10 transition-colors' : ''} ${className}`}
        >
            {children}
        </div>
    );
}

export default GlassCard;
