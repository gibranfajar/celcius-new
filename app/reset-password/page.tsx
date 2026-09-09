"use client";

import React, { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { forgotPassword, resetPassword } from "@/lib/api";
import { getErrorMessage } from "@/lib/api/client";

export default function ResetPassword() {
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { message } = await forgotPassword(email);
      toast.success(message);
      setStep("reset");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { message } = await resetPassword({
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });
      toast.success(message);
      setStep("request");
      setToken("");
      setPassword("");
      setPasswordConfirmation("");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-6">
      <div className="mx-auto max-w-md pt-24">
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold mb-3">Reset your password</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            {step === "request"
              ? "Enter the email address associated with your account. We'll send you a code to reset your password."
              : "Enter the code we sent to your email along with your new password."}
          </p>
        </div>

        {step === "request" ? (
          <form onSubmit={handleRequestCode} className="space-y-8">
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
                Email address
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-3 text-sm font-medium
                         hover:bg-white hover:text-black hover:border hover:border-black
                         transition duration-300 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? "Sending..." : "Send reset code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-6">
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              placeholder="Reset code"
              className="w-full border-b border-gray-300 bg-transparent py-2 text-sm focus:border-black focus:outline-none"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="New password"
              className="w-full border-b border-gray-300 bg-transparent py-2 text-sm focus:border-black focus:outline-none"
            />
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              placeholder="Confirm new password"
              className="w-full border-b border-gray-300 bg-transparent py-2 text-sm focus:border-black focus:outline-none"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-3 text-sm font-medium
                         hover:bg-white hover:text-black hover:border hover:border-black
                         transition duration-300 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? "Resetting..." : "Reset password"}
            </button>

            <button
              type="button"
              onClick={() => setStep("request")}
              className="text-xs text-gray-500 underline"
            >
              Use a different email
            </button>
          </form>
        )}

        {/* FOOTER */}
        <div className="mt-8">
          <Link href="/login" className="text-sm text-gray-500 hover:text-black underline">
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
