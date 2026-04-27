"use client";

import React, { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const [email, setEmail] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Reset password link sent to " + email);
  };

  return (
    <div className="min-h-screen bg-white px-6">
      <div className="mx-auto max-w-md pt-24">
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold mb-3">Reset your password</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Enter the email address associated with your account. We’ll send you
            a link to reset your password.
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-8">
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
              Email address
            </label>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="w-full bg-black text-white py-3 text-sm font-medium
                       hover:bg-white hover:text-black hover:border hover:border-black
                       transition duration-300 cursor-pointer"
          >
            Send reset link
          </button>
        </form>

        {/* FOOTER */}
        <div className="mt-8">
          <Link
            href="/login"
            className="text-sm text-gray-500 hover:text-black underline"
          >
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
