import React, { useEffect, useState } from 'react'
import CustomBtnDestination from '../../Components/ButtonDestination'

import {
  FaUmbrellaBeach,
  FaMountain,
  FaLandmark,
  FaUtensils,
  FaCity,
  FaCompass,
  FaSearch,
  FaMapMarkerAlt,
  FaChevronRight,
  FaFire
} from "react-icons/fa";
import ServicesCard from '../../Components/ServicesCard';
import { Link } from 'react-router-dom';

const btn = [
  { Name: "Biển Đảo", Icon: <FaUmbrellaBeach size={14} /> },
  { Name: "Núi & Trek", Icon: <FaMountain size={14} /> },
  { Name: "Văn Hóa", Icon: <FaLandmark size={14} /> },
  { Name: "Ẩm Thực", Icon: <FaUtensils size={14} /> },
  { Name: "Thành Phố", Icon: <FaCity size={14} /> },
  { Name: "Mạo Hiểm", Icon: <FaCompass size={14} /> },
  { Name: "Du Lịch", Icon: <FaCompass size={14} /> },
];


const Destination = () => {
  const [Data, setData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/services/all");
        const data = await res.json();
        setData(data.data || []);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);
  { console.log(Data) }
  const uniqueLocations = [...new Set(Data.map(item => item.location))];
  const uniqueregion = [...new Set(Data.map(item => item.region))]
  const sliecData = (location,) => {

  }

  return (
    <div className='min-h-screen bg-[#f9fafb]'>

      {/* HERO */}
      <section className='relative h-[480px] overflow-hidden'>
        <div className='absolute inset-0'>
          <img
            className='w-full h-full object-cover'
            src="https://images.unsplash.com/photo-1772333389046-857fa5f9f9a5"
            alt=""
          />
        </div>

        <div className='absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70' />

        <div className='relative z-10 h-full flex flex-col items-center justify-center text-center px-6'>

          {/* LABEL */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
            bg-white/10 backdrop-blur-sm border border-white/20 text-white/90
            text-[13px] font-medium mb-5">

            <FaMapMarkerAlt className="text-[#f59e0b]" size={12} />
            Miền Bắc · Vịnh Hạ Long
          </div>

          {/* TITLE */}
          <h1
            className="text-white mb-4"
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "clamp(28px, 5vw, 52px)",
              fontWeight: 700,
              lineHeight: 1.2
            }}
          >
            Khám phá <span className="text-[#f59e0b]">điểm đến</span><br />
            tuyệt vời nhất Việt Nam
          </h1>

          <p className="text-white/75 max-w-xl mx-auto mb-8 text-[16px]">
            12+ tour độc đáo · Giá tốt nhất · Đảm bảo hoàn tiền
          </p>

          {/* SEARCH */}
          <div className='w-full max-w-2xl'>
            <div className='flex items-center gap-3 bg-white rounded-2xl shadow-2xl p-2 pl-5'>
              <FaSearch className="text-gray-400" />

              <input
                type="text"
                placeholder='Tìm điểm đến, tên tour, danh mục...'
                className='flex-1 outline-none text-[14px] text-gray-800'
              />

              <button className='flex items-center gap-2 px-5 py-3 rounded-xl
                bg-gradient-to-r from-[#f97316] to-[#f59e0b]
                text-white text-[14px] font-semibold'>

                <FaSearch size={14} />
                Tìm kiếm
              </button>
            </div>

            {/* LOCATION HOT */}
            <div className='flex items-center gap-2 mt-4 flex-wrap justify-center'>
              <span className='text-white/60 text-[12px]'>Phổ Biến</span>

              {uniqueLocations.map((loc, index) => (
                <CustomBtnDestination
                  key={index}
                  title={loc}
                  size="medium"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY BUTTON */}
      <div className='max-w-7xl mx-auto px-6 py-8'>
        <div className='flex gap-2 overflow-x-auto pb-2 mb-6'>
          {btn.map((item, index) => (
            <CustomBtnDestination
              key={index}
              title={item.Name}
              icon={item.Icon}
              active={activeIndex === index}
              onClick={() => setActiveIndex(index)}
              size="large"
            />
          ))}
        </div>

        {/* FILTER */}
        <div className='flex flex-col sm:flex-row justify-between gap-3 mb-6'>

          <div className='flex gap-3 flex-wrap'>

            <select className='px-4 py-2.5 rounded-xl border text-[13px]'>
              <option>Tất Cả</option>
              {uniqueregion.map((item, index) => (
                <option key={index}>{item}</option>
              ))}
            </select>

            <select className='px-4 py-2.5 rounded-xl border text-[13px]'>
              <option>Phổ biến nhất</option>
              <option>Đánh giá cao</option>
              <option>Giá thấp → cao</option>
              <option>Giá cao → thấp</option>
            </select>

          </div>

          <div className="text-[13px] text-gray-500">
            <b>{Data.length}</b> kết quả
          </div>

        </div>

      </div>
      {/* List Server */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-4 gap-5">
          {Data.map((props, index) => (
            <ServicesCard service={props} key={index} />
          ))}
        </div>
      </div>
      {/*  */}
      <div className=" max-w-7xl mx-auto my-14 rounded-3xl overflow-hidden relative h-56">
        <img
          src="https://images.unsplash.com/photo-1694152491000-0cf654070339"
          alt="Sapa"
          className="w-full h-full object-cover"
        />

        {/* overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

        <div className="absolute inset-0 flex items-center px-10">
          <div>
            {/* badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full
        bg-[#f97316]/20 border border-[#f97316]/40 text-[#f59e0b]
        text-[12px] font-semibold mb-3">
              <FaFire />
              Ưu đãi mùa hè
            </div>

            {/* title */}
            <h3 className="text-white text-[26px] font-bold mb-2">
              Giảm đến 30% cho tour Tây Bắc
            </h3>

            {/* desc */}
            <p className="text-white/70 text-[14px] mb-4">
              Sapa · Fansipan · Mù Cang Chải
            </p>

            {/* button */}
            <Link
              to="#"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
        bg-gradient-to-r from-[#f97316] to-[#f59e0b]
        text-white text-[13px] font-semibold
        hover:shadow-lg hover:shadow-orange-300 transition-all"
            >
              Xem ngay
              <FaChevronRight />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Destination;
