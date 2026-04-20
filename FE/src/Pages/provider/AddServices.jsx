import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ButtonBack from "../../Components/shared/ButtonBack";
import { splitLines, isValidImageUrl } from "../../utils/stringHelpers.js";
import { fileToDataUrl } from "../../utils/fileToDataUrl.js";

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

const AddServices = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [itineraryFile, setItineraryFile] = useState(null);

  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  } catch {
    currentUser = null;
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const result = await res.json();
        setCategories(Array.isArray(result.data) ? result.data : []);
      } catch {
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImagesChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, images: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
  };

  const handleItineraryFileChange = async (e) => {
    const file = e.target.files?.[0] || null;
    setItineraryFile(file);
    if (!file) return;
    setSuccess(false);
    setMessage("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Tên dịch vụ không được để trống";
    if (!formData.description.trim()) return "Mô tả không được để trống";
    if (!formData.location.trim()) return "Địa điểm không được để trống";
    if (!formData.category) return "Vui lòng chọn danh mục";
    if (!formData.price || Number(formData.price) <= 0) return "Giá phải lớn hơn 0";
    if (!itineraryFile) return "Vui lòng chọn file Excel lịch trình";

    const linkImages = splitLines(formData.images);
    if (linkImages.length === 0 && !imageFile) {
      return "Vui lòng chọn ảnh upload hoặc nhập link ảnh";
    }

    const invalidImage = linkImages.find((item) => !isValidImageUrl(item));
    if (invalidImage) {
      return "Image URL không đúng định dạng";
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

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setMessage("Bạn chưa đăng nhập hoặc token đã hết hạn");
      return;
    }

    const payload = new FormData();
    payload.append("serviceName", formData.name.trim());
    payload.append("nameProvider", currentUser?.fullName || currentUser?.email || "Provider");
    payload.append("description", formData.description.trim());
    payload.append("prices", String(Number(formData.price)));
    payload.append("location", formData.location.trim());
    payload.append("category", formData.category);
    payload.append("duration", formData.duration.trim());
    payload.append("highlight", JSON.stringify(splitLines(formData.highlights)));
    payload.append("includes", JSON.stringify(splitLines(formData.includes)));
    const linkImages = splitLines(formData.images);
    const uploadedImage = imageFile ? await fileToDataUrl(imageFile) : "";
    const imageList = [
      ...(uploadedImage ? [uploadedImage] : []),
      ...linkImages,
    ];
    payload.append("images", JSON.stringify(imageList));
    payload.append("imageUrl", imageList[0] || "");
    payload.append("itineraryFile", itineraryFile);

    try {
      setSubmitting(true);
      const res = await fetch("/api/services", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: payload,
      });

      const result = await res.json();
      if (res.ok) {
        setSuccess(true);
        setMessage("Thêm dịch vụ thành công");
        setFormData(EMPTY_FORM);
        setImageFile(null);
        setItineraryFile(null);
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
            <h1 className="text-3xl font-bold text-gray-900">Thêm dịch vụ mới</h1>
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
                      {categories.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.categoryName || item.name || item.slug}
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
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Ảnh từ máy</p>
                          <input
                            id="service-image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                          <label
                            htmlFor="service-image-upload"
                            className="mt-3 inline-flex cursor-pointer items-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:shadow-md"
                          >
                            Upload file
                          </label>
                          <p className="mt-3 text-sm text-gray-500">
                            {imageFile ? imageFile.name : "Chưa chọn ảnh nào"}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-gray-700">Ảnh từ link</p>
                          <textarea
                            name="images"
                            value={formData.images}
                            onChange={handleImagesChange}
                            rows="3"
                            placeholder="Dán link ảnh (mỗi dòng 1 link)"
                            className={`${inputClass} mt-3`}
                          />
                          <p className="mt-2 text-xs text-gray-500">
                            Ảnh đầu tiên sẽ là thumbnail của dịch vụ, các ảnh còn lại sẽ hiện khi bấm xem thêm ảnh.
                          </p>
                        </div>
                      </div>
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
                    <label className={labelClass}>Lịch trình Excel</label>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleItineraryFileChange}
                      className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition file:mr-4 file:rounded-lg file:border-0 file:bg-orange-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-orange-600 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Dùng file mẫu Excel để import lịch trình vào dịch vụ.
                    </p>
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


