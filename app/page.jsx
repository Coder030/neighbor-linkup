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
    if (posts.length === 0 && posts) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
        setShowMessage(true);
      }, 5000);
      return () => {
        clearTimeout(timer); // This will clear the timeout if the component unmounts before the timeout finishes
        setIsLoading(false);
      };
    }
  }, [posts]);
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
                router.push("/create");
              }}
            >
              Post +
            </button>
            <button className="lg:text-[20px] md:text-[17px] text-[13px]"></button>
          </div>
        </div>
      </div>
      <div className="mx-[5%]">
        {/* <p className="text-[23px] mt-[50px]">Create reports or updates</p> */}
        <p class="text-[25px] text-center mr-[5px] text-[#008080] mt-[50px] font-bold">
          Welcome to Neighbour Linkup!
        </p>
        <div className="flex justify-center">
          <Link
            className="text-[25px] text-center mr-[5px] text-[#adeb21] mt-[5px] underline font-bold cursor-pointer"
            href={`/create`}
          >
            What's in your mind right now, {me["username"]}?
          </Link>
        </div>
        {posts.map((item) => {
          return (
            <div
              key={item.id}
              className="max-w-md mx-auto bg-gray-100 rounded-xl shadow-2xl overflow-hidden md:max-w-2xl m-3 transform transition duration-500 ease-in-out hover:scale-105 mt-10"
            >
              <div className="">
                <div className="md:flex-shrink-0">
                  <img
                    className="h-full w-full object-cover"
                    src={item.img}
                    alt={item.title}
                  />
                </div>
                <div className="p-8">
                  <div className="flex space-x-1.5 mb-[10px]">
                    <div className="uppercase tracking-wide text-xs text-blue-800 font-bold">
                      {item.madeBy}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(item.createdAt))} ago
                    </div>
                  </div>
                  <a
                    href="#"
                    className="block mt-1 text-2xl leading-tight font-bold text-gray-900 hover:text-blue-800"
                  >
                    {item.title}
                  </a>
                  <p className="mt-2 text-base text-gray-700">{item.summary}</p>
                  <p className="mt-2 text-base text-gray-700">{item.details}</p>
                </div>
              </div>
            </div>
          );
        })}
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
        {showMessage && (
          <div className="flex justify-center">
            <p className="text-[20px] mr-[10px]">
              No post yet! Why don't you create one?
            </p>
            <Link href="/create" className="text-[20px] text-[#0000F5]">
              Create?
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
