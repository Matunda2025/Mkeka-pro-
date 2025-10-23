import React from 'react';
import { User } from 'firebase/auth';

// Icons for the menu items
const MyBetslipsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5z" />
    </svg>
);

const BetHistoryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const PaymentHistoryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
);

const ProfileSettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
);

interface UserProfileProps {
  user: User | null;
}
const UserProfile: React.FC<UserProfileProps> = ({ user }) => (
  <div className="flex flex-col items-center p-6 bg-[#1a1a1a] rounded-2xl">
    <img 
      src={user?.photoURL || `https://picsum.photos/seed/${user?.uid || 'default_user'}/100`}
      alt="User Avatar" 
      className="w-24 h-24 rounded-full object-cover border-4 border-[#20C56A]" 
    />
    <h2 className="mt-4 text-2xl font-bold text-white">{user?.displayName || 'Kaka User'}</h2>
    <p className="text-sm text-gray-400">{user?.email}</p>
  </div>
);

interface MenuItemProps {
    icon: React.ReactNode;
    text: string;
    onClick?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, text, onClick }) => (
  <button onClick={onClick} className="flex items-center w-full p-4 bg-[#1a1a1a] rounded-lg text-left hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#20C56A]">
    <div className="mr-4 text-[#20C56A]">
      {icon}
    </div>
    <span className="flex-grow font-semibold text-white">{text}</span>
    <ChevronRightIcon />
  </button>
);

interface AccountPageProps {
    user: User | null;
    onLogout: () => void;
    onNavigateToMyBetslips: () => void;
}

const AccountPage: React.FC<AccountPageProps> = ({ user, onLogout, onNavigateToMyBetslips }) => {
  const handleMenuItemClick = (itemName: string) => {
    // In a real app, this would navigate to a new page.
    alert(`This feature (${itemName}) is coming soon!`);
  };
  
  return (
    <main className="px-4 space-y-6">
      <UserProfile user={user} />
      <div className="space-y-3">
        <MenuItem icon={<MyBetslipsIcon />} text="My Betslips" onClick={onNavigateToMyBetslips} />
        <MenuItem icon={<BetHistoryIcon />} text="Bet History" onClick={() => handleMenuItemClick('Bet History')} />
        <MenuItem icon={<PaymentHistoryIcon />} text="Payment History" onClick={() => handleMenuItemClick('Payment History')} />
        <MenuItem icon={<ProfileSettingsIcon />} text="Profile Settings" onClick={() => handleMenuItemClick('Profile Settings')} />
      </div>
      <div className="pt-4">
         <button 
           onClick={onLogout} 
           className="flex items-center justify-center w-full p-4 bg-red-900/40 text-red-400 rounded-lg hover:bg-red-900/60 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
         >
            <LogoutIcon />
            <span className="ml-3 font-bold">Logout</span>
        </button>
      </div>
    </main>
  );
};

export default AccountPage;
