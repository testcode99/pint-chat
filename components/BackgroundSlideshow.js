// Manages the full-screen background image slideshow with a parallax scroll effect.
import React, { useState, useEffect } from 'react';

const BackgroundSlideshow = ({ images }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [shuffledImages, setShuffledImages] = useState([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);

  // Effect to calculate the maximum parallax scroll to prevent black bars
  useEffect(() => {
    const calculateMaxScroll = () => {
      // The image container is 150% of the viewport height.
      // It's positioned at -25%, meaning it extends 25% below the viewport.
      // The parallax effect shouldn't move the image up by more than this extra 25%.
      const max = window.innerHeight * 0.25;
      setMaxScroll(max);
    };

    calculateMaxScroll();
    window.addEventListener('resize', calculateMaxScroll);
    return () => window.removeEventListener('resize', calculateMaxScroll);
  }, []);

  // Effect to handle scroll events for the parallax effect
  const handleScroll = () => {
    setScrollPosition(window.pageYOffset);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  // Effect to shuffle images on initial load
  useEffect(() => {
    if (images && images.length > 0) {
      setShuffledImages([...images].sort(() => 0.5 - Math.random()));
    }
  }, [images]);

  // Effect to handle the image transition for the slideshow
  useEffect(() => {
    if (shuffledImages.length < 2) return;

    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % shuffledImages.length);
        setIsFading(false);
      }, 1000); // fade duration should match transition duration
    }, 1000); // How long each image stays visible

    return () => clearInterval(interval);
  }, [shuffledImages]);

  if (shuffledImages.length === 0) {
      return <div className="fixed inset-0 bg-beer-dark z-0" />;
  }
  
  // Calculate the clamped translation for the parallax effect
  const translationY = Math.min(scrollPosition * 0.2, maxScroll);

  return (
    <div className="fixed inset-0 w-full h-full z-0 overflow-hidden">
      {shuffledImages.map((image, index) => (
        <div
          key={image}
          className="absolute w-full h-[150%] -top-[25%] left-0 transition-opacity duration-1000" // Image is taller than screen to allow for scrolling
          style={{
            opacity: index === currentImageIndex && !isFading ? 1 : 0,
            backgroundImage: `url(/${image})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            // Apply the corrected and clamped parallax effect
            transform: `translateY(-${translationY}px)`
          }}
        />
      ))}
       <div className="absolute inset-0 bg-black/10" />
    </div>
  );
};

export default BackgroundSlideshow;
