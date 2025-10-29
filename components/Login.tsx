

import React, { useState } from 'react';
import { signInWithGoogle } from '../services/authService.ts';
import { GoogleIcon, SparklesIcon } from './icons.tsx';
// FIX: Migrated from v9 to v8 API to fix module export errors.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

const Login: React.FC = () => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleAuthError = (err: any) => {
        setLoading(false);
        if (err.code) {
            const friendlyMessage = err.code.replace('auth/', '').replace(/-/g, ' ');
            setError(friendlyMessage.charAt(0).toUpperCase() + friendlyMessage.slice(1) + '.');
        } else {
            setError('An unknown error occurred. Please try again.');
        }
    };

    const handleGoogleAuth = async () => {
        setLoading(true);
        setError(null);
        try {
            await signInWithGoogle();
        } catch (err: any) {
            handleAuthError(err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4 font-sans">
            <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 space-y-8 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
                <div className="text-center">
                    <SparklesIcon className="w-12 h-12 text-teal-600 mx-auto" />
                    <h1 className="text-3xl font-bold text-stone-900 mt-4 tracking-tight">Veravox AI CV Editor</h1>
                    <p className="mt-2 text-stone-600">Sign in to continue to your workspace</p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={handleGoogleAuth}
                        disabled={loading}
                        className="w-full flex items-center justify-center py-2.5 px-4 border border-stone-300 rounded-md shadow-sm text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                         {loading ? 'Signing in...' : (
                            <>
                                <GoogleIcon className="w-5 h-5 mr-3" />
                                Sign in with Google
                            </>
                        )}
                    </button>
                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                </div>
                 <p className="text-center text-xs text-stone-500">
                    By signing in, you agree to our terms of service.
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