import React from 'react';
import type { Betslip } from '../types';
import BetslipCard from './BetslipCard';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#20C56A]"></div>
  </div>
);

const EmptyState = () => (
    <div className="text-center py-16 px-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <h3 className="mt-4 text-xl font-semibold text-white">No Betslips Available</h3>
        <p className="mt-2 text-sm text-gray-400">Please check back later for new betslips.</p>
    </div>
);

interface BetslipsPageProps {
  betslips: Betslip[];
  isLoading: boolean;
  onSelectBetslip: (betslip: Betslip) => void;
  purchasedBetslipIds: Set<string>;
}

const BetslipsPage: React.FC<BetslipsPageProps> = ({ betslips, isLoading, onSelectBetslip, purchasedBetslipIds }) => {
  return (
    <main className="px-4 space-y-4">
       {isLoading ? (
        <LoadingSpinner />
      ) : betslips.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {betslips.map((betslip) => (
            <BetslipCard 
                key={betslip.id} 
                betslip={betslip} 
                onView={() => onSelectBetslip(betslip)}
                isPurchased={purchasedBetslipIds.has(betslip.id)}
            />
          ))}
        </div>
      )}
    </main>
  );
};

export default BetslipsPage;
