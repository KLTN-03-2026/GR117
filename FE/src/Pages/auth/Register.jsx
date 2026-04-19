import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CiLogin } from "../../assets/Icons/Icons";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FaInstagram } from "react-icons/fa";

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

  const setField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // 🔥 validate tách riêng
  const validateForm = (form) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[A-Za-zÀ-ỹ\s]+$/;
    const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;

    if (!form.fullName.trim()) return "Tên không được để trống";
    if (form.fullName.trim().length < 2) return "Tên phải ít nhất 2 ký tự";
    if (!nameRegex.test(form.fullName)) return "Tên không hợp lệ";

    if (!emailRegex.test(form.email)) return "Email không đúng định dạng";

    if (!form.email.endsWith("@gmail.com"))
      return "Email phải là gmail";

    if (!phoneRegex.test(form.phone))
      return "số điện thoại không hợp lệ   ";

    if (form.password.length < 6)
      return "Mật khẩu phải ít nhất 6 ký tự";

    if (form.password !== form.confirmPass)
      return "Mật khẩu xác nhận không khớp";

    return "";
  };

  // 🔥 submit chuẩn
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errorMsg = validateForm(form);
    if (errorMsg) {
      setError(errorMsg);
      setMessage("");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          fullName: form.fullName.trim(),
        }),
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

        setTimeout(() => navigate("/signin"), 800);
      } else {
        setError(data.message || "Đăng ký thất bại");
      }
    } catch (err) {
      setError("Lỗi hệ thống");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-[#f8fafc] px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-[#0f172a] mb-2 text-3xl font-bold">
            Đăng ký
          </h1>
          <p className="mt-2 text-slate-500 text-sm">
            Tạo tài khoản mới để bắt đầu hành trình
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl bg-white p-8 shadow-lg"
        >
          {/* Role */}
          <div className="flex gap-2 rounded-xl bg-[#f8fafc] p-1">
            {[
              { value: "user", label: "Khách hàng" },
              { value: "provider", label: "Đối tác" },
            ].map((role) => (
              <button
                key={role.value}
                type="button"
                onClick={() => setField("role", role.value)}
                className={`flex-1 rounded-lg py-2 ${
                  form.role === role.value
                    ? "bg-orange-500 text-white"
                    : "text-gray-500"
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>

          {/* Name */}
          <input
placeholder="Nhập họ và tên"
            value={form.fullName}
            onChange={(e) => setField("fullName", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border bg-gray-50"
          />

          {/* Email */}
          <input
            type="email"
placeholder="abc@gmail.com)"            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border bg-gray-50"
          />

          {/* Phone */}
          <input
            placeholder="Số điện thoại )"
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border bg-gray-50"
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Mật khẩu"
            value={form.password}
            onChange={(e) => setField("password", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border bg-gray-50"
          />

          {/* Confirm */}
          <input
            type="password"
            placeholder="Xác nhận mật khẩu"
            value={form.confirmPass}
            onChange={(e) => setField("confirmPass", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border bg-gray-50"
          />

          {/* Message */}
          {message && (
            <p className="text-green-600 text-sm text-center">{message}</p>
          )}
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          {/* Button */}
          <button
            disabled={loading}
            className="w-full py-3 bg-orange-500 text-white rounded-xl"
          >
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </button>

          <p className="text-center text-sm">
            Đã có tài khoản?{" "}
            <Link to="/signin" className="text-orange-500">
              Đăng nhập
            </Link>
          </p>

          {/* Social */}
          <div className="flex justify-center gap-4 mt-4">
            <FcGoogle size={24} />
            <FaFacebook className="text-blue-600" size={24} />
            <FaInstagram className="text-pink-500" size={24} />
          </div>
        </form>
      </div>
    </div>
  );
}