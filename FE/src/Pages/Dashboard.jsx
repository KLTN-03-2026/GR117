import React from "react";

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Tổng quan</h1>
        <div className="text-right">
          <p className="text-sm text-gray-600">
            Doanh thu tháng:{" "}   
            <span className="font-semibold text-green-600">32.5trđ</span>
          </p>
          <p className="text-sm text-gray-600">1 chờ xác nhận</p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">Tổng doanh thu</p>
          <h2 className="text-xl font-bold text-gray-800">31.9trđ</h2>
          <span className="text-green-600 text-sm">+18%</span>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">Dịch vụ hoạt động</p>
          <h2 className="text-xl font-bold text-gray-800">3/3</h2>
          <span className="text-green-600 text-sm">+2</span>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">Chờ xác nhận</p>
          <h2 className="text-xl font-bold text-gray-800">1</h2>
          <span className="text-red-600 text-sm">Cần xử lý ngay</span>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">Đơn hoàn tất</p>
          <h2 className="text-xl font-bold text-gray-800">1</h2>
          <span className="text-green-600 text-sm">+5%</span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Line Chart Placeholder */}
        <div className="bg-white rounded-xl shadow p-4 md:col-span-2">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Doanh thu theo tháng (2025-2026)
          </h3>
          <div className="h-64 flex items-center justify-center text-gray-400 border border-dashed rounded-lg">
            Biểu đồ đường doanh thu
          </div>
          <p className="text-sm text-gray-600 mt-2">Tổng: 350.8trđ</p>
        </div>

        {/* Pie Chart Placeholder */}
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Danh mục dịch vụ
          </h3>
          <div className="h-64 flex items-center justify-center text-gray-400 border border-dashed rounded-lg">
            Biểu đồ tròn dịch vụ
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <p>Biển đảo: 60%</p>
            <p>Văn hóa: 40%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;