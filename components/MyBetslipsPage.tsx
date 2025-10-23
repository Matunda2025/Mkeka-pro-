
import React from 'react';
import type { Betslip } from '../types';
import BetslipCard from './BetslipCard';

interface MyBetslipsPageProps {
  allBetslips: Betslip[];
  purchasedBetslipIds: Set<string>;
  onSelectBetslip: (betslip: Betslip) => void;
}

const EmptyState = () => (
    <div className="text-center py-16 px-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="mt-4 text-xl font-semibold text-white">No Purchased Betslips</h3>
        <p className="mt-2 text-sm text-gray-400">You haven't purchased any betslips yet. Explore and find your next win!</p>
    </div>
);

const MyBetslipsPage: React.FC<MyBetslipsPageProps> = ({ allBetslips, purchasedBetslipIds, onSelectBetslip }) => {
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
                        <BetslipCard key={betslip.id} betslip={betslip} onView={() => onSelectBetslip(betslip)} isPurchased={true} />
                    ))}
                </div>
            )}
        </main>
    );
};

export default MyBetslipsPage;
