import React from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
const ButtonBack = () => {
  const navigate = useNavigate();
  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-xl"
      >
        <IoIosArrowBack className="text-black" />{" "}
        <p className="font-bold text-black "> BACK</p>{" "}
      </button>
    </div>
  );
};

export default ButtonBack;
