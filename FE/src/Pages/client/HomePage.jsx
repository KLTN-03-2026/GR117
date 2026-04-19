import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { FaShield, FaHeadphones, FaHeart, FaClock, MdStar } from "../../assets/Icons/Icons"
import { FaArrowLeft, FaArrowRight, FaStar, FaArrowRightLong } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { IoLocationOutline } from "react-icons/io5";
import { RiCalendarScheduleLine } from "react-icons/ri";
import { CiSearch } from "react-icons/ci";
import { normalizeText } from "../../utils/stringHelpers.js";

const comments = [
    {
        star: 5,
        comment:
            "Chuyến đi Hạ Long tuyệt vời! Dịch vụ chuyên nghiệp, hướng dẫn viên nhiệt tình.",
        name: "Nguyễn Minh Anh",
        short: "MA",
    },
    {
        star: 4,
        comment:
            "Trải nghiệm ổn, sẽ quay lại lần sau!",
        name: "Nguyễn Anh",
        short: "NA",
    },
    {
        star: 5,
        comment:
            "Dịch vụ ok, nhưng cần cải thiện thêm.",
        name: "Hà Vũ Anh",
        short: "VA",
    },
];

function HomePage() {
    const navigate = useNavigate();
    const [Service, setService] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchCategory, setSearchCategory] = useState("all");
    const [searchBudget, setSearchBudget] = useState("all");

    const [index, setIndex] = useState(0);
    const currentComment = comments[index] || comments[0];

    const handlePrev = () => {
        setIndex((prev) =>
            prev === 0 ? comments.length - 1 : prev - 1
        );
    };

    const handleNext = () => {
        setIndex((prev) =>
            prev === comments.length - 1 ? 0 : prev + 1
        );
    };
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/services/public");
                const data = await res.json();
                setService(Array.isArray(data?.data) ? data.data : []);
            } catch (error) {
                console.log(error);
            }
        };

        fetchData();
    }, []);

    const filteredServices = useMemo(() => {
        if (!Array.isArray(Service)) {
            return [];
        }

        const keyword = normalizeText(searchKeyword);

        return Service.filter((service) => {
            const name = normalizeText(service?.serviceName || service?.servicesName || "");
            const location = normalizeText(service?.location || service?.destination || service?.region || "");
            const provider = normalizeText(service?.nameProvider || "");
            const categories = Array.isArray(service?.category)
                ? service.category
                : service?.category
                    ? [service.category]
                    : [];
            const matchKeyword =
                !keyword ||
                name.includes(keyword) ||
                location.includes(keyword) ||
                provider.includes(keyword);

            const matchCategory =
                searchCategory === "all" ||
                categories.some((item) =>
                    normalizeText(item) === normalizeText(searchCategory),
                );

            const price = Number(service?.prices || service?.price || 0);
            const matchBudget =
                searchBudget === "all" ||
                (searchBudget === "under2" && price > 0 && price < 2000000) ||
                (searchBudget === "2to5" && price >= 2000000 && price <= 5000000) ||
                (searchBudget === "over5" && price > 5000000);

            return matchKeyword && matchCategory && matchBudget;
        });
    }, [Service, searchBudget, searchCategory, searchKeyword]);

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchKeyword.trim()) params.set("q", searchKeyword.trim());
        if (searchCategory !== "all") params.set("category", searchCategory);
        if (searchBudget !== "all") params.set("budget", searchBudget);
        navigate(`/destination${params.toString() ? `?${params.toString()}` : ""}`);
    };

    return (
        <main className="flex-1">
            <div>
                <section className="relative h-[90vh] min-h-[600px] flex items-center overflow-hidden text-left">

                    {/* Background */}
                    <div className="absolute inset-0">
                        <img
                            src="https://images.unsplash.com/photo-1682502922918-fed575428e3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGJlYWNoJTIwcGFyYWRpc2UlMjBzdW5zZXR8ZW58MXx8fHwxNzc0Mjc0MjcxfDA&ixlib=rb-4.1.0&q=80&w=1080"
                            alt=""
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a2e]/80 via-[#1a1a2e]/50 to-transparent"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
                        <div className="max-w-2xl">

                            <span className="inline-block px-4 py-1.5 bg-[#f97316]/20 text-[#f97316] rounded-full mb-6 backdrop-blur-sm border border-[#f97316]/30">
                                Khám phá Việt Nam cùng VIVU
                            </span>

                            <h1 className="text-white mb-6 font-serif text-[clamp(32px,5vw,56px)] font-bold leading-tight">
                                Hành trình của bạn <br />
                                <span className="text-[#f97316]">Câu Chuyện</span> Của Chúng Tôi
                            </h1>

                            <p className="text-white/70 mb-10 max-w-lg text-lg leading-7 mt-[40px] mb-[40px]">
                                Trải nghiệm những chuyến du lịch đẳng cấp với dịch vụ tận tâm, khám phá vẻ đẹp tiềm ẩn của mỗi vùng đất.
                            </p>
                        </div>

                        {/* Search box */}
                        <div className="mt-4 flex max-w-4xl flex-col gap-3 rounded-xl bg-white p-3 shadow-2xl md:flex-row md:items-center md:gap-2 md:p-2">

                            {/* Keyword */}
                            <div className="flex items-center gap-2 px-2 md:flex-1 md:border-r border-gray-100">
                                <div><IoLocationOutline className="ml-1 text-lg text-[#F78F10]" /></div>
                                <div className="min-w-0"><p className="text-gray-400 text-[12px]">Tên điểm đến / dịch vụ</p>
                                    <input
                                        value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                        placeholder="Địa điểm, dịch vụ..."
                                        type="text"
                                        className="w-full bg-transparent text-[#1a1a2e] outline-none text-[14px]"
                                    /></div>
                            </div>

                            {/* Tour type */}
                            <div className="flex items-center gap-2 px-2 md:flex-1 md:border-r border-gray-100">
                                <div><RiCalendarScheduleLine className="ml-1 text-lg text-[#F78F10]" /></div>
                                <div>
                                    <p className="text-gray-400 text-[12px]">Loại tour</p>
                                    <select
                                        value={searchCategory}
                                        onChange={(e) => setSearchCategory(e.target.value)}
                                        className="w-full bg-transparent text-[14px] text-[#1a1a2e] outline-none"
                                    >
                                        <option value="all">Tất cả</option>
                                        <option value="biển đảo">Biển đảo</option>
                                        <option value="nui">Núi</option>
                                        <option value="van hoa">Văn hoá</option>
                                        <option value="am thuc">Ẩm thực</option>
                                        <option value="thanh pho">Thành phố</option>
                                        <option value="mao hiem">Mạo hiểm</option>
                                    </select>
                                </div>
                            </div>

                            {/* Budget */}
                            <div className="flex items-center gap-2 px-2 md:flex-1 md:border-r border-gray-100">
                                <div><RiCalendarScheduleLine className="ml-1 text-lg text-[#F78F10]" /></div>
                                <div>
                                    <p className="text-gray-400 text-[12px]">Ngân sách</p>
                                    <select
                                        value={searchBudget}
                                        onChange={(e) => setSearchBudget(e.target.value)}
                                        className="w-full bg-transparent text-[14px] text-[#1a1a2e] outline-none"
                                    >
                                        <option value="all">Tất cả</option>
                                        <option value="under2">Dưới 2 triệu</option>
                                        <option value="2to5">2 - 5 triệu</option>
                                        <option value="over5">Trên 5 triệu</option>
                                    </select>
                                </div>
                            </div>

                            {/* Button */}
                            <button
                                type="button"
                                onClick={handleSearch}
                                className="rounded-xl bg-gradient-to-r from-[#F78F10] to-[#F78F10] px-6 py-3.5 text-white transition-all hover:shadow-lg hover:shadow-orange-200"
                            >
                                <div className="flex items-center gap-2">
                                    <CiSearch className="text-lg font-bold" /> <p className="font-bold text-[14px]">Tìm kiếm</p>
                                </div>
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-10 mt-10">
                            <div className="text-white/90">
                                <p className="text-2xl font-bold">100+</p>
                                <p className="text-white/50">Dịch vụ</p>
                            </div>

                            <div className="text-white/90">
                                <p className="text-2xl font-bold">50k+</p>
                                <p className="text-white/50">Khách hàng</p>
                            </div>

                            <div className="text-white/90">
                                <p className="text-2xl font-bold">4.9</p>
                                <p className="text-white/50">Đánh giá</p>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="py-20 bg-[#f8fafc]">
                    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

                        {[FaShield, FaHeadphones, FaHeart, FaClock].map((Icon, i) => (
                            <div key={i} className="bg-white rounded-xl p-6 text-center group hover:shadow-xl transition">

                                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#f97316]/10 flex items-center justify-center mb-4 group-hover:bg-[#f97316] transition">
                                    <Icon className="text-[#f97316] group-hover:text-white transition" />
                                </div>

                                <h3 className="text-[16px] font-semibold">
                                    {["An toàn", "Hỗ trợ 24/7", "Trải nghiệm", "Linh hoạt"][i]}
                                </h3>

                                <p className="text-gray-500 mt-2 text-sm">
                                    Dịch vụ chất lượng cao
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-6 text-center mb-10">
                        <span className="text-[#f97316] text-sm font-semibold tracking-widest">
                            KHÁM PHÁ
                        </span>

                        <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-bold mt-2">
                            Dịch Vụ <span className="text-[#f97316]">Nổi Bật</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6 px-6 sm:grid-cols-2 lg:grid-cols-5 max-w-7xl mx-auto">
                        {filteredServices.slice(0, 5).map((service, index) => {
                            const serviceId = service?._id || service?.id;
                            const serviceName = service?.serviceName || service?.servicesName || service?.ServiceName || "Chờ cập nhật";
                            const serviceLocation = service?.location || service?.destination || service?.region || "Chờ cập nhật";
                            const servicePrice = Number(service?.prices ?? service?.price ?? 0);
                            const serviceRating = Number(service?.rating ?? 0);
                            const reviewCount = Number(service?.reviewCount ?? 0);
                            const partnerName = service?.partnerName || service?.nameProvider || "VIVU";
                            const terrainLabel = Array.isArray(service?.category)
                                ? service.category[0]
                                : service?.category || service?.region || "Khám phá";
                            const serviceImage =
                                service?.images?.[0] ||
                                service?.imageUrl ||
                                (service?.imageFile ? `http://localhost:5000/uploads/${service.imageFile}` : "") ||
                                "https://via.placeholder.com/400x250?text=No+Image";

                            return (
                                <motion.div
                                    key={serviceId || serviceName || index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link to={serviceId ? `/services/${serviceId}` : "/destination"} className="group block">
                                        <div className="relative overflow-hidden rounded-lg">
                                            <img
                                                src={serviceImage}
                                                alt={serviceName}
                                                onError={(event) => {
                                                    event.currentTarget.onerror = null;
                                                    event.currentTarget.src = "https://via.placeholder.com/400x250?text=No+Image";
                                                }}
                                                className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                            <div className="absolute left-4 top-4 rounded-full bg-black/40 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                                                {terrainLabel}
                                            </div>
                                            {reviewCount > 0 && serviceRating > 0 && (
                                                <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 backdrop-blur-sm">
                                                    <FaStar size={14} className="fill-[#f59e0b] text-[#f59e0b]" />
                                                    <span style={{ fontSize: 13, fontWeight: 600 }}>
                                                        {serviceRating.toFixed(1)}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="absolute bottom-4 left-4 right-4 text-white">
                                                <h3 className="line-clamp-1" style={{ fontSize: 18, fontWeight: 600 }}>{serviceName}</h3>
                                                <p className="text-white/70 flex items-center gap-1 mt-1" style={{ fontSize: 13 }}>
                                                    <IoLocationOutline size={14} /> {serviceLocation}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="text-left">
                                                <p className="text-[#f97316]" style={{ fontSize: 18, fontWeight: 700 }}>
                                                    {servicePrice.toLocaleString("vi-VN")} đ
                                                </p>
                                                <p className="text-muted-foreground" style={{ fontSize: 12 }}>bởi {partnerName}</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-[#f97316]/10 flex items-center justify-center hover:bg-[#f97316] hover:text-white text-[#f97316] transition-colors">
                                                <FaArrowRightLong size={18} />
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>

                    <div className="text-center mt-10">
                        <Link
                            to="/destination"
                            className="inline-flex items-center gap-2 rounded-full border-2 border-[#f97316] px-8 py-3 text-[#f97316] transition-all hover:bg-[#f97316] hover:text-white"
                            style={{ fontSize: 15, fontWeight: 600 }}
                        >
                            Xem tất cả dịch vụ <FaArrowRight size={18} />
                        </Link>
                    </div>
                </section>

                <section className="relative py-24 overflow-hidden">
                    <div className="absolute inset-0">
                        <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1673505413397-0cd0dc4f5854?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGxhbmRzY2FwZSUyMGFkdmVudHVyZSUyMHRyYXZlbHxlbnwxfHx8fDE3NzQyODk3NjR8MA&ixlib=rb-4.1.0&q=80&w=1080" alt="" />
                        <div className="absolute inset-0 bg-[#1a1a2e]/80">
                        </div>
                    </div>
                    <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
                        <h2 className="text-white mb-4 text-[48px]">
                            Bạn là nhà cung cấp dịch vụ du lịch?
                        </h2>
                        <p className="text-white/60 mb-8">
                            Đăng ký làm đối tác VIVU Travel để đăng tải dịch vụ và tiếp cận hàng nghìn khách hàng tiềm năng
                        </p>
                        <Link to="register" className="inline-block px-8 mt-4 py-3.5 bg-gradient-to-r from-[#f97316] to-[#f59e0b] text-white rounded-full hover:shadow-lg transition-all">
                            Đăng ký đối tác ngay
                        </Link>
                    </div>
                </section>
                <section className="py-20 bg-[#f8fafc]">
                    <div className="max-w-7xl mx-auto px-6">

                        <div className="text-center mb-14">
                            <span className="text-[#f97316] mb-2 block text-l font-semibold tracking-widest">
                                ĐÁNH GIÁ
                            </span>

                            <h2 className="font-serif font-semibold text-[#1a1a2e] text-[40px]">
                                Khách hàng{" "}
                                <span className="text-[#f97316]">
                                    nói gì
                                </span>
                            </h2>
                        </div>

                        <div className="max-w-2xl mx-auto">
                            <div className="bg-white rounded-3xl p-10 shadow-lg text-center">
                                <div className="flex justify-center gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <MdStar
                                            key={i}
                                            className={`w-6 h-6 ${i < currentComment.star
                                                ? "text-[#f59e0b]"
                                                : "text-gray-300"
                                                }`}
                                        />
                                    ))}
                                </div>
                                <p>
                                    {currentComment.comment}
                                </p>
                                <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-[#f97316] to-[#f59e0b] flex items-center justify-center text-white mb-3">
                                    {currentComment.short}
                                </div>
                                <p>
                                    {currentComment.name}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center gap-4 mt-8">
                        <button
                            onClick={handlePrev}
                            className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-[#f97316] hover:text-white transition"
                        >
                            <FaArrowLeft />
                        </button>

                        <button
                            onClick={handleNext}
                            className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-[#f97316] hover:text-white transition"
                        >
                            <FaArrowRight />
                        </button>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default HomePage;



