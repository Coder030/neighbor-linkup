"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import "./style.css";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeOffIcon } from "@heroicons/react/solid";
import Img from "../../app/authImg.png";

function Page() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [emp, setEmp] = useState(false);
  const [same, setSame] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suc, setSuc] = useState(false);
  const handleClick = async () => {
    setLoading(true);
    setSuc(false);
    setSame(false);
    setEmp(false);
    if (username === "" || password === "") {
      setLoading(false);
      setEmp(true);
      return false;
    } else {
      setEmp(false);
      const response = await fetch("http://localhost:2000/make_cookie", {
        method: "POST",
        body: JSON.stringify({ name: username, password: password }),
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (data["message"] === "same") {
        setLoading(false);
        setSame(true);
        setSuc(false);
      } else {
        setSame(false);
        setSuc(true);
        setTimeout(() => {
          router.push("/");
        }, 1000);
      }
    }
    setLoading(false);
  };
  return (
    <div className="">
      <div className="p-[30px] bg-[#262626] border-b-[2px] border-[#333333] sticky right-0 top-0">
        <div className="flex items-center">
          <p
            className="text-[20px] text-[#fff] float-right me-auto cursor-pointer ml-[2%] font-bold"
            onClick={() => {
              router.push("/");
            }}
          >
            Neighbour Linkup
          </p>
        </div>
      </div>
      <div className="flex bg-[#262626]">
        <img src={Img.src} alt="authImg" className="w-[50%]" />
        <div className="text-[#fff]">
          <div className="flex w-[500px] bg-[#2E2E2E] px-[10px] py-[7px] rounded-lg mt-[40px] h-[60px] ml-[20%]">
            <button
              className="text-[#9F9F9F] w-[50%] py-[7px] rounded-lg"
              onClick={() => {
                router.push("/signin");
              }}
            >
              Sign in
            </button>
            <button
              className=" w-[50%] bg-[#373737] py-[7px] rounded-lg"
              onClick={() => {
                router.push("/signup");
              }}
            >
              Sign up
            </button>
          </div>
          <p className="ml-[20%] mt-[40px] text-[27px]">Sign up</p>
          <p className="ml-[20%] mt-[0px] text-[15px]">
            Sign up to create an account on Neighbour Linkup
          </p>
          <div className="flex flex-col w-[500px] bg-[#2E2E2E] px-[10px] py-[10px] rounded-lg mt-[40px] ml-[20%]">
            <p className="text-[#777777]">Full name</p>
            <input
              placeholder="Enter your full name"
              onChange={(e) => {
                setUsername(e.target.value);
              }}
              value={username}
              className="bg-[#2E2E2E] focus:outline-none text-[#fff] mt-[7px]"
            />
          </div>
          <div className="flex flex-col w-[500px] bg-[#2E2E2E] px-[10px] py-[10px] rounded-lg mt-[20px] ml-[20%]">
            <p className="text-[#777777]">Password</p>
            <div className="relative">
              <input
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                type={showPassword ? "text" : "password"}
                className="bg-[#2E2E2E] focus:outline-none text-[#fff] mt-[7px] pr-[24px]"
              />
              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </div>
          </div>
          <div
            className="flex w-[500px] bg-[#4588AE] rounded-lg mt-[40px] h-[fit] py-[10px] ml-[20%] justify-center items-center"
            onClick={handleClick}
          >
            Sign in
          </div>
          {emp && (
            <p className="text-[#ff0000] ml-[20%] mt-[40px]">Empty request</p>
          )}
          {/* {nf && (
            <p className="text-[#ff0000] ml-[20%] mt-[40px]">
              This doesn{`'`}t match. Please try again?
            </p>
          )} */}
          {suc && (
            <p className="text-[#44ff00] ml-[20%] mt-[40px]">
              You have successfully registered to Neighbour Linkup!
            </p>
          )}
          {same && (
            <p className="text-[#ff0000] ml-[20%] mt-[40px]">
              You have already registered. Please sign in to continue.
            </p>
          )}
          {loading && <p className="ml-[20%] mt-[40px]">Loading...</p>}
        </div>
      </div>
    </div>
  );
}

export default Page;
