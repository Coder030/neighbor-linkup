"use client";

import React, { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import Image from "next/image";

import { RiImageAddLine } from "react-icons/ri";
import { useRouter } from "next/navigation";

function Page() {
  async function getLocation(lat, lon) {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );

      if (response.data.display_name) {
        return response.data.display_name;
      } else {
        return "Location not found";
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      return null;
    }
  }
  const [location, setLocation] = useState(null);
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);

  useEffect(() => {
    // Check for Geolocation support
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    // Request user's location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        setError(`Error getting location: ${error.message}`);
      }
    );
  }, []);
  useEffect(() => {
    if (location) {
      setLat(location.latitude);
      setLon(location.longitude);
    }
  }, [location]);
  const [me, setMe] = useState({});
  const router = useRouter();
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:2000/report");
      const socket = socketRef.current;
      setSocket(socket);
    }
  }, []);
  useEffect(() => {
    const fetchy = async () => {
      const rep = await fetch("http://localhost:2000/api/me", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await rep.json();
      if (data["message"] == "nvt") {
        router.push("/signin");
      } else {
        setMe(data["data"]);
      }
    };
    fetchy();
  }, [socket, router]);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [someError, setSomeError] = useState(false);
  const fileInputRef = useRef(null);

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
      <div className="flex justify-center">
        <div className="w-[1200px] p-[45px]">
          <p className="text-[30px] mb-[30px]">
            Create reports, events or updates
          </p>
          <p className="text-[20px]">Title</p>
          <textarea
            className="flex items-center justify-center w-[100%] border-[1px] border-[#BCCAD3] h-[47px] min-h-[47px] mt-[10px] rounded-lg p-[10px] focus:outline-none mb-[30px]"
            placeholder="Your main motive..."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
          />
          <p className="text-[20px]">Summary</p>
          <textarea
            className="flex items-center justify-center w-[100%] border-[1px] border-[#BCCAD3] h-[158px] min-h-[47px] mt-[10px] rounded-lg p-[10px] focus:outline-none mb-[30px]"
            placeholder="What is the summary of your post?"
            value={summary}
            onChange={(e) => {
              setSummary(e.target.value);
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
          />
          <p className="text-[20px]">Details</p>
          <textarea
            className="flex items-center justify-center w-[100%] border-[1px] border-[#BCCAD3] h-[158px] min-h-[47px] mt-[10px] rounded-lg p-[10px] focus:outline-none mb-[30px]"
            placeholder="Please provide any other necessary details here... like the location, date, time etc."
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
          />
          <p className="text-[20px]">Add a cover image</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
            ref={fileInputRef}
          />
          {!selectedImage && (
            <div
              className="w-[100%] text-center h-[89px] bg-[#F7FBFD] border border-[#58AEE4] border-dashed flex justify-center items-center mt-[20px] mb-[30px] cursor-pointer rounded-lg"
              onClick={() => fileInputRef.current.click()}
            >
              <div className="flex items-center">
                <RiImageAddLine className="h-[30px] w-[30px] mr-[10px]" />
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
          <button
            className="bg-[#000] text-[#fff] py-[10px] px-[20px] rounded-md mt-[30px]"
            onClick={() => {
              if (
                title !== "" &&
                summary !== "" &&
                description !== "" &&
                selectedImage !== null
              ) {
                setSomeError(false);
                socket.emit(
                  "post",
                  title,
                  summary,
                  description,
                  selectedImage,
                  me["username"],
                  me["id"],
                  location["latitude"],
                  location["longitude"]
                );
                // setTimeout(() => {
                router.push("/");
                // }, 3000);
              } else {
                setSomeError(true);
              }
            }}
          >
            Publish
          </button>
          {someError && (
            <p className="mt-[20px] text-[#FF0202]">
              ** You left some fields blank... **
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Page;
