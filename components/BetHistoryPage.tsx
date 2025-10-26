import React from 'react';
import type { Betslip } from '../types';
import BetHistoryCard from './BetHistoryCard';

interface BetHistoryPageProps {
  allBetslips: Betslip[];
  purchasedBetslipIds: Set<string>;
  onSelectBetslip: (betslip: Betslip) => void;
}

const EmptyState = () => (
    <div className="text-center py-16 px-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-4 text-xl font-semibold text-white">Hamna Historia ya Mikeka</h3>
        <p className="mt-2 text-sm text-gray-400">Haujanunua mkeka wowote bado. Mikeka uliyonunua itaonekana hapa.</p>
    </div>
);

const BetHistoryPage: React.FC<BetHistoryPageProps> = ({ allBetslips, purchasedBetslipIds, onSelectBetslip }) => {
    const purchasedBetslips = allBetslips.filter(slip => purchasedBetslipIds.has(slip.id));

    // Sort by expiration date, most recent first
    purchasedBetslips.sort((a, b) => b.expiresAt - a.expiresAt);

    return (
        <main className="px-4 space-y-4">
            {purchasedBetslips.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="space-y-4">
                    {purchasedBetslips.map((betslip) => (
                        <BetHistoryCard key={betslip.id} betslip={betslip} onView={() => onSelectBetslip(betslip)} />
                    ))}
                </div>
            )}
        </main>
    );
};

export default BetHistoryPage;
