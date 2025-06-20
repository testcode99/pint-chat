// The footer component with the responsible drinking message.
import React from 'react';

const Footer = () => {
  return (
    <footer className="relative z-20 w-full text-center p-4 mt-8">
      <p className="text-beer-foam/70">When the fun stops, stop.</p>
      <a 
        href="https://www.alcoholics-anonymous.org.uk/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-beer-amber hover:text-beer-gold transition-colors duration-300"
      >
        Alcoholics Anonymous Great Britain
      </a>
    </footer>
  );
};

export default Footer;
