import React, { useState } from "react";
import ButtonBack from "../Components/ButtonBack";
import { useNavigate } from "react-router-dom";

const AddServices = () => {
  const [formData, setFormData] = useState({
    supplier: "",
    servicesName: "",
    prices: "",
    destination: "",
    category: "",
    descriptionDetail: "",
    thumbnail: "",
  });
   const useNavtive = useNavigate();
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "thumbnail") {
      setPreview(value);
      setThumbnailFile(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setSuccess(false);

    try {
      const form = new FormData();

      // Append các field trừ prices và thumbnail
      ["supplier", "servicesName", "destination", "category", "descriptionDetail"].forEach((key) => {
        form.append(key, formData[key]);
      });

      // Giá: convert sang số
      form.append("prices", Number(formData.prices));

      // Thumbnail: ưu tiên file, nếu không thì URL
      if (thumbnailFile) {
        form.append("thumbnail", thumbnailFile);
      } else if (formData.thumbnail) {
        form.append("thumbnail", formData.thumbnail);
      }

      const res = await fetch("http://localhost:5000/api/services/add", {
        method: "POST",
        body: form,
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setMessage("Thêm dịch vụ thành công!");
        setSuccess(true);

        setFormData({
          supplier: "",
          servicesName: "",
          prices: "",
          destination: "",
          category: "",
          descriptionDetail: "",
          thumbnail: "",
        });

        setThumbnailFile(null);
        setPreview("");
      } else {
        setMessage(result.message || "Không thể thêm dịch vụ");
      }
    } catch (error) {
      setMessage("Lỗi kết nối server: " + error.message);
    }
  };

  const handleReset = () => {
    setFormData({
      supplier: "",
      servicesName: "",
      prices: "",
      destination: "",
      category: "",
      descriptionDetail: "",
      thumbnail: "",
    });
    setThumbnailFile(null);
    setPreview("");
    setMessage("");
    setSuccess(false);
  };

  return (
    <div className="min-h-screen bg-[#fdfaf6] p-8">
      <div className="w-full max-w-6xl mx-auto bg-white shadow-xl rounded-xl p-12 border border-orange-100">
        <div className="flex justify-between mb-5 ">

        <h1 className="text-3xl text-center font-bold text-orange-600 "> Thêm dịch vụ</h1>
           <ButtonBack/>
          
        </div>

        {message && (
          <p
            className={`mb-4 text-sm font-medium text-center ${
              success ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Supplier */}
          <div>
            <label className="block text-sm font-semibold text-orange-600 text-left pl-1.5 mb-1">
              Nhà cung cấp *
            </label>
            <input
              type="text"
              name="supplier"
              placeholder="VD: Công ty ABC"
              value={formData.supplier}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg bg-orange-50 focus:ring-2 focus:ring-orange-400 focus:outline-none"
              required
            />
          </div>

          {/* Tên dịch vụ + Giá */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-orange-600 text-left pl-1.5 mb-1">
                Tên dịch vụ *
              </label>
              <input
                type="text"
                name="servicesName"
                placeholder="VD: Tour Hạ Long"
                value={formData.servicesName}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-lg bg-orange-50 focus:ring-2 focus:ring-orange-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-orange-600 text-left pl-1.5 mb-1">
                Giá *
              </label>
              <input
                type="number"
                name="prices"
                value={formData.prices}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-lg bg-orange-50 focus:ring-2 focus:ring-orange-400"
                required
              />
            </div>
          </div>

          {/* Địa điểm + Danh mục */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-orange-600 text-left pl-1.5 mb-1">
                Địa điểm *
              </label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-lg bg-orange-50 focus:ring-2 focus:ring-orange-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-orange-600 text-left pl-1.5 mb-1">
                Danh mục
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-lg bg-orange-50 focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-semibold text-orange-600 text-left pl-1.5 mb-1">
              Mô tả dịch vụ
            </label>
            <textarea
              name="descriptionDetail"
              value={formData.descriptionDetail}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg bg-orange-50 focus:ring-2 focus:ring-orange-400"
              rows="4"
            />
          </div>

          {/* URL ảnh */}
          <div>
            <label className="block text-sm font-semibold text-orange-600 text-left pl-1.5 mb-1">
              URL hình ảnh đại diện
            </label>
            <input
              type="text"
              name="thumbnail"
              value={formData.thumbnail}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg bg-orange-50 focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Upload file */}
          <input type="file" onChange={handleFileChange} />

          {/* Preview */}
          {(preview || formData.thumbnail) && (
            <img
              src={preview || formData.thumbnail}
              alt="preview"
              className="w-40 h-40 object-cover rounded mt-2 border-2 border-orange-200"
            />
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="bg-orange-500 text-white px-5 py-2 rounded-lg hover:bg-orange-600 transition shadow"
            >
              Thêm dịch vụ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddServices;