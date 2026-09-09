"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCategories } from "@/lib/api";
import { Category } from "@/lib/api/types";

type FilterProps = {
  isOpen: boolean;
  setisOpen: (v: boolean) => void;
  gender: string;
};

export default function Filter({ isOpen, setisOpen, gender }: FilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const categoriesByGroup = categories.reduce<Record<string, Category[]>>(
    (acc, category) => {
      acc[category.master_category] = acc[category.master_category] || [];
      acc[category.master_category].push(category);
      return acc;
    },
    {},
  );

  const goTo = (path: string) => {
    router.push(path);
    setisOpen(false);
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-[85vw] max-w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 base-font ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header sidebar */}
      <div className="flex justify-between items-center px-4 py-3 shadow">
        <h2 className="font-semibold">FILTER BY</h2>
        <button
          onClick={() => setisOpen(false)}
          className="text-xl cursor-pointer"
          aria-label="Close filter"
        >
          <i className="bi bi-x"></i>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="h-[calc(100%-56px)] overflow-y-auto p-4">
        <ul className="space-y-2 text-xs">
          <li
            onClick={() => goTo(`/products/${gender}/list`)}
            className="cursor-pointer font-semibold"
          >
            All
          </li>
          <li
            onClick={() => goTo(`/products/${gender}/list/sale`)}
            className="cursor-pointer font-semibold text-red-600"
          >
            Sale
          </li>
        </ul>

        {Object.entries(categoriesByGroup).length > 0 && (
          <div className="mt-6 space-y-4 text-xs">
            {Object.entries(categoriesByGroup).map(([group, items]) => (
              <div key={group}>
                <p className="font-semibold uppercase mb-2">{group}</p>
                <ul className="space-y-1">
                  {items.map((category) => (
                    <li
                      key={category.id}
                      onClick={() =>
                        goTo(`/products/${gender}/list/category/${category.slug}`)
                      }
                      className="cursor-pointer text-gray-600 hover:text-black"
                    >
                      {category.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
