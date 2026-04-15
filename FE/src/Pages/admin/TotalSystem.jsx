import React, { useEffect, useState } from 'react'
import { FiBox } from "react-icons/fi";
import {IoCheckmarkCircleOutline,IoPeopleOutline,IoTicketOutline} from "react-icons/io5";
const TotalSystem = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const res = await fetch("http://localhost:5000/api/admin/stats", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const result = await res.json();
        if (res.ok) {
          setStats(result.data || null);
        } else {
          setError(result.message || "Khong the tai thong ke");
        }
      } catch (err) {
        setError("Khong the tai thong ke");
      }
    };

    fetchStats();
  }, []);
  return (
    <div className="space-y-6">
                  <div>
                    <h2 className="text-left text-xl font-semibold text-slate-900">
                      Tổng quan hệ thống 
                    </h2>
                    
                  </div>
    
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl bg-sky-50 p-5">
                      <FiBox className="text-2xl text-sky-500 mb-3" />
                      <p className="text-left mt-4 text-3xl font-bold mb-3 text-slate-900">{stats?.totalServices ?? "--"}</p>
                      <p className="text-left text-sm text-slate-500 mb-3">Tổng dịch vụ</p>
                    </div>
    
                    <div className="rounded-2xl bg-emerald-50 p-5 ">
                      <IoPeopleOutline className="text-2xl text-emerald-500 mb-3" />
                      <p className="text-left  mb-3 mt-4 text-3xl font-bold text-slate-900">{stats?.totalAccounts ?? "--"}</p>
                      <p className="text-left text-sm text-slate-500">Tổng tài khoản </p>
                    </div>
    
                    <div className="rounded-2xl bg-orange-50 p-5">
                      <IoTicketOutline className="text-2xl text-orange-500 mb-3" />
                      <p className="text-left  mb-3 mt-4 text-3xl font-bold text-slate-900">11</p>
                      <p className="text-left  mb-3 text-sm text-slate-500">Tổng đơn hàng </p>
                    </div>
    
                    <div className="rounded-2xl bg-rose-50 p-5 ">
                      <IoCheckmarkCircleOutline className="text-2xl text-rose-500 mb-3" />
                      <p className="text-left  mb-3 mt-4 text-3xl font-bold text-slate-900">{stats?.pendingServices ?? "--"}</p>
                      <p className="text-left  mb-3 text-sm text-slate-500">Chờ xử lí </p>
                    </div>
                  </div>
    
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-5">
                      <h3 className="text-left  text-sm font-semibold text-slate-900">
                        Doanh thu 
                      </h3>
                      <p className="text-left mt-3 text-3xl font-bold text-orange-500 p-2">500</p>
                      <p className="text-left mt-2 text-sm text-slate-400">
                       Doanh thu trong tháng 
                      </p>
                    </div>
    
                    <div className="rounded-2xl bg-slate-50 p-5">
                      <h3 className="text-left  text-sm font-semibold text-slate-900">
                        Đánh giá 
                      </h3>
                      <p className="text-left mt-3 text-3xl font-bold text-orange-500 p-2">100</p>
                      <p className="text-left mt-2 text-sm text-slate-400">
                       Tổng số lượng đánh giá 
                      </p>
                    </div>
                  </div>
    
                  <div className="text-left rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-400">
                    Dịch vụ đang chờ được xử lý 
                  </div>
                </div>
  )
}

export default TotalSystem
