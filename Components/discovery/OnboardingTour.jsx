
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Menu, MapIcon, LayoutGrid, Search, Filter, Shuffle, LayoutDashboard, Heart, Flag, Users, MoreVertical } from 'lucide-react';
import { useTheme } from '../theme/ThemeProvider';

const TourComponentWrapper = ({ children, className = "" }) => {
  const { isDarkMode } = useTheme();
  return (
    <div className={`flex items-center justify-center p-4 my-4 rounded-lg ${isDarkMode ? 'bg-gray-800/70' : 'bg-gray-100/70'} ${className}`}>
      {children}
    </div>
  );
};

const tourSteps = [
  {
    title: 'Welcome to Ahwaaz',
    description: 'Discover and connect with South Asian creatives from around the world. Let us show you around.',
    renderComponent: () => (
      <TourComponentWrapper>
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">🌍</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Mapping the global South Asian creative industry
          </p>
        </div>
      </TourComponentWrapper>
    )
  },
  {
    title: 'Navigation & Profile',
    description: 'Use the menu button (bottom-left) to open the sidebar where you can create and manage your profile, install Ahwaaz as an app, and access other pages.',
    renderComponent: () => (
      <TourComponentWrapper>
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-white/80 border border-white/40 shadow-lg flex items-center justify-center mb-3">
            <Menu className="w-6 h-6 text-gray-800" />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            Tap to open sidebar
          </p>
        </div>
      </TourComponentWrapper>
    )
  },
  {
    title: 'Switch Views',
    description: 'Use the dock at the bottom to switch between the interactive map view and grid view to explore artists.',
    renderComponent: () => (
      <TourComponentWrapper>
            <div className="flex items-center justify-center gap-6 bg-white/20 border border-white/30 rounded-lg p-4 backdrop-blur-xl">
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-12 flex items-center justify-center">
              <MapIcon className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Map</span>
          </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-12 flex items-center justify-center">
                  <LayoutGrid className="w-6 h-6 text-gray-600" />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Grid</span>
              </div>
        </div>
      </TourComponentWrapper>
    )
  },
  {
    title: 'Grid View - Organization',
    description: 'In grid view, you can organize artists by city, country, or creative practice using the "Group by" dropdown.',
    renderComponent: () => {
      const { isDarkMode } = useTheme();
      return (
        <TourComponentWrapper>
          <div className="space-y-4">
            {/* Group By Demo */}
            <div className="flex items-center justify-center gap-3 bg-white/30 border border-white/40 rounded-lg p-4 backdrop-blur-xl">
              <Users className="w-6 h-6 text-emerald-600" />
              <span className="text-sm font-medium" style={{ color: isDarkMode ? '#f3f4f6' : '#000000' }}>Group by:</span>
              <div className="bg-white/60 border border-gray-300/60 rounded px-4 py-2 text-sm text-gray-900 shadow-sm">
                City ▼
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-sm font-medium" style={{ color: isDarkMode ? '#f3f4f6' : '#000000' }}>
                Choose from:
              </p>
              <div className="flex justify-center gap-2 flex-wrap">
                <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs font-medium">City</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">Country</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">Practice</span>
              </div>
            </div>
          </div>
        </TourComponentWrapper>
      );
    }
  },
  {
    title: 'Grid View - Artist Actions',
    description: 'Tap artist cards to favorite them, or use the three-dot menu (⋯) to report inappropriate content.',
    renderComponent: () => {
      const { isDarkMode } = useTheme();
      return (
        <TourComponentWrapper>
          <div className="space-y-4">
            {/* Artist Card Actions Demo */}
            <div className="bg-white/30 border border-white/40 rounded-lg p-4 backdrop-blur-xl">
              <div className="flex items-center justify-center gap-6">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shadow-md">
                    <Heart className="w-6 h-6 text-red-500" />
                  </div>
                  <span className="text-sm font-medium" style={{ color: isDarkMode ? '#f3f4f6' : '#000000' }}>Favorite</span>
                  <span className="text-xs text-center" style={{ color: isDarkMode ? '#d1d5db' : '#374151' }}>Tap card</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center shadow-md">
                    <MoreVertical className="w-6 h-6 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium" style={{ color: isDarkMode ? '#f3f4f6' : '#000000' }}>Menu</span>
                  <span className="text-xs text-center" style={{ color: isDarkMode ? '#d1d5db' : '#374151' }}>Report option</span>
                </div>
              </div>
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50 rounded-lg p-3">
              <p className="text-sm text-amber-800 dark:text-amber-200 text-center font-medium">
                💡 Favorites can be filtered later using the filter menu
              </p>
            </div>
          </div>
        </TourComponentWrapper>
      );
    }
  },
  {
    title: 'Search Artists',
    description: 'Click the search icon in the dock to search for artists by name, practice, location, and more.',
    renderComponent: () => (
      <TourComponentWrapper>
        <div className="flex flex-col items-center">
          <div className="w-16 h-12 flex items-center justify-center bg-white/20 border border-white/30 rounded-lg backdrop-blur-xl mb-3">
            <Search className="w-6 h-6 text-gray-800" />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            Search by name, practice, or location
          </p>
        </div>
      </TourComponentWrapper>
    )
  },
  {
    title: 'Filter Your Discovery',
    description: 'Use the filter button (bottom-right) to narrow down your search by creative practice, country, city, and more.',
    renderComponent: () => (
      <TourComponentWrapper>
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-white/80 border border-white/40 shadow-lg flex items-center justify-center mb-3 relative">
            <Filter className="w-5 h-5 text-gray-800" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500/80 text-white rounded-full flex items-center justify-center text-xs font-bold">
              3
            </div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            Active filters show with a badge
          </p>
        </div>
      </TourComponentWrapper>
    )
  },
  {
    title: 'Surprise Me!',
    description: 'Click the shuffle button (bottom-right) to discover a random artist profile from the community.',
    renderComponent: () => (
      <TourComponentWrapper>
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-white/80 border border-white/40 shadow-lg flex items-center justify-center mb-3">
            <Shuffle className="w-5 h-5 text-gray-800" />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            Discover random artists
          </p>
        </div>
      </TourComponentWrapper>
    )
  },
  {
    title: 'Dashboard (When Logged In)',
    description: 'Once you create an account, use the dashboard to manage your artist profiles and see your published artist cards.',
    renderComponent: () => (
      <TourComponentWrapper>
        <div className="flex flex-col items-center">
          <div className="w-16 h-12 flex items-center justify-center bg-white/20 border border-white/30 rounded-lg backdrop-blur-xl mb-3">
            <LayoutDashboard className="w-6 h-6 text-emerald-600" />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            Manage your artist profiles
          </p>
        </div>
      </TourComponentWrapper>
    )
  },
  {
    title: 'Ready to Explore',
    description: 'You\'re all set! Start exploring the creative community, discover amazing artists, and consider creating your own profile to join the network.',
    renderComponent: () => (
      <TourComponentWrapper>
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">✨</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Happy exploring!
          </p>
        </div>
      </TourComponentWrapper>
    )
  }
];

export default function OnboardingTour({ onComplete }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const currentStep = tourSteps[stepIndex];
  const { isDarkMode } = useTheme();

  // Handle swipe gestures
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && stepIndex < tourSteps.length - 1) {
      handleNext();
    }
    if (isRightSwipe && stepIndex > 0) {
      handlePrevious();
    }
  };

  const handleNext = () => {
    if (stepIndex < tourSteps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!currentStep) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Centered tour content */}
      <div 
        className="relative w-full max-w-sm"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className={`w-full rounded-xl shadow-2xl border ${isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'}`}
          >
            <div className="p-6">
              {/* Progress indicator */}
              <div className="flex justify-center mb-4">
                <div className="flex gap-2">
                  {tourSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === stepIndex 
                          ? (isDarkMode ? 'bg-emerald-400' : 'bg-emerald-600')
                          : (isDarkMode ? 'bg-gray-600' : 'bg-gray-300')
                      }`}
                    />
                  ))}
                </div>
              </div>

              <h3 className={`font-bold text-xl mb-3 text-center ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {currentStep.title}
              </h3>
              
              <p className={`text-sm mb-4 text-center leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {currentStep.description}
              </p>
              
              {currentStep.renderComponent && currentStep.renderComponent()}
              
              {/* Navigation */}
              <div className="flex justify-between items-center mt-6">
                {stepIndex > 0 ? (
                  <>
                    {/* Left: Back button */}
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={handlePrevious}
                      className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' : 'text-gray-500 hover:text-gray-600 hover:bg-gray-100'}`}
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back
                    </Button>
                    
                    {/* Center: Skip tour button */}
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={handleSkip}
                      className={`text-xs ${isDarkMode ? 'text-gray-500 hover:text-gray-400 hover:bg-gray-800' : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'}`}
                    >
                      Skip tour
                    </Button>
                    
                    {/* Right: Next button */}
                    <Button 
                      size="sm" 
                      onClick={handleNext} 
                      className={`${isDarkMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white px-4`}
                    >
                      {stepIndex === tourSteps.length - 1 ? 'Get Started' : 'Next'}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </>
                ) : (
                  <>
                    {/* First slide: Skip tour on left, Next on right */}
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={handleSkip}
                      className={`text-xs ${isDarkMode ? 'text-gray-500 hover:text-gray-400 hover:bg-gray-800' : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'}`}
                    >
                      Skip tour
                    </Button>
                    
                    <Button 
                      size="sm" 
                      onClick={handleNext} 
                      className={`${isDarkMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white px-4`}
                    >
                      {stepIndex === tourSteps.length - 1 ? 'Get Started' : 'Next'}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </>
                )}
              </div>

              {/* Swipe hint */}
              <div className="mt-4 text-center">
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  💡 Swipe left/right to navigate
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
