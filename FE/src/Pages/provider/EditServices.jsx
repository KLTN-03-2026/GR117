import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const EditServices = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const imagePreview = useMemo(() => splitLines(formData.images)[0] || "", [formData.images]);

  useEffect(() => {
    const fetchServiceDetail = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/services/detail/${id}`);
        const result = await res.json();
        const service = result?.data || result;

        setFormData({
          name: service.servicesName || service.ServiceName || "",
          description: service.descriptionDetail || "",
          price: String(service.prices ?? service.price ?? ""),
          location: service.destination || service.location || "",
          category: service.category || "",
          duration: service.duration || "",
          images: service.imageUrl || "",
          highlights: Array.isArray(service.highlights)
            ? service.highlights.join("\n")
            : "",
          includes: Array.isArray(service.includes)
            ? service.includes.join("\n")
            : "",
          itinerary: Array.isArray(service.itinerary)
            ? service.itinerary.join("\n")
            : "",
        });
      } catch (error) {
        setMessage("Khong tai duoc thong tin dich vu");
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetail();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Ten dich vu khong duoc de trong";
    if (!formData.description.trim()) return "Mo ta khong duoc de trong";
    if (!formData.location.trim()) return "Dia diem khong duoc de trong";
    if (!formData.category) return "Vui long chon category";
    if (!formData.price || Number(formData.price) <= 0) return "Gia phai lon hon 0";

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

    const payload = {
      servicesName: formData.name.trim(),
      descriptionDetail: formData.description.trim(),
      prices: Number(formData.price),
      destination: formData.location.trim(),
      category: formData.category,
      duration: formData.duration.trim(),
      imageUrl: splitLines(formData.images)[0] || "",
      highlights: splitLines(formData.highlights),
      includes: splitLines(formData.includes),
      itinerary: splitLines(formData.itinerary),
    };

    try {
      setSubmitting(true);

      const res = await fetch(`http://localhost:5000/api/services/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setSuccess(true);
        setMessage("Cap nhat dich vu thanh cong");
      } else {
        setMessage(result.message || "Khong the cap nhat dich vu");
      }
    } catch (error) {
      setMessage(`Loi ket noi server: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-300 bg-orange-50 p-3 focus:outline-none focus:ring-2 focus:ring-orange-400";

  if (loading) return <p className="p-6">Dang tai du lieu...</p>;

  return (
    <div className="min-h-screen bg-[#fdfaf6] p-8">
      <div className="mx-auto w-full max-w-5xl rounded-2xl border border-orange-100 bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-orange-600">Sua dich vu</h1>
          </div>
          <ButtonBack />
        </div>

        {message && (
          <p className={`mb-5 text-sm font-medium ${success ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-orange-600">
                Ten dich vu
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-orange-600">
                Gia
              </label>
              <input
                type="number"
                min="0"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-orange-600">
                Dia diem
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-orange-600">
                Danh muc
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
                Thoi luong
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-orange-600">
              Mo ta
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-orange-600">
              Anh
            </label>
            <textarea
              name="images"
              value={formData.images}
              onChange={handleChange}
              rows="4"
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
                Noi bat
              </label>
              <textarea
                name="highlights"
                value={formData.highlights}
                onChange={handleChange}
                rows="5"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-orange-600">
                Bao gom
              </label>
              <textarea
                name="includes"
                value={formData.includes}
                onChange={handleChange}
                rows="5"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-orange-600">
              Lich trinh
            </label>
            <textarea
              name="itinerary"
              value={formData.itinerary}
              onChange={handleChange}
              rows="6"
              className={inputClass}
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-gray-700 transition hover:bg-gray-50"
            >
              Huy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-orange-500 px-5 py-2.5 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Dang luu..." : "Luu thay doi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditServices;

