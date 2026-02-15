import { ReactNode } from 'react';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    glow?: boolean;
    glowColor?: string;
    padding?: string;
    fullHeight?: boolean;
}

export function GlassCard({
    children,
    className = '',
    onClick,
    glow = true,
    glowColor = "bg-indigo-500/10",
    padding = "p-8",
    fullHeight = true
}: GlassCardProps) {
    return (
        <div
            onClick={onClick}
            className={`
                relative overflow-hidden
                bg-[var(--bg-card)] backdrop-blur-3xl
                border border-[var(--glass-border)]
                rounded-[2.5rem]
                ${padding}
                ${fullHeight ? 'h-full' : ''}
                flex flex-col
                group transition-all duration-700
                outline-none
                shadow-[var(--card-shadow)]
                ${onClick ? 'cursor-pointer hover:bg-white/[0.06] hover:border-white/20 active:scale-[0.98]' : ''}
                ${className}
            `}
        >
            {/* Background Glow */}
            {glow && (
                <div className={`absolute -top-12 -right-12 w-32 h-32 ${glowColor} rounded-full blur-3xl opacity-20 group-hover:scale-110 transition-all duration-700`} />
            )}

            <div className={`relative z-10 flex flex-col ${fullHeight ? 'h-full' : ''} text-[var(--text-main)]`}>
                {children}
            </div>
        </div>
    );
}

export default GlassCard;
