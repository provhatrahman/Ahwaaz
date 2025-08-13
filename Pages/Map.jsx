import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Menu, MapIcon, LayoutGrid, Users, LayoutDashboard, Plus, Eye, EyeOff, Edit, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { Artist } from '@/entities/Artist';
import { User } from '@/entities/User';
import ArtistCard from '../components/discovery/AristCard.jsx';
import CityView from '../components/discovery/CityView';
import Sidebar from '../components/layout/Sidebar';
import OnboardingTour from '../components/discovery/OnboardingTour';
import { useTheme } from '../components/theme/ThemeProvider';
import { createPageUrl } from '@/utils';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapPage() {
  const { isDarkMode } = useTheme();
  const [currentUser, setCurrentUser] = useState(null);
  const [artists, setArtists] = useState([]);
  const [myArtists, setMyArtists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState('map'); // 'map', 'grid', 'dashboard'
  const [groupBy, setGroupBy] = useState('city');
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    initializeApp();
    
    // Check URL hash for view
    const hash = window.location.hash.substring(1);
    if (hash === 'dashboard') {
      setView('dashboard');
    }
  }, []);

  const initializeApp = async () => {
    try {
      // Check if user has seen onboarding
      const hasSeenOnboarding = localStorage.getItem('ahwaaz-onboarding-seen');
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }

      // Try to get current user
      try {
        const user = await User.me();
        setCurrentUser(user);
        
        // Load user's artists if logged in
        const userArtists = await Artist.getMyArtists();
        setMyArtists(userArtists);
      } catch (error) {
        // User not logged in, that's okay
        console.log('User not logged in');
      }

      // Load all published artists
      const allArtists = await Artist.list();
      setArtists(allArtists);
    } catch (error) {
      console.error('Error initializing app:', error);
    }
    setIsLoading(false);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem('ahwaaz-onboarding-seen', 'true');
  };

  const handleStartTour = () => {
    setShowOnboarding(true);
  };

  const handleUserUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  const handlePublishToggle = async (artistId, isPublished) => {
    try {
      if (isPublished) {
        await Artist.unpublish(artistId);
      } else {
        await Artist.publish(artistId);
      }
      
      // Refresh data
      const userArtists = await Artist.getMyArtists();
      setMyArtists(userArtists);
      
      const allArtists = await Artist.list();
      setArtists(allArtists);
    } catch (error) {
      console.error('Error toggling publish status:', error);
    }
  };

  const handleDeleteArtist = async (artistId) => {
    if (!confirm('Are you sure you want to delete this artist profile?')) {
      return;
    }
    
    try {
      await Artist.delete(artistId);
      
      // Refresh data
      const userArtists = await Artist.getMyArtists();
      setMyArtists(userArtists);
      
      const allArtists = await Artist.list();
      setArtists(allArtists);
    } catch (error) {
      console.error('Error deleting artist:', error);
    }
  };

  // Group artists by selected criteria
  const groupedArtists = React.useMemo(() => {
    const groups = {};
    
    artists.forEach(artist => {
      let key;
      switch (groupBy) {
        case 'country':
          key = artist.location_country === 'Israel' ? 'Palestine' : artist.location_country;
          break;
        case 'practice':
          key = artist.primary_practice;
          break;
        default: // city
          key = artist.location_city;
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(artist);
    });
    
    return groups;
  }, [artists, groupBy]);

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-black' : 'bg-gradient-to-br from-emerald-50 via-white to-yellow-50'}`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isDarkMode ? 'border-emerald-400' : 'border-emerald-600'} mx-auto mb-4`}></div>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading Ahwaaz...</p>
        </div>
      </div>
    );
  }

  if (selectedCity) {
    return (
      <CityView
        city={selectedCity}
        artists={groupedArtists[selectedCity] || []}
        onBack={() => setSelectedCity(null)}
        onArtistSelect={setSelectedArtist}
        currentUser={currentUser}
        onUserUpdate={handleUserUpdate}
      />
    );
  }

  return (
    <div className={`w-screen overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-emerald-50 via-white to-yellow-50'}`} style={{ height: 'calc(var(--vh, 1vh) * 100)' }}>
      {/* Onboarding Tour */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingTour onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setShowSidebar(false)}
            />
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-80 z-50"
            >
              <Sidebar
                isOpen={showSidebar}
                onClose={() => setShowSidebar(false)}
                currentUser={currentUser}
                onStartTour={handleStartTour}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex flex-col h-full">
        {/* Header - Only show in grid view */}
        {view === 'grid' && (
          <div className={`p-4 border-b backdrop-blur-xl ${isDarkMode ? 'bg-gray-900/60 border-gray-700/50' : 'bg-white/20 border-white/30'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  Discover Creatives
                </h1>
                <Badge variant="outline" className={`${isDarkMode ? 'bg-gray-800/40 border-gray-700/40 text-gray-300' : 'bg-white/20 border-white/40 text-gray-700'}`}>
                  {artists.length} artists
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Users className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Group by:</span>
                <Select value={groupBy} onValueChange={setGroupBy}>
                  <SelectTrigger className={`w-32 ${isDarkMode ? 'bg-gray-800/50 border-gray-700/60 text-gray-200' : 'bg-white/30 border-white/60'}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={`${isDarkMode ? 'bg-gray-950/95 border-gray-800' : 'bg-white/90 border-white/50'}`}>
                    <SelectItem value="city" className={isDarkMode ? 'hover:bg-gray-800/60' : 'hover:bg-white/20'}>City</SelectItem>
                    <SelectItem value="country" className={isDarkMode ? 'hover:bg-gray-800/60' : 'hover:bg-white/20'}>Country</SelectItem>
                    <SelectItem value="practice" className={isDarkMode ? 'hover:bg-gray-800/60' : 'hover:bg-white/20'}>Practice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 min-h-0">
          {view === 'map' && (
            <div className="h-full relative">
              <MapContainer
                center={[20, 77]}
                zoom={3}
                className="h-full w-full"
                style={{ background: isDarkMode ? '#1f2937' : '#f0fdf4' }}
              >
                <TileLayer
                  url={isDarkMode 
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  }
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {artists.map((artist) => (
                  <Marker
                    key={artist.id}
                    position={[artist.latitude, artist.longitude]}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold">{artist.name}</h3>
                        <p className="text-sm text-gray-600">{artist.primary_practice}</p>
                        <p className="text-xs text-gray-500">{artist.location_city}, {artist.location_country}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}

          {view === 'grid' && (
            <div className="h-full overflow-y-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Object.entries(groupedArtists).map(([groupName, groupArtists]) => (
                  <Card
                    key={groupName}
                    className={`cursor-pointer transition-all hover:shadow-lg ${isDarkMode ? 'bg-gray-800/70 hover:bg-gray-800/90 border-gray-700/50' : 'bg-white/80 hover:bg-white/90 border-white/40'}`}
                    onClick={() => setSelectedCity(groupName)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className={`text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        {groupName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {groupArtists.length} creative{groupArtists.length !== 1 ? 's' : ''}
                        </span>
                        <div className="flex -space-x-2">
                          {groupArtists.slice(0, 3).map((artist, index) => (
                            <div
                              key={artist.id}
                              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold ${isDarkMode ? 'bg-emerald-900/50 border-gray-700 text-emerald-400' : 'bg-emerald-100 border-white text-emerald-700'}`}
                            >
                              {artist.name.charAt(0)}
                            </div>
                          ))}
                          {groupArtists.length > 3 && (
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-100 border-white text-gray-600'}`}>
                              +{groupArtists.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {view === 'dashboard' && (
            <div className="h-full overflow-y-auto p-4">
              {currentUser ? (
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        Your Dashboard
                      </h1>
                      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Manage your artist profiles
                      </p>
                    </div>
                    <Button
                      onClick={() => window.location.href = createPageUrl('Profile')}
                      className={`${isDarkMode ? 'bg-emerald-600/80 hover:bg-emerald-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Profile
                    </Button>
                  </div>

                  {myArtists.length === 0 ? (
                    <Card className={`text-center p-8 ${isDarkMode ? 'bg-gray-800/70 border-gray-700/50' : 'bg-white/80 border-white/40'}`}>
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-emerald-900/50' : 'bg-emerald-100'}`}>
                        <Plus className={`w-8 h-8 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                      </div>
                      <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        Create Your First Profile
                      </h3>
                      <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Join the global South Asian creative community by creating your artist profile.
                      </p>
                      <Button
                        onClick={() => window.location.href = createPageUrl('Profile')}
                        className={`${isDarkMode ? 'bg-emerald-600/80 hover:bg-emerald-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                      >
                        Get Started
                      </Button>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {myArtists.map((artist) => (
                        <Card key={artist.id} className={`${isDarkMode ? 'bg-gray-800/70 border-gray-700/50' : 'bg-white/80 border-white/40'}`}>
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className={`text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                  {artist.name}
                                </CardTitle>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {artist.primary_practice}
                                </p>
                              </div>
                              <Badge
                                variant={artist.is_published ? "default" : "secondary"}
                                className={artist.is_published 
                                  ? (isDarkMode ? 'bg-emerald-600/80 text-white' : 'bg-emerald-600 text-white')
                                  : (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700')
                                }
                              >
                                {artist.is_published ? 'Published' : 'Draft'}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <p className={`text-sm line-clamp-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {artist.bio}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.location.href = `${createPageUrl('Profile')}?id=${artist.id}`}
                                  className={`${isDarkMode ? 'border-gray-600/50 bg-gray-700/30 hover:bg-gray-600/50 text-gray-300' : ''}`}
                                >
                                  <Edit className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handlePublishToggle(artist.id, artist.is_published)}
                                  className={`${isDarkMode ? 'border-gray-600/50 bg-gray-700/30 hover:bg-gray-600/50 text-gray-300' : ''}`}
                                >
                                  {artist.is_published ? (
                                    <>
                                      <EyeOff className="w-4 h-4 mr-1" />
                                      Unpublish
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="w-4 h-4 mr-1" />
                                      Publish
                                    </>
                                  )}
                                </Button>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteArtist(artist.id)}
                                className={`text-red-500 hover:text-red-700 ${isDarkMode ? 'hover:bg-red-900/20' : 'hover:bg-red-50'}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Card className={`text-center p-8 max-w-md mx-auto ${isDarkMode ? 'bg-gray-800/70 border-gray-700/50' : 'bg-white/80 border-white/40'}`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-emerald-900/50' : 'bg-emerald-100'}`}>
                    <LayoutDashboard className={`w-8 h-8 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    Sign In Required
                  </h3>
                  <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Please sign in to access your dashboard and manage your artist profiles.
                  </p>
                  <Button
                    onClick={() => User.login()}
                    className={`${isDarkMode ? 'bg-emerald-600/80 hover:bg-emerald-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                  >
                    Sign In
                  </Button>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Bottom Navigation Dock */}
        <div className={`backdrop-blur-3xl border-t flex-shrink-0 shadow-lg ${isDarkMode ? 'bg-gray-900/60 border-gray-700/40' : 'bg-white/20 border-white/30'}`}>
          <div className="px-4 pt-3 pb-6" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
            <div className="flex items-center justify-between max-w-md mx-auto">
              {/* Menu Button */}
              <Button
                variant="ghost"
                onClick={() => setShowSidebar(true)}
                className="w-16 h-12 p-0 bg-transparent hover:bg-transparent transition-all flex items-center justify-center"
              >
                <Menu 
                  style={{ width: '24px', height: '24px' }}
                  className={`transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`} 
                />
              </Button>

              {/* View Toggle Buttons */}
              <div className={`flex items-center rounded-lg p-1 backdrop-blur-xl border shadow-md ${isDarkMode ? 'bg-gray-800/60 border-gray-700/50' : 'bg-white/30 border-white/40'}`}>
                <Button
                  variant={view === 'map' ? 'default' : 'ghost'}
                  onClick={() => setView('map')}
                  className={`w-16 h-10 p-0 transition-all ${
                    view === 'map' 
                      ? (isDarkMode ? 'bg-emerald-600/80 text-white shadow-md' : 'bg-emerald-600 text-white shadow-md')
                      : (isDarkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50' : 'text-gray-600 hover:text-gray-800 hover:bg-white/30')
                  }`}
                >
                  <MapIcon style={{ width: '20px', height: '20px' }} />
                </Button>
                <Button
                  variant={view === 'grid' ? 'default' : 'ghost'}
                  onClick={() => setView('grid')}
                  className={`w-16 h-10 p-0 transition-all ${
                    view === 'grid' 
                      ? (isDarkMode ? 'bg-emerald-600/80 text-white shadow-md' : 'bg-emerald-600 text-white shadow-md')
                      : (isDarkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50' : 'text-gray-600 hover:text-gray-800 hover:bg-white/30')
                  }`}
                >
                  <LayoutGrid style={{ width: '20px', height: '20px' }} />
                </Button>
              </div>

              {/* Dashboard Button */}
              <Button
                variant="ghost"
                onClick={() => setView('dashboard')}
                className="w-16 h-12 p-0 bg-transparent hover:bg-transparent transition-all flex items-center justify-center"
              >
                <LayoutDashboard 
                  style={{ width: '24px', height: '24px' }}
                  className={`transition-colors ${
                    view === 'dashboard' 
                      ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600')
                      : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800')
                  }`} 
                />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Artist Modal */}
      <AnimatePresence>
        {selectedArtist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedArtist(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <ArtistCard
                artist={selectedArtist}
                onClose={() => setSelectedArtist(null)}
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