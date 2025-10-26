import React, { useState, useEffect } from 'react';
import type { Betslip, UserProfile } from '../types';
import PaymentModal from './PaymentModal';
import { User } from 'firebase/auth';

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);


const calculateTimeLeft = (expiryTimestamp: number) => {
  const difference = expiryTimestamp - new Date().getTime();
  let timeLeft = { hours: 0, minutes: 0, seconds: 0 };

  if (difference > 0) {
    timeLeft = {
      hours: Math.floor(difference / (1000 * 60 * 60)),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }
  return timeLeft;
};

const Countdown: React.FC<{ expiryTimestamp: number }> = ({ expiryTimestamp }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(expiryTimestamp));

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft(expiryTimestamp));
    }, 1000);
    return () => clearTimeout(timer);
  });

  const { hours, minutes, seconds } = timeLeft;
  
  if (hours > 0 || minutes > 0 || seconds > 0) {
    return <span>{`${hours}h ${minutes}m ${seconds}s`}</span>
  }
  return <span className="text-red-500">Expired</span>;
};

interface BetslipDetailsPageProps {
    betslip: Betslip;
    isPurchased: boolean;
    onPurchase: (betslip: Betslip) => void;
    user: User | null;
    userProfile: UserProfile | null;
}

const BetslipDetailsPage: React.FC<BetslipDetailsPageProps> = ({ betslip, isPurchased, onPurchase, user, userProfile }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePurchaseClick = () => {
    if (!isPurchased) {
      setIsModalOpen(true);
    }
  };

  const handlePurchaseSuccess = () => {
    onPurchase(betslip);
  };
  
  return (
    <>
    {isModalOpen && (
        <PaymentModal 
            betslip={betslip}
            user={user}
            userProfile={userProfile}
            onClose={() => setIsModalOpen(false)}
            onPurchaseSuccess={handlePurchaseSuccess}
        />
    )}
    <div className="px-4 pb-28 space-y-6 text-white font-sans relative">
      {/* Provider Info */}
      <div className="flex items-center space-x-4">
        <img src={betslip.provider.avatarUrl} alt={betslip.provider.name} className="w-12 h-12 rounded-full object-cover" />
        <div>
          <h3 className="font-bold text-lg">{betslip.provider.name}</h3>
          <p className="text-sm text-gray-400">Subscribers • {(betslip.provider.subscribers).toLocaleString()}</p>
        </div>
      </div>

      {/* Odds, Validity, Price */}
      <div className="space-y-3">
        <div>
          <p className="text-5xl font-extrabold tracking-tighter">{betslip.odds.toFixed(2)}</p>
          <p className="text-gray-400 text-sm">Odds</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-gray-400">Validity Time • <Countdown expiryTimestamp={betslip.expiresAt} /></p>
          <p className="text-lg font-bold">{betslip.price}</p>
        </div>
      </div>

      {/* Bet Companies */}
      <div className="space-y-3">
        <h4 className="font-bold text-lg">Bet Companies</h4>
        <div className="flex items-center space-x-2">
            {betslip.sponsors.map((sponsor) => (
                <div key={sponsor.name} className="bg-[#1f844a] h-6 w-24 rounded"></div>
            ))}
        </div>
      </div>
      
      {/* Blurred Image Preview */}
      <div className="relative w-full h-80 rounded-2xl overflow-hidden flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url('${betslip.betslipImageUrl || 'https://picsum.photos/seed/blurbg/600/800'}')` }}>
          {!isPurchased && <div className="absolute inset-0 bg-black/10 backdrop-blur-md"></div>}
          <button onClick={handlePurchaseClick} className="relative z-10 flex items-center space-x-2 bg-black/40 text-white font-semibold py-3 px-6 rounded-lg hover:bg-black/60 transition-colors disabled:cursor-not-allowed" disabled={isPurchased}>
              {isPurchased ? <span className="text-sm">Unlocked</span> : <><span className="text-sm">View betslip</span><EyeIcon /></>}
          </button>
      </div>
      
      {/* Buy Button - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-[#121212]/80 backdrop-blur-sm z-20">
         <button 
            onClick={handlePurchaseClick} 
            disabled={isPurchased}
            className="w-full py-4 text-md font-bold rounded-xl bg-gradient-to-r from-[#2DD4BF] to-[#20C56A] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
        >
            {isPurchased ? <><CheckCircleIcon /> Purchased</> : 'Buy betslip'}
         </button>
      </div>

    </div>
    </>
  );
};

export default BetslipDetailsPage;