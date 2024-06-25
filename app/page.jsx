/* eslint-disable react/no-unescaped-entities */
"use client";

import React, {  useEffect, useMemo, useRef, useState } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { io } from "socket.io-client";
import "./globals.css";

import { useRouter } from "next/navigation";
import { getDistance } from "geolib";

function Home() {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
  };

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

  const [lat, lon] = useMemo(() => {
    if (location) {
      return [location.latitude, location.longitude];
    }
    return [null, null];
  }, [location]);

  const [me, setMe] = useState({});
  const router = useRouter();
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);
  const [sortByTime, toggleSortByTime] = useState(false);
  const [searchQuery, setSearchQuery] = useState(null);

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
        // router.push("/signin");
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

  const sortedPostsInclDistance = useMemo(() => {
    return posts
      .reduce((result, post) => {
        if (
          !searchQuery ||
          post.title.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          const distance =
            lat && lon && post.Lat && post.Long
              ? getDistance(
                  { latitude: lat, longitude: lon },
                  { latitude: post.Lat, longitude: post.Long }
                )
              : null;

          result.push({
            ...post,
            distance,
          });
        }

        return result;
      }, [])
      .sort((a, b) => {
        if (sortByTime) {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        } else {
          return (b.distance ?? Infinity) - (a.distance ?? Infinity);
        }
      });
  }, [posts, searchQuery, sortByTime, lat, lon]);

  const sliders = sortedPostsInclDistance.map((item) => {
    return (
      <div
        key={item.id}
        className="mr-[100px] bg-[#1F1F1F] pb-[30px] rounded-lg h-[543px] w-[30.9%] mb-[40px]"
      >
        <img src={item.img} alt="postImg" className="w-[445px] rounded-lg" />
        <div className="flex justify-between items-center mt-4">
          <p className="text-[#fff] text-[22px] mx-[20px]">{item.title}</p>
          {item.distance && (
            <p className="text-[#fff]">
              {(item.distance / 1000).toFixed(3)} km
            </p>
          )}
        </div>
        <p className="text-[#BBBBBB] mt-[7px] text-[17px] mx-[20px]">
          {item.summary}
        </p>
        <hr className="my-[20px] mx-[20px] bg-gray-200" />
        <p className="text-[#9A9A9A] mt-[7px] text-[17px] mx-[20px]">
          Posted by - {item.madeBy}
        </p>
      </div>
    );
  });

  return (
    <>
      <div className="bg-[#191919] pb-[0px] h-fit">
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
                Create Event
              </button>
              <button
                className="mr-[20px] text-[20px] text-[#C2C2C2] p-[10px] cursor-pointer"
                onClick={() => {
                  router.push("/");
                }}
                >
                  Create Event
                </button>
                <button
                  className="mr-[20px] text-[20px] text-[#C2C2C2] p-[10px] cursor-pointer"
                  onClick={() => {
                    router.push("/");
                  }}
                >
                  Create Report / Update
                </button>
                <button className="lg:text-[20px] md:text-[17px] text-[13px]"></button>
              </div>
            </div>
          </div>
          <div className="mx-[5%] flex flex-col gap-4 py-7">
            <div className="flex flex-col lg:flex-row lg:justify-between items-center">
              <p class="text-[25px] text-start mr-[5px] text-[#fff] font-normal">
                Latest or ongoing events, reports or updates
              </p>
              <div className="grid grid-cols-2 items-center gap-4">
                <div class="relative flex">
                  <input
                    type="search"
                    class="relative m-0 block flex-auto rounded border border-solid border-neutral-200 bg-transparent bg-clip-padding px-3 py-[0.25rem] text-base font-normal leading-[1.6] text-surface outline-none transition duration-200 ease-in-out text-white focus:z-[3] focus:border-2 focus:shadow-inset focus:outline-none motion-reduce:transition-none"
                    placeholder="Search"
                    aria-label="Search"
                    value={searchQuery}
                    onChange={({ target }) => setSearchQuery(target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <label htmlFor="sort-by-time" className="text-white">
                    Show recently created event
                  </label>
                  <input
                    id="sort-by-time"
                    type="checkbox"
                    checked={sortByTime}
                    onClick={() => toggleSortByTime((prev) => !prev)}
                    className="h-7 w-7"
                  />
                </div>{" "}
              </div>
            </div>
            <div className="slider-container">
              <Slider {...settings} dots={false} arrows={false}>
                {sliders}
              </Slider>
            </div>
          </div>
        </div>
      </>
    );
  }
  
  export default Home;
  