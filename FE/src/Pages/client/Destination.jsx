import { useEffect, useMemo, useState } from "react";
import CustomBtnDestination from "../../Components/ButtonDestination";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaUmbrellaBeach,
  FaMountain,
  FaLandmark,
  FaUtensils,
  FaCity,
  FaCompass,
  FaChevronRight,
  FaFire,
  FaSearch,
  FaMapMarkerAlt,
} from "react-icons/fa";
import ServicesCard from "../../Components/ServicesCard";
import { Link, useLocation } from "react-router-dom";

const normalizeText = (text) =>
  String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const getCategoryIcon = (categoryName) => {
  const key = normalizeText(categoryName);
  if (!key) return <FaCompass size={14} />;
  if (key.includes("bien") || key.includes("dao"))
    return <FaUmbrellaBeach size={14} />;
  if (key.includes("nui") || key.includes("trek"))
    return <FaMountain size={14} />;
  if (key.includes("van hoa") || key.includes("vanhoa"))
    return <FaLandmark size={14} />;
  if (key.includes("am thuc") || key.includes("amthuc"))
    return <FaUtensils size={14} />;
  if (key.includes("thanh pho") || key.includes("thanhpho"))
    return <FaCity size={14} />;
  if (key.includes("mao hiem") || key.includes("maohiem"))
    return <FaCompass size={14} />;
  return <FaCompass size={14} />;
};

const Destination = () => {
  const location = useLocation();
  const [Data, setData] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/services/public");
        const data = await res.json();
        setData(data.data || []);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  const categories = useMemo(() => {
    const categorySet = new Set();

    Data.forEach((service) => {
      const rawCategory = service?.category;
      if (Array.isArray(rawCategory)) {
        rawCategory.filter(Boolean).forEach((item) => categorySet.add(item));
        return;
      }
      if (rawCategory) categorySet.add(rawCategory);
    });

    return ["Tất cả", ...Array.from(categorySet)];
  }, [Data]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const keyword = params.get("q") || "";
    const categoryParam = params.get("category") || "";

    setSearchText(keyword);

    if (categoryParam) {
      const matchedCategory =
        categories.find(
          (item) => normalizeText(item) === normalizeText(categoryParam),
        ) || "";

      if (matchedCategory) {
        setActiveCategory(matchedCategory);
      }
    }
  }, [categories, location.search]);

  const uniqueLocations = [
    ...new Set(Data.map((item) => item?.location).filter(Boolean)),
  ];

  const visibleServices = useMemo(() => {
    if (activeCategory === "Tất cả") return Data;

    return Data.filter((service) => {
      const rawCategory = service?.category;
      if (Array.isArray(rawCategory)) {
        return rawCategory.some(
          (item) => normalizeText(item) === normalizeText(activeCategory),
        );
      }
      return normalizeText(rawCategory) === normalizeText(activeCategory);
    });
  }, [Data, activeCategory]);

  const searchedServices = useMemo(() => {
    const keyword = normalizeText(searchText);
    if (!keyword) return visibleServices;

    return visibleServices.filter((service) => {
      const locationText = normalizeText(
        service?.location || service?.destination || service?.region || "",
      );
      const providerText = normalizeText(service?.nameProvider || "");
      return locationText.includes(keyword) || providerText.includes(keyword);
    });
  }, [searchText, visibleServices]);

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <section className="relative h-[480px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1772333389046-857fa5f9f9a5"
            alt=""
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-[13px] font-medium mb-5">
            <FaMapMarkerAlt className="text-[#f59e0b]" size={12} />
            Miền Bắc · Vịnh Hạ Long
          </div>

          <h1
            className="text-white mb-4"
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "clamp(28px, 5vw, 52px)",
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            Khám phá <span className="text-[#f59e0b]">điểm đến</span>
            <br />
            tuyệt vời nhất Việt Nam
          </h1>

          <p className="text-white/75 max-w-xl mx-auto mb-8 text-[16px]">
            12+ tour độc đáo · Giá tốt nhất · Đảm bảo hoàn tiền
          </p>

          <div className="w-full max-w-2xl">
            <div className="flex items-center gap-3 bg-white rounded-2xl shadow-2xl p-2 pl-5">
              <FaSearch className="text-gray-400" />

              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Tìm theo địa điểm hoặc nhà cung cấp..."
                className="flex-1 outline-none text-[14px] text-gray-800"
              />

              <button
                type="button"
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#f97316] to-[#f59e0b] text-white text-[14px] font-semibold"
              >
                <FaSearch size={14} />
                Tìm kiếm
              </button>
            </div>

            <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
              <span className="text-white/60 text-[12px]">Phổ biến</span>
              {uniqueLocations.map((loc) => (
                <CustomBtnDestination key={loc} title={loc} size="medium" />
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {categories.map((category) => (
            <CustomBtnDestination
              key={category}
              title={category}
              icon={
                category === "Tất cả" ? (
                  <FaCompass size={14} />
                ) : (
                  getCategoryIcon(category)
                )
              }
              active={activeCategory === category}
              onClick={() => setActiveCategory(category)}
              size="large"
            />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-6 px-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence initial={false}>
            {searchedServices.map((service, index) => {
              const serviceId = service?._id || service?.id;

              return (
                <motion.div
                  key={serviceId || index}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={serviceId ? `/services/${serviceId}` : "/destination"}
                    state={{ props: service }}
                    className="block"
                  >
                    <ServicesCard service={service} variant="destination" />
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <div className="max-w-7xl mx-auto my-14 relative h-56 overflow-hidden rounded-3xl">
        <img
          src="https://images.unsplash.com/photo-1694152491000-0cf654070339"
          alt="Sapa"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

        <div className="absolute inset-0 flex items-center px-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f97316]/20 border border-[#f97316]/40 text-[#f59e0b] text-[12px] font-semibold mb-3">
              <FaFire />
              Ưu đãi mùa hè
            </div>

            <h3 className="text-white text-[26px] font-bold mb-2">
              Giảm đến 30% cho tour Tây Bắc
            </h3>

            <p className="text-white/70 text-[14px] mb-4">
              Sapa · Fansipan · Mù Cang Chải
            </p>

            <button
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#f97316] to-[#f59e0b] text-white text-[13px] font-semibold hover:shadow-lg hover:shadow-orange-300 transition-all"
            >
              Xem ngay
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Destination;
