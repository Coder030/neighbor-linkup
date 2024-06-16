"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./style.css";
import { EyeIcon, EyeOffIcon } from "@heroicons/react/solid";
import Img from "../../app/authImg.png";

function Page() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [emp, setEmp] = useState(false);
  const [nf, setNf] = useState(false);
  const [f, setF] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleClick = async () => {
    setLoading(true);
    setNf(false);
    setF(false);
    setEmp(false);
    if (username === "" || password === "") {
      setLoading(false);
      setEmp(true);
      setNf(false);
      return false;
    } else {
      setEmp(false);
      const response = await fetch("http://localhost:2000/get_cookie", {
        method: "POST",
        body: JSON.stringify({ name: username, password: password }),
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data["data"] === "nf") {
        setLoading(false);
        setNf(true);
        return false;
      } else {
        setF(true);
        setNf(false);
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
              className="w-[50%] bg-[#373737] py-[7px] rounded-lg"
              onClick={() => {
                router.push("/signin");
              }}
            >
              Sign in
            </button>
            <button
              className="text-[#9F9F9F] w-[50%] py-[7px] rounded-lg"
              onClick={() => {
                router.push("/signup");
              }}
            >
              Sign up
            </button>
          </div>
          <p className="ml-[20%] mt-[40px] text-[27px]">Sign in </p>
          <p className="ml-[20%] mt-[0px] text-[15px]">
            Sign In to your account.
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
          {nf && (
            <p className="text-[#ff0000] ml-[20%] mt-[40px]">
              This doesn{`'`}t match. Please try again?
            </p>
          )}
          {f && (
            <p className="text-[#44ff00] ml-[20%] mt-[40px]">
              Success! The user has been found!
            </p>
          )}
          {loading && <p className="ml-[20%] mt-[40px]">Loading...</p>}
        </div>
      </div>
    </div>
  );
}

export default Page;
