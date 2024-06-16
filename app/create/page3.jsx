"use client";

import { useRouter } from "next/navigation";
import React, { useState, useRef } from "react";
import { FaRegFileImage } from "react-icons/fa";
// import { RiImageAddLine } from "react-icons";

function Page() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageDataUrl = reader.result;
        setSelectedImage(imageDataUrl);
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <div>
      <div className="p-[20px] shadow-lg">
        <div className="flex items-center">
          <p
            className="text-[25px] text-[#008080] float-right me-auto cursor-pointer ml-[4%] font-extrabold , heading"
            onClick={() => {
              router.push("/");
            }}
          >
            Neighbour Linkup
          </p>
          <div className="ms-auto">
            <button
              className="mr-[50px] text-[20px] bg-[#adeb21] p-[10px] px-[30px] rounded-lg cursor-pointer"
              onClick={() => {
                router.push("/");
              }}
            >
              Home
            </button>
            <button className="lg:text-[20px] md:text-[17px] text-[13px]"></button>
          </div>
        </div>
      </div>
      <div className="ml-[10%]">
        <p className="text-[23px] mt-[50px]">
          Create reports, events or updates
        </p>
        <p className="mt-[30px] text-[22px] text-[#008080] mb-[20px]">Title</p>
        <input
          className="border-[1px] border-[#BCCAD3] p-[10px] w-[400px] mb-[30px] rounded-lg"
          placeholder="Your main motive"
        />
        <p className="mt-[30px] text-[22px] text-[#008080] mb-[20px]">
          Summary
        </p>
        <textarea
          className="border-[1px] border-[#BCCAD3] p-[10px] w-[88.5%] mb-[30px] rounded-lg h-[200px]"
          placeholder="What is the summary of your report, update or event?"
        />
        <p className="mt-[30px] text-[22px] text-[#008080] mb-[20px]">
          Details
        </p>
        <textarea
          className="border-[1px] border-[#BCCAD3] p-[10px] w-[88.5%] mb-[30px] rounded-lg h-[200px]"
          placeholder="Please provide any other necessary details here... like the location, date, time etc."
        />
        <p className="mt-[30px] text-[22px] text-[#008080] mb-[20px]">
          Cover image
        </p>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: "none" }}
          ref={fileInputRef}
        />
        {!selectedImage && (
          <div
            className="w-[88.5%] text-center h-[89px] bg-[#F7FBFD] border-dotted		border-[#58AEE4] flex justify-center items-center mt-[20px] mb-[30px] cursor-pointer rounded-lg"
            onClick={() => fileInputRef.current.click()}
          >
            <div className="flex items-center">
              {/* <RiImageAddLine className="h-[30px] w-[30px] mr-[10px]" /> */}
              <FaRegFileImage className="h-[30px] w-[30px] mr-[10px]" />
              Upload an image from your computer
            </div>
          </div>
        )}
        {selectedImage && (
          <div
            className="w-[100%] h-fit mt-[20px] mb-[30px]"
            onClick={() => fileInputRef.current.click()}
          >
            <img
              src={selectedImage}
              alt="Selected"
              className="h-[30%] w-[30%]"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Page;
