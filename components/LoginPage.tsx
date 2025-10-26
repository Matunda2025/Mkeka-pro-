import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    AuthError
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';


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
            return 'Tafadhali ingiza barua pepe sahihi.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return 'Barua pepe au nenosiri si sahihi. Tafadhali jaribu tena.';
        case 'auth/email-already-in-use':
            return 'Barua pepe hii ishasajiliwa. Tafadhali ingia.';
        case 'auth/weak-password':
            return 'Nenosiri linapaswa kuwa na angalau herufi 6.';
        case 'auth/operation-not-allowed':
             return 'Akaunti za barua pepe/nenosiri hazijawashwa.';
        default:
            return 'Kulitokea hitilafu isiyotarajiwa. Tafadhali jaribu tena.';
    }
}

const LoginPage: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const clearMessages = () => {
        setError(null);
        setSuccessMessage(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        clearMessages();

        try {
            if (isSignUp) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                // Add user info to Firestore for tracking
                await setDoc(doc(db, "users", userCredential.user.uid), {
                    email: userCredential.user.email,
                    createdAt: serverTimestamp(),
                    uid: userCredential.user.uid,
                });
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

    const handleForgotPassword = async () => {
        if (!email) {
            clearMessages();
            setError("Tafadhali ingiza barua pepe yako ili kuweka nenosiri jipya.");
            return;
        }
        setIsLoading(true);
        clearMessages();
        try {
            await sendPasswordResetEmail(auth, email);
            setSuccessMessage("Barua pepe ya kuweka nenosiri jipya imetumwa. Tafadhali angalia kikasha chako!");
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
                    <h1 className="text-3xl font-bold">MIKEKA PRO</h1>
                    <p className="text-gray-400">Your trusted source for tips.</p>
                </div>
            </div>

            <div className="w-full max-w-sm">
                 <form onSubmit={handleSubmit} className="bg-[#1a1a1a] rounded-2xl p-8 space-y-6">
                    <h2 className="text-2xl font-bold text-center">{isSignUp ? 'Fungua Akaunti' : 'Karibu Tena'}</h2>
                    
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Barua Pepe</label>
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
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Nenosiri</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#1F2921] text-white placeholder-gray-400 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#20C56A]"
                            placeholder="••••••••"
                            required
                        />
                         {!isSignUp && (
                            <div className="text-right mt-2">
                                <button 
                                    type="button" 
                                    onClick={handleForgotPassword} 
                                    className="text-sm font-semibold text-gray-400 hover:text-[#20C56A] transition-colors disabled:opacity-50"
                                    disabled={isLoading}
                                >
                                    Umesahau Nenosiri?
                                </button>
                            </div>
                        )}
                    </div>

                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    {successMessage && <p className="text-green-400 text-sm text-center">{successMessage}</p>}


                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center py-3.5 text-md font-bold rounded-xl bg-gradient-to-r from-[#2DD4BF] to-[#20C56A] hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {isLoading ? <LoadingSpinner /> : (isSignUp ? 'Jisajili' : 'Ingia')}
                    </button>
                    
                    <p className="text-sm text-center text-gray-400">
                        {isSignUp ? 'Tayari una akaunti?' : "Huna akaunti?"}
                        <button type="button" onClick={() => { setIsSignUp(!isSignUp); clearMessages(); }} className="font-semibold text-[#20C56A] hover:underline ml-1">
                            {isSignUp ? 'Ingia' : 'Jisajili'}
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;