import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const EditServices = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [itineraryFile, setItineraryFile] = useState(null);

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

  useEffect(() => {
    const fetchServiceDetail = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const res = await fetch(`/api/services/detail/${id}`, {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        });
        const result = await res.json();

        if (!res.ok) {
          setMessage(result?.message || "Khong tai duoc thong tin dich vu");
          return;
        }

        const service = result?.data || result;

        setFormData({
          name: service.serviceName || service.servicesName || service.ServiceName || "",
          description: service.description || service.descriptionDetail || "",
          price: String(service.prices ?? service.price ?? ""),
          location: service.location || service.destination || "",
          category:
            (typeof service.category === "object" && service.category?._id) ||
            (Array.isArray(service.category)
              ? service.category[0]?._id || service.category[0] || ""
              : service.category || ""),
          duration: String(service.duration || ""),
          images:
            Array.isArray(service.images) && service.images.length > 0
              ? service.images.join("\n")
              : service.imageUrl || "",
          highlights: Array.isArray(service.highlights)
            ? service.highlights.join("\n")
            : Array.isArray(service.highlight)
              ? service.highlight.join("\n")
              : service.highlight || "",
          includes: Array.isArray(service.includes)
            ? service.includes.join("\n")
            : Array.isArray(service.serviceIncludes)
              ? service.serviceIncludes.join("\n")
              : "",
          itinerary: Array.isArray(service.itinerary)
            ? JSON.stringify(service.itinerary, null, 2)
            : service.itinerary || "",
        });
      } catch {
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

  const handleItineraryFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setItineraryFile(file);
    if (file) setMessage("");
  };

  const handleImagesChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, images: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Ten dich vu khong duoc de trong";
    if (!formData.description.trim()) return "Mo ta khong duoc de trong";
    if (!formData.location.trim()) return "Dia diem khong duoc de trong";
    if (!formData.category) return "Vui long chon danh muc";
    if (!formData.price || Number(formData.price) <= 0) return "Gia phai lon hon 0";

    const linkImages = splitLines(formData.images);
    if (linkImages.length === 0 && !imageFile) {
      return "Vui long chon anh upload hoac nhap link anh";
    }

    const invalidImage = linkImages.find((item) => !isValidImageUrl(item));
    if (invalidImage) return "Image URL khong dung dinh dang";

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
      setMessage("Ban chua dang nhap hoac token da het han");
      return;
    }

    const payload = new FormData();
    payload.append("serviceName", formData.name.trim());
    payload.append("description", formData.description.trim());
    payload.append("prices", String(Number(formData.price)));
    payload.append("location", formData.location.trim());
    payload.append("category", formData.category);
    payload.append("duration", formData.duration.trim());
    payload.append("highlight", JSON.stringify(splitLines(formData.highlights)));
    payload.append("includes", JSON.stringify(splitLines(formData.includes)));

    const linkImages = splitLines(formData.images);
    const uploadedImage = imageFile ? await fileToDataUrl(imageFile) : "";
    const imageList = [...(uploadedImage ? [uploadedImage] : []), ...linkImages];

    payload.append("images", JSON.stringify(imageList));
    payload.append("imageUrl", imageList[0] || "");

    if (itineraryFile) {
      payload.append("itineraryFile", itineraryFile);
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/services/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: payload,
      });

      const result = await res.json();
      if (res.ok) {
        setSuccess(true);
        setMessage("Cap nhat dich vu thanh cong");
        navigate("/provider/services");
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
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100";
  const labelClass = "mb-1.5 block pl-1 text-sm font-semibold text-gray-700";

  if (loading) return <p className="p-6">Dang tai du lieu...</p>;

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-6 md:px-6 md:py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sua dich vu</h1>
          </div>
          <ButtonBack />
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
                    <label className={labelClass}>Ten dich vu</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Ten dich vu"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Gia</label>
                    <input
                      type="number"
                      min="0"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="VND"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <label className={labelClass}>Dia diem</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Danh muc</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="">Chon danh muc</option>
                      {categories.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.categoryName || item.name || item.slug}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Thoi luong</label>
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
              </div>

              <div>
                <div className="space-y-6">
                  <div>
                    <label className={labelClass}>Mo ta</label>
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
                    <label className={labelClass}>Anh</label>
                    <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-700">
                            Anh tu may
                          </p>
                          <input
                            id="service-image-upload-edit"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                          <label
                            htmlFor="service-image-upload-edit"
                            className="mt-3 inline-flex cursor-pointer items-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:shadow-md"
                          >
                            Upload file
                          </label>
                          <p className="mt-3 text-sm text-gray-500">
                            {imageFile ? imageFile.name : "Giu anh hien tai neu khong chon anh moi"}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-gray-700">
                            Anh tu link
                          </p>
                          <textarea
                            name="images"
                            value={formData.images}
                            onChange={handleImagesChange}
                            rows="3"
                            placeholder="Dan link anh (moi dong 1 link)"
                            className={`${inputClass} mt-3`}
                          />
                          <p className="mt-2 text-xs text-gray-500">
                            Anh dau tien se la thumbnail cua dich vu, cac anh con lai se hien khi bam xem them anh.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>Diem noi bat</label>
                      <textarea
                        name="highlights"
                        value={formData.highlights}
                        onChange={handleChange}
                        rows="4"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Bao gom</label>
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
                    <label className={labelClass}>Lich trinh Excel</label>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleItineraryFileChange}
                      className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition file:mr-4 file:rounded-lg file:border-0 file:bg-orange-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-orange-600 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Chon file Excel neu muon cap nhat lai lich trinh, neu khong thi giu nguyen lich trinh cu.
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
                  Huy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 font-semibold text-white transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Dang luu..." : "Luu thay doi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditServices;
