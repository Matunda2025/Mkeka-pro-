import React from 'react';
import type { Tipster } from '../types';
import TipsterCard from './TipsterCard';

interface SubscribePageProps {
  allTipsters: Tipster[];
  subscribedTipsterIds: Set<string>;
  onToggleSubscription: (tipsterId: string) => void;
}

const EmptyState = () => (
    <div className="text-center py-16 px-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <h3 className="mt-4 text-xl font-semibold text-white">No Subscriptions Yet</h3>
        <p className="mt-2 text-sm text-gray-400">Follow your favorite tipsters to see them here!</p>
    </div>
);

const SubscribePage: React.FC<SubscribePageProps> = ({ allTipsters, subscribedTipsterIds, onToggleSubscription }) => {
    const subscribedTipsters = allTipsters.filter(tipster => subscribedTipsterIds.has(tipster.id));

    return (
        <main className="px-4 space-y-4">
            {subscribedTipsters.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {subscribedTipsters.map((tipster) => (
                        <TipsterCard 
                            key={tipster.id} 
                            tipster={tipster}
                            isSubscribed={true}
                            onSubscribeToggle={() => onToggleSubscription(tipster.id)}
                        />
                    ))}
                </div>
            )}
        </main>
    );
};

export default SubscribePage;