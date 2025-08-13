
import React, { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Move, ZoomIn, ZoomOut, ImagePlus, RotateCcw } from "lucide-react";
import { MapPin, Star } from "lucide-react";
import { useTheme } from "../theme/ThemeProvider";

const practiceColors = {
  "Visual Arts": "bg-red-100 text-red-800",
  "Music": "bg-blue-100 text-blue-800",
  "Dance": "bg-purple-100 text-purple-800",
  "Theater": "bg-green-100 text-green-800",
  "Literature": "bg-yellow-100 text-yellow-800",
  "Film": "bg-indigo-100 text-indigo-800",
  "Photography": "bg-pink-100 text-pink-800",
  "Digital Art": "bg-orange-100 text-orange-800",
  "Fashion": "bg-violet-100 text-violet-800",
  "Architecture": "bg-teal-100 text-teal-800",
  "Other": "bg-gray-100 text-gray-800"
};

const darkPracticeColors = {
  "Visual Arts": "bg-red-900/50 text-red-200",
  "Music": "bg-blue-900/50 text-blue-200",
  "Dance": "bg-purple-900/50 text-purple-200",
  "Theater": "bg-green-900/50 text-green-200",
  "Literature": "bg-yellow-900/50 text-yellow-200",
  "Film": "bg-indigo-900/50 text-indigo-200",
  "Photography": "bg-pink-900/50 text-pink-200",
  "Digital Art": "bg-orange-900/50 text-orange-200",
  "Fashion": "bg-violet-900/50 text-violet-200",
  "Architecture": "bg-teal-900/50 text-teal-200",
  "Other": "bg-gray-700/50 text-gray-300"
};

export default function ImageUploadPreview({ 
  formData, 
  onImageUpload, 
  isUploading, 
  uploadError,
  onObjectPositionChange,
  onImageScaleChange 
}) {
  const { isDarkMode } = useTheme();
  const [imagePosition, setImagePosition] = useState({ x: 50, y: 50 }); 
  const [isDragMode, setIsDragMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef(null);
  const previewRef = useRef(null);

  const updateObjectPosition = useCallback((x, y) => {
    const position = `${x}% ${y}%`;
    onObjectPositionChange(position);
  }, [onObjectPositionChange]);

  const updateImageScale = useCallback((scale) => {
    onImageScaleChange(scale);
  }, [onImageScaleChange]);

  const resetImagePosition = () => {
    setImagePosition({ x: 50, y: 50 }); 
    updateObjectPosition(50, 50); 
    updateImageScale(100); 
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  useEffect(() => {
    if (formData.profile_image_object_position) {
      const [x, y] = formData.profile_image_object_position.split(' ').map(v => parseFloat(v));
      setImagePosition({ x: x || 50, y: y || 50 });
    }
  }, [formData.profile_image_object_position]);

  const handleDragStart = (e) => {
    if (!isDragMode || !formData.profile_image_url) return;
    
    e.preventDefault();
    setIsDragging(true);
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      initialImageX: imagePosition.x,
      initialImageY: imagePosition.y,
    };
  };

  useEffect(() => {
    const handleDragMove = (e) => {
      if (isDragging) {
        e.preventDefault();
      }

      if (!isDragging || !dragStartRef.current || !previewRef.current) return;
      
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const rect = previewRef.current.getBoundingClientRect();
      
      const deltaX = clientX - dragStartRef.current.startX;
      const deltaY = clientY - dragStartRef.current.startY;
      
      const deltaPercentX = (deltaX / rect.width) * 120; // Original horizontal sensitivity
      const deltaPercentY = (deltaY / rect.height) * 80;  // Decreased vertical sensitivity
      
      const newX = Math.max(0, Math.min(100, dragStartRef.current.initialImageX - deltaPercentX));
      const newY = Math.max(0, Math.min(100, dragStartRef.current.initialImageY - deltaPercentY));

      setImagePosition({ x: newX, y: newY }); 
      updateObjectPosition(newX, newY); 
    };

    const handleDragEnd = () => {
      setIsDragging(false);
      dragStartRef.current = null;
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchmove', handleDragMove, { passive: false });
      document.addEventListener('touchend', handleDragEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, updateObjectPosition, imagePosition]); 

  const getImageStyle = () => {
    if (!formData.profile_image_url) return {};
    return {
      backgroundImage: `url(${formData.profile_image_url})`,
      backgroundPosition: `${imagePosition.x}% ${imagePosition.y}%`,
      backgroundSize: `${formData.profile_image_scale || 100}%`,
      backgroundRepeat: 'no-repeat',
      cursor: isDragMode ? (isDragging ? 'grabbing' : 'grab') : 'default'
    };
  };

  const handleZoom = (direction) => {
    const currentScale = formData.profile_image_scale || 100;
    const newScale = direction === 'in' 
      ? Math.min(currentScale + 10, 200)
      : Math.max(currentScale - 10, 80);
    updateImageScale(newScale);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className={`text-base font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Profile Picture</Label>
        <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Upload your profile picture and see how it will appear on your artist card.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Preview Section */}
        <div className="space-y-4">
          <Label className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Card Preview</Label>
          <div className="sticky top-4">
            <Card className={`overflow-hidden border-0 backdrop-blur-2xl shadow-2xl ${isDarkMode ? 'bg-gray-800/70' : 'bg-white/15'}`}>
              <CardHeader className="p-0">
                <div className="relative">
                  <div 
                    ref={previewRef}
                    className="w-full h-48 bg-gradient-to-br from-emerald-200/50 via-yellow-100/50 to-pink-200/50 flex items-center justify-center relative overflow-hidden"
                    style={formData.profile_image_url ? getImageStyle() : {}}
                    onMouseDown={handleDragStart}
                    onTouchStart={handleDragStart}
                  >
                    {!formData.profile_image_url && (
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-emerald-900/50' : 'bg-emerald-200'}`}>
                        <span className={`text-2xl font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                          {formData.name ? formData.name.charAt(0).toUpperCase() : 'A'}
                        </span>
                      </div>
                    )}
                    
                    {isDragMode && formData.profile_image_url && (
                      <div className="absolute inset-0 border-2 border-dashed border-blue-400 bg-blue-500/10 pointer-events-none" />
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {formData.name || 'Your Name'}
                    </h3>
                    <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <MapPin className="w-4 h-4" />
                      <span>
                        {formData.location_city || 'Your City'}, {formData.location_country || 'Your Country'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.primary_practice && (
                      <Badge className={`${isDarkMode ? (darkPracticeColors[formData.primary_practice] || darkPracticeColors.Other) : (practiceColors[formData.primary_practice] || practiceColors.Other)} text-xs`}>
                        {formData.primary_practice}
                      </Badge>
                    )}
                    {formData.secondary_practices?.slice(0, 2).map((practice, index) => (
                      <Badge key={index} variant="outline" className={`text-xs ${isDarkMode ? 'bg-gray-700/40 border-gray-600/40 text-gray-300' : 'bg-white/20 border-white/40 text-gray-700'}`}>
                        {practice}
                      </Badge>
                    ))}
                  </div>

                  {formData.style_genre && (
                    <div className="flex items-center gap-2 text-sm">
                      <Star className={`w-4 h-4 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                      <span className={`font-medium ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>{formData.style_genre}</span>
                    </div>
                  )}

                  <p className={`text-sm leading-relaxed line-clamp-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {formData.bio || 'Your artist bio will appear here...'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Upload & Adjust Section - CONSOLIDATED */}
        <div className="space-y-4">
          <div className={`p-4 rounded-lg border backdrop-blur-xl shadow-lg ${isDarkMode ? 'bg-gray-800/30 border-gray-700/50' : 'bg-white/10 border-white/30'}`}>
             <div className="flex items-center gap-4 mb-4">
               <ImagePlus className={`w-10 h-10 flex-shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
               <div className="flex-1">
                  <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('file-upload').click()}
                      disabled={isUploading}
                      className={`w-full backdrop-blur-xl shadow-md ${isDarkMode ? 'bg-gray-700/40 border-gray-600/60 hover:bg-gray-600/50 text-gray-300' : 'bg-white/10 border-white/50 hover:bg-white/20'}`}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : formData.profile_image_url ? (
                          "Change Image"
                      ) : (
                          "Upload Image"
                      )}
                    </Button>
                    <Input
                      id="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileSelect}
                      accept="image/*"
                    />
               </div>
             </div>

              {uploadError && (
                <p className="text-red-600 dark:text-red-400 text-sm mb-4">{uploadError}</p>
              )}

              {/* Image positioning controls - MOVED INTO SAME CONTAINER */}
              {formData.profile_image_url && (
                <>
                  <hr className={`my-4 ${isDarkMode ? 'border-gray-700/50' : 'border-white/40'}`} />
                  <div className="space-y-4">
                    <Button
                        type="button"
                        variant={isDragMode ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsDragMode(!isDragMode)}
                        className={`w-full flex items-center justify-center gap-2 backdrop-blur-xl shadow-md ${isDragMode ? (isDarkMode ? 'bg-emerald-600/70 hover:bg-emerald-600/90 border border-emerald-500/70' : 'bg-emerald-600/60 hover:bg-emerald-700/80 border border-emerald-500/60 text-white') : (isDarkMode ? 'bg-gray-700/40 border-gray-600/60 hover:bg-gray-600/50 text-gray-300' : 'bg-white/10 border-white/50 hover:bg-white/20')}`}
                      >
                        <Move className="w-4 h-4" />
                        {isDragMode ? 'Exit Adjust Mode' : 'Press to adjust image positioning'}
                      </Button>

                    {isDragMode && (
                      <div className="space-y-3 pt-3 border-t border-gray-700/30 dark:border-white/20">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleZoom('out')}
                            disabled={(formData.profile_image_scale || 100) <= 80}
                            className={`backdrop-blur-xl shadow-md ${isDarkMode ? 'bg-gray-700/40 border-gray-600/60 hover:bg-gray-600/50 text-gray-300' : 'bg-white/10 border-white/50 hover:bg-white/20'}`}
                          >
                            <ZoomOut className="w-4 h-4" />
                          </Button>
                          
                          <span className={`text-sm w-16 text-center tabular-nums ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formData.profile_image_scale || 100}%
                          </span>
                          
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleZoom('in')}
                            disabled={(formData.profile_image_scale || 100) >= 200}
                            className={`backdrop-blur-xl shadow-md ${isDarkMode ? 'bg-gray-700/40 border-gray-600/60 hover:bg-gray-600/50 text-gray-300' : 'bg-white/10 border-white/50 hover:bg-white/20'}`}
                          >
                            <ZoomIn className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-300 bg-blue-50/60 dark:bg-blue-900/40 p-2 rounded backdrop-blur-xl border border-blue-200/50 dark:border-blue-700/50 shadow-sm">
                          <Move className="w-3 h-3 inline mr-1" />
                          Drag on the preview to reposition your image.
                        </div>
                         <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={resetImagePosition}
                          className={`w-full backdrop-blur-xl ${isDarkMode ? 'hover:bg-gray-700/50 text-gray-300' : 'hover:bg-white/20'}`}
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Reset Position
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
