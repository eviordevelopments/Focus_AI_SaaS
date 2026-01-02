import { useEffect, useState, useRef } from 'react';
import logo from '../assets/logo.png';
import deepmindLogo from '../assets/deepmind.png';

interface WelcomeSplashProps {
    userName: string;
    onComplete: () => void;
}

export function WelcomeSplash({ userName, onComplete }: WelcomeSplashProps) {
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState<'welcome' | 'loading' | 'exit'>('welcome');
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Letter-by-letter animation control
    const welcomeText = `Welcome, ${userName}`;
    const [visibleLetters, setVisibleLetters] = useState(0);

    useEffect(() => {
        // Confetti effect
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;

                const particles: any[] = [];
                for (let i = 0; i < 150; i++) {
                    particles.push({
                        x: canvas.width / 2,
                        y: canvas.height / 2,
                        size: Math.random() * 8 + 4,
                        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
                        vx: (Math.random() - 0.5) * 20,
                        vy: (Math.random() - 0.5) * 20 - 10,
                        gravity: 0.5,
                        life: 1
                    });
                }

                const animate = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    particles.forEach((p, i) => {
                        p.x += p.vx;
                        p.y += p.vy;
                        p.vy += p.gravity;
                        p.life -= 0.01;
                        if (p.life <= 0) {
                            particles.splice(i, 1);
                        } else {
                            ctx.globalAlpha = p.life;
                            ctx.fillStyle = p.color;
                            ctx.beginPath();
                            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    });
                    if (particles.length > 0) requestAnimationFrame(animate);
                };
                animate();
            }
        }

        // Letter animation timer
        const letterTimer = setInterval(() => {
            setVisibleLetters(prev => {
                if (prev >= welcomeText.length) {
                    clearInterval(letterTimer);
                    // Move to loading phase after welcome
                    setTimeout(() => setPhase('loading'), 1000);
                    return prev;
                }
                return prev + 1;
            });
        }, 80);

        return () => clearInterval(letterTimer);
    }, [welcomeText, userName]);

    useEffect(() => {
        if (phase === 'loading') {
            const loadingTimer = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(loadingTimer);
                        setTimeout(() => {
                            setPhase('exit');
                            setTimeout(onComplete, 800);
                        }, 500);
                        return 100;
                    }
                    return prev + 1.2; // roughly 2.5-3 seconds
                });
            }, 30);
            return () => clearInterval(loadingTimer);
        }
    }, [phase, onComplete]);

    return (
        <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-900 overflow-hidden transition-all duration-1000 ${phase === 'exit' ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100'}`}>
            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

            {/* Background Gradient Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full animate-pulse" />

            {/* Logo Center Box */}
            <div className="relative flex flex-col items-center gap-8 animate-in zoom-in-95 duration-1000">
                <div className="flex flex-col items-center gap-4">
                    <img src={logo} alt="Deepmind" className="w-32 h-32 object-contain drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]" />
                    <img src={deepmindLogo} alt="Deepmind" className="h-10 w-auto" />
                </div>

                {/* Animated Welcome Message */}
                <div className="h-20 flex items-center justify-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight flex">
                        {welcomeText.split('').map((letter, i) => (
                            <span
                                key={i}
                                className={`transition-all duration-500 ${i < visibleLetters ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                                style={{ transitionDelay: `${i * 20}ms` }}
                            >
                                {letter === ' ' ? '\u00A0' : letter}
                            </span>
                        ))}
                    </h1>
                </div>

                {/* Loading State */}
                <div className={`w-80 space-y-4 transition-all duration-700 ${phase === 'loading' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
                    <div className="text-gray-400 text-sm font-medium text-center animate-pulse">
                        Setting up your profile for deep focus...
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 backdrop-blur-sm">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-100 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                        <span>Optimizing Architecture</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                </div>
            </div>

            {/* Apple style light flare */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent blur-sm" />
        </div>
    );
}
