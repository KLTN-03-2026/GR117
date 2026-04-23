import { useState } from "react";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MdOutlineKey, MdArrowBack } from "react-icons/md";
import { FaRegEye, FaRegEyeSlash } from "../../assets/Icons/Icons";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [done, setDone] = useState(false);

  const inputClass =
    "w-full rounded-2xl border border-[#ead9cb] bg-[#fffaf7] px-4 py-3.5 text-sm text-[#1a1a2e] outline-none transition focus:border-[#f97316] focus:ring-4 focus:ring-[#f97316]/10";

  const eyeButtonClass =
    "absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#f97316]";

  const actionButtonClass =
    "flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#f97316] to-[#f59e0b] py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:shadow-orange-300 disabled:cursor-not-allowed disabled:opacity-70";

  const showError = (text) => setMessage({ type: "error", text });

  const handleReset = async () => {
    if (!token || !email) {
      showError("Link đặt lại không hợp lệ.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      showError("Vui lòng nhập đầy đủ mật khẩu mới.");
      return;
    }

    if (newPassword !== confirmPassword) {
      showError("Mật khẩu xác nhận chưa khớp.");
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: "", text: "" });

      const res = await axios.post("/api/auth/reset-password", {
        email,
        token,
        newPassword,
        confirmPassword,
      });

      setDone(true);
      setMessage({
        type: "success",
        text: res.data?.message || "Đặt lại mật khẩu thành công.",
      });
      setTimeout(() => navigate("/signin"), 1200);
    } catch (error) {
      showError(error?.response?.data?.message || "Đặt lại mật khẩu thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fffaf5] px-4 py-8">
      <div className="absolute inset-0">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-[#f97316]/12 blur-3xl" />
        <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-[#f59e0b]/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#1a1a2e]/8 blur-3xl" />
      </div>

      <div className="relative w-full max-w-xl">
        <div className="rounded-[32px] border border-[#f4dfcf] bg-white p-6 shadow-[0_24px_80px_rgba(26,26,46,0.12)] sm:p-8 lg:p-10">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f97316]/10">
                <MdOutlineKey className="text-[28px] text-[#f97316]" />
              </div>

              <h1 className="text-3xl font-bold text-[#1a1a2e]">
                Đặt lại mật khẩu
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                {email || "Email chưa xác định"}
              </p>
            </div>

            {done ? (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <MdOutlineKey className="text-[28px] text-green-500" />
                </div>
                <p className="text-base font-semibold text-[#1a1a2e]">
                  Đổi mật khẩu thành công!
                </p>
                <Link to="/signin" className={actionButtonClass}>
                  Đăng nhập ngay
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mật khẩu mới"
                    className={`${inputClass} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className={eyeButtonClass}
                  >
                    {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Xác nhận mật khẩu"
                    className={`${inputClass} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className={eyeButtonClass}
                  >
                    {showConfirmPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className={actionButtonClass}
                >
                  {loading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
                </button>

                {message.text ? (
                  <p
                    className={`rounded-xl px-4 py-3 text-center text-sm ${
                      message.type === "success"
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {message.text}
                  </p>
                ) : null}

                <Link
                  to="/signin"
                  className="flex items-center justify-center gap-1 text-sm text-slate-500 transition hover:text-[#f97316]"
                >
                  <MdArrowBack className="text-base" />
                  Quay lại đăng nhập
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
