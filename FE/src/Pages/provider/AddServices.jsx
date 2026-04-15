import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ButtonBack from "../../Components/ButtonBack";
import { FaLocationDot } from "../../assets/Icons/Icons";
import { parseServiceByAI } from "../../services/aiService";
const CATEGORY_OPTIONS = [
  "Biển đảo",
  "Núi",
  "Văn hoá",
  "Ẩm thực",
  "Thành phố",
  "Mạo hiểm",
];

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
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const parseItineraryInput = (value) => {
  const parsed = JSON.parse(value);
  return Array.isArray(parsed) ? parsed : [];
};

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
  const [aiLoading, setAiLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  } catch {
    currentUser = null;
  }

  const imagePreview = useMemo(() => {
    if (imageFile) return URL.createObjectURL(imageFile);
    return splitLines(formData.images)[0] || "";
  }, [formData.images, imageFile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setFormData((prev) => ({ ...prev, images: "" }));
    }
  };

  const handleGenerateByAI = async () => {
    if (!formData.itinerary.trim()) {
      setSuccess(false);
      setMessage("Vui lòng nhập nội dung vào ô lịch trình để AI phân tích");
      return;
    }

    try {
      setAiLoading(true);
      setSuccess(false);
      setMessage("");

      const aiData = await parseServiceByAI(formData.itinerary);

      setFormData((prev) => ({
        ...prev,
        itinerary: JSON.stringify(aiData.itinerary || [], null, 2),
      }));

      setSuccess(true);
      setMessage("AI đã chuẩn hóa nội dung lịch trình");
    } catch (error) {
      setSuccess(false);
      setMessage(error.message);
    } finally {
      setAiLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Tên dịch vụ không được để trống";
    if (!formData.description.trim()) return "Mô tả không được để trống";
    if (!formData.location.trim()) return "Địa điểm không được để trống";
    if (!formData.category) return "Vui lòng chọn danh mục";
    if (!formData.price || Number(formData.price) <= 0)
      return "Giá phải lớn hơn 0";

    try {
      parseItineraryInput(formData.itinerary);
    } catch (error) {
      return "Lịch trình phải là JSON hợp lệ. Bạn có thể bấm 'Tạo bằng AI' để chuẩn hóa.";
    }

    if (!imageFile) {
      const invalidImage = splitLines(formData.images).find(
        (item) => !isValidImageUrl(item),
      );
      if (invalidImage) return "Image URL không đúng định dạng";
    }

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

    const payload = new FormData();
    const parsedItinerary = parseItineraryInput(formData.itinerary);
    payload.append("serviceName", formData.name.trim());
    payload.append(
      "nameProvider",
      currentUser?.fullName || currentUser?.email || "Provider",
    );
    payload.append("description", formData.description.trim());
    payload.append("prices", String(Number(formData.price)));
    payload.append("location", formData.location.trim());
    payload.append("category", formData.category);
    payload.append("duration", formData.duration.trim());
    payload.append("highlight", JSON.stringify(splitLines(formData.highlights)));
    payload.append("itinerary", JSON.stringify(parsedItinerary));
    payload.append("serviceIncludes", JSON.stringify(splitLines(formData.includes)));

    if (imageFile) {
      payload.append("image", imageFile);
    } else {
      payload.append("imageUrl", splitLines(formData.images)[0] || "");
    }

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
          Authorization: `Bearer ${accessToken}`,
        },
        body: payload,
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setSuccess(true);
        setMessage("Thêm dịch vụ thành công");
        setFormData(EMPTY_FORM);
        setImageFile(null);
        navigate("/provider/services");
      } else {
        setMessage(result.message || "Không thể thêm dịch vụ");
      }
    } catch (error) {
      setMessage(`Lỗi kết nối server: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100";
  const labelClass = "mb-1.5 block pl-1 text-sm font-semibold text-gray-700";

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-6 md:px-6 md:py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Thêm dịch vụ mới
            </h1>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="w-full rounded-[28px] border border-orange-100 bg-white p-6 shadow-sm md:p-8">
            {message && (
              <div
                className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-medium ${
                  success
                    ? "border-green-200 bg-green-50 text-green-600"
                    : "border-red-200 bg-red-50 text-red-600"
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>Tên dịch vụ</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Tên dịch vụ"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Giá</label>
                    <input
                      type="number"
                      min="0"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="VNĐ"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <label className={labelClass}>Địa điểm</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Danh mục</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="">Chọn danh mục</option>
                      {CATEGORY_OPTIONS.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Thời lượng</label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      placeholder="VD: 5 ngày 4 đêm"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="space-y-6">
                  <div>
                    <label className={labelClass}>Mô tả</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Mô tả dịch vụ..."
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Ảnh</label>
                    <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 p-4">
                      <input
                        id="service-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="service-image-upload"
                        className="inline-flex cursor-pointer items-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:shadow-md"
                      >
                        Upload file
                      </label>
                      <p className="mt-3 text-sm text-gray-500">
                        {imageFile ? imageFile.name : "Chưa chọn ảnh nào"}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>Điểm nổi bật</label>
                      <textarea
                        name="highlights"
                        value={formData.highlights}
                        onChange={handleChange}
                        rows="4"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Bao gồm</label>
                      <textarea
                        name="includes"
                        value={formData.includes}
                        onChange={handleChange}
                        rows="4"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Lịch trình</label>
                    <textarea
                      name="itinerary"
                      value={formData.itinerary}
                      onChange={handleChange}
                      rows="4"
                      placeholder={
                        'Dán mô tả thô để AI chuẩn hóa, hoặc nhập JSON itinerary hợp lệ'
                      }
                      className={inputClass}
                    />
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={handleGenerateByAI}
                        disabled={aiLoading}
                        className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {aiLoading ? "AI đang phân tích..." : "Tạo bằng AI"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 border-t border-gray-100 pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/provider/services")}
                  className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-gray-700 transition hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 font-semibold text-white transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Đang lưu..." : "Thêm dịch vụ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddServices;
