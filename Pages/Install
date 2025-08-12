import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, Share, PlusSquare, MoreVertical, Star, Home, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useTheme } from '../components/theme/ThemeProvider';

export default function InstallPage() {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-black' : 'bg-gradient-to-br from-emerald-50 via-white to-yellow-50'} relative`}>
      {/* Floating Back Button */}
      <div className="fixed top-6 left-6 z-50">
        <Button variant="outline" asChild className={`backdrop-blur-sm shadow-lg ${isDarkMode ? 'bg-gray-800/90 border-gray-600/50 hover:bg-gray-700/80 text-gray-300' : 'bg-white/90 hover:bg-white'}`}>
          <Link to={createPageUrl("Map")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Explore
          </Link>
        </Button>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12 md:pt-40 md:pb-20">
        <div className="text-center mb-12">
          <div className={`inline-block p-4 rounded-full mb-4 ${isDarkMode ? 'bg-emerald-900/50' : 'bg-emerald-100'}`}>
             <Home className={`w-12 h-12 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
          </div>
          <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Install Ahwaaz
          </h1>
          <p className={`mt-4 text-xl md:text-2xl max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Get quick access to the Ahwaaz community by adding it to your home screen.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* iOS Instructions */}
          <Card className={`shadow-lg border-0 backdrop-blur-sm ${isDarkMode ? 'bg-gray-950/60 border-gray-800/50' : 'bg-white/80'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-3 text-2xl ${isDarkMode ? 'text-gray-100' : ''}`}>
                <i className={`bi-apple ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}></i>
                <span>For iOS & iPadOS</span>
              </CardTitle>
            </CardHeader>
            <CardContent className={`space-y-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>Open Ahwaaz in your <strong>Safari</strong> browser and follow these steps:</p>
              <ol className="space-y-4 list-decimal list-inside">
                <li>
                  Tap the 'Share' icon at the bottom of the screen (under the page URL).
                  <div className={`text-center p-4 my-2 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <Share className="w-8 h-8 mx-auto text-blue-500" />
                  </div>
                </li>
                <li>
                  Scroll down in the share menu and tap on <strong>'Add to Home Screen'</strong>.
                  <div className={`text-center p-4 my-2 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <PlusSquare className={`w-8 h-8 mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                  </div>
                </li>
                <li>
                  Confirm by tapping 'Add' in the top-right corner.
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Android Instructions */}
          <Card className={`shadow-lg border-0 backdrop-blur-sm ${isDarkMode ? 'bg-gray-950/60 border-gray-800/50' : 'bg-white/80'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-3 text-2xl ${isDarkMode ? 'text-gray-100' : ''}`}>
                <i className={`bi-google ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}></i>
                <span>For Android</span>
              </CardTitle>
            </CardHeader>
            <CardContent className={`space-y-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
               <p>Open Ahwaaz in your <strong>Chrome</strong> browser and follow these steps:</p>
              <ol className="space-y-4 list-decimal list-inside">
                <li>
                  Tap the three-dot menu icon in the top-right corner.
                  <div className={`text-center p-4 my-2 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <MoreVertical className={`w-8 h-8 mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                  </div>
                </li>
                <li>
                  Tap on <strong>'Install app'</strong> or <strong>'Add to Home screen'</strong>.
                  <div className={`text-center p-4 my-2 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <ArrowDown className={`w-8 h-8 mx-auto ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  </div>
                </li>
                <li>
                  Follow the on-screen prompts to confirm the installation.
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
            <Button size="lg" asChild className={`${isDarkMode ? 'bg-emerald-600/70 hover:bg-emerald-600/90 border-emerald-500/70' : ''}`}>
                <Link to={createPageUrl("Map")}>Back to the Map</Link>
            </Button>
        </div>
      </div>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" />
    </div>
  );
}