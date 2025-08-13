import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../Layout.jsx';

// Import all pages
import MapPage from '../Pages/Map.jsx';
import ProfilePage from '../Pages/Profile';
import DashboardPage from '../Pages/Dashboard';
import AboutPage from '../Pages/About';
import FeedbackPage from '../Pages/Feedback';
import InstallPage from '../Pages/Install';
import AdminPortalPage from '../Pages/AdminPortal';

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