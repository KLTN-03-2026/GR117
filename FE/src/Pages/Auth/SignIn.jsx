import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaLocationDot, FaRegEye, FaRegEyeSlash } from "../../assets/Icons/Icons";
import CustomApi from "../../../Server";
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
      setError(apiError.message || "Dang nhap that bai");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FaLocationDot className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-gray-900 mb-1 font-semibold">Chao mung tro lai</h1>
            <p className="text-gray-500 text-l">Dang nhap vao ViVu Travel</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5 mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition"
                placeholder="email@gmail.com"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5 mb-1.5">
                Mat khau
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition"
                  placeholder="********"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                </button>
              </div>
            </div>

            {error ? <p className="text-sm text-red-500 text-left">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-teal-500 text-white rounded-xl font-semibold hover:from-sky-600 hover:to-teal-600 transition-all shadow-md disabled:opacity-70"
            >
              {loading ? "Dang xu ly..." : "Dang nhap"}
            </button>
          </form>

          <div className="mt-8">
            <p className="text-center text-sm text-gray-500 mt-5">
              Chua co tai khoan?
              <Link to="/register" className="text-sky-600 font-medium hover:text-sky-700 mx-2">
                Dang ky ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
