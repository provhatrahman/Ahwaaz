import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Users, Globe, ArrowLeft } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useTheme } from '../components/theme/ThemeProvider';

export default function AboutPage() {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-black' : 'bg-gradient-to-br from-emerald-50 via-white to-yellow-50'} relative`}>
      {/* Floating Back Button */}
      <div className="fixed top-6 left-6 z-50">
        <Button variant="outline" asChild className={`backdrop-blur-sm shadow-lg border ${isDarkMode ? 'bg-gray-800/80 border-gray-600/50 hover:bg-gray-700/80 text-gray-300' : 'bg-white/80 hover:bg-white border-white/40'}`}>
          <Link to={createPageUrl("Map")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Explore
          </Link>
        </Button>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12 md:pt-40 md:pb-20">
        <div className="text-center">
          <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
            Ahwaaz
          </h1>
          <p className={`mt-4 text-xl md:text-2xl ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Connecting the Gloabl South Asian Creative Community
          </p>
        </div>

        <div className={`mt-16 backdrop-blur-md border rounded-2xl shadow-xl p-8 md:p-12 space-y-12 ${isDarkMode ? 'bg-gray-950/40 border-gray-700/50' : 'bg-white/40 border-white/30'}`}>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className={`flex-shrink-0 grid place-content-center w-24 h-24 rounded-full ${isDarkMode ? 'bg-emerald-900/50' : 'bg-emerald-100/80'}`}>
              <Heart className={`w-12 h-12 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Our Mission</h2>
              <p className={`mt-4 text-lg leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Our mission is to build an accessible and interactive digital space where South Asian artists and creatives from all disciplines can connect, collaborate, and showcase their work. We aim to break down geographical barriers and foster a global community that celebrates our rich, diverse cultural heritage.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row-reverse items-center gap-8">
            <div className={`flex-shrink-0 grid place-content-center w-24 h-24 rounded-full ${isDarkMode ? 'bg-yellow-900/50' : 'bg-yellow-100/80'}`}>
              <Users className={`w-12 h-12 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>For Us, By Us</h2>
              <p className={`mt-4 text-lg leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Ahwaaz was born from a desire to see our artists gain more visibility and to create a dedicated platform for collaboration without the noise of mainstream social media platforms.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className={`flex-shrink-0 grid place-content-center w-24 h-24 rounded-full ${isDarkMode ? 'bg-rose-900/50' : 'bg-rose-100/80'}`}>
              <Globe className={`w-12 h-12 ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`} />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Join Us</h2>
              <p className={`mt-4 text-lg leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Whether you're an artist looking to create a profile, an industry professional looking to meet new people, or a developer wanting to contribute, you are welcome here.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Button size="lg" asChild className={`backdrop-blur-sm border ${isDarkMode ? 'bg-emerald-600/70 hover:bg-emerald-600/90 border-emerald-500/70' : 'bg-emerald-600/80 hover:bg-emerald-600 border-emerald-500/80'}`}>
            <Link to={createPageUrl("Map")}>
              Explore the Community
              <Globe className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}