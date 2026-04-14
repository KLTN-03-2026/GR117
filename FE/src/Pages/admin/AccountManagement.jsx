import axios from 'axios';
import React, { useEffect } from 'react'
import { useState } from 'react';
import { HiOutlineUserPlus } from "react-icons/hi2";
import {
  IoLockClosedOutline,
  IoSearch,
  IoTrashOutline,
} from "react-icons/io5";
const AccountManagement = () => {
  const [accountSearch, setAccountSearch] = useState("");
  const [showAddUser, setShowAddUser] = useState(false);
  const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100";

  const [getAccount,setAccount] = useState([]);

  // useEffect(()=>{
  //   const fetch = async ()=> {
  //   try {
  //     const result = await axios.get(`http://localhost:5000/api/admin/getAccounts`);
  //      console.log(data);
       
  //       setServices(result.data.data || result.data);
  //   } catch (error) {
      
  //   }
  // }},[]);


  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-left text-xl font-semibold text-slate-900">
          Quản lý tài khoản 
          </h2>
          
        </div>

        <button
          type="button"
          onClick={() => setShowAddUser((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          <HiOutlineUserPlus className="text-base" />
          Thêm tài khoản 
        </button>
      </div>

      {showAddUser && (
        <div className="grid grid-cols-1 gap-4 rounded-2xl bg-slate-50 p-5 md:grid-cols-2">
          <input placeholder="fullName" className={inputClass} />
          <input placeholder="email" className={inputClass} />
          <input placeholder="Số điện thoại " className={inputClass} />
          <select className={inputClass}>
            <option>user</option>
            <option>provider </option>
            <option>admin</option>
          </select>

          <div className="md:col-span-2 flex gap-3">
            <button
              type="button"
              className="rounded-xl bg-slate-200 px-5 py-3 text-sm font-medium text-slate-700"
            >
              Hủy
            </button>
            <button
              type="button"
              className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white"
            >
              Thêm
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
              <th className="px-4 py-3 text-left font-medium">STT</th>
              <th className="px-4 py-3 text-left font-medium">Tên</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">SDT</th>
              <th className="px-4 py-3 text-left font-medium">
                Vai trò 
              </th>
              <th className="px-4 py-3 text-left font-medium">
                Trạng thái 
              </th>
              <th className="px-4 py-3 text-left font-medium">
                Thao tác 
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan="6"
                className="px-4 py-16 text-center text-slate-400"
              >
                Chưa có dữ liệu tài khoản 
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex gap-3 text-slate-500">
        <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm">
          <IoLockClosedOutline />
          Khóa tài khoản 
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm">
          <IoTrashOutline />
          Xóa tài khoản 
        </div>
      </div>
    </div>
  )
}

export default AccountManagement