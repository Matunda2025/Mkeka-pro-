import React from 'react';
import type { Tipster } from '../types';

interface TipsterCardProps {
  tipster: Tipster;
  isSubscribed: boolean;
  onSubscribeToggle: () => void;
}

const TipsterCard: React.FC<TipsterCardProps> = ({ tipster, isSubscribed, onSubscribeToggle }) => {
  return (
    <div className="relative w-40 h-56 flex-shrink-0 rounded-xl overflow-hidden text-white shadow-lg">
      <img src={tipster.imageUrl} alt={tipster.name} className="w-full h-full object-cover" />
      <div
        className={`absolute inset-0 bg-gradient-to-t ${tipster.gradientFrom} ${tipster.gradientVia} to-transparent opacity-80`}
      ></div>
      <div className="absolute inset-0 p-3 flex flex-col justify-end">
        <h3 className="font-semibold text-sm">{tipster.name}</h3>
        <p className="text-4xl font-extrabold tracking-tighter">{tipster.accuracy.toFixed(2)}%</p>
        <p className="text-xs text-gray-300 mb-2">Accuracy</p>
        <button 
            onClick={onSubscribeToggle}
            className={`w-full py-2 text-sm font-bold rounded-full transition-colors ${
                isSubscribed
                ? 'bg-gray-700/80 text-gray-300 hover:bg-gray-600'
                : 'bg-[#20C56A] hover:bg-green-700'
            }`}
        >
          {isSubscribed ? 'Subscribed' : 'Subscribe'}
        </button>
      </div>
    </div>
  );
};

export default TipsterCard;