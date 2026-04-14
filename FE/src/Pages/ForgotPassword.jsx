import { useState } from "react";
import { Link } from "react-router-dom";
import { FaRegEye, FaRegEyeSlash } from "../assets/Icons/Icons";
import { MdOutlineMailOutline, MdOutlineKey, MdArrowBack } from "react-icons/md";

export default function ForgotPassword() {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const inputClass =
    "w-full rounded-2xl border border-[#ead9cb] bg-[#fffaf7] px-4 py-3.5 text-sm text-[#1a1a2e] outline-none transition focus:border-[#f97316] focus:ring-4 focus:ring-[#f97316]/10";

  const eyeButtonClass =
    "absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#f97316]";

  const actionButtonClass =
    "flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#f97316] to-[#f59e0b] py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:shadow-orange-300";

  const showError = (text) => setMessage({ type: "error", text });
  const showSuccess = (text) => setMessage({ type: "success", text });

  const handleSendCode = () => {
    if (!email.trim()) {
      showError("Vui lòng nhập email để tiếp tục.");
      return;
    }

    showSuccess("Mã xác thực đã được gửi tới email của bạn.");
    setStep("code");
  };

  const handleVerifyCode = () => {
    if (code.trim().length !== 6) {
      showError("Vui lòng nhập đúng mã xác thực 6 số.");
      return;
    }

    showSuccess("Xác thực thành công.");
    setStep("reset");
  };

  const handleResetPassword = () => {
    if (!newPassword || !confirmPassword) {
      showError("Vui lòng nhập đầy đủ mật khẩu mới.");
      return;
    }

    if (newPassword !== confirmPassword) {
      showError("Mật khẩu xác nhận chưa khớp.");
      return;
    }

    showSuccess("Đổi mật khẩu thành công.");
    setStep("done");
  };

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
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f97316]/10">
                <MdOutlineKey className="text-[28px] text-[#f97316]" />
              </div>

              <h1 className="text-3xl font-bold text-[#1a1a2e]">
                Quên mật khẩu
              </h1>
            </div>

            <div className="space-y-5">
              {step === "email" && (
                <>
                  <p className="text-center text-sm text-slate-500">
                    Nhập email để nhận mã xác thực
                  </p>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#1a1a2e]">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSendCode}
                    className={actionButtonClass}
                  >
                    <MdOutlineMailOutline className="text-[18px]" />
                    Gửi mã xác thực
                  </button>
                </>
              )}

              {step === "code" && (
                <>
                  <p className="text-center text-sm text-slate-500">
                    Nhập mã xác thực 6 số đã gửi tới {email}
                  </p>

                  <input
                    type="text"
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    maxLength={6}
                    placeholder="000000"
                    className={`${inputClass} text-center text-2xl tracking-[0.5em]`}
                  />

                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    className={actionButtonClass}
                  >
                    Xác nhận
                  </button>
                </>
              )}

              {step === "reset" && (
                <>
                  <p className="text-center text-sm text-slate-500">
                    Tạo mật khẩu mới
                  </p>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mật khẩu mới"
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

                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Xác nhận mật khẩu"
                      className={`${inputClass} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className={eyeButtonClass}
                    >
                      {showConfirmPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className={actionButtonClass}
                  >
                    Đặt lại mật khẩu
                  </button>
                </>
              )}

              {step === "done" && (
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <MdOutlineKey className="text-[28px] text-green-500" />
                  </div>

                  <p className="text-base font-semibold text-[#1a1a2e]">
                    Đổi mật khẩu thành công!
                  </p>

                  <Link to="/signin" className={actionButtonClass}>
                    Đăng nhập ngay
                  </Link>
                </div>
              )}

              {message.text && step !== "done" && (
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

              {step !== "done" && (
                <Link
                  to="/signin"
                  className="flex items-center justify-center gap-1 text-sm text-slate-500 transition hover:text-[#f97316]"
                >
                  <MdArrowBack className="text-base" />
                  Quay lại đăng nhập
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
