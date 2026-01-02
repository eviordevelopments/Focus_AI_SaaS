import { useState } from 'react';
import { useRegisterMutation } from '../../features/api/apiSlice';
import deepmindLogo from '../../assets/deepmind.png';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../features/auth/authSlice';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export function RegisterPage({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [register, { isLoading, error }] = useRegisterMutation();
    const dispatch = useDispatch();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords don't match");
            return;
        }
        if (!agreedToTerms) {
            alert("Please agree to the Terms of Service");
            return;
        }
        try {
            const user = await register({ name, email, password }).unwrap();
            dispatch(setCredentials({ user }));
        } catch (err) {
            console.error('Registration failed', err);
        }
    };

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold text-white mb-1">Create Account</h2>
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-6">
                Get started with <img src={deepmindLogo} alt="Deepmind" className="h-10 w-auto translate-y-[1px]" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-300 block mb-2">Full Name</label>
                    <input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all backdrop-blur-sm"
                        required
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-300 block mb-2">Email Address</label>
                    <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all backdrop-blur-sm"
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
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all backdrop-blur-sm pr-12"
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

                <div>
                    <label className="text-sm font-medium text-gray-300 block mb-2">Confirm Password</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all backdrop-blur-sm"
                        required
                    />
                </div>

                <label className="flex items-start gap-3 cursor-pointer text-sm pt-1">
                    <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500/50"
                    />
                    <span className="text-gray-400">
                        I agree to the <button type="button" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">Terms of Service</button> and <button type="button" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">Privacy Policy</button>
                    </span>
                </label>

                {error && <div className="text-red-400 text-sm p-3 bg-red-500/10 rounded-xl border border-red-500/20">Account creation failed. Please try again.</div>}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-3.5 rounded-full transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 flex justify-center active:scale-[0.98] mt-2"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
                </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-400">
                Already have an account?{' '}
                <button onClick={onSwitchToLogin} className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
                    Sign in
                </button>
            </div>
        </div>
    );
}
