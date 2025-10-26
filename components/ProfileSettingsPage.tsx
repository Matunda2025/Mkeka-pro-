import React, { useState, useRef, useEffect } from 'react';
import { User } from 'firebase/auth';
import { UserProfile } from '../types';

const LoadingSpinnerIcon = () => <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

interface ProfileSettingsPageProps {
    user: User | null;
    userProfile: UserProfile | null;
    onUpdateProfile: (displayName: string, photoFile: string, phoneNumber: string) => Promise<void>;
    onChangePassword: () => Promise<void>;
}

const ProfileSettingsPage: React.FC<ProfileSettingsPageProps> = ({ user, userProfile, onUpdateProfile, onChangePassword }) => {
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [photoFile, setPhotoFile] = useState<string>('');
    const [photoPreview, setPhotoPreview] = useState<string | null>(user?.photoURL || null);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Update local state if user prop changes (e.g., after initial load or external update)
        setDisplayName(user?.displayName || '');
        setPhoneNumber(userProfile?.phoneNumber || '');
        setPhotoPreview(user?.photoURL || null);
    }, [user, userProfile]);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoFile(reader.result as string);
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const clearMessages = () => {
        setSuccessMessage(null);
        setErrorMessage(null);
    };

    const handleSaveChanges = async (e: React.FormEvent) => {
        e.preventDefault();
        clearMessages();
        setIsLoading(true);
        try {
            await onUpdateProfile(displayName, photoFile, phoneNumber);
            setSuccessMessage("Wasifu umesasishwa kikamilifu!");
            setPhotoFile(''); // Clear file after upload
        } catch (error) {
            setErrorMessage("Imeshindwa kusasisha wasifu. Tafadhali jaribu tena.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        clearMessages();
        try {
            await onChangePassword();
            setSuccessMessage("Barua pepe ya kubadilisha nenosiri imetumwa!");
        } catch (error) {
            setErrorMessage("Imeshindwa kutuma barua pepe ya kubadilisha nenosiri.");
        }
    };

    return (
        <main className="px-4 space-y-6">
            <form onSubmit={handleSaveChanges} className="space-y-6">
                <div className="bg-[#1a1a1a] p-5 rounded-2xl space-y-4">
                    <h3 className="text-lg font-bold border-b border-gray-700 pb-3 mb-4 text-white">Taarifa za Wasifu</h3>
                    <div className="flex flex-col items-center space-y-4">
                        <img 
                            src={photoPreview || `https://ui-avatars.com/api/?name=${displayName || user?.email}&background=20C56A&color=fff&size=128`}
                            alt="Profile"
                            className="w-28 h-28 rounded-full object-cover border-4 border-[#20C56A]"
                        />
                         <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            ref={fileInputRef}
                            className="hidden"
                        />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm font-semibold text-[#20C56A] hover:underline">
                            Badilisha Picha
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Jina la Kuonyesha</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full bg-[#1F2921] text-white placeholder-gray-400 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#20C56A]"
                            placeholder="Weka jina lako"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Barua Pepe</label>
                        <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="w-full bg-[#2a2a2a] text-gray-400 rounded-lg py-3 px-4 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Namba ya Simu</label>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full bg-[#1F2921] text-white placeholder-gray-400 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#20C56A]"
                            placeholder="Mfano: 0712345678"
                        />
                    </div>
                </div>

                <div className="bg-[#1a1a1a] p-5 rounded-2xl space-y-4">
                     <h3 className="text-lg font-bold border-b border-gray-700 pb-3 mb-4 text-white">Usalama</h3>
                     <button type="button" onClick={handlePasswordReset} className="w-full text-center text-sm font-semibold text-blue-400 hover:text-blue-300">
                        Badilisha Nenosiri
                    </button>
                </div>
                
                {successMessage && <p className="text-green-400 text-sm text-center">{successMessage}</p>}
                {errorMessage && <p className="text-red-400 text-sm text-center">{errorMessage}</p>}

                <div className="pt-2">
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center py-4 text-md font-bold rounded-xl bg-gradient-to-r from-[#2DD4BF] to-[#20C56A] hover:opacity-90 transition-opacity disabled:opacity-50">
                        {isLoading ? <LoadingSpinnerIcon /> : 'Hifadhi Mabadiliko'}
                    </button>
                </div>

            </form>
        </main>
    );
};

export default ProfileSettingsPage;