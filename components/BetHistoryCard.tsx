import React from 'react';
import type { Betslip } from '../types';

type BetStatus = 'Won' | 'Lost' | 'Pending';

const getStatus = (expiresAt: number): BetStatus => {
    if (Date.now() > expiresAt) {
        // Simple pseudo-random logic based on ID to make it deterministic
        const idNumber = parseInt(expiresAt.toString().slice(-4));
        return idNumber % 2 === 0 ? 'Won' : 'Lost';
    }
    return 'Pending';
};

const StatusBadge: React.FC<{ status: BetStatus }> = ({ status }) => {
    const baseClasses = "text-white text-xs font-semibold px-3 py-1 rounded-full capitalize";
    const statusClasses = {
        Won: 'bg-green-600',
        Lost: 'bg-red-600',
        Pending: 'bg-gray-600',
    };
    return (
        <span className={`${baseClasses} ${statusClasses[status]}`}>
            {status}
        </span>
    );
};

interface BetHistoryCardProps {
    betslip: Betslip;
    onView: () => void;
}

const BetHistoryCard: React.FC<BetHistoryCardProps> = ({ betslip, onView }) => {
    const status = getStatus(betslip.expiresAt);
    const priceAmount = parseInt(betslip.price.replace(/[^0-9]/g, ''), 10);
    const potentialWinnings = (betslip.odds * priceAmount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    return (
        <div className="bg-[#1a1a1a] rounded-2xl p-4 space-y-3 text-white font-sans" onClick={onView} role="button" tabIndex={0}>
            {/* Card Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <img src={betslip.provider.avatarUrl} alt={betslip.provider.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                        <h3 className="font-bold">{betslip.provider.name}</h3>
                        <p className="text-xs text-gray-400">
                            {new Date(betslip.expiresAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                </div>
                <StatusBadge status={status} />
            </div>

            {/* Odds and Winnings */}
            <div className="flex justify-around items-center text-center bg-black/30 p-3 rounded-lg">
                <div>
                    <p className="text-2xl font-extrabold tracking-tighter">{betslip.odds.toFixed(2)}</p>
                    <p className="text-gray-400 text-xs">Odds</p>
                </div>
                <div>
                    <p className="text-2xl font-extrabold tracking-tighter">{priceAmount.toLocaleString()}</p>
                    <p className="text-gray-400 text-xs">Stake (Tzs)</p>
                </div>
                <div>
                    <p className={`text-2xl font-extrabold tracking-tighter ${status === 'Won' ? 'text-green-400' : 'text-white'}`}>
                        {potentialWinnings}
                    </p>
                    <p className="text-gray-400 text-xs">Winnings (Tzs)</p>
                </div>
            </div>
        </div>
    );
};

export default BetHistoryCard;
