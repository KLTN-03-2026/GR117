import { useState } from "react";
import { FaShield, FaHeadphones, FaHeart, FaClock, MdStar } from "../../assets/Icons/Icons"
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { IoLocationOutline } from "react-icons/io5";
import { RiCalendarScheduleLine } from "react-icons/ri";
import { CiSearch } from "react-icons/ci";
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
    const [Service, setService] = useState([]);

    const [index, setIndex] = useState(0);

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
                const res = await fetch("http://localhost:5000/api/services/all");
                const data = await res.json();
                setService(data.data || []);
            } catch (error) {
                console.log(error);
            }
        };

        fetchData();
    }, []);
    console.log(Service[0]?.ServiceName)

    return (
        <main className="flex-1">
            <div>
                <section className="relative h-[90vh] min-h-[600px] flex items-center overflow-hidden text-left">

                    {/* Background */}
                    <div className="absolute inset-0">
                        <img
                            src=""
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
                        <div className="bg-white rounded-2xl mt-4 p-4 md:p-2 shadow-2xl max-w-4xl flex flex-col md:flex-row gap-3 md:gap-0 md:items-center">

                            {/* Keyword */}
                            <div className="flex items-center gap-3 px-4  md:border-r border-gray-100">
                                <div><IoLocationOutline className="text-xl ml-2 text-[#F78F10]" /></div>
                                <div><p className="text-gray-400 text-sm">Tìm kiếm </p>
                                    <input
                                        placeholder="Địa điểm, dịch vụ..."
                                        type="text"
                                        className="w-full outline-none bg-transparent text-[#1a1a2e]"
                                    /></div>
                            </div>

                            {/* Date */}
                            <div className="flex items-center gap-3 px-4  md:border-r border-gray-100">
                                <div><RiCalendarScheduleLine className="text-xl ml-2 text-[#F78F10]" /></div>
                                <div><p className="text-gray-400 text-sm">Ngày đi</p>
                                    <input
                                        type="date"
                                        className="w-full outline-none bg-transparent text-sm text-[#1a1a2e]"
                                    /></div>
                            </div>

                            {/* Guests */}
                            <div className="flex flex-1 items-center gap-3 px-4  md:border-r border-gray-100">
                                <div><RiCalendarScheduleLine className="text-xl ml-2 text-[#F78F10]" /></div>
                                <div>
                                    <p className="text-gray-400 text-sm">Số người</p>
                                    <select className="w-full outline-none bg-transparent text-[#1a1a2e]">
                                        {[1, 2, 3, 4, 5, 6].map((item) => (
                                            <option key={item} value={item}>
                                                {item} người
                                            </option>
                                        ))}
                                    </select>

                                </div>
                            </div>

                            {/* Button */}
                            <button className="bg-gradient-to-r from-[#F78F10] to-[#F78F10] text-white px-8 py-4 rounded-xl hover:shadow-lg hover:shadow-orange-200 transition-all">
                                <div className="flex items-center gap-3 ">
                                    <CiSearch className="text-xl font-bold" />  <p className="font-bold">Tìm Kiếm</p>
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
                                <p className="text-white/50">Khách Hàng</p>
                            </div>

                            <div className="text-white/90">
                                <p className="text-2xl font-bold">4.9</p>
                                <p className="text-white/50">Đánh Giá</p>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="py-20 bg-[#f8fafc]">
                    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

                        {[FaShield, FaHeadphones, FaHeart, FaClock].map((Icon, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 text-center group hover:shadow-xl transition">

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

                    {Service.map((props, index) => {
                        return ServicesCardHomePage(props, index);
                    })}
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
                                            className={`w-6 h-6 ${i < comments[index].star
                                                ? "text-[#f59e0b]"
                                                : "text-gray-300"
                                                }`}
                                        />
                                    ))}
                                </div>
                                <p>
                                    {comments[index].comment}
                                </p>
                                <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-[#f97316] to-[#f59e0b] flex items-center justify-center text-white mb-3">
                                    {comments[index].short}
                                </div>
                                <p>
                                    {comments[index].name}
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