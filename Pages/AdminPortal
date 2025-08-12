
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User } from "@/entities/User";
import { Report } from "@/entities/Report";
import { Feedback } from "@/entities/Feedback";
import { Artist } from "@/entities/Artist";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  MessageSquare,
  Users,
  ArrowLeft,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Flag,
  User as UserIcon,
  Calendar,
  Save
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { useTheme } from "../components/theme/ThemeProvider";

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
    case 'new':
      return 'bg-yellow-100 text-yellow-800';
    case 'under_review':
    case 'reviewed':
      return 'bg-blue-100 text-blue-800';
    case 'resolved':
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'dismissed':
    case 'closed':
      return 'bg-gray-100 text-gray-800';
    case 'planned':
      return 'bg-purple-100 text-purple-800';
    case 'in_progress':
      return 'bg-indigo-100 text-indigo-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getReasonLabel = (reason) => {
  const reasons = {
    'inappropriate_content': 'Inappropriate Content',
    'fake_profile': 'Fake Profile',
    'stolen_identity': 'Stolen Identity',
    'impersonation': 'Impersonation',
    'spam': 'Spam',
    'harassment': 'Harassment',
    'other': 'Other'
  };
  return reasons[reason] || reason;
};

const getFeedbackTypeLabel = (type) => {
  const types = {
    'bug_report': 'Bug Report',
    'feature_request': 'Feature Request',
    'general_feedback': 'General Feedback',
    'complaint': 'Complaint'
  };
  return types[type] || type;
};

export default function AdminPortalPage() {
  const { isDarkMode } = useTheme();
  const [currentUser, setCurrentUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [artists, setArtists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [adminResponse, setAdminResponse] = useState('');

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      if (user.role !== 'admin') {
        // Redirect non-admin users
        window.location.href = createPageUrl("Map");
        return;
      }
      setCurrentUser(user);
      await Promise.all([loadReports(), loadFeedback(), loadArtists()]);
    } catch (error) {
      console.error("Error checking admin access:", error);
      window.location.href = createPageUrl("Map");
    }
    setIsLoading(false);
  };

  const loadReports = async () => {
    try {
      const data = await Report.list('-created_date');
      setReports(data);
    } catch (error) {
      console.error("Error loading reports:", error);
    }
  };

  const loadFeedback = async () => {
    try {
      const data = await Feedback.list('-created_date');
      setFeedback(data);
    } catch (error) {
      console.error("Error loading feedback:", error);
    }
  };

  const loadArtists = async () => {
    try {
      const data = await Artist.list('-created_date');
      setArtists(data);
    } catch (error) {
      console.error("Error loading artists:", error);
    }
  };

  const updateReportStatus = async (reportId, status, notes) => {
    try {
      await Report.update(reportId, { status, admin_notes: notes });
      await loadReports();
      setSelectedReport(null);
      setAdminNotes('');
    } catch (error) {
      console.error("Error updating report:", error);
    }
  };

  const updateFeedbackStatus = async (feedbackId, status, priority, response) => {
    try {
      await Feedback.update(feedbackId, { 
        status, 
        priority, 
        admin_response: response 
      });
      await loadFeedback();
      setSelectedFeedback(null);
      setAdminResponse('');
    } catch (error) {
      console.error("Error updating feedback:", error);
    }
  };

  const getArtistName = (artistId) => {
    const artist = artists.find(a => a.id === artistId);
    return artist ? artist.name : 'Unknown Artist';
  };

  const getReporterName = (userId) => {
    // In a real app, you might want to load user data
    return `User ${userId.slice(0, 8)}...`;
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-black' : 'bg-gradient-to-br from-emerald-50 via-white to-yellow-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isDarkMode ? 'border-emerald-400' : 'border-emerald-600'} mx-auto mb-4`}></div>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading admin portal...</p>
        </div>
      </div>
    );
  }

  const pendingReports = reports.filter(r => r.status === 'pending').length;
  const newFeedback = feedback.filter(f => f.status === 'new').length;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-black' : 'bg-gradient-to-br from-emerald-50 via-white to-yellow-50'} p-4 md:p-8`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild className={`dark:bg-gray-900/40 dark:border-gray-800/60 dark:hover:bg-gray-800/50 dark:text-gray-300 ${isDarkMode ? 'bg-gray-900/40 border-gray-800/60 hover:bg-gray-800/50 text-gray-300' : ''}`}>
              <Link to={createPageUrl("Map")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to App
              </Link>
            </Button>
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Admin Portal</h1>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage reports, feedback, and moderation</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className={`flex items-center gap-2 ${isDarkMode ? 'bg-gray-900/40 border-gray-800/60 text-gray-300' : ''}`}>
              <UserIcon className="w-4 h-4" />
              {currentUser?.full_name || currentUser?.email}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className={isDarkMode ? 'bg-gray-950/60 border-gray-800/50' : ''}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-red-900/50' : 'bg-red-100'}`}>
                  <AlertTriangle className={`w-6 h-6 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                </div>
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending Reports</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{pendingReports}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={isDarkMode ? 'bg-gray-950/60 border-gray-800/50' : ''}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                  <MessageSquare className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>New Feedback</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{newFeedback}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={isDarkMode ? 'bg-gray-950/60 border-gray-800/50' : ''}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-emerald-900/50' : 'bg-emerald-100'}`}>
                  <Users className={`w-6 h-6 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                </div>
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Artists</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{artists.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={isDarkMode ? 'bg-gray-950/60 border-gray-800/50' : ''}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
                  <Flag className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Reports</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{reports.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className={`grid w-full grid-cols-2 max-w-md ${isDarkMode ? 'bg-gray-950/60' : ''}`}>
            <TabsTrigger value="reports" className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-300 data-[state=active]:bg-gray-800/70 data-[state=active]:text-gray-100' : ''}`}>
              <AlertTriangle className="w-4 h-4" />
              Reports {pendingReports > 0 && `(${pendingReports})`}
            </TabsTrigger>
            <TabsTrigger value="feedback" className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-300 data-[state=active]:bg-gray-800/70 data-[state=active]:text-gray-100' : ''}`}>
              <MessageSquare className="w-4 h-4" />
              Feedback {newFeedback > 0 && `(${newFeedback})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Reports Queue</h2>
                {reports.length === 0 ? (
                  <Card className={isDarkMode ? 'bg-gray-950/60 border-gray-800/50' : ''}>
                    <CardContent className="p-8 text-center">
                      <CheckCircle className={`w-12 h-12 ${isDarkMode ? 'text-green-400' : 'text-green-500'} mx-auto mb-4`} />
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>No Reports</h3>
                      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>All caught up! No reports to review.</p>
                    </CardContent>
                  </Card>
                ) : (
                  reports.map((report) => (
                    <Card 
                      key={report.id} 
                      className={`cursor-pointer transition-all ${isDarkMode ? 'bg-gray-950/60 border-gray-800/50 hover:bg-gray-900/60' : ''} ${selectedReport?.id === report.id ? 'ring-2 ring-emerald-500' : ''}`}
                      onClick={() => setSelectedReport(report)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(report.status)}>
                              {report.status}
                            </Badge>
                            <Badge variant="outline" className={`dark:bg-gray-800/40 dark:border-gray-700/40 dark:text-gray-300 ${isDarkMode ? 'bg-gray-800/40 border-gray-700/40 text-gray-300' : ''}`}>
                              {getReasonLabel(report.reason)}
                            </Badge>
                          </div>
                          <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Calendar className="w-4 h-4" />
                            {new Date(report.created_date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                            Reported Artist: {getArtistName(report.reported_artist_id)}
                          </p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Reporter: {getReporterName(report.reporter_user_id)}
                          </p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} line-clamp-2`}>
                            {report.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {selectedReport && (
                <Card className={`sticky top-6 ${isDarkMode ? 'bg-gray-950/60 border-gray-800/50' : ''}`}>
                  <CardHeader>
                    <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      <AlertTriangle className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                      Report Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>Reported Artist</h4>
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{getArtistName(selectedReport.reported_artist_id)}</p>
                    </div>
                    <div>
                      <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>Reason</h4>
                      <Badge variant="outline" className={`dark:bg-gray-800/40 dark:border-gray-700/40 dark:text-gray-300 ${isDarkMode ? 'bg-gray-800/40 border-gray-700/40 text-gray-300' : ''}`}>{getReasonLabel(selectedReport.reason)}</Badge>
                    </div>
                    <div>
                      <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>Description</h4>
                      <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedReport.description}</p>
                    </div>
                    <div>
                      <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>Admin Notes</h4>
                      <Textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add internal notes..."
                        className="min-h-[80px] dark:bg-gray-900/50 dark:border-gray-700/80 dark:text-gray-200 dark:placeholder:text-gray-500"
                      />
                    </div>
                    <div className={`flex gap-2 pt-4 border-t ${isDarkMode ? 'border-gray-800/50' : ''}`}>
                      <Button
                        onClick={() => updateReportStatus(selectedReport.id, 'resolved', adminNotes)}
                        className={`flex-1 bg-green-600 hover:bg-green-700 ${isDarkMode ? 'bg-green-700/80 hover:bg-green-700' : ''}`}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Resolve
                      </Button>
                      <Button
                        onClick={() => updateReportStatus(selectedReport.id, 'dismissed', adminNotes)}
                        variant="outline"
                        className={`flex-1 dark:bg-gray-800/40 dark:border-gray-700/60 dark:hover:bg-gray-700/50 dark:text-gray-300 ${isDarkMode ? 'bg-gray-800/40 border-gray-700/60 hover:bg-gray-700/50 text-gray-300' : ''}`}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Dismiss
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Feedback Queue</h2>
                {feedback.length === 0 ? (
                  <Card className={isDarkMode ? 'bg-gray-950/60 border-gray-800/50' : ''}>
                    <CardContent className="p-8 text-center">
                      <MessageSquare className={`w-12 h-12 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'} mx-auto mb-4`} />
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>No Feedback</h3>
                      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No feedback submissions yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  feedback.map((item) => (
                    <Card 
                      key={item.id} 
                      className={`cursor-pointer transition-all ${isDarkMode ? 'bg-gray-950/60 border-gray-800/50 hover:bg-gray-900/60' : ''} ${selectedFeedback?.id === item.id ? 'ring-2 ring-emerald-500' : ''}`}
                      onClick={() => setSelectedFeedback(item)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                            <Badge variant="outline" className={`dark:bg-gray-800/40 dark:border-gray-700/40 dark:text-gray-300 ${isDarkMode ? 'bg-gray-800/40 border-gray-700/40 text-gray-300' : ''}`}>
                              {getFeedbackTypeLabel(item.type)}
                            </Badge>
                          </div>
                          <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Calendar className="w-4 h-4" />
                            {new Date(item.created_date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} line-clamp-1`}>
                            {item.title}
                          </h3>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} line-clamp-2`}>
                            {item.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {selectedFeedback && (
                <Card className={`sticky top-6 ${isDarkMode ? 'bg-gray-950/60 border-gray-800/50' : ''}`}>
                  <CardHeader>
                    <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      <MessageSquare className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      Feedback Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>Title</h4>
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedFeedback.title}</p>
                    </div>
                    <div>
                      <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>Type</h4>
                      <Badge variant="outline" className={`dark:bg-gray-800/40 dark:border-gray-700/40 dark:text-gray-300 ${isDarkMode ? 'bg-gray-800/40 border-gray-700/40 text-gray-300' : ''}`}>{getFeedbackTypeLabel(selectedFeedback.type)}</Badge>
                    </div>
                    <div>
                      <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>Description</h4>
                      <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedFeedback.description}</p>
                    </div>
                    <div>
                      <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>Priority</h4>
                      <Select 
                        defaultValue={selectedFeedback.priority || 'medium'}
                        onValueChange={(value) => setSelectedFeedback({...selectedFeedback, priority: value})}
                      >
                        <SelectTrigger className="dark:bg-gray-900/50 dark:border-gray-700/80 dark:text-gray-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-950/95 dark:border-gray-800">
                          <SelectItem value="low" className="dark:text-gray-200 dark:hover:bg-gray-800/60">Low</SelectItem>
                          <SelectItem value="medium" className="dark:text-gray-200 dark:hover:bg-gray-800/60">Medium</SelectItem>
                          <SelectItem value="high" className="dark:text-gray-200 dark:hover:bg-gray-800/60">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>Admin Response</h4>
                      <Textarea
                        value={adminResponse}
                        onChange={(e) => setAdminResponse(e.target.value)}
                        placeholder="Add response to user..."
                        className="min-h-[80px] dark:bg-gray-900/50 dark:border-gray-700/80 dark:text-gray-200 dark:placeholder:text-gray-500"
                      />
                    </div>
                    <div className={`flex gap-2 pt-4 border-t ${isDarkMode ? 'border-gray-800/50' : ''}`}>
                      <Select 
                        defaultValue={selectedFeedback.status}
                        onValueChange={(value) => setSelectedFeedback({...selectedFeedback, status: value})}
                      >
                        <SelectTrigger className="flex-1 dark:bg-gray-900/50 dark:border-gray-700/80 dark:text-gray-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-950/95 dark:border-gray-800">
                          <SelectItem value="new" className="dark:text-gray-200 dark:hover:bg-gray-800/60">New</SelectItem>
                          <SelectItem value="under_review" className="dark:text-gray-200 dark:hover:bg-gray-800/60">Under Review</SelectItem>
                          <SelectItem value="planned" className="dark:text-gray-200 dark:hover:bg-gray-800/60">Planned</SelectItem>
                          <SelectItem value="in_progress" className="dark:text-gray-200 dark:hover:bg-gray-800/60">In Progress</SelectItem>
                          <SelectItem value="completed" className="dark:text-gray-200 dark:hover:bg-gray-800/60">Completed</SelectItem>
                          <SelectItem value="closed" className="dark:text-gray-200 dark:hover:bg-gray-800/60">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => updateFeedbackStatus(
                          selectedFeedback.id, 
                          selectedFeedback.status, 
                          selectedFeedback.priority,
                          adminResponse
                        )}
                        className={`bg-emerald-600 hover:bg-emerald-700 ${isDarkMode ? 'bg-emerald-600/80 hover:bg-emerald-600' : ''}`}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
