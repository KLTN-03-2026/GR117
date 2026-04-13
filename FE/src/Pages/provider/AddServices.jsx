import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ButtonBack from "../../Components/ButtonBack";
import {
  FaLocationDot
  } from "../../assets/Icons/Icons";
const CATEGORY_OPTIONS = ["Biển đảo", "Núi", "Văn hoá", "Ẩm thực", "Thành phố", "Mạo hiểm"];

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  location: "",
  category: "",
  duration: "",
  images: "",
  highlights: "",
  includes: "",
  itinerary: "",
};

const splitLines = (value) =>
  value.split("\n").map((item) => item.trim()).filter(Boolean);

const isValidImageUrl = (value) => {
  if (!value.trim()) return true;
  try {
    const url = new URL(value);
    return /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url.pathname);
  } catch {
    return false;
  }
};

const AddServices = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  } catch {
    currentUser = null;
  }

  const imagePreview = useMemo(() => splitLines(formData.images)[0] || "", [formData.images]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Tên dịch vụ không được để trống";
    if (!formData.description.trim()) return "Mô tả không được để trống";
    if (!formData.location.trim()) return "Địa điểm không được để trống";
    if (!formData.category) return "Vui lòng chọn danh mục";
    if (!formData.price || Number(formData.price) <= 0) return "Giá phải lớn hơn 0";

    const invalidImage = splitLines(formData.images).find((item) => !isValidImageUrl(item));
    if (invalidImage) return "Image URL không đúng định dạng";

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setSuccess(false);

    const errorMessage = validateForm();
    if (errorMessage) {
      setMessage(errorMessage);
      return;
    }

    const payload = {
      serviceName: formData.name.trim(),
      nameProvider: currentUser?.fullName || currentUser?.email || "Provider",
      description: formData.description.trim(),
      prices: Number(formData.price),
      location: formData.location.trim(),
      category: formData.category,
      duration: formData.duration.trim(),
      imageUrl: splitLines(formData.images)[0] || "",
      highlight: splitLines(formData.highlights).join("\n"),
      serviceIncludes: splitLines(formData.includes),
      itinerary: splitLines(formData.itinerary).join("\n"),
    };

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setMessage("Bạn chưa đăng nhập hoặc token đã hết hạn");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("http://localhost:5000/api/services/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setSuccess(true);
        setMessage("Thêm dịch vụ thành công");
        setFormData(EMPTY_FORM);
      } else {
        setMessage(result.message || "Không thể thêm dịch vụ");
      }
    } catch (error) {
      setMessage(`Lỗi kết nối server: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass ="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 focus:outline-none focus:ring-2 focus:ring-orange-400";
  const labelClass = "text-left pl-1 block mb-1 pl-2 text-sm font-semibold text-black";

  return (
    <div className="min-h-screen bg-[#fdfaf6] p-8">
      <div className="mx-auto max-w-5xl rounded-2xl border border-orange-100 bg-white p-8 shadow-xl">
        <div className="mb-6 flex justify-between">
          <div className="flex items-center text-orange-600 font-black text-2xl gap-1.5"><FaLocationDot /> 
          <h1 className="text-3xl font-bold text-orange-600">Thêm dịch vụ</h1></div>
          <ButtonBack />
        </div>

        {message && (
          <p className={`mb-5 text-sm font-medium ${success ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tên dịch vụ & Giá */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Tên dịch vụ</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange}
                placeholder="Tên dịch vụ" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Giá</label>
              <input type="number" min="0" name="price" value={formData.price} onChange={handleChange}
                placeholder="VNĐ" className={inputClass} />
            </div>
          </div>

          {/* Địa điểm, Danh mục, Thời lượng */}
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className={labelClass}>Địa điểm</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange}
                placeholder="" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Danh mục</label>
              <select name="category" value={formData.category} onChange={handleChange} className={inputClass}>
                <option value=""></option>
                {CATEGORY_OPTIONS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Thời lượng</label>
              <input type="text" name="duration" value={formData.duration} onChange={handleChange}
                placeholder="VD: 5 ngày 4 đêm" className={inputClass} />
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className={labelClass}>Mô tả</label>
            <textarea name="description" value={formData.description} onChange={handleChange}
              rows="3" placeholder="Mô tả dịch vụ..." className={inputClass} />
          </div>

          {/* Ảnh */}
          <div>
            <label className={labelClass}>Ảnh</label>
            <textarea name="images" value={formData.images} onChange={handleChange}
              rows="1" placeholder={"https://example.com/image-1.jpg"} className={inputClass} />
            {imagePreview && isValidImageUrl(imagePreview) && (
              <img src={imagePreview} alt="preview"
                className="mt-3 h-40 w-56 rounded-lg border border-orange-200 object-cover" />
            )}
          </div>

          {/* Nổi bật & Bao gồm */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Điểm nổi bật</label>
              <textarea name="highlights" value={formData.highlights} onChange={handleChange}
                rows="3" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Đi kèm </label>
              <textarea name="includes" value={formData.includes} onChange={handleChange}
                rows="3" className={inputClass} />
            </div>
          </div>

          {/* Lịch trình */}
          <div>
            <label className={labelClass}>Lịch trình</label>
            <textarea
              name="itinerary"
              value={formData.itinerary}
              onChange={handleChange}
              rows="3"
              placeholder={
               "Ngay 1: Den Da Nang\nNgay 2: Tham quan Ba Na"
              }
              className={inputClass}
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-gray-700 transition hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-orange-500 px-5 py-2.5 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Đang lưu..." : "Thêm dịch vụ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddServices;

