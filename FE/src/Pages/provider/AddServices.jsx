import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ButtonBack from "../../Components/ButtonBack";

const CATEGORY_OPTIONS = [
  "Bien dao",
  "Nui",
  "Van hoa",
  "Am thuc",
  "Thanh pho",
  "Mao hiem",
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

  const imagePreview = useMemo(
    () => splitLines(formData.images)[0] || "",
    [formData.images],
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Ten dich vu khong duoc de trong";
    if (!formData.description.trim()) return "Mo ta khong duoc de trong";
    if (!formData.location.trim()) return "Dia diem khong duoc de trong";
    if (!formData.category) return "Vui long chon category";
    if (!formData.price || Number(formData.price) <= 0)
      return "Gia phai lon hon 0";

    const imageList = splitLines(formData.images);
    const invalidImage = imageList.find((item) => !isValidImageUrl(item));
    if (invalidImage) return "Image url khong dung dinh dang co ban";

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

    const imageList = splitLines(formData.images);
    const highlights = splitLines(formData.highlights);
    const includes = splitLines(formData.includes);
    const itinerary = splitLines(formData.itinerary);

    const payload = {
      ServiceName: formData.name.trim(),
      descriptionDetail: formData.description.trim(),
      price: Number(formData.price),
      location: formData.location.trim(),
      category: formData.category,
      duration: formData.duration.trim(),
      imageUrl: imageList[0] || "",
      highlights,
      includes,
      itinerary,
    };

    try {
      setSubmitting(true);

      const res = await fetch("http://localhost:5000/api/services/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setSuccess(true);
        setMessage("Them dich vu thanh cong");
        setFormData(EMPTY_FORM);
      } else {
        setMessage(result.message || "Khong the them dich vu");
      }
    } catch (error) {
      setMessage(`Loi ket noi server: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-300 bg-orange-50 p-3 focus:outline-none focus:ring-2 focus:ring-orange-400";

  return (
    <div className="min-h-screen bg-[#fdfaf6] p-8">
      <div className="mx-auto w-full max-w-5xl rounded-2xl border border-orange-100 bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-orange-600">Thêm dịch vụ</h1>
          </div>
          <ButtonBack />
        </div>

        {message && (
          <p
            className={`mb-5 text-sm font-medium ${success ? "text-green-600" : "text-red-600"}`}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-orange-600">
                Tên dịch vụ
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="VD: Tour Da Nang 5 ngay"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-orange-600">
                Giá
              </label>
              <input
                type="number"
                min="0"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="1.000.000"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-orange-600">
                Địa điểm
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="VD: Đà Nẵng"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-orange-600">
                Danh mục
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={inputClass}
              >
                <option value=""></option>
                {CATEGORY_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-orange-600">
                Thời lượng
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="VD: 5 ngay 4 dem"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-orange-600">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Mo ta dich vu..."
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-orange-600">
              Ảnh
            </label>
            <textarea
              name="images"
              value={formData.images}
              onChange={handleChange}
              rows="4"
              placeholder={
                "Moi image url 1 dong\nhttps://example.com/image-1.jpg"
              }
              className={inputClass}
            />
            {imagePreview && isValidImageUrl(imagePreview) && (
              <img
                src={imagePreview}
                alt="preview"
                className="mt-3 h-40 w-56 rounded-xl border border-orange-200 object-cover"
              />
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-orange-600">
                Nổi bật
              </label>
              <textarea
                name="highlights"
                value={formData.highlights}
                onChange={handleChange}
                rows="5"
                placeholder={
                  "Moi highlight 1 dong\nCanh dep\nKhach san gan bien"
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-orange-600">
                Bao gồm
              </label>
              <textarea
                name="includes"
                value={formData.includes}
                onChange={handleChange}
                rows="5"
                placeholder={"Moi include 1 dong\nXe dua don\nAn sang"}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-orange-600">
              Lịch trình
            </label>
            <textarea
              name="itinerary"
              value={formData.itinerary}
              onChange={handleChange}
              rows="6"
              placeholder={
                "Moi dong la 1 muc lich trinh\nNgay 1: Den Da Nang\nNgay 2: Tham quan Ba Na"
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

