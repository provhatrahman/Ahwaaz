// Utility functions for the app

export const createPageUrl = (pageName) => {
  const routes = {
    Map: '/map',
    Profile: '/profile',
    Dashboard: '/dashboard',
    About: '/about',
    Feedback: '/feedback',
    Install: '/install',
    AdminPortal: '/admin'
  };
  
  return routes[pageName] || '/map';
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};