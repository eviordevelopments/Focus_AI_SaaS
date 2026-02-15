import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useGetProfileQuery, useUpdateProfileMutation, useResetPasswordMutation, useGetGamifiedDashboardQuery } from '../features/api/apiSlice';
import { logout } from '../features/auth/authSlice';
import { RootState } from '../store';
import { setThemeMode } from '../features/theme/themeSlice';
import GlassCard from './ui/GlassCard';
import { User, Mail, Shield, Palette, Accessibility, Save, LogOut, Camera, Globe, Trophy, Zap, Target, Star, Lock, Activity } from 'lucide-react';

export const SettingsView = () => {
    const { data: profile, isLoading } = useGetProfileQuery();
    const { data: stats } = useGetGamifiedDashboardQuery();
    const [updateProfile] = useUpdateProfileMutation();
    const [resetPassword] = useResetPasswordMutation();
    const { mode: themeMode } = useSelector((state: RootState) => state.theme);
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        name: profile?.name || '',
        username: profile?.username || '',
        description: profile?.description || '',
        profile_photo: profile?.profile_photo || ''
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);

    const handleSave = async () => {
        try {
            await updateProfile(formData).unwrap();
            alert('Protocol updated successfully.');
        } catch (err) {
            alert('Failed to update protocol.');
        }
    };

    const handlePasswordReset = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            return alert('Passwords do not match.');
        }
        try {
            await resetPassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            }).unwrap();
            setIsPasswordResetOpen(false);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            alert('Security protocol re-established.');
        } catch (err) {
            alert('Failed to reset security protocol.');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, profile_photo: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    if (isLoading) return <div className="p-8">Loading profile...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter text-[var(--text-heading)]">System Settings</h1>
                    <p className="text-[var(--text-dim)] font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Personalize your high-performance environment</p>
                </div>
                <button
                    onClick={() => dispatch(logout())}
                    className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl border border-red-500/20 transition-all font-black uppercase tracking-widest text-[10px]"
                >
                    <LogOut size={14} />
                    Terminal Exit
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Section */}
                <div className="md:col-span-2 space-y-8">
                    <GlassCard>
                        <div className="flex items-center gap-6 mb-10">
                            <div className="relative group">
                                <label className="cursor-pointer">
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center font-black text-3xl text-white border border-white/10 shadow-2xl relative overflow-hidden">
                                        {formData.profile_photo || profile?.profile_photo ? (
                                            <img src={formData.profile_photo || profile?.profile_photo} alt={profile?.name} className="w-full h-full object-cover" />
                                        ) : (
                                            (profile?.name || 'U').charAt(0).toUpperCase()
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Camera size={24} />
                                        </div>
                                    </div>
                                </label>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-[var(--text-heading)]">{profile?.name}</h3>
                                <p className="text-blue-400 font-bold text-xs uppercase tracking-widest">{profile?.username || '@focus_agent'}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input label="Full Name" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} icon={<User size={16} />} />
                                <Input label="Username" value={formData.username} onChange={(v) => setFormData({ ...formData, username: v })} icon={<Globe size={16} />} placeholder="@username" />
                            </div>
                            <TextArea label="Bio / Mission Statement" value={formData.description} onChange={(v) => setFormData({ ...formData, description: v })} placeholder="Describe your core objectives..." />

                            <button
                                onClick={handleSave}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 mt-4"
                            >
                                <Save size={16} />
                                Save Protocol Changes
                            </button>
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <h3 className="text-xl font-black italic uppercase tracking-tighter text-[var(--text-heading)] mb-6">Security & Identity</h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--glass-border)] flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Mail size={18} className="text-[var(--text-dim)]" />
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)]">Email Address</div>
                                        <div className="text-sm font-bold text-[var(--text-main)]">{profile?.email}</div>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-black uppercase tracking-widest border border-emerald-500/20">Verified</span>
                            </div>

                            {isPasswordResetOpen ? (
                                <div className="space-y-4 p-6 bg-white/5 rounded-3xl border border-white/10 animate-in slide-in-from-top-2">
                                    <div className="grid grid-cols-1 gap-4">
                                        <Input
                                            label="Current Password"
                                            value={passwordForm.currentPassword}
                                            onChange={(v) => setPasswordForm({ ...passwordForm, currentPassword: v })}
                                            icon={<Lock size={16} />}
                                            type="password"
                                        />
                                        <Input
                                            label="New Password"
                                            value={passwordForm.newPassword}
                                            onChange={(v) => setPasswordForm({ ...passwordForm, newPassword: v })}
                                            icon={<Shield size={16} />}
                                            type="password"
                                        />
                                        <Input
                                            label="Confirm New Password"
                                            value={passwordForm.confirmPassword}
                                            onChange={(v) => setPasswordForm({ ...passwordForm, confirmPassword: v })}
                                            icon={<Shield size={16} />}
                                            type="password"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setIsPasswordResetOpen(false)}
                                            className="flex-1 py-3 bg-white/5 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handlePasswordReset}
                                            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
                                        >
                                            Confirm Change
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsPasswordResetOpen(true)}
                                    className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all border border-white/10 flex items-center justify-center gap-2"
                                >
                                    <Shield size={16} />
                                    Re-establish Security Protocol (Reset Password)
                                </button>
                            )}
                        </div>
                    </GlassCard>
                </div>

                {/* Preferences Section */}
                <div className="space-y-8">
                    <GlassCard>
                        <div className="flex items-center gap-3 mb-8">
                            <Star size={20} className="text-amber-400" />
                            <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Identity Matrix</h3>
                        </div>
                        <div className="space-y-6">
                            <Stat label="Current Level" value={`LVL ${stats?.level || 1}`} icon={<Zap size={14} className="text-indigo-400" />} />
                            <Stat label="Identity Mastery" value={`Rank ${stats?.mastery || 1}`} icon={<Target size={14} className="text-cyan-400" />} />
                            <Stat label="Total Intelligence (XP)" value={(stats?.totalXP || 0).toLocaleString()} icon={<Activity size={14} className="text-pink-400" />} />
                            <Stat label="Trophies Secured" value={stats?.achievementsCount || 0} icon={<Trophy size={14} className="text-amber-400" />} />
                            <Stat label="Validated Results" value={stats?.totalResults || 0} icon={<Star size={14} className="text-emerald-400" />} />
                            <div className="pt-4 border-t border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Overall Progress</span>
                                    <span className="text-xs font-black text-white italic">{stats?.avgProgress || 0}%</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-1000"
                                        style={{ width: `${stats?.avgProgress || 0}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <div className="flex items-center gap-3 mb-6">
                            <Palette size={20} className="text-indigo-400" />
                            <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Environment Appearance</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Display Mode</div>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['dark', 'light'] as const).map(mode => (
                                        <button
                                            key={mode}
                                            onClick={() => dispatch(setThemeMode(mode))}
                                            className={`py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${themeMode === mode ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <Toggle label="Glassmorphic Effects" enabled={true} />
                            <Toggle label="Dynamic Background Blobs" enabled={true} />
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <div className="flex items-center gap-3 mb-6">
                            <Accessibility size={20} className="text-emerald-400" />
                            <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Accessibility</h3>
                        </div>
                        <div className="space-y-4">
                            <Toggle label="Reduce Motion" enabled={false} />
                            <Toggle label="High Contrast" enabled={false} />
                            <Toggle label="Screen Reader Optimization" enabled={true} />
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

const Input = ({ label, value, onChange, icon, placeholder, type = 'text' }: { label: string, value: string, onChange: (v: string) => void, icon: any, placeholder?: string, type?: string }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)] px-1">{label}</label>
        <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-dim)]">{icon}</span>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-2xl py-3 pl-12 pr-4 text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none focus:border-blue-500/50 focus:bg-[var(--glass-bg)] transition-all font-medium"
            />
        </div>
    </div>
);

const TextArea = ({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)] px-1">{label}</label>
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={4}
            className="w-full bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-2xl py-4 px-4 text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none focus:border-blue-500/50 focus:bg-[var(--glass-bg)] transition-all font-medium resize-none"
        />
    </div>
);

const Toggle = ({ label, enabled }: any) => (
    <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/5">
        <span className="text-[11px] font-bold text-gray-300">{label}</span>
        <div className={`w-10 h-5 rounded-full relative transition-all duration-300 cursor-pointer ${enabled ? 'bg-blue-600' : 'bg-white/10'}`}>
            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300 ${enabled ? 'left-6' : 'left-1'}`} />
        </div>
    </div>
);

const Stat = ({ label, value, icon }: any) => (
    <div className="flex items-center justify-between group">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-all">
                {icon}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-400 transition-colors">{label}</span>
        </div>
        <span className="text-xs font-bold text-white tabular-nums italic">{value}</span>
    </div>
);
