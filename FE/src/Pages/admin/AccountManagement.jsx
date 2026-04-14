import React, { useState } from "react";
import { IoSearch } from "react-icons/io5";

const AccountManagement = () => {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold">Quản lí tài khoản</h2>

      <div className="relative">
        <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm tài khoản..."
          className="w-full pl-11 px-4 py-3 border rounded-xl"
        />
      </div>

      <div className="text-center text-slate-400 py-10">
        Chưa có dữ liệu tài khoản
      </div>
    </div>
  );
};

export default AccountManagement;