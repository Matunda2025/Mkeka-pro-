import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    AuthError
} from 'firebase/auth';

const ShieldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[#20C56A]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
    </svg>
);

const LoadingSpinner = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

const getFriendlyErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return 'Invalid email or password. Please try again.';
        case 'auth/email-already-in-use':
            return 'This email is already registered. Please log in.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters long.';
        case 'auth/operation-not-allowed':
             return 'Email/password accounts are not enabled.';
        default:
            return 'An unexpected error occurred. Please try again.';
    }
}

const LoginPage: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            // onAuthStateChanged in App.tsx will handle the redirect
        } catch (err) {
            const authError = err as AuthError;
            setError(getFriendlyErrorMessage(authError.code));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[#121212] min-h-screen font-sans text-white flex flex-col justify-center items-center p-4">
            <div className="text-center mb-8">
                <div className="flex flex-col justify-center items-center gap-4">
                    <ShieldIcon />
                    <h1 className="text-3xl font-bold">Kaka App</h1>
                    <p className="text-gray-400">Your trusted source for tips.</p>
                </div>
            </div>

            <div className="w-full max-w-sm">
                 <form onSubmit={handleSubmit} className="bg-[#1a1a1a] rounded-2xl p-8 space-y-6">
                    <h2 className="text-2xl font-bold text-center">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
                    
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#1F2921] text-white placeholder-gray-400 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#20C56A]"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#1F2921] text-white placeholder-gray-400 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#20C56A]"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center py-3.5 text-md font-bold rounded-xl bg-gradient-to-r from-[#2DD4BF] to-[#20C56A] hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {isLoading ? <LoadingSpinner /> : (isSignUp ? 'Sign Up' : 'Login')}
                    </button>
                    
                    <p className="text-sm text-center text-gray-400">
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                        <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(null); }} className="font-semibold text-[#20C56A] hover:underline ml-1">
                            {isSignUp ? 'Login' : 'Sign Up'}
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;