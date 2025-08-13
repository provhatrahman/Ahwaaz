
import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { X, Filter, Trash2, Heart } from "lucide-react";
import SearchableFilterGroup from "./SearchableFilterGroup";
import { useTheme } from "../theme/ThemeProvider";

export default function FilterSidebar({ artists, filters, onFiltersChange, onClose, currentUser }) {
  const { isDarkMode } = useTheme();

  const getUniqueValues = (items, key) => [
    ...new Set(items.map(artist => artist[key]).filter(Boolean))
  ].sort();

  const getUniquePractices = (items) => [
    ...new Set(items.flatMap(artist => [artist.primary_practice, ...(artist.secondary_practices || [])]))
  ].filter(Boolean).sort();
  
  const getUniqueCountries = (items) => {
    const countries = items.map(artist => 
      artist.location_country === 'Israel' ? 'Palestine' : artist.location_country
    ).filter(Boolean);
    return [...new Set(countries)].sort();
  }

  const getFilteredArtists = (excludeCategory) => {
    let filtered = artists;
    for (const category in filters) {
      if (category === excludeCategory || category === 'showLikes' || !filters[category] || filters[category].length === 0) continue;
      
      if (category === 'practices') {
        filtered = filtered.filter(artist => 
          filters.practices.includes(artist.primary_practice) ||
          artist.secondary_practices?.some(p => filters.practices.includes(p))
        );
      } else if (category === 'countries') {
         filtered = filtered.filter(artist => {
          const displayCountry = artist.location_country === 'Israel' ? 'Palestine' : artist.location_country;
          return filters.countries.includes(displayCountry);
        });
      } else if (['cities', 'genres', 'ethnicities'].includes(category)) {
        const keyMap = { cities: 'location_city', genres: 'style_genre', ethnicities: 'ethnic_background' };
        filtered = filtered.filter(artist => filters[category].includes(artist[keyMap[category]]));
      }
    }
    return filtered;
  };
  
  const filterOptions = useMemo(() => {
    return {
      countries: getUniqueCountries(getFilteredArtists('countries')),
      cities: getUniqueValues(getFilteredArtists('cities'), 'location_city'),
      practices: getUniquePractices(getFilteredArtists('practices')),
      genres: getUniqueValues(getFilteredArtists('genres'), 'style_genre'),
      ethnicities: getUniqueValues(getFilteredArtists('ethnicities'), 'ethnic_background')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, artists]);

  const allPossibleOptions = useMemo(() => {
    return {
      countries: getUniqueCountries(artists),
      cities: getUniqueValues(artists, 'location_city'),
      practices: getUniquePractices(artists),
      genres: getUniqueValues(artists, 'style_genre'),
      ethnicities: getUniqueValues(artists, 'ethnic_background')
    }
  }, [artists]);


  const handleToggle = (category, value) => {
    const currentValues = filters[category] || [];
    const updatedValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onFiltersChange({
      ...filters,
      [category]: updatedValues
    });
  };

  const handleSwitchToggle = (category, value) => {
    onFiltersChange({
      ...filters,
      [category]: value
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      practices: [],
      countries: [],
      cities: [],
      genres: [],
      ethnicities: [],
      showLikes: false
    });
  };

  const activeFiltersCount = Object.values(filters).reduce((acc, curr) => {
    if (Array.isArray(curr)) {
      return acc + curr.length;
    }
    if (typeof curr === 'boolean' && curr) {
        return acc + 1;
    }
    return acc;
  }, 0);

  return (
    <div className="h-full flex flex-col">
      <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700/50' : 'border-white/30'}`}>
        <div className="flex items-center gap-2">
          <Filter className={`w-5 h-5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Filters</h2>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className={`ml-2 ${isDarkMode ? 'bg-gray-600 text-gray-300' : ''}`}>
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
        </Button>
      </div>

      <div className={`flex-1 overflow-y-auto p-2 divide-y ${isDarkMode ? 'divide-gray-700/50' : 'divide-gray-200'}`}>
        {currentUser && (
          <div className="p-2">
            <div className="flex items-center justify-between px-2 py-2">
              <Label htmlFor="show-likes" className="flex items-center gap-2 text-sm font-semibold text-red-500">
                <Heart className="w-4 h-4" />
                My Favorites
              </Label>
              <Switch
                id="show-likes"
                checked={filters.showLikes}
                onCheckedChange={(checked) => handleSwitchToggle('showLikes', checked)}
                className={`${filters.showLikes ? 'data-[state=checked]:bg-red-500' : (isDarkMode ? 'bg-gray-600 data-[state=unchecked]:bg-gray-600' : 'bg-gray-200')}`}
              />
            </div>
          </div>
        )}
        <SearchableFilterGroup
          title="Creative Practices"
          options={allPossibleOptions.practices}
          disabledOptions={allPossibleOptions.practices.filter(o => !filterOptions.practices.includes(o))}
          selected={filters.practices}
          onSelectionChange={(practice) => handleToggle('practices', practice)}
        />
        <SearchableFilterGroup
          title="Countries"
          options={allPossibleOptions.countries}
          disabledOptions={allPossibleOptions.countries.filter(o => !filterOptions.countries.includes(o))}
          selected={filters.countries}
          onSelectionChange={(country) => handleToggle('countries', country)}
        />
         <SearchableFilterGroup
          title="Cities"
          options={allPossibleOptions.cities}
          disabledOptions={allPossibleOptions.cities.filter(o => !filterOptions.cities.includes(o))}
          selected={filters.cities}
          onSelectionChange={(city) => handleToggle('cities', city)}
        />
        <SearchableFilterGroup
          title="Styles/Genres"
          options={allPossibleOptions.genres}
          disabledOptions={allPossibleOptions.genres.filter(o => !filterOptions.genres.includes(o))}
          selected={filters.genres}
          onSelectionChange={(genre) => handleToggle('genres', genre)}
        />
        <SearchableFilterGroup
          title="Ethnic Backgrounds"
          options={allPossibleOptions.ethnicities}
          disabledOptions={allPossibleOptions.ethnicities.filter(o => !filterOptions.ethnicities.includes(o))}
          selected={filters.ethnicities}
          onSelectionChange={(ethnicity) => handleToggle('ethnicities', ethnicity)}
        />
      </div>
      
      <div className={`p-4 border-t mt-auto ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200'}`}>
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            onClick={clearAllFilters}
            className={`w-full ${isDarkMode ? 'border-gray-600/50 bg-gray-700/30 hover:bg-gray-600/50 text-gray-300' : ''}`}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All Filters
          </Button>
        )}
      </div>
    </div>
  );
}
