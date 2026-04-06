import React from "react";

import Dashboard from "../Dashboard";

const DashboardProvider = () => {
  return (
    <div className="flex min-h-screen">
      {/* Ná»™i dung chĂ­nh chiáº¿m háº¿t pháº§n cĂ²n láº¡i vĂ  cÄƒn Ä‘á»u */}
      <div className="flex-1 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Dashboard />
        </div>
      </div>
    </div>
  );
};

export default DashboardProvider;

