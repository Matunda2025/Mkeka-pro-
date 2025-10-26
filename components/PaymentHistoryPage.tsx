import React from 'react';
import type { Betslip, Purchase } from '../types';
import PaymentHistoryCard from './PaymentHistoryCard';

interface PaymentHistoryPageProps {
  allBetslips: Betslip[];
  purchaseHistory: Purchase[];
}

const EmptyState = () => (
    <div className="text-center py-16 px-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
             <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <h3 className="mt-4 text-xl font-semibold text-white">Hamna Historia ya Malipo</h3>
        <p className="mt-2 text-sm text-gray-400">Malipo yote yaliyofanikiwa yataonekana hapa.</p>
    </div>
);

const PaymentHistoryPage: React.FC<PaymentHistoryPageProps> = ({ allBetslips, purchaseHistory }) => {
    const betslipsMap = new Map(allBetslips.map(slip => [slip.id, slip]));

    return (
        <main className="px-4 space-y-4">
            {purchaseHistory.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="space-y-3">
                    {purchaseHistory.map((purchase) => {
                        const betslip = betslipsMap.get(purchase.betslipId);
                        if (!betslip) return null;
                        return <PaymentHistoryCard key={purchase.id} betslip={betslip} purchase={purchase} />;
                    })}
                </div>
            )}
        </main>
    );
};

export default PaymentHistoryPage;