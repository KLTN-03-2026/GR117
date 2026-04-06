import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IoSearch } from "react-icons/io5";
import ServicesCard from "../Components/ServicesCard";

const Services = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/services/all");
        const result = await res.json();

        if (res.ok && result.success) {
          setServices(result.data);
          setFilteredServices(result.data);
        } else {
          setError(result.message || "Không thể tải dịch vụ");
        }
      } catch (err) {
        setError("Lỗi kết nối tới server");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = services.filter(
      (s) =>
        s.servicesName.toLowerCase().includes(lowerSearch) ||
        s.destination.toLowerCase().includes(lowerSearch)
    );
    setFilteredServices(filtered);
  }, [searchTerm, services]);

  if (loading) return <p className="p-6">Đang tải dịch vụ...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-orange-50 p-6 space-y-6">
      {/* Header */}
      <div className="sticky top-0 bg-white z-20 flex justify-between items-center p-4 shadow-md">
        <h1 className="text-2xl font-semibold text-gray-800">Quản lý dịch vụ</h1>
        <Link
          to="/provider/AddServices"
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
        >
          + Thêm dịch vụ
        </Link>
      </div>

      {/* Ô tìm kiếm */}
      <div className="mt-4 relative w-full">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, địa điểm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-300 p-3 pl-10 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none"
        />
        <IoSearch className="absolute left-3 top-3 text-gray-400 text-xl pointer-events-none" />
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        {filteredServices.map((service) => (
          <ServicesCard key={service._id} service={service} />
        ))}
      </div>
    </div>
  );
};

export default Services;