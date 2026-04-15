import axios from "axios";
import React, { useEffect } from "react";
import { useState } from "react";
import { HiOutlineUserPlus } from "react-icons/hi2";
import { IoSearch } from "react-icons/io5";
const AccountManagement = () => {
  const [accountSearch, setAccountSearch] = useState("");
  const [showAddUser, setShowAddUser] = useState(false);
  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100";

  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");

  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRole, setNewRole] = useState("user");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    const fetchAccounts = async () => {
      try {
        setError("");
        const result = await axios.get(
          "http://localhost:5000/api/admin/accounts",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        setAccounts(result.data.data || []);
      } catch (err) {
        setError(
          err?.response?.data?.message || "Khong the tai danh sach tai khoan",
        );
      }
    };

    fetchAccounts();
  }, []);

  const filteredAccounts = accounts.filter((item) => {
    const keyword = accountSearch.trim().toLowerCase();
    if (!keyword) return true;

    const fullName = String(item.fullName || "").toLowerCase();
    const email = String(item.email || "").toLowerCase();
    return fullName.includes(keyword) || email.includes(keyword);
  });

  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    const aIsPendingProvider =
      a?.role === "provider" && a?.status === "pending";
    const bIsPendingProvider =
      b?.role === "provider" && b?.status === "pending";

    if (aIsPendingProvider !== bIsPendingProvider) {
      return aIsPendingProvider ? -1 : 1;
    }

    const aCreatedAt = new Date(a?.createdAt || 0).getTime();
    const bCreatedAt = new Date(b?.createdAt || 0).getTime();
    return bCreatedAt - aCreatedAt;
  });

  const approveProvider = async (id) => {
    const accessToken = localStorage.getItem("accessToken");
    try {
      setActionLoadingId(id);
      setError("");
      await axios.patch(
        `http://localhost:5000/api/admin/approve-provider/${id}`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      setAccounts((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: "active" } : a)),
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Duyet provider that bai");
    } finally {
      setActionLoadingId("");
    }
  };

  const rejectProvider = async (id) => {
    const accessToken = localStorage.getItem("accessToken");
    try {
      setActionLoadingId(id);
      setError("");
      await axios.patch(
        `http://localhost:5000/api/admin/reject-provider/${id}`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      setAccounts((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: "rejected" } : a)),
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Tu choi provider that bai");
    } finally {
      setActionLoadingId("");
    }
  };

  const blockAccount = async (id) => {
    const accessToken = localStorage.getItem("accessToken");
    try {
      setActionLoadingId(id);
      setError("");
      await axios.patch(
        `http://localhost:5000/api/admin/accounts/${id}/block`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      setAccounts((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: "blocked" } : a)),
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Khoa tai khoan that bai");
    } finally {
      setActionLoadingId("");
    }
  };

  const unblockAccount = async (id) => {
    const accessToken = localStorage.getItem("accessToken");
    try {
      setActionLoadingId(id);
      setError("");
      await axios.patch(
        `http://localhost:5000/api/admin/accounts/${id}/unblock`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      setAccounts((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: "active" } : a)),
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Mo khoa tai khoan that bai");
    } finally {
      setActionLoadingId("");
    }
  };

  const deleteAccount = async (id) => {
    const accessToken = localStorage.getItem("accessToken");
    try {
      setActionLoadingId(id);
      setError("");
      await axios.delete(`http://localhost:5000/api/admin/accounts/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setAccounts((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      setError(err?.response?.data?.message || "Xoa tai khoan that bai");
    } finally {
      setActionLoadingId("");
    }
  };

  const addAccount = async () => {
    const accessToken = localStorage.getItem("accessToken");
    try {
      setError("");
      setActionLoadingId("create");

      const payload = {
        fullName: newFullName,
        email: newEmail,
        phone: newPhone,
        password: newPassword,
        role: newRole,
        status: "active",
      };

      const result = await axios.post(
        "http://localhost:5000/api/admin/accounts",
        payload,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      const created = result.data?.data;
      if (created?.id) {
        setAccounts((prev) => [
          {
            _id: created.id,
            fullName: created.fullName,
            email: created.email,
            phone: created.phone,
            role: created.role,
            status: created.status,
          },
          ...prev,
        ]);
      }

      setShowAddUser(false);
      setNewFullName("");
      setNewEmail("");
      setNewPhone("");
      setNewRole("user");
      setNewPassword("");
    } catch (err) {
      setError(err?.response?.data?.message || "Them tai khoan that bai");
    } finally {
      setActionLoadingId("");
    }
  };

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
          <input
            placeholder="fullName"
            className={inputClass}
            value={newFullName}
            onChange={(e) => setNewFullName(e.target.value)}
          />
          <input
            placeholder="email"
            className={inputClass}
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <input
            placeholder="Số điện thoại"
            className={inputClass}
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
          />
          <input
            placeholder="password"
            className={inputClass}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <select
            className={inputClass}
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
          >
            <option value="user">user</option>
            <option value="provider">provider</option>
            <option value="admin">admin</option>
          </select>

          <div className="md:col-span-2 flex gap-3">
            <button
              type="button"
              onClick={() => setShowAddUser(false)}
              className="rounded-xl bg-slate-200 px-5 py-3 text-sm font-medium text-slate-700"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={addAccount}
              disabled={actionLoadingId === "create"}
              className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white"
            >
              Thêm
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      {actionLoadingId && (
        <p className="text-sm text-slate-400">Dang xu ly...</p>
      )}

      <div className="relative">
        <IoSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
        <input
          value={accountSearch}
          onChange={(e) => setAccountSearch(e.target.value)}
          placeholder="Tìm theo tên, email..."
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
              <th className="px-4 py-3 text-left font-medium">Vai trò</th>
              <th className="px-4 py-3 text-left font-medium">Trạng thái</th>
              <th className="px-4 py-3 text-left font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {sortedAccounts.map((item, index) => (
              <tr key={item._id}>
                <td className="px-4 py-3 text-left">{index + 1}</td>
                <td className="px-4 py-3 text-left">{item.fullName}</td>
                <td className="px-4 py-3 text-left">{item.email}</td>
                <td className="px-4 py-3 text-left">{item.phone || "--"}</td>
                <td className="px-4 py-3 text-left">{item.role}</td>
                <td className="px-4 py-3 text-left">{item.status}</td>
                <td className="px-4 py-3 text-left flex gap-2">
                  {item.role === "provider" && item.status === "pending" && (
                    <>
                      <button
                        type="button"
                        onClick={() => approveProvider(item._id)}
                        className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-100"
                      >
                        Duyệt
                      </button>
                      <button
                        type="button"
                        onClick={() => rejectProvider(item._id)}
                        className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                      >
                        Từ chối
                      </button>
                    </>
                  )}
                  {item.status === "blocked" ? (
                    <button
                      type="button"
                      onClick={() => unblockAccount(item._id)}
                      className="rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-600 hover:bg-sky-100"
                    >
                      Khóa
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => blockAccount(item._id)}
                      className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Khóa
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => deleteAccount(item._id)}
                    className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}

            {sortedAccounts.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  className="px-4 py-16 text-center text-slate-400"
                >
                  ChÆ°a cĂ³ dá»¯ liá»‡u tĂ i khoáº£n
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountManagement;
