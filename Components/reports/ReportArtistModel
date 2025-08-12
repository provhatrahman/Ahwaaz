import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { Report } from "@/entities/Report";
import { User } from "@/entities/User";
import { useTheme } from "../theme/ThemeProvider";

const reportReasons = [
  { value: "inappropriate_content", label: "Inappropriate Content" },
  { value: "fake_profile", label: "Fake Profile" },
  { value: "stolen_identity", label: "Stolen Identity" },
  { value: "impersonation", label: "Impersonation" },
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment" },
  { value: "other", label: "Other" }
];

export default function ReportArtistModal({ artist, onClose, onSuccess }) {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    reason: "",
    description: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.reason) {
      newErrors.reason = "Please select a reason for reporting";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Please provide a description";
    }
    
    if (formData.description.length > 1000) {
      newErrors.description = "Description must be 1000 characters or less";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const currentUser = await User.me();
      
      await Report.create({
        reporter_user_id: currentUser.id,
        reported_artist_id: artist.id,
        reason: formData.reason,
        description: formData.description
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error submitting report:", error);
      setErrors({ submit: "Failed to submit report. Please try again." });
    }
    
    setIsSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <Card className={`overflow-hidden border-0 backdrop-blur-2xl shadow-2xl ${isDarkMode ? 'bg-gray-950/90' : 'bg-white/90'}`}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className={`text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Report Profile</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className={`w-4 h-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.submit && (
                <div className={`border rounded-lg p-3 ${isDarkMode ? 'bg-red-900/40 border-red-700/40' : 'bg-red-50 border-red-200'}`}>
                  <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>{errors.submit}</p>
                </div>
              )}
              
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Reporting: {artist.name}</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {artist.location_city}, {artist.location_country === 'Israel' ? 'Palestine' : artist.location_country}
                </p>
              </div>

              <div>
                <Label className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>Reason for reporting *</Label>
                <Select value={formData.reason} onValueChange={(value) => setFormData({...formData, reason: value})}>
                  <SelectTrigger className={`${isDarkMode ? 'bg-gray-800/50 border-gray-700/60 text-gray-200' : 'bg-white border-gray-300'} ${errors.reason ? "border-red-300" : ""}`}>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent className={`${isDarkMode ? 'bg-gray-900/95 border-gray-800' : 'bg-white border-gray-200'}`}>
                    {reportReasons.map((reason) => (
                      <SelectItem key={reason.value} value={reason.value} className={isDarkMode ? 'hover:bg-gray-800/60' : 'hover:bg-gray-100'}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.reason && <p className={`text-sm mt-1 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{errors.reason}</p>}
              </div>

              <div>
                <Label className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>Description * ({formData.description.length}/1000)</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Please provide details about why you're reporting this profile..."
                  className={`h-24 ${isDarkMode ? 'bg-gray-800/50 border-gray-700/60 text-gray-200 placeholder:text-gray-500' : 'bg-white border-gray-300'} ${errors.description ? "border-red-300" : ""}`}
                  maxLength={1000}
                />
                {errors.description && <p className={`text-sm mt-1 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{errors.description}</p>}
              </div>

              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700/40' : 'bg-blue-50 border border-blue-200'}`}>
                <p className={`text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                  Reports are reviewed by our moderation team. False reports may result in action against your account.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className={isDarkMode ? 'border-gray-600/50 bg-gray-800/30 hover:bg-gray-700/50 text-gray-300' : ''}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`${isDarkMode ? 'bg-red-600/80 hover:bg-red-700/90' : 'bg-red-600 hover:bg-red-700'}`}
                >
                  {isSubmitting ? "Submitting..." : "Submit Report"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}