import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../Layout.js';

// Import all pages
import MapPage from '../Pages/Map.js';
import ProfilePage from '../Pages/Profile.js';
import DashboardPage from '../Pages/Dashboard.js';
import AboutPage from '../Pages/About.js';
import FeedbackPage from '../Pages/Feedback.js';
import InstallPage from '../Pages/Install.js';
import AdminPortalPage from '../Pages/AdminPortal.js';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/map" replace />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/install" element={<InstallPage />} />
          <Route path="/admin" element={<AdminPortalPage />} />
          <Route path="*" element={<Navigate to="/map" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;