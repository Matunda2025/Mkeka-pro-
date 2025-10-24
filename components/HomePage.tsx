import React from 'react';
import Carousel from './Carousel';
import TipsterCard from './TipsterCard';
import type { Tipster } from '../types';

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const TrendingUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

interface HomePageProps {
  tipsters: Tipster[];
  subscribedTipsterIds: Set<string>;
  onToggleSubscription: (tipsterId: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ tipsters, subscribedTipsterIds, onToggleSubscription }) => {
  const topTipsters = tipsters.slice(0, 4);
  const tipstersToFollow = tipsters.slice(4);

  return (
    <main className="px-4 space-y-6">
        {/* Carousel */}
        <Carousel />

        {/* Search Bar */}
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SearchIcon />
            </div>
            <input
                type="text"
                placeholder="Search for tipster"
                className="w-full bg-[#1F2921] text-white placeholder-gray-400 rounded-full py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-[#20C56A]"
            />
        </div>
        
        {/* Top Tipsters Section */}
        <section>
            <div className="flex items-center space-x-2 mb-2">
                <h2 className="text-xl font-bold">Top Tipsters</h2>
                <TrendingUpIcon />
            </div>
            <div className="flex overflow-x-auto space-x-4 py-2 scrollbar-hide">
                {topTipsters.map(tipster => (
                    <TipsterCard 
                        key={tipster.id} 
                        tipster={tipster}
                        isSubscribed={subscribedTipsterIds.has(tipster.id)}
                        onSubscribeToggle={() => onToggleSubscription(tipster.id)}
                    />
                ))}
            </div>
        </section>
        
        {/* Tipsters to follow Section */}
        <section>
            <h2 className="text-xl font-bold mb-2">Tipsters to follow</h2>
            <div className="flex overflow-x-auto space-x-4 py-2 scrollbar-hide">
                {tipstersToFollow.map(tipster => (
                    <TipsterCard 
                        key={tipster.id} 
                        tipster={tipster} 
                        isSubscribed={subscribedTipsterIds.has(tipster.id)}
                        onSubscribeToggle={() => onToggleSubscription(tipster.id)}
                    />
                ))}
            </div>
        </section>
    </main>
  );
};

export default HomePage;