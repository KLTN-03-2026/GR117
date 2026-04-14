import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CiLogin } from "../assets/Icons/Icons";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPass: "",
    role: "user",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const setField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPass) {
      setError("Mật khẩu xác nhận không khớp");
      setMessage("");
      return;
    }

    if (form.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      setMessage("");
      return;
    }

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
            role: "user",
          });

          setTimeout(() => {
            navigate("/signin");
          }, 800);
        } else {
          setError(data.message || "Đăng ký thất bại");
        }
      } catch {
        setError("Lỗi hệ thống");
      } finally {
        setLoading(false);
        setSubmitted(false);
      }
    };

    registerUser();
  }, [submitted, form, navigate]);

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
            Đăng ký
          </h1>
          <p className="mt-2 text-slate-500" style={{ fontSize: 15 }}>
            Tạo tài khoản mới để bắt đầu hành trình
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl bg-white p-8 shadow-lg"
        >
          <div className="flex gap-2 rounded-xl bg-[#f8fafc] p-1">
            {[
              { value: "user", label: "Khách hàng" },
              { value: "provider", label: "Đối tác / Nhà cung cấp" },
            ].map((role) => (
              <button
                key={role.value}
                type="button"
                onClick={() => setField("role", role.value)}
                className={`flex-1 rounded-lg py-2.5 transition-all ${
                  form.role === role.value
                    ? "bg-[#f97316] text-white shadow-sm"
                    : "text-slate-500"
                }`}
                style={{ fontSize: 13, fontWeight: 600 }}
              >
                {role.label}
              </button>
            ))}
          </div>

          <div>
            <label
              className="mb-1.5 block text-slate-500"
              style={{ fontSize: 13, fontWeight: 500 }}
            >
              Họ tên
            </label>
            <input
              value={form.fullName}
              onChange={(e) => setField("fullName", e.target.value)}
              required
              className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-[#0f172a] outline-none transition-colors focus:border-[#f97316]"
              style={{ fontSize: 14 }}
            />
          </div>

          <div>
            <label
              className="mb-1.5 block text-slate-500"
              style={{ fontSize: 13, fontWeight: 500 }}
            >
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              required
              className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-[#0f172a] outline-none transition-colors focus:border-[#f97316]"
              style={{ fontSize: 14 }}
            />
          </div>

          <div>
            <label
              className="mb-1.5 block text-slate-500"
              style={{ fontSize: 13, fontWeight: 500 }}
            >
              Số điện thoại
            </label>
            <input
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              required
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
            <input
              type="password"
              value={form.password}
              onChange={(e) => setField("password", e.target.value)}
              required
              className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-[#0f172a] outline-none transition-colors focus:border-[#f97316]"
              style={{ fontSize: 14 }}
            />
          </div>

          <div>
            <label
              className="mb-1.5 block text-slate-500"
              style={{ fontSize: 13, fontWeight: 500 }}
            >
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              value={form.confirmPass}
              onChange={(e) => setField("confirmPass", e.target.value)}
              required
              className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-[#0f172a] outline-none transition-colors focus:border-[#f97316]"
              style={{ fontSize: 14 }}
            />
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
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f97316] to-[#f59e0b] py-3.5 text-white transition-all hover:shadow-lg hover:shadow-orange-200 disabled:cursor-not-allowed disabled:opacity-70"
            style={{ fontSize: 15, fontWeight: 600 }}
          >
            <CiLogin size={20} />
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </button>

          <p className="text-center text-slate-500" style={{ fontSize: 14 }}>
            Đã có tài khoản?{" "}
            <Link
              to="/signin"
              className="text-[#f97316] transition hover:underline"
              style={{ fontWeight: 600 }}
            >
              Đăng nhập
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}