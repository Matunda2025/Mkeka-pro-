import React, { useState, useEffect, useCallback } from 'react';

interface CarouselProps {
  images: string[];
}

const Carousel: React.FC<CarouselProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    if (images.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 3000);
    return () => clearInterval(slideInterval);
  }, [nextSlide]);

  if (!images || images.length === 0) {
    return (
      <div className="relative w-full h-56 md:h-64 rounded-xl overflow-hidden bg-[#1F2921] flex items-center justify-center">
        <p className="text-gray-400">No promotional banners available.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-56 md:h-64 rounded-xl overflow-hidden">
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Slide ${index + 1}`}
            className="w-full h-full object-cover flex-shrink-0"
          />
        ))}
      </div>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentIndex === index ? 'w-6 bg-[#20C56A]' : 'w-2 bg-gray-500'
            }`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
