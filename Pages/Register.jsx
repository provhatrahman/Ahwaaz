
import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Artist } from "@/entities/Artist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Plus, Trash2, ChevronsUpDown, Check, XIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { countries } from "@/components/data/countries.jsx";


const creativePractices = [
  "A&R", "Actor", "Agent", "Animator", "Architect", "Art Director", "Audio Engineer", "Author", 
  "Band", "Choreographer", "Cinematographer", "Collective", "Colourist", "Composer", "Content Creator", 
  "Copywriter", "Creative Director", "Creative Strategist", "Curator", "DJ", "Dancer", "Drag Artist", 
  "Event Producer", "Event Promoter", "Fashion Designer", "Film Director", "Graphic Designer", 
  "Illustrator", "Journalist", "Label Manager", "Lighting Designer", "Manager", "Marketing Manager", 
  "Mastering Engineer", "Mixing Engineer", "Motion Graphics Artist", "Music Producer", "Music Supervisor", 
  "Musician", "Painter", "Photographer", "Playwright", "Poet", "Radio Host", "Rapper", "Screenwriter", 
  "Set Designer", "Social Media Manager", "Songwriter", "Sound Designer", "Tailor", "Tour Manager", 
  "Venue Owner", "Video Editor", "Videographer", "Visual Artist", "Vocalist", "Voice Actor"
].sort();


const contactMethods = ["Email", "Instagram", "Website", "Phone"];

// Sample coordinates for major cities
const cityCoordinates = {
  "Mumbai": { lat: 19.0760, lng: 72.8777 },
  "Delhi": { lat: 28.7041, lng: 77.1025 },
  "Bangalore": { lat: 12.9716, lng: 77.5946 },
  "Chennai": { lat: 13.0827, lng: 80.2707 },
  "Kolkata": { lat: 22.5726, lng: 88.3639 },
  "Hyderabad": { lat: 17.3850, lng: 78.4867 },
  "Pune": { lat: 18.5204, lng: 73.8567 },
  "Ahmedabad": { lat: 23.0225, lng: 72.5714 },
  "Karachi": { lat: 24.8607, lng: 67.0011 },
  "Lahore": { lat: 31.5204, lng: 74.3587 },
  "Islamabad": { lat: 33.6844, lng: 73.0479 },
  "Dhaka": { lat: 23.8103, lng: 90.4125 },
  "Chittagong": { lat: 22.3569, lng: 91.7832 },
  "Colombo": { lat: 6.9271, lng: 79.8612 },
  "Kathmandu": { lat: 27.7172, lng: 85.3240 },
  "London": { lat: 51.5074, lng: -0.1278 },
  "New York": { lat: 40.7128, lng: -74.0060 },
  "Toronto": { lat: 43.6532, lng: -79.3832 },
  "Vancouver": { lat: 49.2827, lng: -123.1207 },
  "Sydney": { lat: -33.8688, lng: 151.2093 },
  "Melbourne": { lat: -37.8136, lng: 144.9631 },
  "Dubai": { lat: 25.2048, lng: 55.2708 },
  "Singapore": { lat: 1.3521, lng: 103.8198 }
};

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location_city: "",
    location_country: "",
    primary_practice: "",
    secondary_practices: [],
    style_genre: "",
    ethnic_background: "",
    bio: "",
    portfolio_links: {
      website: "",
      instagram: ""
    },
    custom_links: [],
    contact_method: "",
    profile_image_url: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handlePortfolioLinkChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      portfolio_links: {
        ...prev.portfolio_links,
        [platform]: value
      }
    }));
  };

  const handlePrimaryPracticeChange = (value) => {
    handleInputChange("primary_practice", value);
  };

  const handleSecondaryPracticeToggle = (practice) => {
    setFormData(prev => {
      const secondary_practices = prev.secondary_practices.includes(practice)
        ? prev.secondary_practices.filter(p => p !== practice)
        : [...prev.secondary_practices, practice];
      return { ...prev, secondary_practices };
    });
  };

  const addCustomLink = () => {
    setFormData(prev => ({
      ...prev,
      custom_links: [...prev.custom_links, { label: "", url: "" }]
    }));
  };

  const updateCustomLink = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      custom_links: prev.custom_links.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const removeCustomLink = (index) => {
    setFormData(prev => ({
      ...prev,
      custom_links: prev.custom_links.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.location_city.trim()) newErrors.location_city = "City is required";
    if (!formData.location_country.trim()) newErrors.location_country = "Country is required";
    if (!formData.primary_practice) newErrors.primary_practice = "Primary practice is required";
    if (!formData.bio.trim()) newErrors.bio = "Bio is required";
    if (formData.bio.length > 500) newErrors.bio = "Bio must be 500 characters or less";
    if (!formData.contact_method) newErrors.contact_method = "Contact method is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Use existing cityCoordinates for known cities, otherwise default to (0,0)
      const coordinates = cityCoordinates[formData.location_city] || { lat: 0, lng: 0 };
      
      const artistData = {
        ...formData,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        custom_links: formData.custom_links.filter(link => link.label && link.url),
        is_active: true
      };

      await Artist.create(artistData);
      setIsSuccess(true);
    } catch (error) {
      console.error("Error creating artist profile:", error);
      setErrors({ submit: "Failed to create profile. Please try again." });
    }
    
    setIsSubmitting(false);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-yellow-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to the Community!</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Your artist profile has been created successfully. You're now part of our global creative network.
          </p>
          <Button
            asChild
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Link to="/map">
              Explore Artists
            </Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-yellow-50 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
            Join Our Creative Community
          </h1>
          <p className="text-gray-600 text-base md:text-lg">
            Connect with South Asian artists worldwide and showcase your creative work
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl md:text-2xl text-center text-gray-900">
              Artist Registration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Basic Information
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter your full name"
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="your@email.com"
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location_city">City *</Label>
                    <Input
                      id="location_city"
                      value={formData.location_city}
                      onChange={(e) => handleInputChange("location_city", e.target.value)}
                      placeholder="e.g., London, Mumbai"
                      className={errors.location_city ? "border-red-500" : ""}
                    />
                    {errors.location_city && <p className="text-red-500 text-sm mt-1">{errors.location_city}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="location_country">Country *</Label>
                     <Select
                      value={formData.location_country}
                      onValueChange={(value) => handleInputChange("location_country", value)}
                    >
                      <SelectTrigger className={errors.location_country ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map(country => (
                          <SelectItem key={country.code} value={country.name}>{country.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.location_country && <p className="text-red-500 text-sm mt-1">{errors.location_country}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="ethnic_background">Ethnic/Cultural Background</Label>
                  <Input
                    id="ethnic_background"
                    value={formData.ethnic_background}
                    onChange={(e) => handleInputChange("ethnic_background", e.target.value)}
                    placeholder="e.g., Punjabi, Bengali, Tamil, Pakistani, etc."
                  />
                  <p className="text-xs text-gray-500 mt-1">Help others discover artists from their community</p>
                </div>
              </div>

              {/* Creative Practice */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Creative Practice
                </h3>
                
                <div>
                  <Label htmlFor="primary_practice">Primary Creative Practice *</Label>
                  <PracticeCombobox
                    value={formData.primary_practice}
                    onChange={handlePrimaryPracticeChange}
                    placeholder="Select primary practice..."
                  />
                  {errors.primary_practice && <p className="text-red-500 text-sm mt-1">{errors.primary_practice}</p>}
                </div>

                <div>
                  <Label>Secondary Creative Practices (Optional)</Label>
                  <MultiPracticeSelect
                    selected={formData.secondary_practices}
                    onChange={handleSecondaryPracticeToggle}
                  />
                </div>

                <div>
                  <Label htmlFor="style_genre">Style/Genre/Specialization</Label>
                  <Input
                    id="style_genre"
                    value={formData.style_genre}
                    onChange={(e) => handleInputChange("style_genre", e.target.value)}
                    placeholder="e.g., Portrait Photography, Classical Bharatanatyam, Electronic Music, etc."
                  />
                  <p className="text-xs text-gray-500 mt-1">What style or genre best describes your work?</p>
                </div>

                <div>
                  <Label htmlFor="contact_method">Preferred Contact Method *</Label>
                  <Select
                    value={formData.contact_method}
                    onValueChange={(value) => handleInputChange("contact_method", value)}
                  >
                    <SelectTrigger className={errors.contact_method ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select contact method" />
                    </SelectTrigger>
                    <SelectContent>
                      {contactMethods.map(method => (
                        <SelectItem key={method} value={method}>{method}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.contact_method && <p className="text-red-500 text-sm mt-1">{errors.contact_method}</p>}
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  About You
                </h3>
                
                <div>
                  <Label htmlFor="bio">Artist Bio / Statement *</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Tell us about your creative journey, style, and what drives your work..."
                    className={`min-h-[120px] ${errors.bio ? "border-red-500" : ""}`}
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.bio && <p className="text-red-500 text-sm">{errors.bio}</p>}
                    <p className="text-sm text-gray-500 ml-auto">
                      {formData.bio.length}/500 characters
                    </p>
                  </div>
                </div>
              </div>

              {/* Portfolio Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Portfolio & Links
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.portfolio_links.website}
                      onChange={(e) => handlePortfolioLinkChange("website", e.target.value)}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={formData.portfolio_links.instagram}
                      onChange={(e) => handlePortfolioLinkChange("instagram", e.target.value)}
                      placeholder="@yourusername"
                    />
                  </div>
                </div>

                {/* Custom Links */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Additional Links</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addCustomLink}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Link
                    </Button>
                  </div>
                  
                  {formData.custom_links.map((link, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Label htmlFor={`link-label-${index}`}>Label</Label>
                        <Input
                          id={`link-label-${index}`}
                          value={link.label}
                          onChange={(e) => updateCustomLink(index, "label", e.target.value)}
                          placeholder="e.g., YouTube Channel, Portfolio"
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={`link-url-${index}`}>URL</Label>
                        <Input
                          id={`link-url-${index}`}
                          value={link.url}
                          onChange={(e) => updateCustomLink(index, "url", e.target.value)}
                          placeholder="https://..."
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeCustomLink(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {errors.submit && (
                <div className="text-red-500 text-sm text-center">{errors.submit}</div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 py-3 text-lg font-semibold"
              >
                {isSubmitting ? "Creating Profile..." : "Join Creative Community"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Combobox for a single selection
function PracticeCombobox({ value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleSelect = (currentValue) => {
    onChange(currentValue);
    setOpen(false);
  };

  const filteredPractices = creativePractices.filter(p => p.toLowerCase().includes(search.toLowerCase()));
  const showCreateOption = search && !filteredPractices.some(p => p.toLowerCase() === search.toLowerCase());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput 
            placeholder="Search practice..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {showCreateOption ? "..." : "No practice found."}
            </CommandEmpty>
            <CommandGroup>
              {filteredPractices.map((practice) => (
                <CommandItem
                  key={practice}
                  value={practice}
                  onSelect={() => handleSelect(practice)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === practice ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {practice}
                </CommandItem>
              ))}
            </CommandGroup>
            {showCreateOption && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={() => handleSelect(search)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create "{search}"
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Multi-select for secondary practices
function MultiPracticeSelect({ selected, onChange }) {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add secondary practices
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search practices..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {creativePractices.map((practice) => {
                  const isSelected = selected.includes(practice);
                  return (
                    <CommandItem
                      key={practice}
                      onSelect={() => onChange(practice)}
                      disabled={isSelected}
                      className={isSelected ? "opacity-50 cursor-not-allowed" : ""}
                    >
                       <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <Check className={cn("h-4 w-4")} />
                      </div>
                      <span>{practice}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <div className="flex flex-wrap gap-2">
        {selected.map((practice) => (
          <Badge key={practice} variant="secondary">
            {practice}
            <button
              type="button"
              className="ml-1.5"
              onClick={() => onChange(practice)}
            >
              <XIcon className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
