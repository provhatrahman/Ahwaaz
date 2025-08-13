import React, { useEffect } from 'react';
import { ThemeProvider } from './Components/theme/ThemeProvider.jsx';

export default function Layout({ children, currentPageName }) {
  useEffect(() => {
    // Set CSS custom property for proper viewport height handling, useful for mobile browsers
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Set initial value
    setVH();

    // Update on resize and orientation change
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    // Handle PWA viewport changes
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', setVH);
    }

    // Cleanup listeners
    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', setVH);
      }
    };
  }, []);

  return (
    <ThemeProvider>
      <div>
        {children}
      </div>
    </ThemeProvider>
  );
}