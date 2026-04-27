"use client";

import { useState } from "react";
import { CalendarDays, Eye, EyeOff, Gift, Percent } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function Register() {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${BASE_URL}register`, {
        name,
        phone,
        email,
        password,
      });

      if (response.status === 201) {
        toast.success("Registration successful!");
        router.push("/login");
      }
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        console.error("Terjadi kesalahan:", error.message);
      }
    }
  };

  return (
    <div className="flex items-center justify-center px-4 md:p-6 seccond-font">
      <div className="w-full overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left - Login */}
        <div className="p-4 md:p-12 flex flex-col justify-center">
          <h1 className="text-2xl font-semibold mb-4 text-center">REGISTER</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* FULL NAME */}
            <div className="relative">
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder=" "
                className="peer w-full border-b border-gray-300 bg-transparent py-2
                 focus:border-black focus:outline-none"
              />
              <label
                htmlFor="name"
                className="
                    absolute left-0 top-2
                    text-sm text-gray-500 transition-all duration-200 ease-out

                    peer-focus:-top-3
                    peer-focus:text-xs
                    peer-focus:text-black

                    peer-not-placeholder-shown:-top-3
                    peer-not-placeholder-shown:text-xs
                    peer-not-placeholder-shown:text-black
                  "
              >
                Full Name
              </label>
            </div>

            {/* PHONE */}
            <div className="relative">
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder=" "
                className="peer w-full border-b border-gray-300 bg-transparent py-2
                 focus:border-black focus:outline-none"
              />
              <label
                htmlFor="phone"
                className="
                    absolute left-0 top-2
                    text-sm text-gray-500 transition-all duration-200 ease-out

                    peer-focus:-top-3
                    peer-focus:text-xs
                    peer-focus:text-black

                    peer-not-placeholder-shown:-top-3
                    peer-not-placeholder-shown:text-xs
                    peer-not-placeholder-shown:text-black
                  "
              >
                Phone Number
              </label>
            </div>

            {/* EMAIL */}
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder=" "
                className="peer w-full border-b border-gray-300 bg-transparent py-2
                 focus:border-black focus:outline-none"
              />
              <label
                htmlFor="email"
                className="
                    absolute left-0 top-2
                    text-sm text-gray-500 transition-all duration-200 ease-out

                    peer-focus:-top-3
                    peer-focus:text-xs
                    peer-focus:text-black

                    peer-not-placeholder-shown:-top-3
                    peer-not-placeholder-shown:text-xs
                    peer-not-placeholder-shown:text-black
                  "
              >
                Email
              </label>
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder=" "
                className="peer w-full border-b border-gray-300 bg-transparent py-2 pr-10
                 focus:border-black focus:outline-none"
              />
              <label
                htmlFor="password"
                className="
                    absolute left-0 top-2
                    text-sm text-gray-500 transition-all duration-200 ease-out

                    peer-focus:-top-3
                    peer-focus:text-xs
                    peer-focus:text-black

                    peer-not-placeholder-shown:-top-3
                    peer-not-placeholder-shown:text-xs
                    peer-not-placeholder-shown:text-black
                  "
              >
                Password
              </label>

              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* SUBMIT */}
            <div className="flex flex-col items-center space-y-4 pt-4">
              <div className="flex items-center gap-2 text-xs">
                <input type="checkbox" required />
                <p>
                  I have read and understand the{" "}
                  <Link href="/privacy-policy" className="underline">
                    Privacy and Cookies Policy
                  </Link>
                </p>
              </div>

              <button
                type="submit"
                className="text-sm bg-black text-white py-2 px-4 w-1/2
                 hover:bg-white hover:text-black hover:border hover:border-black
                 transition duration-300 cursor-pointer"
              >
                CREATE ACCOUNT
              </button>
            </div>
          </form>
        </div>

        {/* Right - Register Info */}
        <div className="p-4 space-y-4 flex flex-col mt-12">
          <h2 className="mb-6">Register make you special</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <Gift size={16} />
              Exclusive gifts
            </li>
            <li className="flex items-center gap-2">
              <CalendarDays size={16} />
              Special event invites
            </li>
            <li className="flex items-center gap-2">
              <Percent size={15} />
              Sale previews
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
