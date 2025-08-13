
import React, { useEffect } from "react";
import { createPageUrl } from "@/utils";

export default function DashboardPage() {
  useEffect(() => {
    // Redirect to Map page with dashboard view
    window.location.href = createPageUrl("Map") + "#dashboard";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
