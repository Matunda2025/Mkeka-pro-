import React from 'react';
import type { Betslip, Purchase } from '../types';

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

interface PaymentHistoryCardProps {
    betslip: Betslip;
    purchase: Purchase;
}

const PaymentHistoryCard: React.FC<PaymentHistoryCardProps> = ({ betslip, purchase }) => {
    
    const purchaseDate = new Date(purchase.purchasedAt.seconds * 1000);
    const formattedDate = purchaseDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
    const formattedTime = purchaseDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });

    return (
        <div className="bg-[#1a1a1a] rounded-2xl p-4 text-white font-sans flex items-center space-x-4">
            <CheckCircleIcon />
            <div className="flex-grow">
                <p className="font-bold">Umenunua mkeka kutoka kwa {betslip.provider.name}</p>
                <p className="text-xs text-gray-400">{formattedDate} at {formattedTime}</p>
            </div>
            <div className="text-right">
                <p className="font-bold text-lg text-green-400">{betslip.price}</p>
                <p className="text-xs text-gray-500">Imekamilika</p>
            </div>
        </div>
    );
};

export default PaymentHistoryCard;