import React from 'react';
import { Settings, LogOut, User } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setActiveTab } from '../../features/ui/uiSlice';

import { useGetProfileQuery } from '../../features/api/apiSlice';

interface SidebarProfileProps {
    user: any;
    collapsed: boolean;
}

export const SidebarProfile = ({ user, collapsed }: SidebarProfileProps) => {
    const dispatch = useDispatch();
    const { data: profile } = useGetProfileQuery();

    // Prefer the live profile data if available (e.g. after update), fallback to auth user
    const displayUser = profile || user;

    return (
        <div
            onClick={() => dispatch(setActiveTab('settings'))}
            className={`mt-auto p-4 border-t border-white/10 group/profile cursor-pointer hover:bg-white/5 transition-all duration-300 ${collapsed ? 'flex justify-center' : 'flex items-center gap-3'}`}
        >
            <div className={`shrink-0 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center font-bold text-white border border-white/10 shadow-lg transition-all duration-300 overflow-hidden ${collapsed ? 'w-10 h-10' : 'w-12 h-12'}`}>
                {displayUser?.profile_photo ? (
                    <img src={displayUser.profile_photo} alt={displayUser.name} className="w-full h-full object-cover" />
                ) : (
                    (displayUser?.name || 'U').charAt(0).toUpperCase()
                )}
            </div>
            {!collapsed && (
                <div className="flex-1 min-w-0 animate-in slide-in-from-left-2 duration-300">
                    <div className="text-sm font-black text-white truncate italic uppercase tracking-tighter">{displayUser?.name || 'Agent'}</div>
                    <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest truncate">{displayUser?.username || '@focus_agent'}</div>
                </div>
            )}
            {!collapsed && (
                <Settings size={16} className="text-gray-500 group-hover/profile:text-white group-hover/profile:rotate-90 transition-all duration-500" />
            )}
        </div>
    );
};
