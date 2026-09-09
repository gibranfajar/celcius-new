"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setToken, setUser } from "@/redux/authSlice";
import { login } from "@/lib/api";
import { getErrorMessage } from "@/lib/api/client";

export default function Login() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await login({ email, password });
      dispatch(setToken(response.token));
      dispatch(setUser(response.user));

      toast.success("Login Success!");
      router.push("/dashboard");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 md:p-6 seccond-font">
      <div className="w-full max-w-4xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-zinc-200">
        {/* Left - Login */}
        <div className="p-4 md:p-12 flex flex-col justify-center">
          <h1 className="text-2xl font-semibold mb-4 text-center">LOGIN</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                    bg-white px-1
                    text-sm text-gray-500
                    transition-all duration-200 ease-out

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
                  text-sm text-gray-500
                  transition-all duration-200 ease-out

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
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 cursor-pointer"
                aria-pressed={showPassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col items-center space-y-3 pt-2">
              <span className="text-sm">
                Forgot password?{" "}
                <Link href="/reset-password" className="underline hover:text-black">
                  Click here!
                </Link>
              </span>

              <button
                type="submit"
                disabled={isLoading}
                className="text-sm bg-black text-white py-2 px-4 w-1/2 hover:bg-white hover:text-black hover:border hover:border-black transition duration-300 ease-in-out cursor-pointer disabled:opacity-50"
              >
                {isLoading ? "Loading..." : "LOGIN"}
              </button>
            </div>
          </form>
        </div>

        {/* Right - Register Info */}
        <div className="p-4 md:p-12 space-y-4 flex flex-col justify-center items-center text-center bg-zinc-50 border-t border-zinc-200 md:border-t-0 md:border-l">
          <h2 className="text-2xl font-semibold mb-3">NEW USER</h2>
          <p className="text-sm text-center">
            If you still don't have a Clcs.co.id account, use this option to
            access the registration form.
          </p>
          <p className="text-sm text-center">
            If you provide us with details, you will have a fast and enjoyable
            shopping experience at Clcs.co.id.
          </p>
          <Link
            href="/register"
            className="text-center text-sm bg-black text-white hover:text-black py-2 px-4 w-1/2 cursor-pointer hover:bg-white hover:border-black hover:border transition duration-300 ease-in-out"
          >
            CREATE AN ACCOUNT
          </Link>
        </div>
      </div>
    </div>
  );
}
