// The footer component with the responsible drinking message.
import React from 'react';

const Footer = () => {
  return (
    <footer className="relative z-20 w-full text-center p-4">
      <a 
        href="https://www.alcoholics-anonymous.org.uk/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-block bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-lg"
      >
        When the fun stops, stop.
        <br />
        <span className="text-sm font-normal opacity-80">Alcoholics Anonymous Great Britain</span>
      </a>
    </footer>
  );
};

export default Footer;
