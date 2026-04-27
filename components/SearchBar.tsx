"use client";
import { useEffect, useState } from "react";

export default function SearchBar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // cegah hydration error

  return (
    <div
      className={`fixed top-0 left-0 h-32 w-full bg-white z-50 transform transition-transform duration-300 ${
        isOpen ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {/* Tombol Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-xl cursor-pointer"
      >
        <i className="bi bi-x"></i>
      </button>

      {/* Konten Tengah */}
      <div className="flex flex-col items-center justify-center h-full w-full">
        <p className="mb-2 text-sm">YOU CAN SEARCH ANYTHING HERE</p>

        <form className="flex items-center w-full max-w-md">
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 px-4 py-2 border border-zinc-400 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 border border-zinc-400"
          >
            <i className="bi bi-search"></i>
          </button>
        </form>
      </div>
    </div>
  );
}
