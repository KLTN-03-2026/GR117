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

const tabs = [
  { id: "overview", label: "Tong quan", icon: IoBarChartOutline },
  { id: "services", label: "Dich vu", icon: IoPricetagOutline },
  { id: "accounts", label: "Tai khoan", icon: IoPeopleOutline },
  { id: "bookings", label: "Booking", icon: IoTicketOutline },
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
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-500">
            <IoShieldCheckmarkOutline className="text-xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Admin <span className="text-orange-500">Dashboard</span>
            </h1>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto rounded-2xl bg-[#eef2f7] p-1">
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
          {/* {tab === "overview" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Tong quan he thong
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Khu vuc nay de hien thi cac chi so tong hop cua admin
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-sky-50 p-5">
                  <IoPricetagOutline className="text-2xl text-sky-500" />
                  <p className="mt-4 text-3xl font-bold text-slate-900">--</p>
                  <p className="text-sm text-slate-500">Tong dich vu</p>
                </div>

                <div className="rounded-2xl bg-emerald-50 p-5">
                  <IoPeopleOutline className="text-2xl text-emerald-500" />
                  <p className="mt-4 text-3xl font-bold text-slate-900">--</p>
                  <p className="text-sm text-slate-500">Tong tai khoan</p>
                </div>

                <div className="rounded-2xl bg-orange-50 p-5">
                  <IoTicketOutline className="text-2xl text-orange-500" />
                  <p className="mt-4 text-3xl font-bold text-slate-900">--</p>
                  <p className="text-sm text-slate-500">Tong booking</p>
                </div>

                <div className="rounded-2xl bg-rose-50 p-5">
                  <IoCheckmarkCircleOutline className="text-2xl text-rose-500" />
                  <p className="mt-4 text-3xl font-bold text-slate-900">--</p>
                  <p className="text-sm text-slate-500">Cho duyet</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <h3 className="text-base font-semibold text-slate-900">
                    Doanh thu
                  </h3>
                  <p className="mt-3 text-4xl font-bold text-orange-500">--</p>
                  <p className="mt-2 text-sm text-slate-400">
                    Khu vuc tong hop doanh thu booking da thanh toan
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <h3 className="text-base font-semibold text-slate-900">
                    Danh gia
                  </h3>
                  <p className="mt-3 text-4xl font-bold text-orange-500">--</p>
                  <p className="mt-2 text-sm text-slate-400">
                    Khu vuc tong hop so luong review he thong
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-400">
                Khu vuc danh sach dich vu cho duyet
              </div>
            </div>
          )} */}

          {tab === "services" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Quan ly dich vu
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
