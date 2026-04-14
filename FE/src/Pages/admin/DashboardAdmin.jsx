import React, { useState } from "react";
import {
  IoBarChartOutline,
  IoCheckmarkCircleOutline,
  IoLockClosedOutline,
  IoPeopleOutline,
  IoPricetagOutline,
  IoSearch,
  IoShieldCheckmarkOutline,
  IoTicketOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { HiOutlineUserPlus } from "react-icons/hi2";
import TotalSystem from "./TotalSystem";

const tabs = [
  { id: "overview", label: "Tổng quan ", icon: IoBarChartOutline },
  { id: "services", label: "Dịch vụ", icon: IoPricetagOutline },
  { id: "accounts", label: "Tài khoản ", icon: IoPeopleOutline },
  { id: "bookings", label: "Đơn hàng ", icon: IoTicketOutline },
];

const DashboardAdmin = () => {
  const [tab, setTab] = useState("overview");
  const [serviceSearch, setServiceSearch] = useState("");
  const [accountSearch, setAccountSearch] = useState("");
  const [showAddUser, setShowAddUser] = useState(false);

  const cardClass =
    "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";
  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100";

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-500">
            <IoShieldCheckmarkOutline className="text-xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 my-5 ">
              Admin <span className="text-orange-500">Dashboard</span>
            </h1>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto rounded-2xl bg-[#eef2f7] p-1 mb-6">
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium whitespace-nowrap transition ${
                  active
                    ? "bg-white text-orange-500 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon className="text-base" />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className={cardClass}>
          {tab === "overview" && (
           <TotalSystem />
          )}

          {tab === "services" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Quản lí dịch vụ 
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Tim kiem, loc va xu ly trang thai dich vu
                </p>
              </div>

              <div className="flex flex-col gap-3 lg:flex-row">
                <div className="relative flex-1">
                  <IoSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    placeholder="Tim theo ten, nha cung cap..."
                    className={`${inputClass} pl-11`}
                  />
                </div>

                <select className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100">
                  <option>Tat ca trang thai</option>
                  <option>Cho duyet</option>
                  <option>Dang hien thi</option>
                  <option>Bi tu choi</option>
                  <option>Da an</option>
                </select>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">
                        Dich vu
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Nha cung cap
                      </th>
                      <th className="px-4 py-3 text-left font-medium">Gia</th>
                      <th className="px-4 py-3 text-left font-medium">
                        Danh gia
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Trang thai
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Thao tac
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td
                        colSpan="6"
                        className="px-4 py-16 text-center text-slate-400"
                      >
                        Chua co du lieu dich vu
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "accounts" && (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Quan ly tai khoan
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Them, tim kiem va khoa tai khoan
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddUser((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  <HiOutlineUserPlus className="text-base" />
                  Them tai khoan
                </button>
              </div>

              {showAddUser && (
                <div className="grid grid-cols-1 gap-4 rounded-2xl bg-slate-50 p-5 md:grid-cols-2">
                  <input placeholder="Ho ten" className={inputClass} />
                  <input placeholder="Email" className={inputClass} />
                  <input placeholder="So dien thoai" className={inputClass} />
                  <select className={inputClass}>
                    <option>Khach hang</option>
                    <option>Doi tac</option>
                    <option>Admin</option>
                  </select>

                  <div className="md:col-span-2 flex gap-3">
                    <button
                      type="button"
                      className="rounded-xl bg-slate-200 px-5 py-3 text-sm font-medium text-slate-700"
                    >
                      Huy
                    </button>
                    <button
                      type="button"
                      className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white"
                    >
                      Them
                    </button>
                  </div>
                </div>
              )}

              <div className="relative">
                <IoSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  value={accountSearch}
                  onChange={(e) => setAccountSearch(e.target.value)}
                  placeholder="Tim theo ten, email..."
                  className={`${inputClass} pl-11`}
                />
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Ten</th>
                      <th className="px-4 py-3 text-left font-medium">Email</th>
                      <th className="px-4 py-3 text-left font-medium">SDT</th>
                      <th className="px-4 py-3 text-left font-medium">
                        Vai tro
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Trang thai
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Thao tac
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td
                        colSpan="6"
                        className="px-4 py-16 text-center text-slate-400"
                      >
                        Chua co du lieu tai khoan
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3 text-slate-500">
                <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm">
                  <IoLockClosedOutline />
                  Khoa tai khoan
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm">
                  <IoTrashOutline />
                  Xoa tai khoan
                </div>
              </div>
            </div>
          )}

          {tab === "bookings" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Giam sat booking
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Theo doi thong tin booking toan he thong
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Ma</th>
                      <th className="px-4 py-3 text-left font-medium">
                        Khach hang
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Dich vu
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Doi tac
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Tong tien
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Trang thai
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Ngay dat
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td
                        colSpan="7"
                        className="px-4 py-16 text-center text-slate-400"
                      >
                        Chua co du lieu booking
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
