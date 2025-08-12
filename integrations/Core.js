// Core integration functions for Supabase and other services

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// File upload function
export const UploadFile = async ({ file }) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return { file_url: publicUrl };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// LLM integration for location validation
export const InvokeLLM = async ({ prompt, response_json_schema }) => {
  try {
    // Mock implementation - in production, this would call an actual LLM service
    // For now, we'll do basic location validation
    const cityCountryMatch = prompt.match(/City='([^']+)', Country='([^']+)'/);
    if (!cityCountryMatch) {
      return { isValid: false };
    }

    const [, city, country] = cityCountryMatch;
    
    // Basic validation - in production, use a real geocoding service
    const knownCities = {
      'Mumbai': { country: 'India', lat: 19.0760, lng: 72.8777 },
      'Delhi': { country: 'India', lat: 28.7041, lng: 77.1025 },
      'London': { country: 'United Kingdom', lat: 51.5074, lng: -0.1278 },
      'New York': { country: 'United States', lat: 40.7128, lng: -74.0060 },
      'Toronto': { country: 'Canada', lat: 43.6532, lng: -79.3832 },
      'Karachi': { country: 'Pakistan', lat: 24.8607, lng: 67.0011 },
      'Dhaka': { country: 'Bangladesh', lat: 23.8103, lng: 90.4125 },
      'Colombo': { country: 'Sri Lanka', lat: 6.9271, lng: 79.8612 }
    };

    const cityData = knownCities[city];
    if (cityData && (cityData.country === country || country === 'India' && cityData.country === 'India')) {
      return {
        isValid: true,
        city: city,
        country: country,
        latitude: cityData.lat,
        longitude: cityData.lng
      };
    }

    return { isValid: false };
  } catch (error) {
    console.error('Error in LLM integration:', error);
    return { isValid: false, error: error.message };
  }
};