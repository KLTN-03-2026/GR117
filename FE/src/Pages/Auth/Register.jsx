import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaLocationDot,
  FaRegEye,
  FaRegEyeSlash,
} from "../../assets/Icons/Icons";

export default function Register() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPass: "",
  });

  const [show, setShow] = useState({
    password: false,
    confirmPass: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const navigate = useNavigate();

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    setSubmitted(true);
  };

  useEffect(() => {
    if (!submitted) return;

    const registerUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

        const data = await res.json();

        if (res.ok) {
          setMessage(data.message || "Đăng ký thành công");
          setForm({
            fullName: "",
            email: "",
            phone: "",
            password: "",
            confirmPass: "",
          });

          setTimeout(() => {
            navigate("/signin");
          }, 1500);
        } else {
          setError(data.message || "Đăng ký thất bại");
        }
      } catch (err) {
        setError("Lỗi hệ thống");
      } finally {
        setLoading(false);
        setSubmitted(false);
      }
    };

    registerUser();
  }, [submitted, form, navigate]);

  const inputClass =
    "w-full rounded-2xl border border-[#ead9cb] bg-[#fffaf7] px-4 py-3.5 text-sm text-[#1a1a2e] outline-none transition focus:border-[#f97316] focus:ring-4 focus:ring-[#f97316]/10";

  const eyeButtonClass =
    "absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#f97316]";

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
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f97316] to-[#f59e0b] text-white shadow-lg shadow-orange-200">
                <FaLocationDot className="text-2xl" />
              </div>

              <h1 className="text-3xl font-bold text-[#1a1a2e]">
                Tạo tài khoản
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Gia nhập ViVu Travel và bắt đầu hành trình của bạn.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#1a1a2e]">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#1a1a2e]">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="email@gmail.com"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#1a1a2e]">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="09xxxxxxxx"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1a1a2e]">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={show.password ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className={`${inputClass} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShow((prev) => ({
                        ...prev,
                        password: !prev.password,
                      }))
                    }
                    className={eyeButtonClass}
                  >
                    {show.password ? <FaRegEyeSlash /> : <FaRegEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1a1a2e]">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={show.confirmPass ? "text" : "password"}
                    value={form.confirmPass}
                    onChange={(e) =>
                      handleChange("confirmPass", e.target.value)
                    }
                    placeholder="Nhập lại mật khẩu"
                    className={`${inputClass} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShow((prev) => ({
                        ...prev,
                        confirmPass: !prev.confirmPass,
                      }))
                    }
                    className={eyeButtonClass}
                  >
                    {show.confirmPass ? <FaRegEyeSlash /> : <FaRegEye />}
                  </button>
                </div>
              </div>

              {(message || error) && (
                <div className="space-y-2">
                  {message && (
                    <p className="rounded-xl bg-green-50 px-4 py-3 text-center text-sm text-green-600">
                      {message}
                    </p>
                  )}
                  {error && (
                    <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">
                      {error}
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-[#f97316] to-[#f59e0b] py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:shadow-orange-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Đang xử lý..." : "Tạo tài khoản"}
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-[#f4e5d7] bg-[#fff7ef] px-4 py-3 text-center text-sm text-slate-500">
              Đã có tài khoản?
              <Link
                to="/signin"
                className="ml-2 font-semibold text-[#f97316] transition hover:text-[#ea580c]"
              >
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
