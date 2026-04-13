import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  CiLogin,
  FaRegEye,
  FaRegEyeSlash,
} from "../../assets/Icons/Icons";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FaInstagram } from "react-icons/fa";
import CustomApi from "../../../Server";

function SignIn() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  if (currentUser) {
    const role = String(currentUser.role || "").toLowerCase();
    const path =
      role === "admin"
        ? "/admin/dashboard"
        : role === "provider" || role === "partner"
          ? "/provider/dashboard"
          : "/";

    return <Navigate to={path} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await CustomApi({
        Url: "/api/auth/login",
        method: "POST",
        data: { email, password },
      });

      const accessToken = res.data?.accessToken;
      const user = res.data?.user;

      if (accessToken) localStorage.setItem("accessToken", accessToken);
      if (user) localStorage.setItem("currentUser", JSON.stringify(user));

      navigate("/");
      window.location.reload();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Đăng nhập thất bại",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Đăng nhập
            </h1>
            <p className="text-gray-500 text-sm mt-1 mb-3">
              Chào mừng bạn quay trở lại VIVU Travel
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <label className="text-left pl-2 mb-1.5 block text-slate-500 font-medium text-sm" > Email </label>
            <input
              type="email"
              placeholder="Email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border bg-gray-50 focus:border-orange-400 outline-none text-sm"
              required
            />

            {/* Password */}
            <div>
              <label className="text-left pl-2 mb-1.5 block text-slate-500 font-medium text-sm">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border bg-gray-50 focus:border-orange-400 outline-none text-sm pr-10"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-gray-500 hover:text-orange-500 transition"
                >
                  {showPw ? <FaRegEyeSlash size={18} /> : <FaRegEye size={18} />}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-500">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Ghi nhớ
              </label>

              <span
                onClick={() => navigate("/forgot-password")}
                className="text-orange-500 cursor-pointer hover:underline"
              >
                Quên mật khẩu?
              </span>
            </div>

            {/* Message */}
            {message.text && (
              <p className="text-center text-red-500 text-sm">
                {message.text}
              </p>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#f97316] to-[#f59e0b] text-white hover:shadow-lg transition disabled:opacity-70"
            >
              <CiLogin />
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-[1px] bg-gray-200" />
              <span className="text-xs text-gray-400">
                Hoặc đăng nhập với
              </span>
              <div className="flex-1 h-[1px] bg-gray-200" />
            </div>

            {/* Social Login */}
            <div className="flex justify-center gap-4 mb-3">
              <button className="flex items-center justify-center w-11 h-11 rounded-full  hover:bg-gray-50 transition ">
                <FcGoogle className="text-2xl" />
              </button>

              <button className="flex items-center justify-center w-11 h-11 rounded-full  hover:bg-blue-50 transition ">
                <FaFacebook className="text-blue-600 text-2xl" />
              </button>

              <button className="flex items-center justify-center w-11 h-11 rounded-full  hover:bg-pink-50 transition ">
                <FaInstagram className="text-pink-500 text-2xl" />
              </button>
            </div>
          </form>

          {/* Register */}
          <p className="text-center text-sm text-gray-500 mt-6 mb-6 ">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-orange-500 font-semibold hover:underline"
            >
              Đăng ký
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;