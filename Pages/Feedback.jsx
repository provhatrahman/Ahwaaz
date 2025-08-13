
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowLeft, MessageSquare, Send } from "lucide-react";
import { motion } from "framer-motion";
import { Feedback } from "@/entities/Feedback";
import { User } from "@/entities/User";
import { createPageUrl } from "@/utils";
import { useTheme } from "../components/theme/ThemeProvider";

const feedbackTypes = [
  { value: "bug_report", label: "Bug Report", description: "Something isn't working correctly" },
  { value: "feature_request", label: "Feature Request", description: "Suggest a new feature or improvement" },
  { value: "general_feedback", label: "General Feedback", description: "Share your thoughts about the app" },
  { value: "complaint", label: "Complaint", description: "Report an issue or concern" }
];

export default function FeedbackPage() {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    type: "",
    title: "",
    description: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.type) newErrors.type = "Please select a feedback type";
    if (!formData.title.trim()) newErrors.title = "Please provide a title";
    if (formData.title.length > 200) newErrors.title = "Title must be 200 characters or less";
    if (!formData.description.trim()) newErrors.description = "Please provide a description";
    if (formData.description.length > 2000) newErrors.description = "Description must be 2000 characters or less";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const user = await User.me();
      await Feedback.create({
        user_id: user.id,
        type: formData.type,
        title: formData.title,
        description: formData.description
      });
      setIsSuccess(true);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setErrors({ submit: "Failed to submit feedback. Please try again." });
    }
    setIsSubmitting(false);
  };

  if (isSuccess) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-black' : 'bg-gradient-to-br from-emerald-50 via-white to-yellow-50'} relative`}>
        {/* Floating Back Button */}
        <div className="fixed top-6 left-6 z-50">
          <Button variant="outline" asChild className={`backdrop-blur-sm shadow-lg ${isDarkMode ? 'bg-gray-800/90 border-gray-600/50 hover:bg-gray-700/80 text-gray-300' : 'bg-white/90 hover:bg-white border-white/40'}`}>
            <Link to={createPageUrl("Map")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Explore
            </Link>
          </Button>
        </div>

        <div className="flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-center backdrop-blur-2xl p-8 rounded-2xl shadow-xl max-w-lg border ${isDarkMode ? 'bg-gray-950/80 border-gray-700/50' : 'bg-white border-white/30'}`}
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isDarkMode ? 'bg-emerald-900/50' : 'bg-emerald-100'}`}>
              <CheckCircle className={`w-10 h-10 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
            <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Thank You!</h2>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Your feedback has been submitted successfully. We appreciate you taking the time to help us improve Ahwaaz.
            </p>
            <Button asChild className={`${isDarkMode ? 'bg-emerald-600/80 hover:bg-emerald-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
              <Link to={createPageUrl("Map")}>Back to Explore</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-black' : 'bg-gradient-to-br from-emerald-50 via-white to-yellow-50'} relative`}>
      {/* Floating Back Button */}
      <div className="fixed top-6 left-6 z-50">
        <Button variant="outline" asChild className={`backdrop-blur-sm shadow-lg ${isDarkMode ? 'bg-gray-800/90 border-gray-600/50 hover:bg-gray-700/80 text-gray-300' : 'bg-white/90 hover:bg-white border-white/40'}`}>
          <Link to={createPageUrl("Map")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Explore
          </Link>
        </Button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className="text-center mb-8">
          <div className={`inline-block p-4 rounded-full mb-4 ${isDarkMode ? 'bg-emerald-900/50' : 'bg-emerald-100'}`}>
            <MessageSquare className={`w-12 h-12 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
          </div>
          <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Share Your Feedback
          </h1>
          <p className={`mt-4 text-xl md:text-2xl max-w-lg mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Help us improve Ahwaaz by sharing your thoughts, reporting bugs, or suggesting new features.
          </p>
        </div>

        <Card className={`shadow-xl border-0 backdrop-blur-sm ${isDarkMode ? 'bg-gray-950/60 border-gray-800/50' : 'bg-white/80'}`}>
          <CardHeader>
            <CardTitle className={`text-xl ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Tell Us What You Think</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="type" className={isDarkMode ? 'text-gray-300' : ''}>Feedback Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className={`${isDarkMode ? 'bg-gray-800/50 border-gray-600/80 text-gray-200' : ''} ${errors.type ? "border-red-300" : ""}`}>
                    <SelectValue placeholder="Select feedback type" />
                  </SelectTrigger>
                  <SelectContent className={isDarkMode ? 'bg-gray-800/90 border-gray-700' : ''}>
                    {feedbackTypes.map(type => (
                      <SelectItem key={type.value} value={type.value} className={isDarkMode ? 'text-gray-200 hover:bg-gray-700/60' : ''}>
                        <div className="py-2">
                          <div className="font-medium">{type.label}</div>
                          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && <p className={`text-sm mt-1 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{errors.type}</p>}
              </div>

              <div>
                <Label htmlFor="title" className={isDarkMode ? 'text-gray-300' : ''}>Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief summary of your feedback"
                  className={`${isDarkMode ? 'bg-gray-800/50 border-gray-600/80 text-gray-200 placeholder:text-gray-500' : ''} ${errors.title ? "border-red-300" : ""}`}
                  maxLength={200}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.title && <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{errors.title}</p>}
                  <p className={`text-sm ml-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formData.title.length}/200 characters
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="description" className={isDarkMode ? 'text-gray-300' : ''}>Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Please provide detailed information about your feedback..."
                  className={`min-h-[150px] ${isDarkMode ? 'bg-gray-800/50 border-gray-600/80 text-gray-200 placeholder:text-gray-500' : ''} ${errors.description ? "border-red-300" : ""}`}
                  maxLength={2000}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.description && <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{errors.description}</p>}
                  <p className={`text-sm ml-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formData.description.length}/2000 characters
                  </p>
                </div>
              </div>

              <div className={`border rounded-lg p-4 ${isDarkMode ? 'bg-blue-900/20 border-blue-700/40' : 'bg-blue-50 border-blue-200'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                  <strong>Your feedback matters!</strong> We read every submission and use your input 
                  to prioritize improvements and new features for the Ahwaaz community.
                </p>
              </div>

              {errors.submit && (
                <div className={`text-sm text-center ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{errors.submit}</div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 text-lg font-semibold ${isDarkMode ? 'bg-emerald-600/80 hover:bg-emerald-600' : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'}`}
              >
                {isSubmitting ? "Submitting..." : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
