import React, { useState, useEffect } from 'react';

export const SidebarDateDisplay = ({ collapsed }: { collapsed: boolean }) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (collapsed) return null;

    return (
        <div className="px-6 py-4 border-b border-white/5 animate-in fade-in duration-500">
            <div className="text-2xl font-black tracking-tighter text-white italic">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mt-1">
                {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
        </div>
    );
};
