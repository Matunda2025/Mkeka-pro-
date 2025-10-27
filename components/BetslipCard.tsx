import React, { useState, useEffect } from 'react';
import type { Betslip } from '../types';

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

interface BetslipCardProps {
    betslip: Betslip;
    onView: () => void;
    isPurchased?: boolean;
}

const BetslipCard: React.FC<BetslipCardProps> = ({ betslip, onView, isPurchased = false }) => {
  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-4 space-y-4 text-white font-sans">
      {/* Card Header */}
      <div className="flex items-center space-x-4">
        <img src={betslip.provider.avatarUrl} alt={betslip.provider.name} className="w-12 h-12 rounded-full object-cover" />
        <div>
          <h3 className="font-bold text-lg">{betslip.provider.name}</h3>
          <p className="text-sm text-gray-400">Subscribers • {betslip.provider.subscribers.toLocaleString()}</p>
        </div>
      </div>

      {/* Odds and Status */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-5xl font-extrabold tracking-tighter">{betslip.odds.toFixed(2)}</p>
          <p className="text-gray-400 text-sm mb-2">Odds</p>
          <div className="flex items-center space-x-2">
            {betslip.sponsors.map(sponsor => (
              <div key={sponsor.name} className={`h-6 flex items-center justify-center rounded px-2 text-white font-bold text-xs ${
                sponsor.name === 'SportyBet' ? 'bg-red-600' :
                sponsor.name === 'PARIPESA' ? 'bg-blue-600' :
                'bg-gray-700'
              }`}>
                {sponsor.name === 'Sokabet' ? (
                  // Using a text approximation for the logo
                  <span className="italic opacity-90">Sokabet</span>
                ) : (
                  <span>{sponsor.name}</span>
                )}
              </div>
            ))}
          </div>
        </div>
        <span className={`text-white text-xs font-semibold px-3 py-1 rounded-full capitalize ${isPurchased ? 'bg-purple-600' : 'bg-[#1f844a]'}`}>
            {isPurchased ? 'Purchased' : betslip.status}
        </span>
      </div>

      {/* Details and Price */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-sm text-gray-400">Validity Time • <Countdown expiryTimestamp={betslip.expiresAt} /></p>
        </div>
        <p className="text-2xl font-bold">{betslip.price}</p>
      </div>

      {/* Footer Button */}
      <button onClick={onView} className="w-full py-3.5 text-md font-bold rounded-xl bg-gradient-to-r from-[#2DD4BF] to-[#20C56A] hover:opacity-90 transition-opacity">
        View betslips
      </button>
    </div>
  );
};

export default BetslipCard;