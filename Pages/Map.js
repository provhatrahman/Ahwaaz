
import React, { useState, useEffect, useRef } from "react";
import { Artist } from "@/entities/Artist";
import { User } from "@/entities/User";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shuffle, MapPin, Users, Filter, Map as MapIcon, Grid3x3, X, Menu, Search, LayoutDashboard, ChevronDown, Plus, Edit, EyeOff, Eye, Globe, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPageUrl } from "@/utils";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useTheme } from "../components/theme/ThemeProvider";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

import ArtistCard from "../components/discovery/ArtistCard";
import FilterSidebar from "../components/discovery/FilterSidebar";
import CityView from "../components/discovery/CityView";
import Sidebar from "../components/layout/Sidebar";
import OnboardingTour from "../components/discovery/OnboardingTour";

const practiceColors = {
  "Visual Arts": "#10B981", // emerald-500
  "Music": "#10B981", // emerald-500
  "Dance": "#059669", // emerald-600
  "Theater": "#047857", // emerald-700
  "Literature": "#065F46", // emerald-800
  "Film": "#064E3B", // emerald-900
  "Photography": "#10B981", // emerald-500
  "Digital Art": "#059669", // emerald-600
  "Fashion": "#047857", // emerald-700
  "Architecture": "#065F46", // emerald-800
  "Other": "#6B7280" // gray-500
};

// A helper component to silently update the map's view state in a ref
function MapEvents({ onViewStateChange }) {
  const map = useMapEvents({
    moveend: () => {
      onViewStateChange(map.getCenter(), map.getZoom());
    },
    zoomend: () => {
      onViewStateChange(map.getCenter(), map.getZoom());
    },
  });
  return null;
}

export default function MapPage() {
  const { isDarkMode } = useTheme();
  const [artists, setArtists] = useState([]);
  const [filteredArtists, setFilteredArtists] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [filters, setFilters] = useState({
    practices: [],
    countries: [],
    cities: [],
    genres: [],
    ethnicities: [],
    showLikes: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState(() => {
    // Check if user should start in dashboard view
    const urlParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    return hash === '#dashboard' || urlParams.get('view') === 'dashboard' ? 'dashboard' : 'map';
  });
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [gridScrollPosition, setGridScrollPosition] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const [themeInitialized, setThemeInitialized] = useState(false);
  const [groupBy, setGroupBy] = useState('city');
  const [mapGrouping, setMapGrouping] = useState('country'); // For map view clustering
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionFromCountry, setTransitionFromCountry] = useState(null);
  const viewStateRef = useRef({ center: [20, 77], zoom: 3 });

  // Dashboard-specific state
  const [artistProfiles, setArtistProfiles] = useState([]);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);

  const mainContentRef = useRef(null);

  useEffect(() => {
    const tourCompleted = localStorage.getItem('ahwaaz-tour-completed');
    if (!tourCompleted) {
      setShowTour(true);
    }
  }, []);

  // Set CSS variable for map brightness based on theme
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.style.setProperty('--map-brightness', '1.6');
      root.style.setProperty('--map-saturate', '1');
    } else {
      root.style.setProperty('--map-brightness', '1');
      root.style.setProperty('--map-saturate', '1');
    }
  }, [isDarkMode]);

  useEffect(() => {
    loadArtists();
    loadUser();
  }, []);

  // Add effect to reload user data when component becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible again, reload user data to get latest favorites
        loadUser();
      }
    };

    // Also reload when the page gains focus
    const handleFocus = () => {
      loadUser();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [artists, filters, searchTerm]);

  useEffect(() => {
    if (selectedArtist) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedArtist]);

  // Add a layout reset effect when user authentication changes
  useEffect(() => {
    // Force a layout recalculation when currentUser changes
    const resetViewport = () => {
      // Reset any cached viewport calculations
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', () => {
          // Force recalculation of viewport dimensions
          document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
        });
      }
      // Set CSS custom property for proper viewport height
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };

    resetViewport();
    
    // Also reset on window resize
    window.addEventListener('resize', resetViewport);
    return () => window.removeEventListener('resize', resetViewport);
  }, [currentUser]); // Reset when currentUser changes (login/logout)

  // Add effect to wait for theme initialization
  useEffect(() => {
    // Small delay to ensure theme provider has initialized
    const timer = setTimeout(() => {
      setThemeInitialized(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [isDarkMode]);

  // Initialize map grouping based on initial zoom level
  useEffect(() => {
    const zoomThreshold = 3.5;
    const initialGrouping = viewStateRef.current.zoom >= zoomThreshold ? 'city' : 'country';
    setMapGrouping(initialGrouping);
  }, []);

  // Add dashboard data loading function
  const loadDashboardData = async () => {
    if (!currentUser) return;
    
    setIsDashboardLoading(true);
    try {
      const profiles = await Artist.filter({ user_id: currentUser.id });
      setArtistProfiles(profiles);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsDashboardLoading(false);
  };

  // Load dashboard data when switching to dashboard view
  useEffect(() => {
    if (viewMode === 'dashboard' && currentUser) {
      loadDashboardData();
    }
  }, [viewMode, currentUser]);

  const handleStartTour = () => {
    setShowTour(true);
  };

  const handleViewStateChange = (center, zoom) => {
    viewStateRef.current = { center: [center.lat, center.lng], zoom };
    
    // Update grouping based on zoom level
    const zoomThreshold = 3.5; // Threshold for switching between country and city grouping
    const newGrouping = zoom >= zoomThreshold ? 'city' : 'country';
    
    if (newGrouping !== mapGrouping) {
      // Start transition animation
      if (newGrouping === 'city' && mapGrouping === 'country') {
        // Transitioning from country to city - scatter effect
        setTransitionFromCountry(groupArtistsByCountry());
        setIsTransitioning(true);
        
        // Delay the grouping change to allow animation
        setTimeout(() => {
          setMapGrouping(newGrouping);
          setTimeout(() => {
            setIsTransitioning(false);
            setTransitionFromCountry(null);
          }, 600); // Animation duration
        }, 50);
      } else {
        // Direct transition for city to country
        setMapGrouping(newGrouping);
      }
    }
  };
  
  const loadUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      setCurrentUser(null);
    }
  };

  const handleUserUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  const loadArtists = async () => {
    setIsLoading(true);
    try {
      const data = await Artist.filter({ is_published: true });
      setArtists(data);
    } catch (error) {
      console.error("Error loading artists:", error);
    }
    setIsLoading(false);
  };

  const applyFilters = () => {
    let filtered = artists;

    if (filters.showLikes && currentUser) {
      const likedIds = currentUser.liked_artists || [];
      filtered = filtered.filter(artist => likedIds.includes(artist.id));
    }

    if (filters.practices.length > 0) {
      filtered = filtered.filter(artist => 
        filters.practices.includes(artist.primary_practice) ||
        artist.secondary_practices?.some(practice => filters.practices.includes(practice))
      );
    }

    if (filters.countries.length > 0) {
      filtered = filtered.filter(artist => {
        const displayCountry = artist.location_country === 'Israel' ? 'Palestine' : artist.location_country;
        return filters.countries.includes(displayCountry);
      });
    }

    if (filters.cities.length > 0) {
      filtered = filtered.filter(artist =>
        filters.cities.includes(artist.location_city)
      );
    }

    if (filters.genres.length > 0) {
      filtered = filtered.filter(artist =>
        filters.genres.includes(artist.style_genre)
      );
    }

    if (filters.ethnicities.length > 0) {
      filtered = filtered.filter(artist =>
        filters.ethnicities.includes(artist.ethnic_background)
      );
    }

    if (searchTerm.trim()) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(artist => {
        const nameMatch = artist.name?.toLowerCase().includes(lowercasedTerm);
        const primaryPracticeMatch = artist.primary_practice?.toLowerCase().includes(lowercasedTerm);
        const secondaryPracticeMatch = artist.secondary_practices?.some(p => p.toLowerCase().includes(lowercasedTerm));
        const ethnicityMatch = artist.ethnic_background?.toLowerCase().includes(lowercasedTerm);
        const cityMatch = artist.location_city?.toLowerCase().includes(lowercasedTerm);
        const countryMatch = (artist.location_country === 'Israel' ? 'palestine' : artist.location_country?.toLowerCase()).includes(lowercasedTerm);
        const genreMatch = artist.style_genre?.toLowerCase().includes(lowercasedTerm);

        return nameMatch || primaryPracticeMatch || secondaryPracticeMatch || ethnicityMatch || cityMatch || countryMatch || genreMatch;
      });
    }

    setFilteredArtists(filtered);
  };

  const getRandomArtist = () => {
    if (filteredArtists.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredArtists.length);
      setSelectedArtist(filteredArtists[randomIndex]);
    }
  };

  const groupArtistsByCity = () => {
    const cityGroups = {};
    filteredArtists.forEach(artist => {
      const displayCountry = artist.location_country === 'Israel' ? 'Palestine' : artist.location_country;
      const cityKey = `${artist.location_city}, ${displayCountry}`;
      if (!cityGroups[cityKey]) {
        cityGroups[cityKey] = {
          artists: [],
          latitude: artist.latitude,
          longitude: artist.longitude,
          primaryPractice: artist.primary_practice
        };
      }
      cityGroups[cityKey].artists.push(artist);
    });
    return cityGroups;
  };

  const groupArtistsByCountry = () => {
    const countryGroups = {};
    filteredArtists.forEach(artist => {
      const displayCountry = artist.location_country === 'Israel' ? 'Palestine' : artist.location_country;
      if (!countryGroups[displayCountry]) {
        countryGroups[displayCountry] = {
          artists: [],
          latitudes: [],
          longitudes: [],
          primaryPractice: artist.primary_practice
        };
      }
      countryGroups[displayCountry].artists.push(artist);
      countryGroups[displayCountry].latitudes.push(artist.latitude);
      countryGroups[displayCountry].longitudes.push(artist.longitude);
    });

    // Calculate centroid for each country
    Object.keys(countryGroups).forEach(country => {
      const group = countryGroups[country];
      const avgLat = group.latitudes.reduce((sum, lat) => sum + lat, 0) / group.latitudes.length;
      const avgLng = group.longitudes.reduce((sum, lng) => sum + lng, 0) / group.longitudes.length;
      
      countryGroups[country] = {
        artists: group.artists,
        latitude: avgLat,
        longitude: avgLng,
        primaryPractice: group.primaryPractice
      };
    });

    return countryGroups;
  };

  const groupArtistsByPractice = () => {
    const practiceGroups = {};
    filteredArtists.forEach(artist => {
      // Add artist to primary practice group
      const primaryPractice = artist.primary_practice;
      if (!practiceGroups[primaryPractice]) {
        practiceGroups[primaryPractice] = {
          artists: [],
          latitude: artist.latitude,
          longitude: artist.longitude,
          primaryPractice: primaryPractice
        };
      }
      practiceGroups[primaryPractice].artists.push(artist);

      // Add artist to secondary practice groups (if they exist)
      if (artist.secondary_practices && Array.isArray(artist.secondary_practices)) {
        artist.secondary_practices.forEach(secondaryPractice => {
          if (secondaryPractice && secondaryPractice !== primaryPractice) {
            if (!practiceGroups[secondaryPractice]) {
              practiceGroups[secondaryPractice] = {
                artists: [],
                latitude: artist.latitude,
                longitude: artist.longitude,
                primaryPractice: secondaryPractice
              };
            }
            // Only add if artist isn't already in this group
            if (!practiceGroups[secondaryPractice].artists.find(a => a.id === artist.id)) {
              practiceGroups[secondaryPractice].artists.push(artist);
            }
          }
        });
      }
    });
    return practiceGroups;
  };

  const getCurrentGrouping = () => {
    switch (groupBy) {
      case 'country':
        return groupArtistsByCountry();
      case 'practice':
        return groupArtistsByPractice();
      default:
        return groupArtistsByCity();
    }
  };

  const getGroupIcon = () => {
    switch (groupBy) {
      case 'country':
        return MapPin;
      case 'practice':
        return Users;
      default:
        return MapPin;
    }
  };
  
  // Update the createCustomMarker function to accept isDarkMode parameter
  const createCustomMarker = (count, primaryPractice, isDarkMode, isTransitioning = false, delay = 0) => {
    const color = practiceColors[primaryPractice] || "#10B981"; // Default to emerald-500 instead of purple
    const size = 32; // Reduced size for all markers
    
    // Set text and border colors - black for dark mode, white for light mode
    const textColor = isDarkMode ? 'black' : 'white';
    const borderColor = isDarkMode ? 'black' : 'white';
    
    // Adjust font size based on count for better readability
    const fontSize = count > 99 ? '8px' : count > 9 ? '10px' : '12px';
    
    // Add transition animations
    const animationClass = isTransitioning ? 'marker-scatter-appear' : '';
    const transitionStyle = isTransitioning ? 
      `animation-delay: ${delay}ms;` : 
      'transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);';
    
    return L.divIcon({
      html: `
        <div style="
          background: ${color};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: 3px solid ${borderColor};
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${textColor};
          font-weight: bold;
          font-size: ${fontSize};
          ${transitionStyle}
        " class="custom-marker-div ${animationClass}">
          ${count}
        </div>
      `,
      className: 'custom-marker',
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    });
  };  

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleCloseFilters = () => {
    setShowFilters(false);
  };
  
  const handleCloseArtistModal = () => {
    setSelectedArtist(null);
  };

  const handleCityViewReturn = () => {
    setSelectedCity(null);
    setSelectedCountry(null);
    setSelectedPractice(null);
    // Restore scroll position when returning from city view
    setTimeout(() => {
      if (mainContentRef.current && viewMode === 'grid') {
        mainContentRef.current.scrollTop = gridScrollPosition;
      }
    }, 50);
  };

  const handleCitySelect = (cityKey) => {
    // Save current scroll position before navigating to city view
    if (mainContentRef.current && viewMode === 'grid') {
      setGridScrollPosition(mainContentRef.current.scrollTop);
    }
    setSelectedCity(cityKey);
  };

  const handleCountrySelect = (countryKey) => {
    // Save current scroll position before navigating to country view
    if (mainContentRef.current && viewMode === 'grid') {
      setGridScrollPosition(mainContentRef.current.scrollTop);
    }
    setSelectedCountry(countryKey);
  };

  const handlePracticeSelect = (practiceKey) => {
    // Save current scroll position before navigating to practice view
    if (mainContentRef.current && viewMode === 'grid') {
      setGridScrollPosition(mainContentRef.current.scrollTop);
    }
    setSelectedPractice(practiceKey);
  };

  const handleTourComplete = () => {
    setShowTour(false);
    localStorage.setItem('ahwaaz-tour-completed', 'true');
  };

  // Add dashboard-specific functions
  const togglePublishStatus = async (profile) => {
    try {
      const updatedProfile = {
        ...profile,
        is_published: !profile.is_published
      };
      await Artist.update(profile.id, updatedProfile);
      
      // Update local state directly instead of refetching all data
      setArtistProfiles(prev => 
        prev.map(p => 
          p.id === profile.id 
            ? { ...p, is_published: !p.is_published }
            : p
        )
      );
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };
  
  const handleDeleteProfile = async (profileId) => {
    try {
      await Artist.delete(profileId);
      
      // Update local state directly instead of refetching all data
      setArtistProfiles(prev => prev.filter(p => p.id !== profileId));
    } catch(error) {
      console.error("Error deleting profile:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await User.logout();
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Delete all artist profiles first
      for (const profile of artistProfiles) {
        await Artist.delete(profile.id);
      }
      
      // Then logout (which effectively deletes access to the account)
      await User.logout();
      window.location.href = "/";
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  if (selectedCity) {
    return (
      <CityView
        city={selectedCity}
        artists={groupArtistsByCity()[selectedCity].artists}
        onBack={handleCityViewReturn}
        onArtistSelect={setSelectedArtist}
        currentUser={currentUser}
        onUserUpdate={handleUserUpdate}
      />
    );
  }

  if (selectedCountry) {
    return (
      <CityView
        city={selectedCountry}
        artists={groupArtistsByCountry()[selectedCountry].artists}
        onBack={handleCityViewReturn}
        onArtistSelect={setSelectedArtist}
        currentUser={currentUser}
        onUserUpdate={handleUserUpdate}
      />
    );
  }

  if (selectedPractice) {
    return (
      <CityView
        city={selectedPractice}
        artists={groupArtistsByPractice()[selectedPractice].artists}
        onBack={handleCityViewReturn}
        onArtistSelect={setSelectedArtist}
        currentUser={currentUser}
        onUserUpdate={handleUserUpdate}
      />
    );
  }
  
  const renderGridView = () => {
    const currentGroups = getCurrentGrouping();
    const GroupIcon = getGroupIcon();
    
    return (
      <div className="p-4 sm:p-6">
        {/* Group By Selector */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Group by:</span>
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger className={`w-40 backdrop-blur-2xl shadow-lg border ${isDarkMode ? 'bg-gray-800/90 border-gray-700/60 text-gray-100' : 'bg-white/90 border-gray-300/60 text-gray-800'}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={isDarkMode ? 'bg-gray-800/95 border-gray-700/60' : 'bg-white/95 border-gray-300/60'}>
                <SelectItem value="city">City</SelectItem>
                <SelectItem value="country">Country</SelectItem>
                <SelectItem value="practice">Creative Practice</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {filteredArtists.length > 0 && (
            <div className="mt-3">
              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} italic`}>
                💡 Tap any profile card to bring into focus
              </p>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {Object.entries(currentGroups).map(([groupKey, groupData]) => (
            <Card key={groupKey} className={`overflow-hidden border-0 ${isDarkMode ? 'bg-gray-800/70 shadow-2xl shadow-black/80' : 'bg-white/50 shadow-lg'}`}>
              <div className={`bg-gradient-to-r text-white p-4 sm:p-6 ${isDarkMode ? 'from-emerald-700 to-emerald-800' : 'from-emerald-600 to-emerald-700'}`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <GroupIcon className="w-6 h-6 flex-shrink-0" />
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold">{groupKey}</h2>
                        <p className={isDarkMode ? 'text-emerald-200' : 'text-emerald-100'}>
                          {groupData.artists.length} creative{groupData.artists.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        switch (groupBy) {
                          case 'city':
                            handleCitySelect(groupKey);
                            break;
                          case 'country':
                            handleCountrySelect(groupKey);
                            break;
                          case 'practice':
                            handlePracticeSelect(groupKey);
                            break;
                          default:
                            break;
                        }
                      }}
                      className={`w-full sm:w-auto ${isDarkMode ? 'bg-white/30 hover:bg-white/40 text-white border-white/30' : 'bg-white/30 hover:bg-white/40 text-white border-white/30'}`}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Explore {groupBy === 'city' ? 'City' : groupBy === 'country' ? 'Country' : 'Practice'}
                    </Button>
                  </div>
              </div>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupData.artists.slice(0, 3).map((artist, index) => (
                      <motion.div
                        key={artist.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => setSelectedArtist(artist)}
                        className={`cursor-pointer ${isDarkMode ? 'drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)]' : 'drop-shadow-[0_8px_25px_rgba(0,0,0,0.15)]'}`}
                      >
                        <ArtistCard artist={artist} currentUser={currentUser} onUserUpdate={handleUserUpdate} />
                      </motion.div>
                    ))}
                </div>
                {groupData.artists.length > 3 && (
                  <div className="mt-6 text-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        switch (groupBy) {
                          case 'city':
                            handleCitySelect(groupKey);
                            break;
                          case 'country':
                            handleCountrySelect(groupKey);
                            break;
                          case 'practice':
                            handlePracticeSelect(groupKey);
                            break;
                          default:
                            break;
                        }
                      }}
                      className={isDarkMode ? 'border-emerald-500/50 hover:bg-emerald-900/30 text-emerald-400' : 'border-emerald-500 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium'}
                    >
                      View all {groupData.artists.length} creatives
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredArtists.length === 0 && !isLoading && (
          <div className="text-center py-12 px-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                <Users className={`w-8 h-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>No creatives found</h3>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Try adjusting your filters or search term to discover more creatives
              </p>
          </div>
        )}
      </div>
    );
  };
  
  const renderMapView = () => {
    // Don't render the map until theme is initialized
    if (!themeInitialized) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className={`animate-spin rounded-full h-8 w-8 border-b-2 mx-auto ${isDarkMode ? 'border-emerald-400' : 'border-emerald-600'}`}></div>
        </div>
      );
    }

    // Use CSS variables for consistent theme-based styling
    const mapStyle = {
      height: "100%",
      width: "100%",
      filter: 'brightness(var(--map-brightness, 1)) saturate(var(--map-saturate, 1))',
      transition: 'filter 0.3s ease-in-out',
    };

    return (
      <div className="h-full overflow-hidden">
        <MapContainer
          center={viewStateRef.current.center}
          zoom={viewStateRef.current.zoom}
          style={mapStyle}
          className="z-10"
          scrollWheelZoom={true}
          attributionControl={false}
          zoomControl={false}
          maxBounds={[[-90, -210], [90, 210]]}
          minZoom={2}
        >
          <MapEvents onViewStateChange={handleViewStateChange} />
          <TileLayer
            url={isDarkMode 
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            }
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          
          {/* Render transitioning country markers (fading out) */}
          {isTransitioning && transitionFromCountry && Object.entries(transitionFromCountry).map(([countryKey, countryData]) => (
            <Marker
              key={`transition-${countryKey}`}
              position={[countryData.latitude, countryData.longitude]}
              icon={createCustomMarker(countryData.artists.length, countryData.primaryPractice, isDarkMode, false, 0)}
              opacity={0.3}
            />
          ))}
          
          {/* Render main markers */}
          {Object.entries(mapGrouping === 'city' ? groupArtistsByCity() : groupArtistsByCountry()).map(([locationKey, locationData], index) => {
            const isCountryGrouping = mapGrouping === 'country';
            const delay = isTransitioning && mapGrouping === 'city' ? index * 80 : 0; // Stagger the city markers appearing
            
            return (
              <Marker
                key={locationKey}
                position={[locationData.latitude, locationData.longitude]}
                icon={createCustomMarker(locationData.artists.length, locationData.primaryPractice, isDarkMode, isTransitioning && mapGrouping === 'city', delay)}
                opacity={1}
              >
                <Popup className="custom-popup">
                  <div className={`text-center p-3 rounded-lg backdrop-blur-xl shadow-lg ${isDarkMode ? 'bg-gray-950/90 text-gray-100 border-0' : 'bg-white/90 text-gray-900 border-0'}`}>
                    <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`} style={{ margin: 0, marginBottom: '2px' }}>{locationKey}</h3>
                    <p className={`mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} style={{ margin: 0, marginBottom: '12px' }}>
                      {locationData.artists.length} artist{locationData.artists.length !== 1 ? 's' : ''}
                    </p>
                    {!isCountryGrouping && (
                      <Button
                        size="sm"
                        onClick={() => handleCitySelect(locationKey)}
                        className={`backdrop-blur-sm shadow-md ${isDarkMode ? 'bg-emerald-600/80 hover:bg-emerald-600 border border-emerald-500/80' : 'bg-emerald-600/80 hover:bg-emerald-600 border border-emerald-500/80'}`}
                      >
                        Explore City
                      </Button>
                    )}
                    {isCountryGrouping && (
                      <div className="space-y-2">
                        <Button
                          size="sm"
                          onClick={() => handleCountrySelect(locationKey)}
                          className={`backdrop-blur-sm shadow-md w-full ${isDarkMode ? 'bg-emerald-600/80 hover:bg-emerald-600 border border-emerald-500/80' : 'bg-emerald-600/80 hover:bg-emerald-600 border border-emerald-500/80'}`}
                        >
                          Explore Country
                        </Button>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Or zoom in to see cities
                        </p>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    );
  };

  const renderDashboardView = () => {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="flex flex-col justify-between items-start gap-4 mb-8">
          <div className="min-w-0 flex-1">
            <h1 className={`text-xl md:text-2xl lg:text-3xl font-bold truncate ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Profile Dashboard
            </h1>
            <p className={`mt-1 text-sm md:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage and create new artist profiles below
            </p>
          </div>
          <div className="flex gap-2 md:gap-3 w-full lg:w-auto">
            <Button 
              onClick={() => window.location.href = createPageUrl("Profile")}
              variant="outline" 
              className={`flex-1 lg:flex-none text-sm border backdrop-blur-2xl shadow-lg ${isDarkMode ? 'bg-gray-800/60 border-gray-700/60 hover:bg-gray-700/60 text-gray-300' : 'border-white/50 bg-white/25 hover:bg-white/35'}`}
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Create New Profile</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </div>
        </div>

        {/* Dashboard Content */}
        {isDashboardLoading ? (
          <div className="text-center py-16">
            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 ${isDarkMode ? 'border-emerald-400' : 'border-emerald-600'}`}></div>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading your dashboard...</p>
          </div>
        ) : artistProfiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-16">
            {artistProfiles.map(profile => (
              <div key={profile.id} className={`rounded-2xl overflow-hidden backdrop-blur-2xl border-0 ${isDarkMode ? 'bg-gray-800/70 shadow-lg' : 'bg-white/15 shadow-lg'}`}>
                {/* Artist Card Content - Disable hover effects */}
                <div className="relative dashboard-artist-card">
                  <ArtistCard artist={profile} currentUser={currentUser} onUserUpdate={setCurrentUser} />
                  <Badge 
                    variant={profile.is_published ? "default" : "secondary"}
                    className={`absolute top-4 right-4 backdrop-blur-xl border shadow-md ${profile.is_published ? (isDarkMode ? 'bg-emerald-600/80 text-white border-emerald-500/60' : 'bg-emerald-500/80 text-white border-white/30') : (isDarkMode ? 'bg-gray-700/80 text-gray-300 border-gray-600/60' : 'bg-white/80 text-gray-700 border-white/60')}`}
                  >
                    {profile.is_published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                
                {/* Action Buttons Section */}
                <div className={`p-4 border-t-2 ${isDarkMode ? 'border-gray-600/80 bg-gray-800/50' : 'border-gray-300/60 bg-white/20'} flex flex-col gap-3`}>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => window.location.href = createPageUrl(`Profile?id=${profile.id}`)}
                      variant="outline" 
                      size="sm" 
                      className={`flex-1 backdrop-blur-xl shadow-sm ${isDarkMode ? 'bg-gray-700/40 border-gray-600/60 hover:bg-gray-600/50 text-gray-300' : 'bg-white/30 border-white/60 hover:bg-white/40'}`}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePublishStatus(profile)}
                      className={`flex-1 backdrop-blur-xl shadow-sm ${profile.is_published ? (isDarkMode ? 'bg-yellow-900/40 border-yellow-700/60 hover:bg-yellow-800/50 text-yellow-300' : 'bg-yellow-50/60 border-yellow-200/60 hover:bg-yellow-100/70 text-yellow-700') : (isDarkMode ? 'bg-emerald-800/40 border-emerald-700/60 hover:bg-emerald-700/50 text-emerald-300' : 'bg-emerald-50/60 border-emerald-200/60 hover:bg-emerald-100/70 text-emerald-700')}`}
                    >
                      {profile.is_published ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-2" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          Publish
                        </>
                      )}
                    </Button>
                  </div>
                  {profile.is_published && (
                    <Button 
                      onClick={() => {
                        setViewMode('grid');
                        setSelectedArtist(profile);
                      }}
                      variant="outline" 
                      size="sm" 
                      className={`w-full backdrop-blur-xl shadow-sm ${isDarkMode ? 'bg-blue-800/40 border-blue-700/60 hover:bg-blue-700/50 text-blue-300' : 'bg-blue-50/60 border-blue-200/60 hover:bg-blue-100/70 text-blue-700'}`}
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      View Live
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className={`w-full backdrop-blur-xl shadow-sm ${isDarkMode ? 'bg-red-900/50 border-red-700/60 hover:bg-red-800/60 text-red-300' : ''}`}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Profile
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                      <AlertDialogHeader>
                        <AlertDialogTitle className={isDarkMode ? 'text-gray-100' : 'text-gray-900'}>Delete Profile?</AlertDialogTitle>
                        <AlertDialogDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                          This will permanently delete the artist profile for "{profile.name}". This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className={isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteProfile(profile.id)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 mb-16"
          >
            <div className={`w-24 h-24 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-6 border shadow-lg ${isDarkMode ? 'bg-emerald-900/50 border-emerald-700/50' : 'bg-emerald-100/60 border-white/30'}`}>
              <Plus className={`w-12 h-12 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
            <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Create Your First Profile</h2>
            <p className={`mb-8 max-w-md mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Join the Ahwaaz community by creating your artist profile. Share your work, connect with others, and discover amazing artists from around the world.
            </p>
            <Button 
              onClick={() => window.location.href = createPageUrl("Profile")}
              className={`backdrop-blur-2xl shadow-lg ${isDarkMode ? 'bg-emerald-600/80 hover:bg-emerald-700/90 border border-emerald-500/60' : 'bg-emerald-600/80 hover:bg-emerald-700/90 border-emerald-500/60'}`}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Profile
            </Button>
          </motion.div>
        )}

        {/* Bottom Actions */}
        <div className="flex flex-col gap-4 pt-8 border-t border-gray-200/20 mb-20">
          <div className="flex gap-4 justify-center">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className={`backdrop-blur-2xl shadow-lg ${isDarkMode ? 'bg-red-900/30 border-red-700/60 hover:bg-red-800/40 text-red-300' : 'bg-red-50/50 border-red-200/80 hover:bg-red-100/70 text-red-700'}`}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <AlertDialogHeader>
                  <AlertDialogTitle className={isDarkMode ? 'text-gray-100' : 'text-gray-900'}>Delete Your Account</AlertDialogTitle>
                  <AlertDialogDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    This will permanently delete your account and all associated artist profiles. 
                    This action cannot be undone. Are you sure you want to continue?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className={isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Button 
              variant="outline" 
              onClick={handleLogout} 
              className={`backdrop-blur-2xl shadow-lg ${isDarkMode ? 'bg-gray-800/60 border-gray-700/60 hover:bg-gray-700/60 text-gray-300' : 'border-white/50 bg-white/25 hover:bg-white/35'}`}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`w-screen h-screen overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-emerald-50 via-white to-yellow-50'}`} style={{ height: 'calc(var(--vh, 1vh) * 100)' }}>
      {showTour && <OnboardingTour onComplete={handleTourComplete} />}
      <style>{`
        body {
          overflow: hidden !important;
          height: 100vh !important;
          max-height: 100vh !important;
        }
        html {
          overflow: hidden !important;
          height: 100vh !important;
          max-height: 100vh !important;
        }
        .custom-popup .leaflet-popup-content-wrapper,
        .custom-popup .leaflet-popup-tip {
          background: transparent;
          box-shadow: none;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
        }
        .custom-popup .leaflet-popup-close-button {
          display: none;
        }
        .custom-marker {
          transition: opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .marker-scatter-appear {
          animation: scatterAppear 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          opacity: 0;
          transform: scale(0.3) translateY(20px);
        }
        @keyframes scatterAppear {
          0% {
            opacity: 0;
            transform: scale(0.3) translateY(20px) rotate(-180deg);
          }
          30% {
            opacity: 0.6;
            transform: scale(0.8) translateY(-10px) rotate(-60deg);
          }
          60% {
            opacity: 0.9;
            transform: scale(1.15) translateY(-5px) rotate(0deg);
          }
          80% {
            opacity: 1;
            transform: scale(0.95) translateY(2px) rotate(0deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0) rotate(0deg);
          }
        }
        /* Dashboard artist card styles - disable hover effects */
        .dashboard-artist-card * {
          transition: none !important;
          transform: none !important;
        }
        .dashboard-artist-card:hover * {
          transform: none !important;
          box-shadow: none !important;
        }
        .dashboard-artist-card > * {
          box-shadow: none !important;
          filter: none !important;
        }
        .dashboard-artist-card:hover > * {
          box-shadow: none !important;
          filter: none !important;
          transform: none !important;
        }
      `}</style>
      {/* --- Sidebars in the background, revealed on push --- */}
      <div className="fixed top-0 left-0 bottom-0 z-0">
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-80 h-full"
            >
              <Sidebar isOpen={true} onClose={handleCloseSidebar} currentUser={currentUser} onStartTour={handleStartTour} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="fixed top-0 left-0 bottom-0 z-0" style={{ left: isSidebarOpen ? 320 : 0 }}>
         <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`w-80 h-full backdrop-blur-2xl border-r shadow-2xl ${isDarkMode ? 'bg-gray-800/90 border-gray-700/50' : 'bg-white/15 border-white/25'}`}
            >
              <FilterSidebar
                artists={artists}
                filters={filters}
                onFiltersChange={setFilters}
                onClose={handleCloseFilters}
                currentUser={currentUser}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- Main container that gets pushed --- */}
      <motion.div
        className="flex flex-col bg-transparent overflow-hidden"
        style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
        animate={{ x: (isSidebarOpen ? 320 : 0) + (showFilters ? 320 : 0) }}
        transition={{ type: "spring", stiffness: 500, damping: 50 }}
      >
        {/* Clickable overlay to close sidebars */}
        <AnimatePresence>
          {(isSidebarOpen || showFilters) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/10 z-40"
              onClick={() => {
                setIsSidebarOpen(false);
                setShowFilters(false);
              }}
            />
          )}
        </AnimatePresence>



        {/* Floating Hamburger Menu Button - Left Side */}
        <div className="fixed left-6 z-40" style={{ bottom: 'calc(80px + max(1.5rem, env(safe-area-inset-bottom)))' }}>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className={`w-14 h-14 rounded-full backdrop-blur-2xl shadow-lg border sidebar-handle ${isDarkMode ? 'bg-gray-800/80 border-gray-600/50 hover:bg-gray-700/80 text-gray-300' : 'bg-white/80 border-white/40 hover:bg-white text-gray-800'}`}
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>

        {/* Floating Filter and Random Buttons - Above Dock - Only show for map and grid views */}
        {viewMode !== 'dashboard' && (
          <div className="fixed right-6 z-40 flex flex-col gap-3" style={{ bottom: 'calc(80px + max(1.5rem, env(safe-area-inset-bottom)))' }}>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={`relative w-14 h-14 rounded-full backdrop-blur-2xl shadow-lg border filters-button ${isDarkMode ? 'bg-gray-800/80 border-gray-600/50 hover:bg-gray-700/80 text-gray-300' : 'bg-white/80 border-white/40 hover:bg-white text-gray-800'}`}
            >
              <Filter className="w-5 h-5" />
              {Object.values(filters).reduce((acc, curr) => {
                if (Array.isArray(curr)) {
                  return acc + curr.length;
                }
                if (typeof curr === 'boolean' && curr) {
                  return acc + 1;
                }
                return acc;
              }, 0) > 0 && (
                <Badge variant="secondary" className={`absolute -top-1 -right-1 w-5 h-5 p-0 text-xs rounded-full flex items-center justify-center ${isDarkMode ? 'bg-emerald-600/80 text-white' : 'bg-emerald-500/80 text-white'}`}>
                  {Object.values(filters).reduce((acc, curr) => {
                    if (Array.isArray(curr)) {
                      return acc + curr.length;
                    }
                    if (typeof curr === 'boolean' && curr) {
                      return acc + 1;
                    }
                    return acc;
                  }, 0)}
                </Badge>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={getRandomArtist}
              className={`w-14 h-14 rounded-full backdrop-blur-2xl shadow-lg border random-button ${isDarkMode ? 'bg-gray-800/80 border-gray-600/50 hover:bg-gray-700/80 text-gray-300' : 'bg-white/80 border-white/40 hover:bg-white text-gray-800'}`}
            >
              <Shuffle className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Contextual Stats Card - Top of Map */}
        {viewMode === 'map' && !showSearch && (
          <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-40 max-w-none">
            <div className={`px-6 py-3 rounded-full backdrop-blur-2xl shadow-lg border whitespace-nowrap ${isDarkMode ? 'bg-gray-800/80 border-gray-600/50' : 'bg-white/80 border-white/40'}`}>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <Users className={`w-4 h-4 flex-shrink-0 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    {filteredArtists.length} creative{filteredArtists.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className={`w-1 h-1 rounded-full flex-shrink-0 ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'}`}></div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <MapPin className={`w-4 h-4 flex-shrink-0 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    {mapGrouping === 'city' 
                      ? `${Object.keys(groupArtistsByCity()).length} cit${Object.keys(groupArtistsByCity()).length !== 1 ? 'ies' : 'y'}`
                      : `${Object.keys(groupArtistsByCountry()).length} countr${Object.keys(groupArtistsByCountry()).length !== 1 ? 'ies' : 'y'}`
                    }
                  </span>
                </div>
                {Object.values(filters).reduce((acc, curr) => {
                  if (Array.isArray(curr)) return acc + curr.length;
                  if (typeof curr === 'boolean' && curr) return acc + 1;
                  return acc;
                }, 0) > 0 && (
                  <>
                    <div className={`w-1 h-1 rounded-full flex-shrink-0 ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'}`}></div>
                    <div className="relative flex items-center whitespace-nowrap pr-2">
                      <Filter className={`w-4 h-4 flex-shrink-0 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                      <Badge variant="secondary" className={`absolute -top-1 -right-0 w-4 h-4 p-0 text-xs rounded-full flex items-center justify-center ${isDarkMode ? 'bg-emerald-600/80 text-white' : 'bg-emerald-500/80 text-white'}`}>
                        {Object.values(filters).reduce((acc, curr) => {
                          if (Array.isArray(curr)) return acc + curr.length;
                          if (typeof curr === 'boolean' && curr) return acc + 1;
                          return acc;
                        }, 0)}
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Search Overlay - Only show for map and grid views */}
        <AnimatePresence>
          {showSearch && viewMode !== 'dashboard' && (
               <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
                 transition={{ duration: 0.2 }}
              className="fixed top-6 left-6 right-6 z-50"
               >
              <div className={`flex items-center gap-2 px-4 py-3 rounded-lg backdrop-blur-2xl shadow-lg border ${isDarkMode ? 'bg-gray-800/90 border-gray-600/50' : 'bg-white/90 border-white/40'}`}>
                  <Search className={`h-5 w-5 flex-shrink-0 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                  <Input 
                    placeholder="Search by name, practice, location..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 !border-none !ring-0 !shadow-none !px-0 !bg-transparent focus-visible:!ring-offset-0"
                    autoFocus
                  />
                  <Button variant="ghost" size="icon" onClick={() => { setShowSearch(false); setSearchTerm(''); }}>
                    <X className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`} />
                  </Button>
                </div>
              </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main ref={mainContentRef} className={`flex-1 min-h-0 focus:outline-none bg-transparent ${viewMode === 'grid' || viewMode === 'dashboard' ? 'overflow-y-auto' : 'overflow-hidden'}`} tabIndex={0}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 ${isDarkMode ? 'border-emerald-400' : 'border-emerald-600'}`}></div>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading artists...</p>
            </div>
          ) : (
            viewMode === 'map' ? renderMapView() : viewMode === 'grid' ? renderGridView() : renderDashboardView()
          )}
        </main>

        {/* Dock - Bottom Navigation */}
        <footer className={`backdrop-blur-3xl border-t z-30 flex-shrink-0 shadow-lg ${isDarkMode ? 'bg-gray-900/60 border-gray-700/40' : 'bg-white/20 border-white/30'}`}>
          <div className="px-4 pt-2 pb-4" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
            <div className="flex items-center justify-around max-w-full overflow-hidden">
              {/* Map Icon */}
              <Button
                variant="ghost"
                onClick={() => setViewMode('map')}
                className="w-16 h-10 p-0 bg-transparent hover:bg-transparent transition-all flex items-center justify-center flex-shrink-0"
              >
                <MapIcon 
                  style={{ width: '24px', height: '24px' }}
                  className={`transition-colors ${viewMode === 'map' ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600') : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800')}`} 
                />
              </Button>

              {/* Grid Icon */}
              <Button
                variant="ghost"
                onClick={() => setViewMode('grid')}
                className="w-16 h-10 p-0 bg-transparent hover:bg-transparent transition-all flex items-center justify-center flex-shrink-0"
              >
                <Grid3x3 
                  style={{ width: '24px', height: '24px' }}
                  className={`transition-colors ${viewMode === 'grid' ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600') : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800')}`} 
                />
              </Button>

              {/* Search Icon - Greyed out in dashboard view */}
              <Button
                variant="ghost"
                onClick={viewMode !== 'dashboard' ? () => setShowSearch(true) : undefined}
                disabled={viewMode === 'dashboard'}
                className="w-16 h-10 p-0 bg-transparent hover:bg-transparent transition-all search-button flex items-center justify-center flex-shrink-0"
              >
                <Search 
                  style={{ width: '24px', height: '24px' }}
                  className={`transition-colors ${
                    viewMode === 'dashboard' 
                      ? (isDarkMode ? 'text-gray-600' : 'text-gray-400') 
                      : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800')
                  }`} 
                />
              </Button>

              {/* Dashboard Icon */}
              {currentUser && (
                <Button
                  variant="ghost"
                  onClick={() => setViewMode('dashboard')}
                  className="w-16 h-10 p-0 bg-transparent hover:bg-transparent transition-all flex items-center justify-center flex-shrink-0"
                >
                  <LayoutDashboard 
                    style={{ width: '24px', height: '24px' }}
                    className={`transition-colors ${viewMode === 'dashboard' ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600') : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800')}`} 
                  />
                </Button>
              )}
            </div>
          </div>
        </footer>
      </motion.div>

      {/* --- Artist Modal (remains a separate overlay) --- */}
      <AnimatePresence>
        {selectedArtist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-hidden"
            onClick={handleCloseArtistModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full max-h-[90vh] overflow-y-auto overflow-x-hidden"
              style={{ scrollbarWidth: 'thin' }}
            >
              <ArtistCard
                artist={selectedArtist}
                onClose={handleCloseArtistModal}
                isModal={true}
                currentUser={currentUser}
                onUserUpdate={handleUserUpdate}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
