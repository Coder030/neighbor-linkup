/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

function Home() {
  const [showMessage, setShowMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    if (socket) {
      socket.emit("give");
      socket.on("posts", async (posts2) => {
        console.log(posts2);
        setPosts(posts2);
      });
    }
  }, [socket, posts]);
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 5000);
  }, []);
  return (
    <div className="bg-[#191919] pb-[200px] h-fit">
      <div className="p-[20px] shadow-lg border-b-[1px] border-[#fff]">
        <div className="flex items-center">
          <p
            className="text-[25px] text-[#fff] float-right me-auto cursor-pointer ml-[4%] font-bols , heading"
            onClick={() => {
              router.push("/");
            }}
          >
            Neighbour Linkup
          </p>
          <div className="ms-auto">
            <button
              className="text-[20px] text-[#fff] p-[10px] cursor-pointer mr-[10px] border-b-[2px] border-[#5199C2]"
              onClick={() => {
                router.push("/");
              }}
            >
              Home
            </button>
            <button
              className="mr-[20px] text-[20px] text-[#C2C2C2] p-[10px] cursor-pointer"
              onClick={() => {
                router.push("/");
              }}
            >
              Create
            </button>
            <button className="lg:text-[20px] md:text-[17px] text-[13px]"></button>
          </div>
        </div>
      </div>
      <div className="mx-[5%]">
        {/* <p className="text-[23px] mt-[50px]">Create reports or updates</p> */}
        <p class="text-[25px] text-start mr-[5px] text-[#fff] mt-[50px] font-normal">
          Latest or ongoing events, reports or updates
        </p>
        <div className="mt-[30px] h-fit flex flex-wrap w-fit">
          {posts.map((item) => {
            return (
              <div
                key={item.id}
                className="mr-[30px] bg-[#1F1F1F] pb-[30px] rounded-lg h-fit w-[394px] mb-[40px]"
              >
                <img
                  src={item.img}
                  alt="postImg"
                  className="w-[445px] rounded-lg"
                />
                <p className="text-[#fff] mt-[25px] text-[22px] mx-[20px]">
                  {item.title}
                </p>
                <p className="text-[#BBBBBB] mt-[7px] text-[17px] mx-[20px]">
                  {item.summary}
                </p>
                <hr className="my-[20px] mx-[20px] bg-gray-200" />
                <p className="text-[#9A9A9A] mt-[7px] text-[17px] mx-[20px]">
                  Posted by - {item.madeBy}
                </p>
              </div>
            );
          })}
        </div>
        {isLoading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "150px",
            }}
          >
            <CircularProgress />
          </Box>
        )}
      </div>
    </div>
  );
}

export default Home;
