import React from 'react';

interface LogoutConfirmationPageProps {
    onConfirmLogout: () => void;
    onCancel: () => void;
}

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

const LogoutConfirmationPage: React.FC<LogoutConfirmationPageProps> = ({ onConfirmLogout, onCancel }) => {
    return (
        <main className="px-4 flex flex-col items-center justify-center text-center" style={{height: 'calc(100vh - 160px)'}}>
            <div className="bg-[#1a1a1a] p-8 rounded-2xl max-w-sm w-full space-y-6 shadow-lg">
                <LogoutIcon />
                <h2 className="text-2xl font-bold text-white">Unathibitisha kutoka?</h2>
                <p className="text-gray-400">
                    Utahitaji kuingia tena ili kuendelea kutumia huduma zetu.
                </p>
                <div className="flex gap-4 pt-4">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 text-md font-bold rounded-xl bg-gray-700/80 text-gray-300 hover:bg-gray-600 transition-colors"
                    >
                        Ghairi
                    </button>
                    <button
                        onClick={onConfirmLogout}
                        className="flex-1 py-3 text-md font-bold rounded-xl bg-red-900/60 text-red-300 hover:bg-red-800/80 transition-colors"
                    >
                        Thibitisha
                    </button>
                </div>
            </div>
        </main>
    );
};

export default LogoutConfirmationPage;
