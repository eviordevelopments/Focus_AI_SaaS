import { useState } from 'react';
import { useLoginMutation } from '../../features/api/apiSlice';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../features/auth/authSlice';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export function LoginPage({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [login, { isLoading, error }] = useLoginMutation();
    const dispatch = useDispatch();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const user = await login({ email, password }).unwrap();
            dispatch(setCredentials({ user }));
        } catch (err) {
            console.error('Login failed', err);
        }
    };

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold text-white mb-1">Welcome Back</h2>
            <p className="text-gray-400 text-sm mb-8">Sign in to Deepmind</p>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="text-sm font-medium text-gray-300 block mb-2">Email Address</label>
                    <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all backdrop-blur-sm"
                        required
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-300 block mb-2">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all backdrop-blur-sm pr-12"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500/50"
                        />
                        <span className="text-gray-400">Remember me</span>
                    </label>
                    <button type="button" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">Forgot password?</button>
                </div>

                {error && <div className="text-red-400 text-sm p-3 bg-red-500/10 rounded-xl border border-red-500/20">Invalid email or password</div>}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-3.5 rounded-full transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 flex justify-center active:scale-[0.98] mt-2"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
                </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-400">
                Don't have an account?{' '}
                <button onClick={onSwitchToRegister} className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
                    Sign up
                </button>
            </div>
        </div>
    );
}
