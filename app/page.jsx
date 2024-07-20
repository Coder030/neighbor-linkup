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


  // progress bar
  const [progress, setProgress] = useState(30);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev < 100 ? prev + 1 : prev))
    }, 100)

    return () => clearInterval(interval)
  }, [])

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
                  className="border border-[#2f2f2f] bg-transparent w-[165px] max-h-[40px] p-4  flex items-center justify-between font-bold text-lg rounded-lg trcking-wider active:border-white duration-300 active:text-white"
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



           {/* my changes */}
        <div className="relative z-10 w-5/6">
          <div className="relative rounded-lg">
            <img
              className="absolute -z-10 top-0 left-0" 
              src="/art-bg.png" alt="art background" />

            <img
              className="absolute -z-10 top-0 left-0" 
              src="/bg-gradient.png" alt="" />
          </div>       

          <div className="text-[20px] text-[#E1FFF6] bg-[#ABA9A9] w-max px-6 py-3 rounded-br-lg bg-opacity-30">EVENTS TODAY</div>


          {/* image container starts here */}
          <div className="mt-[6rem] px-10 flex items-center gap-10">
            <div className="bg-gradient-to-b relative z-10 from-[#a3a3a35b] to-[#0000002c] rounded-lg w-max p-2">

              <div className="absolute w-[90%] h-full -z-20 -top-3 left-[50%] translate-x-[-50%] bg-gradient-to-b from-[#a3a3a336] to-[#0000002c] rounded-lg"></div>

              <button className="p-3 rounded-b-lg bg-[#1f1f1f] absolute top-0 left-[1.5rem] z-0">
                <svg
                  width="21"
                  height="21"
                  viewBox="0 0 21 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.39844 3.28125C8.09238 3.28125 9.57551 4.00969 10.5 5.24098C11.4245 4.00969 12.9076 3.28125 14.6016 3.28125C15.95 3.28277 17.2427 3.8191 18.1962 4.77257C19.1497 5.72604 19.686 7.01878 19.6875 8.36719C19.6875 14.1094 11.1735 18.7573 10.8109 18.9492C10.7153 19.0006 10.6085 19.0275 10.5 19.0275C10.3915 19.0275 10.2847 19.0006 10.1891 18.9492C9.82652 18.7573 1.3125 14.1094 1.3125 8.36719C1.31402 7.01878 1.85035 5.72604 2.80382 4.77257C3.75728 3.8191 5.05003 3.28277 6.39844 3.28125ZM10.5 17.6203C11.9979 16.7475 18.375 12.7714 18.375 8.36719C18.3737 7.36681 17.9757 6.40778 17.2683 5.7004C16.561 4.99303 15.6019 4.59505 14.6016 4.59375C13.0061 4.59375 11.6665 5.44359 11.107 6.80859C11.0576 6.92896 10.9735 7.03191 10.8654 7.10436C10.7573 7.17681 10.6301 7.21549 10.5 7.21549C10.3699 7.21549 10.2427 7.17681 10.1346 7.10436C10.0265 7.03191 9.94241 6.92896 9.89297 6.80859C9.33352 5.44113 7.99395 4.59375 6.39844 4.59375C5.39806 4.59505 4.43903 4.99303 3.73165 5.7004C3.02428 6.40778 2.6263 7.36681 2.625 8.36719C2.625 12.7649 9.00375 16.7467 10.5 17.6203Z" fill="#858585"/>
                  </svg>
              </button>
            
            
             <div>
              <img
                width={245}
                height={245}
                src="/art-image.png" alt="" />
             </div>
            </div>


            {/* details col */}

            <div className="w-3/5">
              <div className="text-white text-[26px] font-bold">Art Competition 2030 2.0</div>

              <div className="flex items-center gap-8">
                <p className="text-[#737373] text-[12px]">2 hrs 47 min</p>

                <div className="my-6 w-3/6 h-2 bg-gray-800 rounded">
                  <div
                    className="h-full bg-gradient-to-r from-gray-200 via-[#E0FFF671] to-gray-800 rounded"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                <p className="text-[#737373] text-[12px]">50 min elapsed</p>
              </div>

              
              {/* time/location/date */}

              <div className="flex lg:items-center lg:flex-row gap-4 flex-col ">
                <div className="flex items-center gap-2 leading-none text-[13px] text-white p-3 px-6 bg-[#1B1B1BC9] rounded-full w-max">
                  
                <div>
                <svg width="21" height="22" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_2524_526)">
                <path d="M18.812 3.6665H16.9162V4.88873H18.6662V18.3332H2.33283V4.88873H4.08283V3.6665H2.187C2.05064 3.66889 1.91606 3.6994 1.79095 3.75628C1.66585 3.81316 1.55267 3.89531 1.45787 3.99803C1.36307 4.10074 1.28852 4.22202 1.23847 4.35492C1.18842 4.48783 1.16385 4.62976 1.16617 4.77261V18.4493C1.16385 18.5921 1.18842 18.7341 1.23847 18.867C1.28852 18.9999 1.36307 19.1212 1.45787 19.2239C1.55267 19.3266 1.66585 19.4087 1.79095 19.4656C1.91606 19.5225 2.05064 19.553 2.187 19.5554H18.812C18.9484 19.553 19.0829 19.5225 19.208 19.4656C19.3331 19.4087 19.4463 19.3266 19.5411 19.2239C19.6359 19.1212 19.7105 18.9999 19.7605 18.867C19.8106 18.7341 19.8351 18.5921 19.8328 18.4493V4.77261C19.8351 4.62976 19.8106 4.48783 19.7605 4.35492C19.7105 4.22202 19.6359 4.10074 19.5411 3.99803C19.4463 3.89531 19.3331 3.81316 19.208 3.75628C19.0829 3.6994 18.9484 3.66889 18.812 3.6665Z" fill="#484848"/>
                <path d="M4.66602 8.55518H5.83268V9.7774H4.66602V8.55518Z" fill="#484848"/>
                <path d="M8.16797 8.55518H9.33464V9.7774H8.16797V8.55518Z" fill="#484848"/>
                <path d="M11.668 8.55518H12.8346V9.7774H11.668V8.55518Z" fill="#484848"/>
                <path d="M15.166 8.55518H16.3327V9.7774H15.166V8.55518Z" fill="#484848"/>
                <path d="M4.66602 11.6108H5.83268V12.8331H4.66602V11.6108Z" fill="#484848"/>
                <path d="M8.16797 11.6108H9.33464V12.8331H8.16797V11.6108Z" fill="#484848"/>
                <path d="M11.668 11.6108H12.8346V12.8331H11.668V11.6108Z" fill="#484848"/>
                <path d="M15.166 11.6108H16.3327V12.8331H15.166V11.6108Z" fill="#484848"/>
                <path d="M4.66602 14.6665H5.83268V15.8887H4.66602V14.6665Z" fill="#484848"/>
                <path d="M8.16797 14.6665H9.33464V15.8887H8.16797V14.6665Z" fill="#484848"/>
                <path d="M11.668 14.667H12.8346V15.8892H11.668V14.667Z" fill="#484848"/>
                <path d="M15.166 14.6665H16.3327V15.8887H15.166V14.6665Z" fill="#484848"/>
                <path d="M5.83333 6.11106C5.98804 6.11106 6.13642 6.04667 6.24581 5.93207C6.35521 5.81746 6.41667 5.66202 6.41667 5.49995V1.83328C6.41667 1.6712 6.35521 1.51576 6.24581 1.40116C6.13642 1.28655 5.98804 1.22217 5.83333 1.22217C5.67862 1.22217 5.53025 1.28655 5.42085 1.40116C5.31146 1.51576 5.25 1.6712 5.25 1.83328V5.49995C5.25 5.66202 5.31146 5.81746 5.42085 5.93207C5.53025 6.04667 5.67862 6.11106 5.83333 6.11106Z" fill="#484848"/>
                <path d="M15.1654 6.11106C15.3201 6.11106 15.4684 6.04667 15.5778 5.93207C15.6872 5.81746 15.7487 5.66202 15.7487 5.49995V1.83328C15.7487 1.6712 15.6872 1.51576 15.5778 1.40116C15.4684 1.28655 15.3201 1.22217 15.1654 1.22217C15.0107 1.22217 14.8623 1.28655 14.7529 1.40116C14.6435 1.51576 14.582 1.6712 14.582 1.83328V5.49995C14.582 5.66202 14.6435 5.81746 14.7529 5.93207C14.8623 6.04667 15.0107 6.11106 15.1654 6.11106Z" fill="#484848"/>
                <path d="M7.58203 3.6665H13.4154V4.88873H7.58203V3.6665Z" fill="#484848"/>
                </g>
                <defs>
                <clipPath id="clip0_2524_526">
                <rect width="21" height="22" fill="white"/>
                </clipPath>
                </defs>
                </svg>

                </div>

                  <span>24/07/2024</span>
                </div>
                
                <div className="flex items-center gap-2 leading-none text-[13px] text-white p-3 px-6 bg-[#1B1B1BC9] rounded-full w-max">
                  <div>
                    <svg width="13" height="18" viewBox="0 0 13 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.5 9C5.60625 9 4.875 8.235 4.875 7.3C4.875 6.365 5.60625 5.6 6.5 5.6C7.39375 5.6 8.125 6.365 8.125 7.3C8.125 8.235 7.39375 9 6.5 9ZM11.375 7.47C11.375 4.3845 9.22188 2.2 6.5 2.2C3.77813 2.2 1.625 4.3845 1.625 7.47C1.625 9.459 3.20937 12.094 6.5 15.239C9.79063 12.094 11.375 9.459 11.375 7.47ZM6.5 0.5C9.9125 0.5 13 3.237 13 7.47C13 10.292 10.8306 13.6325 6.5 17.5C2.16937 13.6325 0 10.292 0 7.47C0 3.237 3.0875 0.5 6.5 0.5Z" fill="#484848"/>
                    </svg>


                  </div>
                  <span>Soel Stadium, South Korea</span>
                </div>

                <div className="flex items-center gap-2 leading-none text-[13px] text-white p-3 px-6 bg-[#1B1B1BC9] rounded-full w-max">
                  
                  <div>
                  <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.5 1.96875C8.81268 1.96875 7.16325 2.4691 5.7603 3.40652C4.35734 4.34395 3.26387 5.67635 2.61816 7.23523C1.97245 8.79411 1.8035 10.5095 2.13268 12.1644C2.46186 13.8193 3.27438 15.3394 4.4675 16.5325C5.66062 17.7256 7.18074 18.5381 8.83564 18.8673C10.4905 19.1965 12.2059 19.0276 13.7648 18.3818C15.3237 17.7361 16.6561 16.6427 17.5935 15.2397C18.5309 13.8368 19.0313 12.1873 19.0313 10.5C19.0289 8.2381 18.1293 6.06954 16.5299 4.47013C14.9305 2.87073 12.7619 1.97114 10.5 1.96875ZM10.5 17.7188C9.07227 17.7188 7.6766 17.2954 6.48948 16.5022C5.30236 15.709 4.37712 14.5816 3.83075 13.2625C3.28438 11.9434 3.14142 10.492 3.41996 9.09169C3.6985 7.69139 4.38602 6.40513 5.39558 5.39557C6.40514 4.38601 7.6914 3.69849 9.0917 3.41996C10.492 3.14142 11.9434 3.28437 13.2625 3.83074C14.5816 4.37711 15.709 5.30236 16.5022 6.48948C17.2954 7.67659 17.7188 9.07227 17.7188 10.5C17.7166 12.4139 16.9553 14.2487 15.602 15.602C14.2487 16.9553 12.4139 17.7166 10.5 17.7188ZM15.75 10.5C15.75 10.674 15.6809 10.841 15.5578 10.964C15.4347 11.0871 15.2678 11.1562 15.0938 11.1562H10.5C10.326 11.1562 10.159 11.0871 10.036 10.964C9.91289 10.841 9.84375 10.674 9.84375 10.5V5.90625C9.84375 5.7322 9.91289 5.56528 10.036 5.44221C10.159 5.31914 10.326 5.25 10.5 5.25C10.6741 5.25 10.841 5.31914 10.964 5.44221C11.0871 5.56528 11.1563 5.7322 11.1563 5.90625V9.84375H15.0938C15.2678 9.84375 15.4347 9.91289 15.5578 10.036C15.6809 10.159 15.75 10.326 15.75 10.5Z" fill="#484848"/>
                  </svg>

                  </div>
                  
                  <span>4 - 6 pm</span>
                </div>
              </div>

              {/* divider */}
              <div className="w-full h-[1px] bg-[#1D1D1D] my-6"></div>

              <div className="flex items-center gap-4">
                <button className="flex items-center text-white bg-[#418772] p-2 px-4 rounded-lg gap-4">
                  Event details
                
                  <div className="p-2 bg-[#2A6B58] rounded-lg">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.00171 10.3362L9.84867 5.92902L5.34086 1.42121L6.19574 0.441836L11.7053 5.95138L7.00345 11.338L6.00171 10.3362ZM1.36018 10.2803L5.20714 5.87313L0.69933 1.36532L1.55421 0.385946L7.06375 5.89549L2.36191 11.2821L1.36018 10.2803Z" fill="#fff"/>
                    </svg>
                  </div>
                </button>

                <div className="p-[.9rem] bg-[#1B1B1BC9] rounded-lg">
                  <svg width="17" height="14" viewBox="0 0 17 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 7.2002L10 1.2002V4.2002C7 4.2002 1 6.0002 1 13.2002C1 12.1999 2.8 10.2002 10 10.2002V13.2002L16 7.2002Z" stroke="#6D6C6C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>

                </div>
              </div>

              


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
