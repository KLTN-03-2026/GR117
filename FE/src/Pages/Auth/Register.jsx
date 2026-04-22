import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CiLogin } from "../../assets/Icons/Icons";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { fileToDataUrl } from "../../utils/fileToDataUrl";

const defaultForm = {
  fullName: "",
  businessName: "",
  email: "",
  phone: "",
  password: "",
  confirmPass: "",
  role: "user",
  taxCode: "",
  businessLicense: "",
  address: "",
  legalRepresentative: "",
  agreements: {
    termsAccepted: false,
    policyAccepted: false,
    complaintPolicyAccepted: false,
    infoCommitment: false,
  },
};

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setAgreement = (key, value) => {
    setForm((prev) => ({
      ...prev,
      agreements: {
        ...prev.agreements,
        [key]: value,
      },
    }));
  };

  const handleBusinessLicenseChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setField("businessLicense", "");
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      setField("businessLicense", dataUrl);
      setError("");
    } catch {
      setError("Khong the doc file anh, vui long thu lai");
    }
  };

  const validateProviderForm = () => {
    if (!form.businessName.trim())
      return "Vui long nhap ten doanh nghiep/ho kinh doanh/thuong nhan";
    if (!form.taxCode.trim()) return "Vui long nhap ma so thue";
    if (!form.address.trim()) return "Vui long nhap dia chi doanh nghiep";
    if (!form.businessLicense.trim())
      return "Vui long upload giay phep kinh doanh";
    if (!form.legalRepresentative.trim())
      return "Vui long nhap nguoi dai dien phap luat";
    if (form.agreements.termsAccepted !== true) {
      return "Ban can dong y dieu khoan hop tac";
    }
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPass) {
      setError("Mat khau xac nhan khong khop");
      setMessage("");
      return;
    }

    if (form.password.length < 6) {
      setError("Mat khau phai co it nhat 6 ky tu");
      setMessage("");
      return;
    }

    if (form.role === "provider") {
      const providerError = validateProviderForm();
      if (providerError) {
        setError(providerError);
        setMessage("");
        return;
      }
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
        const payload = {
          fullName:
            form.role === "provider" ? form.businessName : form.fullName,
          businessName: form.businessName,
          email: form.email,
          phone: form.phone,
          password: form.password,
          confirmPass: form.confirmPass,
          role: form.role,
        };

        if (form.role === "provider") {
          payload.taxCode = form.taxCode;
          payload.businessLicense = form.businessLicense;
          payload.address = form.address;
          payload.legalRepresentative = form.legalRepresentative;
          payload.agreements = form.agreements;
        }

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (res.ok) {
          setMessage(data.message || "Dang ky thanh cong");
          setForm({
            ...defaultForm,
            agreements: { ...defaultForm.agreements },
          });
          setTimeout(() => navigate("/signin"), 1000);
        } else {
          setError(data.message || "Dang ky that bai");
        }
      } catch {
        setError("Loi he thong");
      } finally {
        setLoading(false);
        setSubmitted(false);
      }
    };

    registerUser();
  }, [submitted, form, navigate]);

  const checkboxItems = [
    { key: "termsAccepted", label: "Toi da doc va dong y dieu khoan hop tac" },
  ];

  const inputClass =
    "flex h-12 w-full items-center rounded-xl border border-gray-200 bg-[#f8fafc] px-4 text-[#0f172a] outline-none transition-colors focus:border-[#f97316] focus:bg-white";

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-[#f8fafc] px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1
            className="mb-2 text-[#0f172a]"
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
          className="space-y-4 rounded-3xl border border-gray-100 bg-white p-8 shadow-xl"
        >
          <div className="flex gap-2 rounded-2xl bg-[#f8fafc] p-2">
            {[
              { value: "user", label: "Khách hàng" },
              { value: "provider", label: "Đối tác / Nhà cung cấp" },
            ].map((role) => (
              <button
                key={role.value}
                type="button"
                onClick={() => setField("role", role.value)}
                className={`flex-1 rounded-2xl py-2.5 transition-all ${
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

          {form.role === "user" ? (
            <div>
              <label
                className="mb-1.5 block pl-2 text-left text-slate-500"
                style={{ fontSize: 13, fontWeight: 500 }}
              >
                Họ tên
              </label>
              <input
                value={form.fullName}
                onChange={(e) => setField("fullName", e.target.value)}
                required
                className={inputClass}
                style={{ fontSize: 14 }}
              />
            </div>
          ) : (
            <div>
              <label
                className="mb-1.5 block pl-2 text-left text-slate-500"
                style={{ fontSize: 13, fontWeight: 500 }}
              >
                Tên doanh nghiệp/hộ kinh doanh/thương nhân
              </label>
              <input
                value={form.businessName}
                onChange={(e) => setField("businessName", e.target.value)}
                required
                className={inputClass}
                style={{ fontSize: 14 }}
              />
            </div>
          )}

          {form.role === "provider" ? (
            <div className="space-y-4 rounded-3xl  p-6">
              <div>
                <label
                  className="mb-1.5 block pl-2 text-left text-slate-500"
                  style={{ fontSize: 13, fontWeight: 500 }}
                >
                  Mã số thuế
                </label>
                <input
                  value={form.taxCode}
                  onChange={(e) => setField("taxCode", e.target.value)}
                  className={inputClass}
                  style={{ fontSize: 14 }}
                />
              </div>

              <div>
                <label
                  className="mb-1.5 block pl-2 text-left text-slate-500"
                  style={{ fontSize: 13, fontWeight: 500 }}
                >
                  Địa chỉ doanh nghiệp
                </label>
                <input
                  value={form.address}
                  onChange={(e) => setField("address", e.target.value)}
                  className={inputClass}
                  style={{ fontSize: 14 }}
                />
              </div>

              <div>
                <label
                  className="mb-1.5 block pl-2 text-left text-slate-500"
                  style={{ fontSize: 13, fontWeight: 500 }}
                >
                  Giấy phép kinh doanh
                </label>
                <label className="flex h-12 cursor-pointer items-center justify-between gap-4 rounded-xl border border-dashed border-orange-200 bg-white px-4 text-sm text-slate-600 transition hover:border-orange-300">
                  <span>Upload ảnh</span>
                  <span className="text-xs text-slate-400">
                    {form.businessLicense ? "Đã chọn ảnh" : "Chưa upload"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBusinessLicenseChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label
                  className="mb-1.5 block pl-2 text-left text-slate-500"
                  style={{ fontSize: 13, fontWeight: 500 }}
                >
                  Người đại diện pháp luật
                </label>
                <input
                  value={form.legalRepresentative}
                  onChange={(e) =>
                    setField("legalRepresentative", e.target.value)
                  }
                  className={inputClass}
                  style={{ fontSize: 14 }}
                />
              </div>
            </div>
          ) : null}

          <div>
            <label
              className="mb-1.5 block pl-2 text-left text-slate-500"
              style={{ fontSize: 13, fontWeight: 500 }}
            >
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              required
              className={inputClass}
              style={{ fontSize: 14 }}
            />
          </div>

          <div>
            <label
              className="mb-1.5 block pl-2 text-left text-slate-500"
              style={{ fontSize: 13, fontWeight: 500 }}
            >
              Số điện thoại
            </label>
            <input
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              required
              className={inputClass}
              style={{ fontSize: 14 }}
            />
          </div>

          <div>
            <label
              className="mb-1.5 block pl-2 text-left text-slate-500"
              style={{ fontSize: 13, fontWeight: 500 }}
            >
              Mật khẩu
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setField("password", e.target.value)}
              required
              className={inputClass}
              style={{ fontSize: 14 }}
            />
          </div>

          <div>
            <label
              className="mb-1.5 block pl-2 text-left text-slate-500"
              style={{ fontSize: 13, fontWeight: 500 }}
            >
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              value={form.confirmPass}
              onChange={(e) => setField("confirmPass", e.target.value)}
              required
              className={inputClass}
              style={{ fontSize: 14 }}
            />
          </div>

          {form.role === "provider" ? (
            <div className="space-y-3 rounded-2xl border border-white bg-white p-4">
              {checkboxItems.map((item) => (
                <label
                  key={item.key}
                  className="flex items-start gap-3 text-left text-sm text-slate-600"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(form.agreements[item.key])}
                    onChange={(e) => setAgreement(item.key, e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-[#f97316] focus:ring-[#f97316]"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          ) : null}

          {message || error ? (
            <div className="space-y-2">
              {message ? (
                <p className="rounded-2xl bg-green-50 px-4 py-3 text-center text-sm text-green-600">
                  {message}
                </p>
              ) : null}
              {error ? (
                <p className="rounded-2xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">
                  {error}
                </p>
              ) : null}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#f97316] to-[#f59e0b] py-3.5 text-white transition-all hover:shadow-lg hover:shadow-orange-200 disabled:cursor-not-allowed disabled:opacity-70"
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

          <div className="my-2 flex items-center gap-3">
            <div className="h-[1px] flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">Hoặc đăng ký với</span>
            <div className="h-[1px] flex-1 bg-gray-200" />
          </div>

          <div className="flex justify-center gap-4">
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-gray-50"
            >
              <FcGoogle className="text-2xl" />
            </button>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-blue-50"
            >
              <FaFacebook className="text-2xl text-blue-600" />
            </button>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-pink-50"
            >
              <FaInstagram className="text-2xl text-pink-500" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
