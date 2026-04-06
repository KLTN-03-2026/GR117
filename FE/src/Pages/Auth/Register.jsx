import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaLocationDot, FaRegEye, FaRegEyeSlash } from "../../assets/Icons/Icons";

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
    setSubmitted(true); // bật cờ để useEffect chạy
  };

  // useEffect để gọi API khi submitted = true
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-5">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-bold">
              <span><FaLocationDot /></span>
            </div>
            <h1 className="text-gray-900 font-semibold text-l">Tạo tài khoản</h1>
            <p className="text-gray-500 text-sm">Tham gia ViVu Travel ngay hôm nay</p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block text-left">Họ và tên</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block text-left">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="email@gmail.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block text-left">Số điện thoại</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="09xxxxxxxx"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block text-left">Mật khẩu</label>
              <div className="relative">
                <input
                  type={show.password ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition"
                />
                <button
                  type="button"
                  onClick={() => setShow((prev) => ({ ...prev, password: !prev.password }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {show.password ? <FaRegEyeSlash /> : <FaRegEye />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block text-left">Xác nhận mật khẩu</label>
              <div className="relative">
                <input
                  type={show.confirmPass ? "text" : "password"}
                  value={form.confirmPass}
                  onChange={(e) => handleChange("confirmPass", e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition"
                />
                <button
                  type="button"
                  onClick={() => setShow((prev) => ({ ...prev, confirmPass: !prev.confirmPass }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {show.confirmPass ? <FaRegEyeSlash /> : <FaRegEye />}
                </button>
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-teal-500 text-white rounded-xl font-semibold hover:from-sky-600 hover:to-teal-600 transition-all shadow-md mt-2"
            >
              {loading ? "Đang xử lý..." : "Tạo tài khoản"}
            </button>

            {/* Messages */}
            {message && <p className="text-green-600 text-center mt-2">{message}</p>}
            {error && <p className="text-red-600 text-center mt-2">{error}</p>}
          </form>

          {/* Footer */}
          <p className="text-center py-5 text-sm text-gray-500">
            Đã có tài khoản?
            <Link to="/signin" className="text-sky-600 font-medium hover:text-sky-700 ml-1">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}