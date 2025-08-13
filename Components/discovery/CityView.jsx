import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Users, Filter, Shuffle, Search, X } from "lucide-react";
import ArtistCard from "./AristCard.jsx";
import FilterSidebar from "./FilterSidebar";
import { useTheme } from "../theme/ThemeProvider";

export default function CityView({ city, artists, onBack, onArtistSelect, currentUser, onUserUpdate }) {
  const { isDarkMode } = useTheme();
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [filteredArtists, setFilteredArtists] = useState(artists);
  const [showFilters, setShowFilters] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    practices: [],
    countries: [],
    cities: [],
    genres: [],
    ethnicities: [],
    showLikes: false,
  });

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

  // Apply filters whenever artists, filters, or search term changes
  useEffect(() => {
    applyFilters();
  }, [artists, filters, searchTerm]);

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

  const handleArtistClick = (artist) => {
    setSelectedArtist(artist);
  };

  const handleCloseModal = () => {
    setSelectedArtist(null);
  };

  const handleCloseFilters = () => {
    setShowFilters(false);
  };

  const getRandomArtist = () => {
    if (filteredArtists.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredArtists.length);
      setSelectedArtist(filteredArtists[randomIndex]);
    }
  };

  return (
    <div className={`w-screen overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-emerald-50 via-white to-yellow-50'}`} style={{ height: 'calc(var(--vh, 1vh) * 100)' }}>
      {/* --- Filter Sidebar --- */}
      <div className="fixed top-0 left-0 bottom-0 z-0">
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
        className="flex flex-col bg-transparent overflow-y-auto"
        style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
        animate={{ x: showFilters ? 320 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 50 }}
      >
        {/* Clickable overlay to close filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/10 z-40"
              onClick={() => setShowFilters(false)}
            />
          )}
        </AnimatePresence>

        {/* Floating Back Button - Left Side */}
        <div className="fixed left-6 z-40" style={{ bottom: 'calc(80px + max(1.5rem, env(safe-area-inset-bottom)))' }}>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onBack} 
            className={`w-14 h-14 rounded-full backdrop-blur-2xl shadow-lg border ${isDarkMode ? 'bg-gray-800/80 border-gray-600/50 hover:bg-gray-700/80 text-gray-300' : 'bg-white/80 border-white/40 hover:bg-white text-gray-800'}`}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </div>



        {/* Floating Filter and Random Buttons - Above Dock */}
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



        {/* Search Overlay */}
        <AnimatePresence>
          {showSearch && (
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
                  placeholder="Search within this group..." 
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
        <main className="flex-1 min-h-0 focus:outline-none bg-transparent overflow-y-auto" tabIndex={0}>
          <div className="p-4 sm:p-6">
            {/* City information header */}
            <div className="mb-6 sm:mb-8">
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <MapPin className={`w-6 h-6 mt-1 flex-shrink-0 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  <h1 className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} break-words`}>
                    {city}
                  </h1>
                </div>
                <div className="flex items-center gap-3 ml-9">
                  <Users className={`w-4 h-4 flex-shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {filteredArtists.length === artists.length 
                      ? `${filteredArtists.length} creative${filteredArtists.length !== 1 ? 's' : ''}`
                      : `${filteredArtists.length} of ${artists.length} creative${artists.length !== 1 ? 's' : ''}`
                    }
                  </p>
                </div>
                {filteredArtists.length > 0 && (
                  <div className="ml-9 mt-3">
                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} italic`}>
                      💡 Tap any profile card to bring into focus
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredArtists.map((artist, index) => (
                <motion.div
                  key={artist.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleArtistClick(artist)}
                  className={`cursor-pointer ${isDarkMode ? 'drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)]' : 'drop-shadow-[0_8px_25px_rgba(0,0,0,0.15)]'}`}
                >
                  <ArtistCard artist={artist} currentUser={currentUser} onUserUpdate={onUserUpdate} />
                </motion.div>
              ))}
            </div>

            {/* No Results Message */}
            {filteredArtists.length === 0 && (
              <div className="text-center py-12 px-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                  <Users className={`w-8 h-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>No creatives found</h3>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Try adjusting your filters or search term within this group
                </p>
              </div>
            )}
          </div>
        </main>

        {/* Dock - Bottom Navigation */}
        <footer className={`backdrop-blur-3xl border-t z-30 flex-shrink-0 shadow-lg ${isDarkMode ? 'bg-gray-900/60 border-gray-700/40' : 'bg-white/20 border-white/30'}`}>
          <div className="px-4 pt-3 pb-6" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
            <div className="flex items-center justify-center">
              {/* Search Icon */}
              <Button
                variant="ghost"
                onClick={() => setShowSearch(true)}
                className="w-16 h-12 p-0 bg-transparent hover:bg-transparent transition-all search-button flex items-center justify-center"
              >
                <Search 
                  style={{ width: '24px', height: '24px' }}
                  className={`transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`} 
                />
              </Button>
            </div>
          </div>
        </footer>
      </motion.div>

      {/* Artist Modal */}
      <AnimatePresence>
        {selectedArtist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-hidden"
            onClick={handleCloseModal}
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
                onClose={handleCloseModal}
                isModal={true}
                currentUser={currentUser}
                onUserUpdate={onUserUpdate}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}