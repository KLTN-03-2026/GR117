import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaLocationDot,
  FaRegEye,
  FaRegEyeSlash,
} from "../assets/Icons/Icons";
import CustomApi from "../../Server";

function SignIn() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await CustomApi({
        Url: "/api/auth/login",
        method: "POST",
        data: form,
      });

      const accessToken = res.data?.accessToken;
      const user = res.data?.user;

      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
      }

      if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
      }

      navigate("/");
      window.location.reload();
    } catch (apiError) {
      setError(apiError.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-[#ead9cb] bg-[#fffaf7] px-4 py-3.5 text-sm text-[#1a1a2e] outline-none transition focus:border-[#f97316] focus:ring-4 focus:ring-[#f97316]/10";

  const eyeButtonClass =
    "absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#f97316]";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fffaf5] px-4 py-8">
      <div className="absolute inset-0">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-[#f97316]/12 blur-3xl" />
        <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-[#f59e0b]/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#1a1a2e]/8 blur-3xl" />
      </div>

      <div className="relative w-full max-w-xl">
        <div className="rounded-[32px] border border-[#f4dfcf] bg-white p-6 shadow-[0_24px_80px_rgba(26,26,46,0.12)] sm:p-8 lg:p-10">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f97316] to-[#f59e0b] text-white shadow-lg shadow-orange-200">
                <FaLocationDot className="text-2xl" />
              </div>

              <h1 className="text-3xl font-bold text-[#1a1a2e]">
                Chào mừng trở lại
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Đăng nhập vào ViVu Travel để tiếp tục sử dụng dịch vụ.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#1a1a2e]">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="email@gmail.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1a1a2e]">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Nhập mật khẩu"
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
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-[#f97316] to-[#f59e0b] py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:shadow-orange-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Đang xử lý..." : "Đăng nhập"}
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-[#f4e5d7] bg-[#fff7ef] px-4 py-3 text-center text-sm text-slate-500">
              Chưa có tài khoản?
              <Link
                to="/register"
                className="ml-2 font-semibold text-[#f97316] transition hover:text-[#ea580c]"
              >
                Đăng ký ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
