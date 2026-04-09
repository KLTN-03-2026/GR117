import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { CiLogin, FaRegEye, FaRegEyeSlash } from "../assets/Icons/Icons";
import CustomApi from "../../Server";

function SignIn() {
  const navigate = useNavigate();

  // ===== SAFE PARSE =====
  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem("currentUser"));
  } catch {
    currentUser = null;
  }

  // ===== STATE =====
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // ===== REDIRECT FUNCTION =====
  const getRedirectPath = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "/admin/dashboard";
      case "provider":
        return "/provider/dashboard";
      default:
        return "/user/dashboard";
    }
  };

  // ===== AUTO FILL EMAIL =====
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberLoginEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // ===== IF LOGIN → REDIRECT =====
  if (currentUser) {
    return (
      <Navigate to={getRedirectPath(currentUser.role)} replace />
    );
  }

  // ===== SUBMIT =====
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
        text: "Đăng nhập thành công",
      });

      navigate(getRedirectPath(user?.role));

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
    <div className="flex min-h-[80vh] items-center justify-center bg-[#f8fafc] px-4 py-16">
      <div className="w-full max-w-md">
        <h1 className="text-center text-2xl font-bold mb-6">Đăng nhập</h1>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-3 rounded"
            required
          />

          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-3 rounded pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-3"
            >
              {showPw ? <FaRegEyeSlash /> : <FaRegEye />}
            </button>
          </div>

          <div className="flex justify-between text-sm">
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              /> Ghi nhớ
            </label>

            <button type="button" onClick={() => navigate("/forgot-password")}>
              Quên mật khẩu
            </button>
          </div>

          {message.text && (
            <p className={message.type === "success" ? "text-green-600" : "text-red-600"}>
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-3 rounded"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <p className="text-center text-sm">
            Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignIn;