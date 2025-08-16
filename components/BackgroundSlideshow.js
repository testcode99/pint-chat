// Manages the full-screen background image slideshow with a fixed (non-scrolling) position.
import React, { useState, useEffect } from 'react';

const BackgroundSlideshow = ({ images }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [shuffledImages, setShuffledImages] = useState([]);

  useEffect(() => {
    if (images && images.length > 0) {
      setShuffledImages([...images].sort(() => 0.5 - Math.random()));
    }
  }, [images]);

  useEffect(() => {
    if (shuffledImages.length < 2) return;

    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % shuffledImages.length);
        setIsFading(false);
      }, 3); // Fade duration
    }, 750); // Time each image is visible

    return () => clearInterval(interval);
  }, [shuffledImages]);

  if (shuffledImages.length === 0) {
    return <div className="fixed inset-0 bg-beer-dark z-0" />;
  }

  return (
    <div className="fixed inset-0 w-full h-full z-0 overflow-hidden">
      {shuffledImages.map((image, index) => (
        <div
          key={image + '-bg'}
          className="absolute w-full h-full transition-opacity duration-300"
          style={{
            opacity: index === currentImageIndex && !isFading ? 1 : 0,
            backgroundImage: `url(/${image})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover', // This layer covers the whole area
            // --- UPDATED: Brightness filter removed ---
            filter: 'blur(20px)', 
            transform: `scale(1.1)`, // Scale up to hide blurry edges
          }}
        />
      ))}
      {shuffledImages.map((image, index) => (
         <div
          key={image + '-fg'}
          className="absolute w-full h-full transition-opacity duration-300"
          style={{
            opacity: index === currentImageIndex && !isFading ? 1 : 0,
            backgroundImage: `url(/${image})`,
            backgroundPosition: 'center',
            backgroundSize: 'contain', // This layer shows the full image
            backgroundRepeat: 'no-repeat',
          }}
        />
      ))}
      {/* --- UPDATED: Overlay opacity reduced for more brightness --- */}
      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
};

export default BackgroundSlideshow;
