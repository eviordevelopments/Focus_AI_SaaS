import React from 'react';

interface GlassModalProps {
    isOpen: boolean;
    children: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
    padding?: string;
    className?: string; // Additional classes for the card container
}

export default function GlassModal({ 
    isOpen, 
    children, 
    maxWidth = '4xl',
    padding = 'p-8 md:p-12',
    className = ''
}: GlassModalProps) {
    if (!isOpen) return null;

    const maxWidthClass = {
        'sm': 'max-w-sm',
        'md': 'max-w-md',
        'lg': 'max-w-lg',
        'xl': 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
    }[maxWidth] || `max-w-4xl`;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-300">
            <div className={`relative w-[95%] ${maxWidthClass} bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] mb-12 ${padding} ${className}`}>
                {children}
            </div>
        </div>
    );
}
