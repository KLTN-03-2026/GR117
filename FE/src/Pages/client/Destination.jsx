import { useEffect, useMemo, useState } from "react";
import CustomBtnDestination from "../../Components/destination/ButtonDestination";
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
import ServicesCard from "../../Components/services/ServicesCard";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";

const normalizeText = (text) =>
  String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const getCategoryText = (category) => {
  if (Array.isArray(category)) {
    return category[0]?.categoryName || category[0] || "";
  }
  if (category && typeof category === "object") {
    return category.categoryName || "";
  }
  return category || "";
};

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
  const navigate = useNavigate();
  const [Data, setData] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [searchText, setSearchText] = useState("");
  const [budgetFilter, setBudgetFilter] = useState("all");
  const [favoriteServiceIds, setFavoriteServiceIds] = useState([]);
  const [favoriteLoadingId, setFavoriteLoadingId] = useState("");
  const accessToken = localStorage.getItem("accessToken");
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser") || "null");
    } catch {
      return null;
    }
  }, []);
  const canManageFavorites = Boolean(
    currentUser &&
      String(currentUser.role || "").toLowerCase() === "user" &&
      accessToken,
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/services?limit=1000");
        const data = await res.json();
        setData(data.data || []);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!canManageFavorites) {
      setFavoriteServiceIds([]);
      return;
    }

    const fetchFavorites = async () => {
      try {
        const res = await axios.get("/api/users/favorites", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const favoriteIds = Array.isArray(res.data?.data)
          ? res.data.data.map((item) => String(item?._id || item?.id)).filter(Boolean)
          : [];

        setFavoriteServiceIds(favoriteIds);
      } catch (error) {
        setFavoriteServiceIds([]);
      }
    };

    fetchFavorites();
  }, [accessToken, canManageFavorites]);

  const categories = useMemo(() => {
    const categorySet = new Set();

    Data.forEach((service) => {
      const rawCategory = service?.category;
      if (Array.isArray(rawCategory)) {
        rawCategory
          .map(getCategoryText)
          .filter(Boolean)
          .forEach((item) => categorySet.add(item));
        return;
      }
      const categoryText = getCategoryText(rawCategory);
      if (categoryText) categorySet.add(categoryText);
    });

    return ["Tất cả", ...Array.from(categorySet)];
  }, [Data]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const keyword = params.get("q") || "";
    const categoryParam = params.get("category") || "";
    const budgetParam = params.get("budget") || "all";

    setSearchText(keyword);
    setBudgetFilter(budgetParam);

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
          (item) => normalizeText(getCategoryText(item)) === normalizeText(activeCategory),
        );
      }
      return normalizeText(getCategoryText(rawCategory)) === normalizeText(activeCategory);
    });
  }, [Data, activeCategory]);

  const searchedServices = useMemo(() => {
    const keyword = normalizeText(searchText);
    return visibleServices.filter((service) => {
      const locationText = normalizeText(
        service?.location || service?.destination || service?.region || "",
      );
      const terrainText = normalizeText(
        getCategoryText(service?.category) || service?.region || "",
      );
      const price = Number(service?.prices || service?.price || 0);
      const matchKeyword =
        !keyword ||
        locationText.includes(keyword) ||
        terrainText.includes(keyword);
      const matchBudget =
        budgetFilter === "all" ||
        (budgetFilter === "under2" && price > 0 && price < 2000000) ||
        (budgetFilter === "2to5" && price >= 2000000 && price <= 5000000) ||
        (budgetFilter === "over5" && price > 5000000);

      return matchKeyword && matchBudget;
    });
  }, [budgetFilter, searchText, visibleServices]);

  const handleToggleFavorite = async (service) => {
    const serviceId = String(service?._id || service?.id || "");
    if (!serviceId) return;

    if (!canManageFavorites) {
      navigate("/signin");
      return;
    }

    try {
      setFavoriteLoadingId(serviceId);
      const res = await axios.patch(
        `/api/users/favorites/${serviceId}/toggle`,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      const nextFavorite = Boolean(res.data?.data?.isFavorited);
      setFavoriteServiceIds((prev) => {
        if (nextFavorite) {
          return prev.includes(serviceId) ? prev : [...prev, serviceId];
        }

        return prev.filter((item) => item !== serviceId);
      });
      return { isFavorited: nextFavorite };
    } catch (error) {
      console.log(error);
      return { isFavorited: false };
    } finally {
      setFavoriteLoadingId("");
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <section className="relative h-[90vh] min-h-[600px] flex items-center overflow-hidden text-center">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1772333389046-857fa5f9f9a5"
            alt=""
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/45" />

        <div className="relative z-10 mx-auto flex w-full max-w-7xl justify-center px-6">
          <div className="flex max-w-2xl flex-col items-center">
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

            <p className="text-white/75 max-w-xl mb-8 text-[16px] leading-7">
              12+ tour độc đáo · Giá tốt nhất · Đảm bảo hoàn tiền
            </p>

            <div className="w-full max-w-4xl">
              <div className="flex items-center gap-3 rounded-2xl bg-white p-2 pl-5 shadow-2xl">
                <FaSearch className="text-gray-400" />

                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Tìm theo địa điểm hoặc địa hình..."
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
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {categories.map((category) => (
            <CustomBtnDestination
              key={category}
              title={getCategoryText(category)}
              icon={
                category === "Tất cả" ? (
                  <FaCompass size={14} />
                ) : (
                  getCategoryIcon(getCategoryText(category))
                )
              }
              active={activeCategory === getCategoryText(category)}
              onClick={() => setActiveCategory(getCategoryText(category))}
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
                    <ServicesCard
                      service={service}
                      variant="destination"
                      showFavorite
                      isFavorite={favoriteServiceIds.includes(String(serviceId))}
                      favoriteLoading={favoriteLoadingId === String(serviceId)}
                      onToggleFavorite={handleToggleFavorite}
                    />
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
