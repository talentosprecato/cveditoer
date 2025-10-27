

import React, { useState } from 'react';
import { signInWithGoogle, signInWithFacebook, signUpWithEmail, logInWithEmail } from '../services/authService.ts';
import { FacebookIcon, GoogleIcon, MailIcon, SparklesIcon } from './icons.tsx';
import { getAuth, fetchSignInMethodsForEmail, GoogleAuthProvider } from 'firebase/auth';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isLoginView, setIsLoginView] = useState(true);

    const handleAuthError = (err: any) => {
        setLoading(false);
        if (err.code) {
            const friendlyMessage = err.code.replace('auth/', '').replace(/-/g, ' ');
            setError(friendlyMessage.charAt(0).toUpperCase() + friendlyMessage.slice(1) + '.');
        } else {
            setError('An unknown error occurred. Please try again.');
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (isLoginView) {
                await logInWithEmail(email, password);
            } else {
                await signUpWithEmail(email, password);
            }
        } catch (err) {
            handleAuthError(err);
        }
    };

    const handleSocialAuth = async (provider: 'google' | 'facebook') => {
        setLoading(true);
        setError(null);
        try {
            if (provider === 'google') {
                await signInWithGoogle();
            } else {
                await signInWithFacebook();
            }
        } catch (err: any) {
            if (err.code === 'auth/account-exists-with-different-credential') {
                const email = err.customData.email;
                const auth = getAuth();
                fetchSignInMethodsForEmail(auth, email)
                    .then((methods) => {
                        if (methods.includes(GoogleAuthProvider.PROVIDER_ID)) {
                            setError("This email is already associated with a Google account. Please sign in with Google.");
                        } else if (methods.includes('password')) {
                            setError("This email is already registered. Please sign in using your email and password.");
                        } else {
                            setError("An account with this email already exists. Please use your original login method.");
                        }
                    })
                    .catch(() => {
                        // Fallback to the generic handler if fetching methods fails
                        handleAuthError(err);
                    })
                    .finally(() => {
                        setLoading(false);
                    });
            } else {
                handleAuthError(err);
            }
        }
    };

    const SocialButton: React.FC<{ provider: 'google' | 'facebook', onClick: () => void, children: React.ReactNode, disabled: boolean }> = ({ provider, onClick, children, disabled }) => {
        const icons = {
            google: <GoogleIcon className="w-5 h-5" />,
            facebook: <FacebookIcon className="w-5 h-5 text-white" />,
        };
        const styles = {
            google: 'bg-white text-stone-700 hover:bg-stone-50 border-stone-300',
            facebook: 'bg-blue-600 text-white hover:bg-blue-700 border-transparent',
        };
        return (
            <button
                onClick={onClick}
                disabled={disabled}
                className={`w-full flex items-center justify-center py-2.5 px-4 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${styles[provider]}`}
            >
                <span className="mr-3">{icons[provider]}</span>
                {children}
            </button>
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4 font-sans">
            <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 space-y-6 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
                <div className="text-center">
                    <SparklesIcon className="w-12 h-12 text-indigo-600 mx-auto" />
                    <h1 className="text-3xl font-bold text-stone-900 mt-4 tracking-tight">Veravox AI CV Editor</h1>
                    <p className="mt-2 text-stone-600">{isLoginView ? 'Sign in to continue' : 'Create your account'}</p>
                </div>

                <div className="space-y-3">
                    <SocialButton provider="google" onClick={() => handleSocialAuth('google')} disabled={loading}>Sign in with Google</SocialButton>
                    <SocialButton provider="facebook" onClick={() => handleSocialAuth('facebook')} disabled={loading}>Sign in with Facebook</SocialButton>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-stone-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-stone-500">Or continue with</span>
                    </div>
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="sr-only">Email address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white/50"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="sr-only">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete={isLoginView ? 'current-password' : 'new-password'}
                            required
                            minLength={6}
                            className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white/50"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                    >
                        {loading ? '...' : (isLoginView ? 'Login' : 'Create Account')}
                    </button>
                </form>

                <p className="text-center text-sm text-stone-600">
                    {isLoginView ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => { setIsLoginView(!isLoginView); setError(null); }} className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none">
                        {isLoginView ? 'Sign up' : 'Login'}
                    </button>
                </p>
            </div>
            <style>{`
                @keyframes fade-in-scale {
                  from {
                    transform: scale(0.95);
                    opacity: 0;
                  }
                  to {
                    transform: scale(1);
                    opacity: 1;
                  }
                }
                .animate-fade-in-scale {
                  animation: fade-in-scale 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Login;