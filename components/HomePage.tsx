import React from 'react';
import Carousel from './Carousel';
import TipsterCard from './TipsterCard';
import type { Tipster, Banner } from '../types';

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const DollarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182.553-.44 1.282-.659 2.003-.659c.725 0 1.45.22 2.003.659C13.536 9.781 14 10.5 14 11.25" />
    </svg>
);


interface HomePageProps {
  tipsters: Tipster[];
  banners: Banner[];
  subscribedTipsterIds: Set<string>;
  onToggleSubscription: (tipsterId: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ tipsters, banners, subscribedTipsterIds, onToggleSubscription }) => {
  const topTipsters = tipsters.slice(0, 4);
  const tipstersToFollow = tipsters.slice(4);
  const bannerImages = banners.map(b => b.imageUrl);

  return (
    <main className="px-4 space-y-6">
        {/* Carousel */}
        <Carousel images={bannerImages} />

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
                <DollarIcon />
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