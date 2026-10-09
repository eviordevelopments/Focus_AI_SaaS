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
    const [validationError, setValidationError] = useState('');
    const [login, { isLoading, error }] = useLoginMutation();
    const dispatch = useDispatch();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError('');
        
        if (!email.trim() || !password) {
            setValidationError('Please fill out all fields.');
            return;
        }
        
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

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div>
                    <label className="text-sm font-medium text-gray-300 block mb-2">Email Address</label>
                    <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full bg-white/5 border ${validationError && !email.trim() ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all backdrop-blur-sm`}
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
                            className={`w-full bg-white/5 border ${validationError && !password ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all backdrop-blur-sm pr-12`}
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

                {(error || validationError) && (
                    <div className={`text-sm p-3 rounded-xl border ${error && 'status' in error && error.status === 'FETCH_ERROR'
                            ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                            : 'text-red-400 bg-red-500/10 border-red-500/20'
                        }`}>
                        {validationError || (error && 'status' in error && error.status === 'FETCH_ERROR'
                            ? 'Unable to connect to server. Please check your internet or server status.'
                            : 'Invalid email or password'
                        )}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-700 hover:bg-blue-600 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-700/40 hover:shadow-blue-700/60 flex justify-center active:scale-[0.98] mt-2"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
                </button>
            </form>

            <div className="relative flex items-center py-6">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-gray-500 text-sm">or continue with</span>
                <div className="flex-grow border-t border-white/10"></div>
            </div>

            <button
                type="button"
                className="w-full bg-white text-gray-900 font-semibold py-3.5 rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center shadow-lg active:scale-[0.98]"
            >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
            </button>

            <div className="mt-8 text-center text-sm text-gray-400">
                Don't have an account?{' '}
                <button onClick={onSwitchToRegister} className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
                    Sign up
                </button>
            </div>
        </div>
    );
}
