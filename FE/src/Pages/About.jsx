import React from "react";
import { FaLocationDot } from "../assets/Icons/Icons.jsx";

const About = () => {
  return (
    <div>
      {/* HEADER */}
      <section className="relative py-24">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://png.pngtree.com/background/20231110/pngtree-snowy-mountain-range-a-captivating-winter-texture-image_13795040.png')",
          }}
        ></div>

        <div className="absolute inset-0 bg-black/50"></div>

        <div className="relative max-w-7xl mx-auto px-6 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Về <span className="text-orange-500">chúng tôi</span>
          </h1>
          <p className="text-white/90 mt-6 text-lg">
            Câu chuyện và sứ mệnh của VIVU Travel
          </p>
        </div>
      </section>

      {/* GIỚI THIỆU */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-16 items-center">
        <div className="w-full aspect-[4/3] overflow-hidden rounded-3xl">
          <img
            src="https://images.unsplash.com/photo-1673505413397-0cd0dc4f5854?q=80&w=1200&auto=format&fit=crop"
            alt="about"
            className="w-full h-full object-cover object-[50%_35%]"
          />
        </div>

        <div>
          <span className="text-orange-500 font-semibold text-sm tracking-widest">
            CÂU CHUYỆN CỦA CHÚNG TÔI
          </span>

          <h2
            className="mt-3 mb-6 text-4xl md:text-5xl font-bold leading-tight"
            style={{ fontFamily: "Playfair Display, serif", color: "#1A1A2E" }}
          >
            10 năm đồng hành cùng{" "}
            <span className="text-orange-500">hành trình</span> của bạn
          </h2>

          <p className="text-gray-500 mb-4 leading-relaxed text-[15px] md:text-base">
            VIVU Travel được thành lập năm 2016 với niềm đam mê mang đến những
            trải nghiệm du lịch chất lượng cao cho người Việt. Từ một nhóm nhỏ
            yêu thích khám phá, chúng tôi đã phát triển thành một trong những
            công ty du lịch uy tín hàng đầu.
          </p>

          <p className="text-gray-500 leading-relaxed text-[15px] md:text-base">
            Mỗi chuyến đi là một câu chuyện, mỗi điểm đến là một khám phá. Chúng
            tôi không chỉ đưa bạn đến những vùng đất mới, mà còn giúp bạn tạo
            nên những kỷ niệm không thể nào quên.
          </p>
        </div>
      </section>

      {/* SỨ MỆNH + TẦM NHÌN */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-8">
          {/* Sứ mệnh */}
          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition text-center">
            <div className="w-14 h-14 mx-auto rounded-xl bg-orange-100 flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="#f97316"
                  strokeWidth="2"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="5"
                  stroke="#f97316"
                  strokeWidth="2"
                />
                <circle cx="12" cy="12" r="1.5" fill="#f97316" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Sứ mệnh</h3>
            <p className="text-gray-500 leading-relaxed">
              Mang đến trải nghiệm du lịch tuyệt vời nhất với dịch vụ chuyên
              nghiệp, an toàn và tận tâm.
            </p>
          </div>

          {/* Tầm nhìn */}
          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition text-center">
            <div className="w-14 h-14 mx-auto rounded-xl bg-orange-100 flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                  stroke="#f97316"
                  strokeWidth="2"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  stroke="#f97316"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Tầm nhìn</h3>
            <p className="text-gray-500 leading-relaxed">
              Trở thành thương hiệu du lịch hàng đầu Việt Nam, kết nối con người
              với thiên nhiên.
            </p>
          </div>
        </div>
      </section>

      {/* THỐNG KÊ */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-orange-500 text-4xl font-bold">10+</p>
            <p className="text-gray-500 mt-1">Năm kinh nghiệm</p>
          </div>
          <div>
            <p className="text-orange-500 text-4xl font-bold">500+</p>
            <p className="text-gray-500 mt-1">Tour du lịch</p>
          </div>
          <div>
            <p className="text-orange-500 text-4xl font-bold">50K+</p>
            <p className="text-gray-500 mt-1">Khách hàng</p>
          </div>
          <div>
            <p className="text-orange-500 text-4xl font-bold">100+</p>
            <p className="text-gray-500 mt-1">Điểm đến</p>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="text-orange-500 font-semibold text-sm tracking-widest">
            ĐỘI NGŨ
          </span>

          <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-12 font-serif">
            Gặp gỡ <span className="text-orange-500">đội ngũ</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { name: "Nguyễn Văn An", role: "CEO" },
              { name: "Trần Thị Bích", role: "COO" },
              { name: "Lê Minh Tuấn", role: "Tour Manager" },
              { name: "Phạm Thị Lan", role: "Marketing" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center text-white font-bold text-xl mb-3">
                  {item.name
                    .split(" ")
                    .map((w) => w[0])
                    .slice(-2)
                    .join("")}
                </div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-gray-500 text-sm">{item.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
