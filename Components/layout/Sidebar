import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  X, 
  LogOut, 
  User as UserIcon, 
  Heart,
  CalendarClock,
  HelpCircle,
  Download,
  MessageSquare,
  Shield,
  Moon,
  Sun,
  BookOpenCheck
} from 'lucide-react';
import { User } from '@/entities/User';
import { createPageUrl } from '@/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from '../theme/ThemeProvider';

export default function Sidebar({ isOpen, onClose, currentUser, onStartTour }) {
  const { isDarkMode, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await User.logout();
      onClose();
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleLogin = () => {
    User.login();
    onClose();
  };

  const handleLinkClick = () => {
    onClose();
  };
  
  const handleStartTour = () => {
    onClose();
    // Give sidebar time to close before starting tour
    setTimeout(() => {
        onStartTour();
    }, 300);
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className={`h-full flex flex-col ${isDarkMode ? 'bg-gray-950/95 backdrop-blur-2xl' : 'bg-white/95 backdrop-blur-2xl'}`}>
        <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-800/50' : 'border-white/30'}`}>
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>Ahwaaz</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className={`w-6 h-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
          </Button>
        </div>

        <div className="flex-1 p-4 space-y-2">
          {currentUser && currentUser.role === 'admin' && (
            <Link to={createPageUrl("AdminPortal")} onClick={handleLinkClick}>
              <Button variant="ghost" className={`w-full justify-start text-base ${isDarkMode ? 'text-gray-300 hover:bg-gray-800/50 hover:text-white' : 'text-gray-700 hover:bg-white/20'}`}>
                <Shield className="w-5 h-5 mr-3" />
                Admin Portal
              </Button>
            </Link>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" className={`w-full justify-start text-base cursor-not-allowed ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} disabled>
                <CalendarClock className="w-5 h-5 mr-3" />
                Events
                <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>Soon</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Coming Soon!</p>
            </TooltipContent>
          </Tooltip>
          
          <Button variant="ghost" className={`w-full justify-start text-base ${isDarkMode ? 'text-gray-300 hover:bg-gray-800/50 hover:text-white' : 'text-gray-700 hover:bg-white/20'}`} onClick={handleStartTour}>
            <BookOpenCheck className="w-5 h-5 mr-3" />
            Tutorial
          </Button>

          {currentUser && (
            <Link to={createPageUrl("Feedback")} onClick={handleLinkClick}>
              <Button variant="ghost" className={`w-full justify-start text-base ${isDarkMode ? 'text-gray-300 hover:bg-gray-800/50 hover:text-white' : 'text-gray-700 hover:bg-white/20'}`}>
                <MessageSquare className="w-5 h-5 mr-3" />
                Send Feedback
              </Button>
            </Link>
          )}
          
          <Link to={createPageUrl("About")} onClick={handleLinkClick}>
            <Button variant="ghost" className={`w-full justify-start text-base ${isDarkMode ? 'text-gray-300 hover:bg-gray-800/50 hover:text-white' : 'text-gray-700 hover:bg-white/20'}`}>
              <HelpCircle className="w-5 h-5 mr-3" />
              About Ahwaaz
            </Button>
          </Link>

          <Link to={createPageUrl("Install")} onClick={handleLinkClick}>
            <Button variant="ghost" className={`w-full justify-start text-base ${isDarkMode ? 'text-gray-300 hover:bg-gray-800/50 hover:text-white' : 'text-gray-700 hover:bg-white/20'}`}>
              <Download className="w-5 h-5 mr-3" />
              Install Ahwaaz
            </Button>
          </Link>

          <Button 
            variant="ghost" 
            className={`w-full justify-start text-base ${isDarkMode ? 'text-gray-300 hover:bg-gray-800/50 hover:text-white' : 'text-gray-700 hover:bg-white/20'}`}
            onClick={toggleTheme}
          >
            {isDarkMode ? <Sun className="w-5 h-5 mr-3" /> : <Moon className="w-5 h-5 mr-3" />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </Button>
        </div>

        <div className={`p-4 space-y-4 border-t ${isDarkMode ? 'border-gray-800/50' : 'border-white/30'}`}>
          <a href="https://www.buymeacoffee.com/ahwaaz" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className={`w-full ${isDarkMode ? 'border-gray-600/50 bg-gray-700/30 hover:bg-gray-600/50 text-gray-300' : 'border-white/50 bg-white/25 hover:bg-white/35'}`}>
              <Heart className="w-5 h-5 mr-3 text-red-500" />
              Donate
            </Button>
          </a>

          {currentUser ? (
            <Button variant="outline" className={`w-full justify-center ${isDarkMode ? 'border-gray-600/50 bg-gray-700/30 hover:bg-gray-600/50 text-gray-300' : 'border-white/50 bg-white/25 hover:bg-white/35'}`} onClick={handleLogout}>
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          ) : (
            <Button className={`w-full justify-center ${isDarkMode ? 'bg-emerald-600/80 hover:bg-emerald-700/90 border-emerald-500/60' : 'bg-emerald-600 hover:bg-emerald-700'}`} onClick={handleLogin}>
              <UserIcon className="w-5 h-5 mr-3" />
              Sign In / Register
            </Button>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}