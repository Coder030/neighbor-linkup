/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { io } from "socket.io-client";
import "./globals.css";
import { AiOutlineCaretUp, AiOutlineCaretDown } from "react-icons/ai";
import list from "./list.json";

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
  const [isOpen, setIsOpen] = useState(false);

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
  

  const [sortAs, setSortAs] = useState(0);

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
        const isSortDescOrder = sortAs === 1;
        if (isSortDescOrder) {
         
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        } else {
          
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
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
            <div
              className=" text-[25px] text-[#fff] float-right me-auto cursor-pointer ml-[4%] font-bols , heading"
              onClick={() => {
                router.push("/");
              }}
            >
              Neighbour Linkup
            </div>
            <div className="bg-[#1B1B1B] flex items-center w-[324px] px-2 rounded-lg focus:z-[3] focus:border-2 focus:shadow-inset focus:outline-none motion-reduce:transition-none">
              <div>
                <svg
                  width="19"
                  height="20"
                  viewBox="0 0 19 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14.2742 13.5547L17.6649 16.9446L16.5447 18.0648L13.1548 14.6741C11.8935 15.6853 10.3246 16.2352 8.70801 16.2329C4.77501 16.2329 1.58301 13.0409 1.58301 9.10791C1.58301 5.17491 4.77501 1.98291 8.70801 1.98291C12.641 1.98291 15.833 5.17491 15.833 9.10791C15.8353 10.7245 15.2853 12.2934 14.2742 13.5547ZM12.6861 12.9673C13.6906 11.9339 14.2517 10.549 14.2497 9.10791C14.2497 6.04654 11.7694 3.56624 8.70801 3.56624C5.64663 3.56624 3.16634 6.04654 3.16634 9.10791C3.16634 12.1693 5.64663 14.6496 8.70801 14.6496C10.1491 14.6516 11.534 14.0905 12.5674 13.086L12.6861 12.9673Z"
                    fill="white"
                  />
                </svg>
              </div>
              <input
                type="search"
                class="flex relative w-full m-0 flex-auto rounded bg-transparent bg-clip-padding px-3 py-[0.5rem] text-[16px] font-normal leading-[1.9] text-surface outline-none transition duration-200 ease-in-out text-white text-nowrap"
                placeholder="Search for reports/events"
                aria-label="Search"
                value={searchQuery}
                onChange={({ target }) => setSearchQuery(target.value)}
              />
              <div className="bg-[#2f2f2f] h-[35px] w-[45px] flex items-center justify-center">
                <svg
                  width="6"
                  height="14"
                  viewBox="0 0 6 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.88 13.2442C1.82667 13.3829 1.752 13.4842 1.656 13.5482C1.57067 13.6122 1.46933 13.6442 1.352 13.6442C1.23467 13.6442 1.128 13.6122 1.032 13.5482C0.946667 13.4949 0.882667 13.4149 0.84 13.3082C0.797333 13.2015 0.797333 13.0789 0.84 12.9402L4.648 1.13219C4.70133 0.993528 4.776 0.892194 4.872 0.828195C4.968 0.764195 5.06933 0.732195 5.176 0.732195C5.29333 0.732195 5.39467 0.764195 5.48 0.828195C5.576 0.881528 5.64 0.961528 5.672 1.06819C5.71467 1.17486 5.71467 1.29753 5.672 1.43619L1.88 13.2442Z"
                    fill="#7D7D7D"
                  />
                </svg>
              </div>
            </div>
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
          <div className="flex flex-col lg:flex-row lg:justify-between">
            <div class="display:flex text-[25px] text-start mr-[5px] text-[#fff] font-normal">
              Latest or ongoing events, reports or updates
            </div>

            <div className="flex gap-4  flex-row">
              <p className="text-[#9A9A9A] mt-3 text-[15px] font-[400] leading-[20.46px]">
                Sort by :
              </p>
              <div className="relative flex flex-col items-center h-auto min-h-[200px] rounded-lg">
                <button
                  onClick={() => setIsOpen((prev) => !prev)}
                  className="border border-[#2f2f2f] bg-transparent w-[165px] max-h-[40px] p-4 w-full flex items-center justify-between font-bold text-lg rounded-lg trcking-wider active:border-white duration-300 active:text-white"
                >
                  <p className="text-white text-[15px] font-[400] leading-[20.46px]">
                    {sortAs === 0 ? "New to Old" : "Old to New"}
                  </p>
                  <svg
                    width="28"
                    height="26"
                    viewBox="0 0 28 26"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clip-path="url(#clip0_1183_16)">
                      <path
                        d="M8.59755 14.0149L13.6828 18.4537L18.9259 13.2106L20.0559 14.197L13.6477 20.6052L7.43242 15.18L8.59755 14.0149ZM8.68525 8.63608L13.7705 13.0749L19.0136 7.83178L20.1436 8.81818L13.7354 15.2264L7.52012 9.80121L8.68525 8.63608Z"
                        fill="#878787"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_1183_16">
                        <rect
                          width="19.7729"
                          height="18"
                          fill="white"
                          transform="matrix(-0.707107 0.707107 -0.753368 -0.657599 27.543 12.0029)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                </button>
                {isOpen && (
                  <div className="absolute mt-10 flex flex-col items-start rounded-lg p-2 w-full bg-slate-500">
                    {list.map((item, i) => (
                      
                      <div
                        onClick={() => {
                          setSortAs(item.value);
                          
                          setIsOpen(false);
                        }}
                        className="flex w-full justify-between p-4 cursor-pointer rounded-r-lg border-l-transparent border-l-3"
                        key={i}
                      >
                        <p className="text-white text-[15px] font-[400] leading-[20.46px]">
                          {item.sortAs}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2"></div>
        </div>

        <div className="slider-container">
          <Slider {...settings} dots={false} arrows={false}>
            {sliders}
          </Slider>
        </div>
      </div>
    </>
  );
}

export default Home;
