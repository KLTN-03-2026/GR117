import React from "react";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock } from "react-icons/fa";

const contactInfo = [
  {
    icon: FaMapMarkerAlt,
    title: "Địa chỉ",
    lines: ["123 Nguyễn Huệ, Q.1", "TP. Hồ Chí Minh"],
  },
  {
    icon: FaPhoneAlt,
    title: "Điện thoại",
    lines: ["1900 1234", "0901 234 567"],
  },
  {
    icon: FaEnvelope,
    title: "Email",
    lines: ["hello@vivutravel.vn", "support@vivutravel.vn"],
  },
  {
    icon: FaClock,
    title: "Giờ làm việc",
    lines: ["T2 - T7: 8:00 - 18:00", "CN: 9:00 - 15:00"],
  },
];

const Contact = () => {
  return (
    <div>
      {/* HEADER */}
      <section 
        className="py-20 text-center relative bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&w=1200&q=80')"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a2e]/95 to-[#16213e]/95"></div>
        <div className="relative z-10">
          <h1 className="text-5xl font-bold text-white">
            Liên <span className="text-[#f97316]">hệ</span>
          </h1>
          <p className="text-white/60 mt-4">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="bg-[#f3f4f6] py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-5 gap-12">

          {/* LEFT */}
        <div className="md:col-span-2 space-y-8">
  {contactInfo.map((item, i) => {
    const Icon = item.icon;

    return (
       <div key={i} className="flex gap-5">
        {/* ICON */}
        <div className="w-14 h-14 rounded-2xl bg-[#f97316]/10 flex items-center justify-center shrink-0">
          <Icon className="text-[#f97316]" />
        </div>

        {/* TEXT */}
        <div className="flex flex-col">
          <h4 className="text-lg font-semibold text-[#1a1a2e] leading-tight text-left">
            {item.title}
          </h4>

          <div className="mt-1 space-y-1 text-gray-500 text-[15px] leading-6">
            {item.lines.map((line, idx) => (
              <p key={idx} className="m-0 text-left">
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  })}
</div>

          {/* RIGHT - FORM */}
          <div className="md:col-span-3">
            <form className="bg-white rounded-3xl p-10 shadow-xl">

              <h3 className="text-2xl font-semibold mb-6">
                Gửi tin nhắn cho chúng tôi
              </h3>

              {/* Row */}
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm text-gray-500">
                    Họ tên
                  </label>
                  <input className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border outline-none focus:border-[#f97316]" />
</div>

                <div>
                  <label className="text-sm text-gray-500">
                    Email
                  </label>
                  <input className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border outline-none focus:border-[#f97316]" />
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm text-gray-500">
                  Số điện thoại
                </label>
                <input className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border outline-none focus:border-[#f97316]" />
              </div>

              <div className="mb-6">
                <label className="text-sm text-gray-500">
                  Tin nhắn
                </label>
                <textarea
                  rows="5"
                  className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border outline-none focus:border-[#f97316]"
                ></textarea>
              </div>

              <button className="w-full py-4 rounded-xl bg-gradient-to-r from-[#f97316] to-[#f59e0b] text-white font-semibold hover:shadow-lg transition">
                 Gửi tin nhắn
              </button>
            </form>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Contact;
