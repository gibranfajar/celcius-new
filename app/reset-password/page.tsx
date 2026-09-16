"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { forgotPassword, resetPassword } from "@/lib/api";
import { getErrorMessage } from "@/lib/api/client";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token");
  const emailFromUrl = searchParams.get("email");

  // Arriving from the reset email means the link already carries the email
  // and token, so we skip straight to choosing a new password instead of
  // asking the customer to copy a code in by hand.
  const [step, setStep] = useState<"request" | "sent" | "reset">(
    tokenFromUrl && emailFromUrl ? "reset" : "request",
  );
  const [email, setEmail] = useState(emailFromUrl ?? "");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { message } = await forgotPassword(email);
      toast.success(message);
      setStep("sent");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tokenFromUrl || !emailFromUrl) {
      return;
    }

    setIsLoading(true);

    try {
      const { message } = await resetPassword({
        email: emailFromUrl,
        token: tokenFromUrl,
        password,
        password_confirmation: passwordConfirmation,
      });
      toast.success(message);
      router.push("/login");
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
            {step === "request" &&
              "Enter the email address associated with your account. We'll send you a link to reset your password."}
            {step === "sent" &&
              "Check your email for a link to reset your password."}
            {step === "reset" && "Enter your new password below."}
          </p>
        </div>

        {step === "request" && (
          <form onSubmit={handleRequestLink} className="space-y-8">
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder=" "
                className="peer w-full bg-zinc-100 px-3 pt-5 pb-2 outline-none focus:bg-zinc-200 transition-colors"
              />
              <label
                htmlFor="email"
                className="
                absolute left-3 top-1/2 -translate-y-1/2
                text-sm text-gray-500 transition-all duration-200 ease-out

                peer-focus:top-2
                peer-focus:translate-y-0
                peer-focus:text-xs
                peer-focus:text-black

                peer-not-placeholder-shown:top-2
                peer-not-placeholder-shown:translate-y-0
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
              {isLoading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={handleReset} className="space-y-6">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="New password"
              className="w-full bg-zinc-100 px-3 py-2.5 text-sm outline-none focus:bg-zinc-200 transition-colors"
            />
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              placeholder="Confirm new password"
              className="w-full bg-zinc-100 px-3 py-2.5 text-sm outline-none focus:bg-zinc-200 transition-colors"
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
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
