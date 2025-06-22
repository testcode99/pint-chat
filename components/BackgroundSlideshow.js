// Manages the full-screen background image slideshow with a less-zoomed parallax effect.
import React, { useState, useEffect } from 'react';

const BackgroundSlideshow = ({ images }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [shuffledImages, setShuffledImages] = useState([]);
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = () => {
    setScrollPosition(window.pageYOffset);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      }, 1000);
    }, 5000);

    return () => clearInterval(interval);
  }, [shuffledImages]);

  if (shuffledImages.length === 0) {
    return <div className="fixed inset-0 bg-beer-dark z-0" />;
  }

  // Use a different parallax factor for a more subtle effect
  const parallaxTranslation = scrollPosition * 0.1;

  return (
    <div className="fixed inset-0 w-full h-full z-0 overflow-hidden">
      {shuffledImages.map((image, index) => (
        <div
          key={image + '-bg'}
          className="absolute w-full h-full transition-opacity duration-1000"
          style={{
            opacity: index === currentImageIndex && !isFading ? 1 : 0,
            backgroundImage: `url(/${image})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover', // This layer covers the whole area
            filter: 'blur(20px) brightness(0.7)', // Blur and darken it
            transform: `scale(1.1) translateY(-${parallaxTranslation}px)`, // Scale up to hide blurry edges
          }}
        />
      ))}
      {shuffledImages.map((image, index) => (
         <div
          key={image + '-fg'}
          className="absolute w-full h-full transition-opacity duration-1000"
          style={{
            opacity: index === currentImageIndex && !isFading ? 1 : 0,
            backgroundImage: `url(/${image})`,
            backgroundPosition: 'center',
            backgroundSize: 'contain', // This layer shows the full image
            backgroundRepeat: 'no-repeat',
            transform: `translateY(-${parallaxTranslation}px)`,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
};

export default BackgroundSlideshow;
