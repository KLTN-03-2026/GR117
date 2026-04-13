import React from "react";

import Dashboard from "./Dashboard";

const DashboardProvider = () => {
  return (
    <div className="flex min-h-screen">
     
      <div className="flex-1 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Dashboard />
        </div>
      </div>
    </div>
  );
};

export default DashboardProvider;

