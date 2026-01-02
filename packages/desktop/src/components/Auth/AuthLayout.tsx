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
        <div className="fixed inset-0 z-50 flex bg-gray-900 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center">
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-gray-900/80 to-gray-900/70" />

            {/* Centered Container - holds both panels with balanced spacing */}
            <div className="relative z-10 flex w-full items-center justify-center px-8 lg:px-16 gap-8 lg:gap-16">

                {/* Left Panel - Narrative */}
                <div className="hidden lg:flex flex-col justify-center max-w-lg">
                    {/* Logo & Brand - Above Title */}
                    <div className="flex flex-col items-center gap-4 mb-8">
                        <img
                            src={logo}
                            alt="Deepmind"
                            className="w-24 h-24 object-contain"
                        />
                        <img src={deepmindLogo} alt="Deepmind" className="h-10 w-auto" />
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4 text-center">
                        {view === 'login' ? 'Welcome Back' : 'Join Deepmind'}
                    </h1>
                    <p className="text-lg text-gray-300 mb-10 text-center">
                        {view === 'login'
                            ? 'Sign in to access your productivity hub and continue building great habits.'
                            : 'Create your account to unlock AI-powered productivity, health tracking, and deep focus tools.'}
                    </p>

                    {/* Feature Pills */}
                    <div className="space-y-5">
                        {NARRATIVES.map((item, i) => (
                            <div key={i} className="flex items-center gap-4 group">
                                <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 group-hover:scale-105 transition-all shadow-lg">
                                    <item.icon size={22} />
                                </div>
                                <div>
                                    <p className="text-white font-semibold">{item.title}</p>
                                    <p className="text-gray-400 text-sm">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer / Disclaimer */}
                    <div className="flex items-center gap-2 text-gray-500 text-xs mt-12 justify-center">
                        <Shield size={14} />
                        <span>Your data is encrypted and secure. We respect your privacy.</span>
                    </div>
                </div>

                {/* Right Panel - Form Card */}
                <div className="w-full max-w-lg relative">
                    {/* Animated wave gradient behind card */}
                    <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-500/30 via-blue-500/20 to-purple-500/30 rounded-3xl blur-xl opacity-60 animate-pulse" />

                    {/* Main Card */}
                    <div className="relative w-full bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 border border-white/20 animate-in slide-in-from-right-4 fade-in duration-300">
                        {/* Mobile Logo (shown on small screens) */}
                        <div className="lg:hidden flex flex-col items-center gap-4 mb-8">
                            <img src={logo} alt="Deepmind" className="w-20 h-20 object-contain" />
                            <img src={deepmindLogo} alt="Deepmind" className="h-10 w-auto" />
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
