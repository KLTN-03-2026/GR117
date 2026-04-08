import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { CiLogin, FaRegEye, FaRegEyeSlash } from "../assets/Icons/Icons";
import CustomApi from "../../Server";

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
          : "/user/dashboard";

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
      const role = String(user?.role || "").toLowerCase();

      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
      }

      if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
      }

      if (rememberMe) {
        localStorage.setItem("rememberLoginEmail", email);
      } else {
        localStorage.removeItem("rememberLoginEmail");
      }

      setMessage({
        type: "success",
        text: res.message || "Đăng nhập thành công",
      });

      const nextPath =
        role === "admin"
          ? "/admin/dashboard"
          : role === "provider" || role === "partner"
            ? "/provider/dashboard"
            : "/";

      navigate(nextPath);
      window.location.reload();
    } catch (apiError) {
      setMessage({
        type: "error",
        text: apiError.message || "Đăng nhập thất bại",
      });
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setMessage({ type: "", text: "" });
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-[#f8fafc] px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1
            className="text-[#0f172a]"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            Đăng nhập
          </h1>
          <p className="mt-2 text-slate-500" style={{ fontSize: 15 }}>
            Chào mừng bạn quay trở lại VIVU Travel
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl bg-white p-8 shadow-lg"
        >
          <div>
            <label
              className="mb-1.5 block text-slate-500"
              style={{ fontSize: 13, fontWeight: 500 }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-[#0f172a] outline-none transition-colors focus:border-[#f97316]"
              style={{ fontSize: 14 }}
            />
          </div>

          <div>
            <label
              className="mb-1.5 block text-slate-500"
              style={{ fontSize: 13, fontWeight: 500 }}
            >
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 pr-12 text-[#0f172a] outline-none transition-colors focus:border-[#f97316]"
                style={{ fontSize: 14 }}
              />
              <button
                type="button"
                onClick={() => setShowPw((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPw ? <FaRegEyeSlash size={18} /> : <FaRegEye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded"
              />
              <span className="text-slate-500" style={{ fontSize: 13 }}>
                Ghi nhớ đăng nhập
              </span>
            </label>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-[#f97316] transition hover:underline"
              style={{ fontSize: 13 }}
            >
              Quên mật khẩu?
            </button>
          </div>

          {message.text && (
            <p
              className={`rounded-xl px-4 py-3 text-center text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f97316] to-[#f59e0b] py-3.5 text-white transition-all hover:shadow-lg hover:shadow-orange-200 disabled:cursor-not-allowed disabled:opacity-70"
            style={{ fontSize: 15, fontWeight: 600 }}
          >
            <CiLogin size={20} />
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <p className="text-center text-slate-500" style={{ fontSize: 14 }}>
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-[#f97316] transition hover:underline"
              style={{ fontWeight: 600 }}
            >
              Đăng ký ngay
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignIn;
