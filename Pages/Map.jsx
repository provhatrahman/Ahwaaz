import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Menu, MapIcon, LayoutGrid, Users, LayoutDashboard, Plus, Eye, EyeOff, Edit, Trash2, Filter, Search, LocateFixed, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { Artist } from '@/entities/Artist';
import { User } from '@/entities/User';
import ArtistCard from '../components/discovery/AristCard.jsx';
import CityView from '../components/discovery/CityView';
import Sidebar from '../components/layout/Sidebar';
import OnboardingTour from '../components/discovery/OnboardingTour';
import FilterSidebar from '../components/discovery/FilterSidebar';
import { Input } from '@/components/ui/input';
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
  const [showFilters, setShowFilters] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [leafletMap, setLeafletMap] = useState(null);
  const [filters, setFilters] = useState({
    practices: [],
    countries: [],
    cities: [],
    genres: [],
    ethnicities: [],
    showLikes: false
  });

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

  // Apply filters to artists for map/grid views
  const filteredArtists = useMemo(() => {
    let filtered = artists;
    if (filters.showLikes && currentUser) {
      const likedIds = currentUser.liked_artists || [];
      filtered = filtered.filter(a => likedIds.includes(a.id));
    }
    if (filters.practices.length > 0) {
      filtered = filtered.filter(a =>
        filters.practices.includes(a.primary_practice) ||
        a.secondary_practices?.some(p => filters.practices.includes(p))
      );
    }
    if (filters.countries.length > 0) {
      filtered = filtered.filter(a => {
        const displayCountry = a.location_country === 'Israel' ? 'Palestine' : a.location_country;
        return filters.countries.includes(displayCountry);
      });
    }
    if (filters.cities.length > 0) {
      filtered = filtered.filter(a => filters.cities.includes(a.location_city));
    }
    if (filters.genres.length > 0) {
      filtered = filtered.filter(a => filters.genres.includes(a.style_genre));
    }
    if (filters.ethnicities.length > 0) {
      filtered = filtered.filter(a => filters.ethnicities.includes(a.ethnic_background));
    }
    if (searchTerm.trim()) {
      const t = searchTerm.toLowerCase();
      filtered = filtered.filter(a => (
        a.name?.toLowerCase().includes(t) ||
        a.primary_practice?.toLowerCase().includes(t) ||
        a.secondary_practices?.some(p => p.toLowerCase().includes(t)) ||
        a.ethnic_background?.toLowerCase().includes(t) ||
        a.location_city?.toLowerCase().includes(t) ||
        (a.location_country === 'Israel' ? 'palestine' : a.location_country?.toLowerCase()).includes(t) ||
        a.style_genre?.toLowerCase().includes(t)
      ));
    }
    return filtered;
  }, [artists, filters, searchTerm, currentUser]);

  // Group artists by selected criteria (for grid and city view)
  const groupedArtists = useMemo(() => {
    const groups = {};
    filteredArtists.forEach(artist => {
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
  }, [filteredArtists, groupBy]);

  // City clusters for the map view
  const cityClusters = useMemo(() => {
    const clusters = {};
    filteredArtists.forEach(a => {
      if (!a.location_city || a.latitude == null || a.longitude == null) return;
      const key = a.location_city;
      if (!clusters[key]) {
        clusters[key] = { city: key, artists: [], latSum: 0, lngSum: 0 };
      }
      clusters[key].artists.push(a);
      clusters[key].latSum += a.latitude;
      clusters[key].lngSum += a.longitude;
    });
    return Object.values(clusters).map(c => ({
      city: c.city,
      count: c.artists.length,
      lat: c.latSum / c.artists.length,
      lng: c.lngSum / c.artists.length,
      artists: c.artists
    }));
  }, [filteredArtists]);

  const countriesCount = useMemo(() => {
    const set = new Set();
    filteredArtists.forEach(a => set.add(a.location_country === 'Israel' ? 'Palestine' : a.location_country));
    return set.size;
  }, [filteredArtists]);

  const createClusterIcon = (count) => {
    const size = count >= 100 ? 44 : count >= 10 ? 40 : 36;
    const html = `\n      <div style="width:${size}px;height:${size}px;border-radius:9999px;display:flex;align-items:center;justify-content:center;background:#10b981;color:#fff;font-weight:700;border:2px solid rgba(16,185,129,0.8);box-shadow:0 4px 10px rgba(0,0,0,0.15)">${count}</div>\n    `;
    return L.divIcon({ html, className: '', iconSize: [size, size] });
  };

  const handleLocate = () => {
    if (!leafletMap || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      leafletMap.setView([latitude, longitude], 6);
    });
  };

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

      {/* App Sidebar */}
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

        {/* Filter Drawer (Map + Grid) */}
        <div className="fixed top-0 left-0 bottom-0 z-40">
          <AnimatePresence>
            {showFilters && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/10"
                  onClick={() => setShowFilters(false)}
                />
                <motion.div
                  initial={{ x: -320 }}
                  animate={{ x: 0 }}
                  exit={{ x: -320 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className={`w-80 h-full backdrop-blur-2xl border-r shadow-2xl relative ${isDarkMode ? 'bg-gray-800/90 border-gray-700/50' : 'bg-white/15 border-white/25'}`}
                >
                  <FilterSidebar
                    artists={artists}
                    filters={filters}
                    onFiltersChange={setFilters}
                    onClose={() => setShowFilters(false)}
                    currentUser={currentUser}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0">
          {view === 'map' && (
            <div className="h-full relative">
              {/* Top center stats pill */}
              <div className="absolute top-4 left-0 right-0 z-20 flex justify-center">
                <div className={`px-4 py-2 rounded-full shadow-md border flex items-center gap-4 ${isDarkMode ? 'bg-gray-900/70 border-gray-700/60 text-gray-200' : 'bg-white/80 border-white/60 text-gray-800'}`}>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium">{filteredArtists.length} creatives</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-gray-400" />
                  <div className="flex items-center gap-2">
                    <MapIcon className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium">{countriesCount} countries</span>
                  </div>
                </div>
              </div>

              <MapContainer
                center={[20, 77]}
                zoom={3}
                className="h-full w-full"
                style={{ background: isDarkMode ? '#1f2937' : '#f0fdf4' }}
                whenCreated={setLeafletMap}
              >
                <TileLayer
                  url={isDarkMode 
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  }
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {cityClusters.map((cluster) => (
                  <Marker
                    key={cluster.city}
                    position={[cluster.lat, cluster.lng]}
                    icon={createClusterIcon(cluster.count)}
                    eventHandlers={{
                      click: () => setSelectedCity(cluster.city)
                    }}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold">{cluster.city}</h3>
                        <p className="text-sm text-gray-600">{cluster.count} creative{cluster.count !== 1 ? 's' : ''}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>

              {/* Floating right-side buttons */}
              <div className="absolute right-4 z-20 flex flex-col gap-3" style={{ bottom: 'calc(80px + max(1.5rem, env(safe-area-inset-bottom)))' }}>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowFilters(true)}
                  className={`w-12 h-12 rounded-full backdrop-blur-2xl shadow-lg border ${isDarkMode ? 'bg-gray-800/80 border-gray-600/50 hover:bg-gray-700/80 text-gray-300' : 'bg-white/80 border-white/40 hover:bg-white text-gray-800'}`}
                >
                  <Filter className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleLocate}
                  className={`w-12 h-12 rounded-full backdrop-blur-2xl shadow-lg border ${isDarkMode ? 'bg-gray-800/80 border-gray-600/50 hover:bg-gray-700/80 text-gray-300' : 'bg-white/80 border-white/40 hover:bg-white text-gray-800'}`}
                >
                  <LocateFixed className="w-5 h-5" />
                </Button>
              </div>

              {/* Search overlay */}
              <AnimatePresence>
                {showSearch && (
                  <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-6 left-6 right-6 z-30"
                  >
                    <div className={`flex items-center gap-2 px-4 py-3 rounded-lg backdrop-blur-2xl shadow-lg border ${isDarkMode ? 'bg-gray-800/90 border-gray-600/50' : 'bg-white/90 border-white/40'}`}>
                      <Search className={`h-5 w-5 flex-shrink-0 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                      <Input 
                        placeholder="Search artists..." 
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
        <div className={`backdrop-blur-3xl border-t flex-shrink-0 shadow-lg z-50 ${isDarkMode ? 'bg-gray-900/60 border-gray-700/40' : 'bg-white/20 border-white/30'}`}>
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

              {/* Search button */}
              <Button
                variant="ghost"
                onClick={() => setShowSearch(true)}
                className="w-16 h-12 p-0 bg-transparent hover:bg-transparent transition-all flex items-center justify-center"
              >
                <Search 
                  style={{ width: '22px', height: '22px' }}
                  className={`transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`} 
                />
              </Button>

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