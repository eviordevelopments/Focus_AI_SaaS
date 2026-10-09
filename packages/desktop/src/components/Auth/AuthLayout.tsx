import { useState } from 'react';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import logo from '../../assets/logo.png';
import deepmindLogo from '../../assets/deepmind.png';
import { Brain, Heart, Zap, Focus, LayoutGrid, Shield } from 'lucide-react';

const NARRATIVES = [
    { icon: Brain, title: 'Work Smart, Less Stress', desc: 'AI-powered insights to optimize your workflow.' },
    { icon: Heart, title: 'Manage Your Health', desc: 'Track burnout risk and prevent exhaustion.' },
    { icon: Zap, title: 'Do More With Less', desc: 'One app for tasks, focus, learning & health.' },
    { icon: Focus, title: 'Deep Focus Sessions', desc: 'Pomodoro & custom timers to stay in flow.' },
    { icon: LayoutGrid, title: 'Organize Your Life', desc: 'Kanban boards, calendars, and life areas.' },
];

export function AuthLayout() {
    const [view, setView] = useState<'login' | 'register'>('login');

    return (
        <div className="fixed inset-0 z-50 flex bg-[#050505]">
            {/* Left Panel - Solid Color Background (Narrative) */}
            <div className="hidden lg:flex flex-col justify-center w-[60%] max-w-3xl bg-[#020617] px-16 xl:px-24 relative z-20 border-r border-black/5 dark:border-white/5 shadow-2xl">
                {/* Logo & Brand - Above Title */}
                <div className="flex flex-col items-start gap-4 mb-10">
                    <img
                        src={logo}
                        alt="Deepmind"
                        className="w-20 h-20 object-contain"
                    />
                    <img src={deepmindLogo} alt="Deepmind" className="h-8 w-auto opacity-90" />
                </div>

                {/* Title */}
                <h1 className="text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-4 tracking-tight">
                    {view === 'login' ? 'Welcome Back' : 'Join Deepmind'}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 leading-relaxed">
                    {view === 'login'
                        ? 'Sign in to access your productivity hub and continue building great habits.'
                        : 'Create your account to unlock AI-powered productivity, health tracking, and deep focus tools.'}
                </p>

                {/* Feature Pills */}
                <div className="space-y-6">
                    {NARRATIVES.map((item, i) => (
                        <div key={i} className="flex items-start gap-5 group">
                            <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/10 transition-all border border-black/5 dark:border-white/5 shrink-0 shadow-lg">
                                <item.icon size={22} />
                            </div>
                            <div className="pt-0.5">
                                <p className="text-gray-900 dark:text-white font-semibold text-[15px]">{item.title}</p>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer / Disclaimer */}
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mt-16 font-medium">
                    <Shield size={14} />
                    <span>Your data is encrypted and secure. We respect your privacy.</span>
                </div>
            </div>

            {/* Right Panel - Form over Background Image */}
            <div className="flex-1 relative flex items-center justify-center p-8 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center">
                {/* Dark Overlay just for the right side */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-900/70 to-gray-900/50 backdrop-blur-[2px]" />
                
                <div className="w-full max-w-md relative z-10">
                    {/* Animated wave gradient behind card */}
                    <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-500/30 via-blue-500/20 to-purple-500/30 rounded-xl blur-xl opacity-60 animate-pulse" />

                    {/* Main Card */}
                    <div className="relative w-full bg-black/10 dark:bg-white/10 backdrop-blur-2xl rounded-xl shadow-2xl p-10 border border-black/20 dark:border-white/20 animate-in slide-in-from-right-4 fade-in duration-300">
                        {/* Mobile Logo (shown on small screens) */}
                        <div className="lg:hidden flex flex-col items-center gap-4 mb-8">
                            <img src={logo} alt="Deepmind" className="w-16 h-16 object-contain" />
                            <img src={deepmindLogo} alt="Deepmind" className="h-8 w-auto opacity-90" />
                        </div>

                        {view === 'login' ? (
                            <LoginPage onSwitchToRegister={() => setView('register')} />
                        ) : (
                            <RegisterPage onSwitchToLogin={() => setView('login')} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
